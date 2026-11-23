import { test } from "node:test";
import assert from "node:assert/strict";
import { checkSpecs } from "../presets/common/check-spec.mjs";
import { checkAgents } from "../presets/common/check-agents.mjs";
import { tmpRepo } from "./helpers/tmp.mjs";

const TIER = "Tier: T2 (since 2026-11-20)\n";

test("spec without Verification fails", () => assert.match(checkSpecs(tmpRepo({ ".scratch/login/spec.md": "## Flow map\n" })).join(), /login\/spec\.md.*## Verification/));
test("spec with both headings passes", () => assert.deepEqual(checkSpecs(tmpRepo({ ".scratch/a/spec.md": "## Verification\n## Flow map\n" })), []));
test("no .scratch passes", () => assert.deepEqual(checkSpecs(tmpRepo({})), []));
test("agents over budget fails", () => assert.match(checkAgents(tmpRepo({ "AGENTS.md": TIER + "x\n".repeat(130) })).join(), /131 lines, max 120/));
test("agents code-line ref fails", () => assert.match(checkAgents(tmpRepo({ "AGENTS.md": TIER + "see game.js:11\n" })).join(), /game\.js:11/));
test("agents bad tier line fails", () => assert.match(checkAgents(tmpRepo({ "AGENTS.md": "Tier: 2\n" })).join(), /tier line/i));
test("agents within budget passes", () => assert.deepEqual(checkAgents(tmpRepo({ "AGENTS.md": TIER + "ok\n" })), []));
