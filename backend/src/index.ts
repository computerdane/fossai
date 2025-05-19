import { Hono } from "hono";
import { jwt, sign, verify } from "hono/jwt";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { cors } from "hono/cors";
import env from "./env";
import getDb from "./db";
import { createMiddleware } from "hono/factory";
import { proxy } from "hono/proxy";
import error from "./error";
import { getSignedCookie, setSignedCookie } from "hono/cookie";

type SessionJwt = {
  personId: string;
  exp: number;
};

type RefreshJwt = {
  id: string;
  personId: string;
  exp: number;
};

function dateToUnix(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

function unixToDate(seconds: number) {
  return new Date(seconds * 1000);
}

function getExpiry(inSeconds: number) {
  return dateToUnix(new Date()) + inSeconds;
}

const db = await getDb();

const anon = await db
  .selectFrom("person")
  .select("id")
  .where("email", "=", "anon")
  .executeTakeFirst();
if (!anon) {
  throw new Error("The 'anon' user does not exist!");
}

const openaiHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${env.server.OPENAI_API_KEY}`,
};

const api = new Hono()
  .use(
    env.client.DISABLE_AUTH
      ? async (_, next) => await next()
      : jwt({ secret: env.server.JWT_SECRET }),
  )
  .use(
    createMiddleware<{ Variables: { personId: string } }>(
      env.client.DISABLE_AUTH
        ? async (c, next) => {
            c.set("personId", anon.id);
            await next();
          }
        : async (c, next) => {
            const { personId, exp } = c.get("jwtPayload") as SessionJwt;

            if (new Date(exp * 1000) < new Date()) {
              return error(c, 401);
            }

            c.set("personId", personId);
            await next();
          },
    ),
  )
  .get("/me", async (c) => {
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
    return proxy(`https://api.openai.com/v1/${c.req.param("path")}`, {
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
  .use(cors({ origin: "http://localhost:5173", credentials: true }))
  .route("/api", api)
  .get("/env", (c) => c.json(env.client))
  .post(
    "/login",
    zValidator("json", z.object({ email: z.string().nonempty() })),
    async (c) => {
      const { email } = c.req.valid("json");

      const person = await db
        .selectFrom("person")
        .select("id")
        .where("email", "=", email)
        .executeTakeFirst();

      if (person) {
        const payload: SessionJwt = {
          personId: person.id,
          exp: getExpiry(env.server.JWT_SESSION_EXP_SEC),
        };
        const token = await sign(payload, env.server.JWT_SECRET);

        const refreshExpiry = getExpiry(env.server.JWT_REFRESH_EXP_SEC);
        const record = await db
          .insertInto("refresh_token")
          .values({
            person_id: person.id,
            expires_at: unixToDate(refreshExpiry),
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
            env.server.JWT_SECRET,
          );

          await setSignedCookie(
            c,
            "fossai_refresh_token",
            refreshToken,
            env.server.COOKIE_SECRET,
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
    const refreshToken = await getSignedCookie(
      c,
      env.server.COOKIE_SECRET,
      "fossai_refresh_token",
    );

    if (refreshToken) {
      const payload = await verify(refreshToken, env.server.JWT_SECRET);
      const { id, personId, exp } = payload as RefreshJwt;
      const now = new Date();

      if (new Date(exp * 1000) > now) {
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
            exp: getExpiry(env.server.JWT_SESSION_EXP_SEC),
          };
          const token = await sign(payload, env.server.JWT_SECRET);

          return c.json({ token }, 200);
        }
      }
    }

    return error(c, 401);
  })
  .post(
    "/register",
    zValidator("json", z.object({ email: z.string(), first_name: z.string() })),
    async (c) => {
      const input = c.req.valid("json");

      if (env.server.EMAIL_VALIDATION_REGEX.test(input.email)) {
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
export type ClientEnvType = typeof env.client;

export default app;
