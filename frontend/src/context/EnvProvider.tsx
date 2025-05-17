import type { ClientEnvType } from "@fossai/backend";
import { EnvContext } from ".";


export function EnvProvider({ env, children }: { env: ClientEnvType; children: React.ReactNode }) {
  return <EnvContext.Provider value={env}>{children}</EnvContext.Provider>;
}