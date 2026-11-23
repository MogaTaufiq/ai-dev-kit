import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REQUIRED = ["## Verification", "## Flow map"];

export function checkSpecs(repo) {
  const scratch = join(repo, ".scratch");
  if (!existsSync(scratch)) return [];
  const out = [];
  for (const feature of readdirSync(scratch, { withFileTypes: true })) {
    if (!feature.isDirectory()) continue;
    const spec = join(scratch, feature.name, "spec.md");
    if (!existsSync(spec)) continue;
    const text = readFileSync(spec, "utf8");
    for (const heading of REQUIRED) {
      if (!new RegExp(`^${heading}\\s*$`, "m").test(text)) out.push(`.scratch/${feature.name}/spec.md is missing "${heading}" (AGENTS.md, Spec extras)`);
    }
  }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const errors = checkSpecs(resolve(process.argv[2] ?? "."));
  for (const e of errors) console.error(e);
  process.exit(errors.length ? 1 : 0);
}
