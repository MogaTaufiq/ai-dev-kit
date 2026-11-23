import { test } from "node:test";
import assert from "node:assert/strict";
import { render } from "../scripts/lib/render.mjs";

test("render fills vars", () => assert.equal(render("Tier: {{TIER}}", { TIER: "T2" }), "Tier: T2"));
test("render throws on missing var", () => assert.throws(() => render("{{X}}", {}), /unfilled placeholder: X/));
