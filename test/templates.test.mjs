import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), "utf8");
const tpl = (name) => read(`templates/${name}`);
const lines = (text) => text.replace(/\n$/, "").split("\n");
const designTpl = read("skills/design-session/DESIGN.template.md");

export const FORCED_STOPS = [
  "spec approval (including `assumed` flows)",
  "`DESIGN.md` approval",
  "database migrations",
  "deleting data",
  "auth changes",
  "new dependencies",
  "the first UI ticket",
  "T3 sensitive paths",
  "tier upgrade proposals",
  "the AGENTS.md restructure during adopt",
  "changing a DESIGN.md token, brand color or font family",
  "removing a visible feature or effect",
  "creating or reusing cloud resources",
];

test("AGENTS.md line 1 is the tier line", () => assert.equal(lines(tpl("AGENTS.md"))[0], "Tier: {{TIER}} (since {{SINCE}})"));
test("AGENTS.md has the DoD lines", () => { for (const p of ["Per task : {{CHECK_TASK}}", "Per merge: {{CHECK_MERGE}}", "Per release: {{CHECK_RELEASE}}"]) assert.ok(tpl("AGENTS.md").includes(p), p); });
test("AGENTS.md lists all 13 forced stops", () => { for (const s of FORCED_STOPS) assert.ok(tpl("AGENTS.md").includes(s), s); });
test("AGENTS.md sections", () => { for (const h of ["## Definition of Done (required in every plan)", "## Non-negotiable rules", "## Forced stops", "## Pitfalls", "## Spec extras", "## Pointers"]) assert.ok(tpl("AGENTS.md").includes(h), h); });
test("AGENTS.md at most 120 lines", () => assert.ok(lines(tpl("AGENTS.md")).length <= 120));
test("CLAUDE.md is the stub", () => assert.equal(tpl("CLAUDE.md"), "@AGENTS.md\n"));
test("CODING_STANDARDS has the 6 slop groups", () => { for (const g of ["Visual", "Layout", "Type", "Motion", "Copy and content", "Flow"]) assert.match(tpl("CODING_STANDARDS.md"), new RegExp(`\\| ${g} \\|`), g); });
test("DESIGN template headings", () => { for (const h of ["## Identity", "## Tokens", "### Primitive", "### Semantic", "### Component", "## Contrast", "## Component rules", "## Signature moves", "## Project bans", "## Profile rules"]) assert.ok(designTpl.includes(h), h); });
test("verify-app sections", () => { for (const h of ["## Launch", "## Doctor", "## Drive", "## Evidence", "## Cleanup"]) assert.ok(tpl("verify-app/SKILL.md").includes(h), h); });
test("states pages stay out of production", () => { assert.match(tpl("states/next-page.tsx"), /process\.env\.NODE_ENV === "production"[\s\S]*notFound\(\)/); assert.match(tpl("states/vite-states.tsx"), /import\.meta\.env\.DEV/); });
