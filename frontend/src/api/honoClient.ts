import { hc } from "hono/client";
import type { AppType } from "@fossai/backend";

export const client = hc<AppType>("http://localhost:3000");

export type Client = ReturnType<typeof hc<AppType>>;
