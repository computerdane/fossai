import { hc } from "hono/client";
import type { AppType } from "@fossai/backend";

export const client = hc<AppType>("http://localhost:3000", {
  init: {
    credentials: "include",
  },
});
