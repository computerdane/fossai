import { privateDef, publicDef } from "@fossai/env";

const combined = { ...privateDef, ...publicDef };
await Bun.file(`${import.meta.dir}/env.generated.json`).write(
  JSON.stringify(combined, null, 2),
);
