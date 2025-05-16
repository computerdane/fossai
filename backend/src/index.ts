import { Hono } from "hono";
import { jwt, sign } from "hono/jwt";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { cors } from "hono/cors";
import env from "./env";

const api = new Hono().get("/ping", (c) => c.text("pong"));

if (!env.client.DISABLE_AUTH) {
  api.use(jwt({ secret: env.server.JWT_SECRET }));
}

const app = new Hono()
  .use(cors())
  .get("/", (c) => c.json({ ok: true }))
  .get("/env", (c) => c.json(env.client))
  .post(
    "/login",
    zValidator("json", z.object({ email: z.string() })),
    async (c) => {
      const { email } = c.req.valid("json");

      if (email === "dane@computerdane.net") {
        const payload = {
          sub: "user123",
          role: "admin",
          exp: Math.floor(Date.now() / 1000) + 60 * 5, // Token expires in 5 minutes
        };
        const token = await sign(payload, env.server.JWT_SECRET);
        return c.json({ token });
      }

      return c.json({ error: "unauthorized" }, 401);
    },
  )
  .route("/api", api);

export type AppType = typeof app;
export type ClientEnvType = typeof env.client;

export default app;
