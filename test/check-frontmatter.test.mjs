import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { checkSkill, checkPlugin } from "../scripts/check-frontmatter.mjs";

const fx = (name) => fileURLToPath(new URL(`./fixtures/skills/${name}`, import.meta.url));

test("good skill passes", () => assert.deepEqual(checkSkill(fx("good")), []));
test("non-portable key fails", () => assert.match(checkSkill(fx("bad-key")).join(), /key "model" not allowed/));
test("description over 1536 chars fails", () => assert.match(checkSkill(fx("long-desc")).join(), /1536/));
test("broken relative link fails", () => assert.match(checkSkill(fx("broken-link")).join(), /missing\.md/));
test("user-invoked skill needs allow_implicit_invocation: false", () => assert.match(checkSkill(fx("user-no-yaml")).join(), /allow_implicit_invocation/));
test("plugin.json skills array matches skills/ dirs", () => assert.deepEqual(checkPlugin(fx("plugin-ok")), []));
