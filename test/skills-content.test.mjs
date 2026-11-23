import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { checkSkill, parseFrontmatter } from "../scripts/check-frontmatter.mjs";

const dir = (s) => fileURLToPath(new URL(`../skills/${s}`, import.meta.url));
const skillText = (s) => readFileSync(`${dir(s)}/SKILL.md`, "utf8") + readRefs(s);
const readRefs = (s) => { try { return ["references/session.md", "references/tiers.md", "references/process.md", "references/guardrails.md"].map((r) => { try { return readFileSync(`${dir(s)}/${r}`, "utf8"); } catch { return ""; } }).join("\n"); } catch { return ""; } };
const fm = (s) => readFileSync(`${dir(s)}/SKILL.md`, "utf8").split("\n---")[0];
const body = (s) => parseFrontmatter(readFileSync(`${dir(s)}/SKILL.md`, "utf8")).body;

test("all skills pass checkSkill", () => { for (const s of ["dev-kit", "design-session", "adopt"]) assert.deepEqual(checkSkill(dir(s)), [], s); });
test("adopt is user-invoked; others model-invoked", () => { assert.match(fm("adopt"), /disable-model-invocation: true/); assert.doesNotMatch(fm("dev-kit") + fm("design-session"), /disable-model-invocation/); });
test("dev-kit tells the user to type user-invoked commands", () => { for (const c of ["/grill-with-docs", "/to-spec", "/to-tickets", "/implement-spec", "/wayfinder", "/retro"]) assert.ok(body("dev-kit").includes(c), c); });
test("dev-kit calls model-invoked skills via the Skill tool", () => { for (const s of ["tdd", "code-review", "prototype", "diagnosing-bugs", "domain-modeling"]) assert.match(body("dev-kit"), new RegExp(`Call the Skill tool with \`mattpocock-skills:${s}\``), s); });
test("dev-kit points at repo files, not copies", () => { for (const p of ["AGENTS.md", "## Forced stops", "CODING_STANDARDS.md", "DESIGN.md", "[STOP: <reason>]"]) assert.ok(body("dev-kit").includes(p), p); });
test("design-session covers the 10 topics", () => { for (const t of ["audience", "personality", "references", "brand assets", "profile", "density", "light or dark", "motion", "signature", "devices"]) assert.match(skillText("design-session"), new RegExp(t, "i"), t); });
test("adopt runs plan before apply and never overwrites", () => { const b = body("adopt"); assert.ok(b.includes('adopt.mjs" plan') && b.indexOf('adopt.mjs" plan') < b.indexOf('adopt.mjs" apply')); assert.match(b, /never overwrite/i); });

test("adopt opens each question with the STOP escape", () => assert.ok(body("adopt").includes("[STOP: adopt in progress]")));
test("design-session calls prototype by its namespaced name", () => assert.match(body("design-session"), /Call the Skill tool with `mattpocock-skills:prototype`/));
