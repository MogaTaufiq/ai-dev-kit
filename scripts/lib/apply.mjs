import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { render } from "./render.mjs";

export function applyAdopt(repo, plan) {
  const written = [];
  for (const item of plan.create) {
    const target = join(repo, item.path);
    if (existsSync(target)) continue;
    const content = item.content ?? render(readFileSync(item.from, "utf8"), plan.vars);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content, { flag: "wx" });
    if (item.path === ".githooks/pre-commit") chmodSync(target, 0o755);
    written.push(item.path);
  }
  return { written };
}
