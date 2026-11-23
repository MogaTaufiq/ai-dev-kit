import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { planAdopt } from "./lib/plan.mjs";
import { applyAdopt } from "./lib/apply.mjs";
import { excludeFile, isExcluded, readExcludes } from "./lib/exclude.mjs";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { tier: { type: "string" }, profile: { type: "string", default: "app" }, since: { type: "string" } },
});
const [cmd, repoArg] = positionals;
if (!["plan", "apply"].includes(cmd) || !repoArg || !/^T[123]$/.test(values.tier ?? "")) {
  console.error("usage: node adopt.mjs plan|apply <repo> --tier T1|T2|T3 [--profile showcase|app] [--since YYYY-MM-DD]");
  process.exit(2);
}
const kitVersion = JSON.parse(readFileSync(new URL("../.claude-plugin/plugin.json", import.meta.url), "utf8")).version;
const since = values.since ?? new Date().toLocaleDateString("en-CA");
const repo = resolve(repoArg);
if (isExcluded(repo, readExcludes(excludeFile()))) {
  console.error(`refused: ${repo} is excluded by ${excludeFile()}`);
  process.exit(3);
}
const plan = planAdopt(repo, { tier: values.tier, profile: values.profile, since, kitVersion });
const view = { ...plan, create: plan.create.map((c) => c.path) };
if (cmd === "plan") console.log(JSON.stringify(view, null, 2));
else console.log(JSON.stringify({ ...applyAdopt(repo, plan), merge: plan.merge, notes: plan.notes }, null, 2));
