import { hc } from "hono/client";
import type { AppType } from "@fossai/backend";

export const client = hc<AppType>("http://localhost:3000", {
  fetch: (input: string | Request | URL, init = {}) => {
    return fetch(input, {
      ...init,
      credentials: "include",
    });
  },
});
