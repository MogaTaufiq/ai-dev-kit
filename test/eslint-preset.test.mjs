import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";
import tseslint from "typescript-eslint";

const cwd = fileURLToPath(new URL("./fixtures/lint/", import.meta.url));
const config = fileURLToPath(new URL("../presets/ts-web/eslint.kit.mjs", import.meta.url));
const eslint = new ESLint({ cwd, overrideConfigFile: config });
const lint = async (file) => (await eslint.lintFiles([file]))[0].messages;
const ids = async (file) => (await lint(file)).map((m) => m.ruleId);
const msgs = async (file) => (await lint(file)).map((m) => m.message).join("\n");

test("bans any", async () => assert.ok((await ids("bad.tsx")).includes("@typescript-eslint/no-explicit-any")));
test("bans as outside lib", async () => assert.ok((await ids("bad.tsx")).includes("@typescript-eslint/consistent-type-assertions")));
test("allows as in lib/", async () => assert.deepEqual(await ids("lib/cast.ts"), []));
test("bans ts-ignore", async () => assert.ok((await ids("bad.tsx")).includes("@typescript-eslint/ban-ts-comment")));
test("raw hex message names the root cause", async () => assert.match(await msgs("bad.tsx"), /Raw hex color: use a DESIGN\.md token/));
test("arbitrary tailwind value flagged", async () => assert.match(await msgs("bad.tsx"), /Arbitrary Tailwind value: add a token/));
test("good file is clean, as const allowed", async () => assert.deepEqual(await ids("good.tsx"), []));
test("rulesOnly works on top of a config that already registers typescript-eslint", async () => {
  const { rulesOnly } = await import(config);
  const base = { files: ["**/*.{ts,tsx}"], languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } }, plugins: { "@typescript-eslint": tseslint.plugin } };
  const e = new ESLint({ cwd, overrideConfigFile: true, overrideConfig: [base, ...rulesOnly] });
  const found = (await e.lintFiles(["bad.tsx"]))[0].messages.map((m) => m.ruleId);
  assert.ok(found.includes("@typescript-eslint/no-explicit-any") && found.includes("no-restricted-syntax"));
});

test("important-modifier arbitrary value flagged", async () => assert.match(await msgs("important.tsx"), /Arbitrary Tailwind value/));
