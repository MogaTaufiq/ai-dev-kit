import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const TIER_LINE = /^Tier: T[123] \(since \d{4}-\d{2}-\d{2}\)$/;
const CODE_LINE_REF = /\b[\w/.-]+\.(ts|tsx|js|mjs|py):\d+\b/g;

export function checkAgents(repo, maxLines = 120) {
  const file = join(repo, "AGENTS.md");
  if (!existsSync(file)) return ["AGENTS.md is missing"];
  const lines = readFileSync(file, "utf8").replace(/\n$/, "").split("\n");
  const out = [];
  if (!TIER_LINE.test(lines[0])) out.push(`AGENTS.md line 1 must be the tier line "Tier: T2 (since YYYY-MM-DD)", found "${lines[0]}"`);
  if (lines.length > maxLines) out.push(`AGENTS.md is ${lines.length} lines, max ${maxLines}: move history to CHANGELOG.md or docs/adr/`);
  for (const [i, line] of lines.entries()) {
    for (const [ref] of line.matchAll(CODE_LINE_REF)) out.push(`AGENTS.md line ${i + 1} points at code by line number (${ref}): point at the file instead, line numbers go stale`);
  }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const errors = checkAgents(resolve(process.argv[2] ?? "."));
  for (const e of errors) console.error(e);
  process.exit(errors.length ? 1 : 0);
}
