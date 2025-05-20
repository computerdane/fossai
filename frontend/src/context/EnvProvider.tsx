import type { PublicEnv } from "@fossai/env";
import { EnvContext } from ".";

export function EnvProvider({
  env,
  children,
}: {
  env: PublicEnv;
  children: React.ReactNode;
}) {
  return <EnvContext.Provider value={env}>{children}</EnvContext.Provider>;
}
