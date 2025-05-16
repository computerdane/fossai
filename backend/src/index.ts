import { Hono } from "hono";
import { jwt, sign } from "hono/jwt";
import { JWT_SECRET } from "./env";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { cors } from "hono/cors";

const api = new Hono()
  .use(jwt({ secret: JWT_SECRET }))
  .get("/ping", (c) => c.text("pong"));

const app = new Hono()
  .use(cors())
  .get("/", (c) => c.json({ ok: true }))
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
        const token = await sign(payload, JWT_SECRET);
        return c.json({ token });
      }

      return c.json({ error: "unauthorized" }, 401);
    },
  )
  .route("/api", api);

export type AppType = typeof app;
export default app;
