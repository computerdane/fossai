import { Hono } from "hono";
import { jwt, sign } from "hono/jwt";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { cors } from "hono/cors";
import env from "./env";
import getDb from "./db";
import { createMiddleware } from "hono/factory";

const db = await getDb();

const api = new Hono().get("/ping", (c) => c.text("pong"));

if (!env.client.DISABLE_AUTH) {
  api.use(jwt({ secret: env.server.JWT_SECRET }));
  api.use(
    createMiddleware<{ Variables: { personId: string } }>(async (c, next) => {
      c.set("personId", c.get("jwtPayload").id);
      await next();
    }),
  );
} else {
  const anon = await db
    .selectFrom("person")
    .select("id")
    .where("email", "=", "anon")
    .executeTakeFirst();
  if (!anon) {
    throw new Error("The 'anon' user does not exist!");
  }
  api.use(
    createMiddleware<{ Variables: { personId: string } }>(async (c, next) => {
      c.set("personId", anon.id);
      await next();
    }),
  );
}

const app = new Hono()
  .use(cors())
  .route("/api", api)
  .get("/env", (c) => c.json(env.client))
  .post(
    "/login",
    zValidator("json", z.object({ email: z.string() })),
    async (c) => {
      const { email } = c.req.valid("json");

      const id = await db
        .selectFrom("person")
        .select("id")
        .where("email", "=", email)
        .executeTakeFirst();

      if (id) {
        const payload = {
          id,
          exp: Math.floor(Date.now() / 1000) + 60 * 5, // Token expires in 5 minutes
        };
        const token = await sign(payload, env.server.JWT_SECRET);
        return c.json({ token });
      }

      return c.json({ error: "unauthorized" }, 401);
    },
  )
  .post(
    "/register",
    zValidator("json", z.object({ email: z.string(), first_name: z.string() })),
    async (c) => {
      const input = c.req.valid("json");
      const person = await db
        .insertInto("person")
        .values(input)
        .returningAll()
        .executeTakeFirst();
      return c.json(person);
    },
  )
  .get("/", (c) => c.json({ ok: true }));

export type AppType = typeof app;
export type ClientEnvType = typeof env.client;

export default app;
