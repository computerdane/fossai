import { hc } from "hono/client";
import type { AppType } from "@fossai/backend";

export const client = hc<AppType>(
  import.meta.env.VITE_BACKEND_BASE_URL ?? "http://localhost:3000",
  {
    init: {
      credentials: "include",
    },
  },
);
