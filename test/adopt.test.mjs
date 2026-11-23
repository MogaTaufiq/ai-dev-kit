import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { detectStack } from "../scripts/lib/detect.mjs";
import { planAdopt, defaultChecks } from "../scripts/lib/plan.mjs";
import { applyAdopt } from "../scripts/lib/apply.mjs";
import { tmpRepo } from "./helpers/tmp.mjs";

const FIXTURES = {
  "next-existing": { "package.json": JSON.stringify({ name: "web", dependencies: { next: "16.2.7", "eslint-config-next": "16.2.7" } }), "AGENTS.md": "old rules\n", "eslint.config.mjs": "export default [];\n", ".github/workflows/ci.yml": "name: old\n" },
  "vite-empty": { "package.json": JSON.stringify({ name: "Vite App", devDependencies: { vite: "7.0.0" } }) },
  python: { "pyproject.toml": "[project]\nname = \"ml\"\n" },
  "no-git": { "package.json": JSON.stringify({ name: "nogit", devDependencies: { vite: "7.0.0" } }) },
  system: { "app/package.json": JSON.stringify({ name: "app", devDependencies: { vite: "7.0.0" } }), "api/pyproject.toml": "[project]\nname = \"api\"\n" },
};
const fx = (name) => {
  const root = tmpRepo(FIXTURES[name]);
  if (name !== "no-git" && name !== "system") execFileSync("git", ["init", "-q"], { cwd: root });
  return root;
};
const read = (root, rel) => readFileSync(join(root, rel), "utf8");
const OPTS = { tier: "T2", profile: "app", since: "2026-11-20", kitVersion: "0.1.0" };

test("detects next + existing files", () => { const d = detectStack(fx("next-existing")); assert.deepEqual(d.stacks, ["ts-next"]); assert.ok(d.existing.includes("AGENTS.md") && d.existing.includes("eslint.config.mjs")); });
test("defaultChecks for TS T1 builds in the task check", () => assert.equal(defaultChecks("ts-vite", "T1").checkScript, "eslint . && tsc -b && npm run build"));
test("defaultChecks for python", () => assert.equal(defaultChecks("python", "T2").task, "ruff check . && pyright && { pytest -q || [ $? -eq 5 ]; }"));
test("apply never overwrites", () => { const r = fx("next-existing"); const before = read(r, "AGENTS.md"); applyAdopt(r, planAdopt(r, OPTS)); assert.equal(read(r, "AGENTS.md"), before); });
test("existing configs listed under merge", () => assert.deepEqual(planAdopt(fx("next-existing"), OPTS).merge.sort(), ["AGENTS.md", ".github/workflows/ci.yml", "eslint.config.mjs", "package.json#scripts"].sort()));
test("second apply writes nothing", () => { const r = fx("vite-empty"); applyAdopt(r, planAdopt(r, OPTS)); assert.deepEqual(applyAdopt(r, planAdopt(r, OPTS)).written, []); });
test("no-git repo gets a git init note", () => assert.ok(planAdopt(fx("no-git"), OPTS).notes.some((n) => n.includes("git init"))));
test("python gets ruff, not eslint", () => { const p = planAdopt(fx("python"), OPTS).create.map((c) => c.path); assert.ok(p.includes("ruff.toml") && !p.includes("eslint.kit.mjs")); });
test("T1 has no verify skill, T2 has one", () => { assert.ok(!planAdopt(fx("vite-empty"), { ...OPTS, tier: "T1" }).create.some((c) => c.path.includes("verify-"))); assert.ok(planAdopt(fx("vite-empty"), OPTS).create.some((c) => c.path.startsWith(".claude/skills/verify-"))); });
test("written files have no placeholders", () => { const r = fx("vite-empty"); for (const f of applyAdopt(r, planAdopt(r, OPTS)).written) assert.doesNotMatch(read(r, f), /\{\{\w+\}\}/, f); });
test("notes carry setup, baseline and branch protection", () => { const n = planAdopt(fx("next-existing"), OPTS).notes.join("\n"); assert.match(n, /\/setup-matt-pocock-skills/); assert.match(n, /eslint \. --suppress-all/); });
test("parent of two repos is system mode", () => { const p = planAdopt(fx("system"), { ...OPTS, tier: "T3" }); assert.ok(p.create.some((c) => c.path === ".gitignore")); assert.ok(p.notes.some((n) => /run adopt in (each child|app|api)/.test(n))); });
test("app name is slugged into the verify skill path", () => assert.ok(planAdopt(fx("vite-empty"), OPTS).create.some((c) => c.path === ".claude/skills/verify-vite-app/SKILL.md")));
test("next repo with eslint-config-next is told to use rulesOnly", () => assert.match(planAdopt(fx("next-existing"), OPTS).notes.join("\n"), /rulesOnly/));
test("pre-commit is executable after apply", () => { const r = fx("vite-empty"); applyAdopt(r, planAdopt(r, OPTS)); assert.equal(execFileSync("sh", ["-c", "test -x .githooks/pre-commit && echo yes"], { cwd: r }).toString().trim(), "yes"); });
test("CLI plan prints JSON", () => { const r = fx("vite-empty"); const out = JSON.parse(execFileSync("node", [new URL("../scripts/adopt.mjs", import.meta.url).pathname, "plan", r, "--tier", "T2", "--profile", "app", "--since", "2026-11-20"]).toString()); assert.ok(out.create.length > 0 && Array.isArray(out.notes)); });

test("vite type-checks with tsc -b, next with tsc --noEmit", () => { assert.match(defaultChecks("ts-vite", "T2").checkScript, /tsc -b/); assert.match(defaultChecks("ts-next", "T2").checkScript, /tsc --noEmit/); });
test("T2 vitest passes when there are no tests yet", () => assert.match(defaultChecks("ts-next", "T2").checkScript, /vitest run --passWithNoTests/));
test("pytest exit 5 (no tests) counts as a pass", () => assert.match(defaultChecks("python", "T2").task, /pytest -q \|\| \[ \$\? -eq 5 \]/));
test("TS repos get a playwright config", () => assert.ok(planAdopt(fx("vite-empty"), OPTS).create.some((c) => c.path === "playwright.config.ts")));
