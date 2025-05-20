import type { PublicEnv } from "@fossai/env";
import { createContext } from "react";

export const EnvContext = createContext<PublicEnv>(null!);
