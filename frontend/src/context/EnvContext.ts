import type { ClientEnvType } from "@fossai/backend";
import { createContext } from "react";

export const EnvContext = createContext<ClientEnvType>(null!);