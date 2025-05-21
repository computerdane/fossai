import { Hono } from "hono";
import { jwt, sign, verify } from "hono/jwt";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { cors } from "hono/cors";
import env from "@fossai/env";
import getDb from "./db";
import { createMiddleware } from "hono/factory";
import { proxy } from "hono/proxy";
import error from "./error";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";
import { createTransport } from "nodemailer";

if (!env.private.OPENAI_API_KEY) {
  console.error("Option OPENAI_API_KEY must be set!");
  process.exit(1);
}
if (!env.public.DISABLE_AUTH) {
  if (!env.private.EMAIL_TRANSPORT_CONFIG_JSON) {
    console.error(
      "Option EMAIL_TRANSPORT_CONFIG_JSON must be set when DISABLE_AUTH=false!",
    );
    process.exit(1);
  }
  if (!env.private.EMAIL_FROM_ADDRESS) {
    console.error(
      "Option EMAIL_FROM_ADDRESS must be set when DISABLE_AUTH=false!",
    );
    process.exit(1);
  }
  try {
    JSON.parse(env.private.EMAIL_TRANSPORT_CONFIG_JSON);
  } catch (e) {
    console.error("Option EMAIL_TRANSPORT_CONFIG_JSON has invalid JSON: ", e);
    process.exit(1);
  }
}

type SessionJwt = {
  personId: string;
  exp: number;
};

type RefreshJwt = {
  id: string;
  personId: string;
  exp: number;
};

function getExpiry(inSeconds: number) {
  return Date.now() / 1000 + inSeconds;
}

const db = await getDb();

const anon = await db
  .selectFrom("person")
  .selectAll()
  .where("email", "=", "anon")
  .executeTakeFirst();
if (!anon) {
  throw new Error("The 'anon' user does not exist!");
}

// TODO: I dare anyone to figure out how to get this working without the "any" type
let mailer: any;
if (!env.public.DISABLE_AUTH) {
  mailer = createTransport(JSON.parse(env.private.EMAIL_TRANSPORT_CONFIG_JSON));
}

/** Generate a unique 6-digit code for the given person */
async function generateLoginCode(personId: string) {
  let code = Math.floor(Math.random() * 900000) + 100000;
  const expiresAt = new Date(getExpiry(env.private.LOGIN_CODE_EXP_SEC) * 1000);

  const { login_code } = await db
    .updateTable("person")
    .set({ login_code: code, login_code_expires_at: expiresAt })
    .where("id", "=", personId)
    .returning("login_code")
    .executeTakeFirstOrThrow();

  return login_code!;
}

const openaiHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${env.private.OPENAI_API_KEY}`,
};

const api = new Hono()
  .use(
    env.public.DISABLE_AUTH
      ? async (_, next) => await next()
      : jwt({ secret: env.private.JWT_SECRET }),
  )
  .use(
    createMiddleware<{ Variables: { personId: string } }>(
      env.public.DISABLE_AUTH
        ? async (c, next) => {
            c.set("personId", anon.id);
            await next();
          }
        : async (c, next) => {
            const { personId, exp } = c.get("jwtPayload") as SessionJwt;

            if (exp < Date.now() / 1000) {
              return error(c, 401);
            }

            c.set("personId", personId);
            await next();
          },
    ),
  )
  .get("/me", async (c) => {
    if (env.public.DISABLE_AUTH) {
      return c.json(anon);
    }

    const person = await db
      .selectFrom("person")
      .selectAll()
      .where("id", "=", c.get("personId"))
      .executeTakeFirst();

    if (person) {
      return c.json(person);
    }

    return error(c, 500);
  })
  .all("/openai/:path{.+}", async (c) => {
    return proxy(`${env.private.OPENAI_BASE_URL}/${c.req.param("path")}`, {
      ...c.req,
      headers: openaiHeaders,
    });
  })
  .get("/chats", async (c) =>
    c.json(
      await db
        .selectFrom("chat")
        .selectAll()
        .where("person_id", "=", c.get("personId"))
        .orderBy("created_at", "desc")
        .execute(),
    ),
  )
  .post(
    "/chat",
    zValidator("json", z.object({ title: z.string() })),
    async (c) => {
      const chat = await db
        .insertInto("chat")
        .values({ ...c.req.valid("json"), person_id: c.get("personId") })
        .returning("id")
        .executeTakeFirst();

      if (chat) {
        return c.json(chat, 201);
      }

      return error(c, 500);
    },
  )
  .put(
    "/chat/:id",
    zValidator("json", z.object({ title: z.string() })),
    async (c) => {
      const { title } = c.req.valid("json");
      const chat = await db
        .selectFrom("chat")
        .select("id")
        .where("id", "=", c.req.param("id"))
        .where("person_id", "=", c.get("personId"))
        .executeTakeFirst();

      if (chat) {
        const updated = await db
          .updateTable("chat")
          .set("title", title)
          .where("id", "=", chat.id)
          .returningAll()
          .executeTakeFirst();

        if (updated) {
          return c.json(updated, 200);
        }

        return error(c, 500);
      }

      return error(c, 404);
    },
  )
  .delete("/chat/:id", async (c) => {
    const chat = await db
      .selectFrom("chat")
      .select("id")
      .where("id", "=", c.req.param("id"))
      .where("person_id", "=", c.get("personId"))
      .executeTakeFirst();

    if (chat) {
      await db.deleteFrom("message").where("chat_id", "=", chat.id).execute();
      await db.deleteFrom("chat").where("id", "=", chat.id).execute();
      return c.body(null, 204);
    }

    return error(c, 404);
  })
  .get("/chat/:id/messages", async (c) =>
    c.json(
      await db
        .selectFrom("message")
        .selectAll("message")
        .where("message.chat_id", "=", c.req.param("id"))
        .innerJoin("chat", "chat.id", "message.chat_id")
        .where("person_id", "=", c.get("personId"))
        .orderBy("message.created_at", "asc")
        .execute(),
    ),
  )
  .post(
    "/chat/:id/message",
    zValidator(
      "json",
      z.object({
        role: z.enum(["user", "assistant"]),
        model: z.optional(z.string()),
        content: z.string(),
      }),
    ),
    async (c) => {
      const chat = await db
        .selectFrom("chat")
        .select("id")
        .where("person_id", "=", c.get("personId"))
        .where("id", "=", c.req.param("id"))
        .executeTakeFirst();

      if (chat) {
        const message = await db
          .insertInto("message")
          .values({ ...c.req.valid("json"), chat_id: chat.id })
          .returningAll()
          .executeTakeFirst();

        if (message) {
          return c.json(message, 201);
        }

        return error(c, 500);
      }

      return error(c, 404);
    },
  )
  .put(
    "/message/:id",
    zValidator("json", z.object({ content: z.string() })),
    async (c) => {
      const message = await db
        .selectFrom("message")
        .select("message.id")
        .where("message.id", "=", c.req.param("id"))
        .innerJoin("chat", "chat.id", "message.chat_id")
        .where("chat.person_id", "=", c.get("personId"))
        .executeTakeFirst();

      if (message) {
        const updated = await db
          .updateTable("message")
          .set("content", c.req.valid("json").content)
          .where("id", "=", message.id)
          .returningAll()
          .executeTakeFirst();

        if (updated) {
          return c.json(updated, 200);
        }

        return error(c, 500);
      }

      return error(c, 404);
    },
  );

const app = new Hono()
  .use(cors({ origin: env.private.CORS_ORIGIN, credentials: true }))
  .route("/api", api)
  .get("/env", (c) => c.json(env.public))
  .post(
    "/login_code",
    zValidator("json", z.object({ email: z.string().nonempty() })),
    async (c) => {
      if (env.public.DISABLE_AUTH) {
        return c.body(null, 204);
      }

      const { email } = c.req.valid("json");

      const person = await db
        .selectFrom("person")
        .select(["id", "active", "email"])
        .where("email", "=", email)
        .executeTakeFirst();

      if (person) {
        const code = await generateLoginCode(person.id);

        const info = await mailer.sendMail({
          from: `"${env.public.LOGIN_PAGE_TITLE} Email Login" <${env.private.EMAIL_FROM_ADDRESS}>`,
          to: person.email,
          subject: `Your ${env.public.LOGIN_PAGE_TITLE} login code`,
          html: `Your ${env.public.LOGIN_PAGE_TITLE} login code is: <b>${code}</b>`,
        });

        console.log("Sent email: ", info.messageId);

        return c.json({ sent: true }, 201);
      }

      return error(c, 401);
    },
  )
  .post(
    "/login",
    zValidator("json", z.object({ email: z.string().nonempty() })),
    async (c) => {
      const { email } = c.req.valid("json");

      const person = await db
        .selectFrom("person")
        .select(["id", "active"])
        .where("email", "=", email)
        .executeTakeFirst();

      if (person) {
        const payload: SessionJwt = {
          personId: person.id,
          exp: getExpiry(env.private.JWT_SESSION_EXP_SEC),
        };
        const token = await sign(payload, env.private.JWT_SECRET);

        const refreshExpiry = getExpiry(env.private.JWT_REFRESH_EXP_SEC);
        const record = await db
          .insertInto("refresh_token")
          .values({
            person_id: person.id,
            expires_at: new Date(refreshExpiry * 1000),
          })
          .returningAll()
          .executeTakeFirst();

        if (record) {
          const refreshPayload: RefreshJwt = {
            id: record.id,
            personId: record.person_id,
            exp: refreshExpiry,
          };
          const refreshToken = await sign(
            refreshPayload,
            env.private.JWT_SECRET,
          );

          await setSignedCookie(
            c,
            "fossai_refresh_token",
            refreshToken,
            env.private.COOKIE_SECRET,
            {
              path: "/",
              secure: true,
              httpOnly: true,
              expires: record.expires_at,
              sameSite: "strict",
            },
          );
        } else {
          console.error("Critical Error: Failed to create refresh token!");
        }

        return c.json({ token }, 200);
      }

      return error(c, 401);
    },
  )
  .post("/refresh", async (c) => {
    if (env.public.DISABLE_AUTH) {
      return c.json({ token: "anon" });
    }

    const refreshToken = await getSignedCookie(
      c,
      env.private.COOKIE_SECRET,
      "fossai_refresh_token",
    );

    if (refreshToken) {
      const payload = await verify(refreshToken, env.private.JWT_SECRET);
      const { id, personId, exp } = payload as RefreshJwt;
      const now = new Date();

      if (exp > now.getTime() / 1000) {
        const record = await db
          .selectFrom("refresh_token")
          .select("id")
          .where("id", "=", id)
          .where("person_id", "=", personId)
          .where("expires_at", ">", now)
          .executeTakeFirst();

        if (record) {
          const payload: SessionJwt = {
            personId,
            exp: getExpiry(env.private.JWT_SESSION_EXP_SEC),
          };
          const token = await sign(payload, env.private.JWT_SECRET);

          return c.json({ token }, 200);
        }
      }
    }

    return error(c, 401);
  })
  .post("/logout", async (c) => {
    const refreshToken = await getSignedCookie(
      c,
      env.private.COOKIE_SECRET,
      "fossai_refresh_token",
    );

    if (refreshToken) {
      const payload = await verify(refreshToken, env.private.JWT_SECRET);
      const { id, personId } = payload as RefreshJwt;

      await db
        .deleteFrom("refresh_token")
        .where("id", "=", id)
        .where("person_id", "=", personId)
        .execute();

      deleteCookie(c, "fossai_refresh_token");

      return c.body(null, 204);
    }

    return error(c, 401);
  })
  .post(
    "/register",
    zValidator("json", z.object({ email: z.string(), first_name: z.string() })),
    async (c) => {
      const input = c.req.valid("json");

      if (new RegExp(env.private.EMAIL_VALIDATION_REGEX).test(input.email)) {
        const person = await db
          .insertInto("person")
          .values(input)
          .returningAll()
          .executeTakeFirst();

        if (person) {
          return c.json(person, 201);
        }

        return error(c, 401);
      }

      return c.json({ error: "invalid email" }, 400);
    },
  )
  .get("/", (c) => c.json({ ok: true }));

export type AppType = typeof app;

export default {
  port: env.private.PORT,
  fetch: app.fetch,
};
