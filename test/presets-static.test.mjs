import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const preset = (rel) => readFileSync(new URL(`../presets/${rel}`, import.meta.url), "utf8");

test("CI templates run on pull_request and call the task check", () => { for (const f of ["ts-web/ci.t1.yml", "ts-web/ci.t2.yml", "python/ci.yml"]) { assert.match(preset(f), /pull_request/, f); assert.match(preset(f), /\{\{CHECK_TASK\}\}/, f); assert.match(preset(f), /check-agents\.mjs/, f); } });
test("ts t2 CI runs e2e", () => assert.match(preset("ts-web/ci.t2.yml"), /\{\{CHECK_MERGE\}\}/));
test("pre-commit runs the task check and both kit checks", () => { const p = preset("common/pre-commit"); assert.match(p, /^#!\/bin\/sh/); assert.match(p, /\{\{CHECK_TASK\}\}/); assert.match(p, /check-agents\.mjs/); assert.match(p, /check-spec\.mjs/); });
test("ML experiment note has the S6 headings", () => { for (const h of ["## Baselines compared (at least 3)", "## Leakage check", "## Seeds", "## Insight"]) assert.ok(preset("python/EXPERIMENT.md").includes(h), h); });
test("pyright is strict", () => assert.equal(JSON.parse(preset("python/pyrightconfig.json")).typeCheckingMode, "strict"));
test("ruff selects the agreed rule sets", () => assert.match(preset("python/ruff.toml"), /select = \["E", "F", "I", "B", "UP", "ANN", "T20"\]/));
test("states spec covers the 4 widths with axe", () => { const s = preset("ts-web/e2e/states.spec.ts"); for (const w of ["320", "768", "1024", "1440"]) assert.ok(s.includes(w), w); assert.match(s, /AxeBuilder/); assert.match(s, /violations\)\.toEqual\(\[\]\)/); });
test("smoke spec fails loudly without SMOKE_URL", () => assert.match(preset("ts-web/e2e/smoke.spec.ts"), /SMOKE_URL[\s\S]*throw new Error/));
test("tsconfig preset is strict", () => { const c = JSON.parse(preset("ts-web/tsconfig.kit.json")).compilerOptions; for (const k of ["strict", "noUncheckedIndexedAccess", "noImplicitOverride", "noFallthroughCasesInSwitch"]) assert.equal(c[k], true, k); });

test("playwright preset starts the dev server", () => { const p = preset("ts-web/playwright.config.ts"); assert.match(p, /webServer/); assert.match(p, /npm run dev/); assert.match(p, /\{\{DEV_PORT\}\}/); });
test("python CI installs only the dependency files that exist", () => { const p = preset("python/ci.yml"); assert.match(p, /-f requirements\.txt/); assert.match(p, /-f pyproject\.toml/); });
