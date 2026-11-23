import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { isExcluded, readExcludes } from "../scripts/lib/exclude.mjs";

const ADOPT = fileURLToPath(new URL("../scripts/adopt.mjs", import.meta.url));

test("readExcludes skips blanks and comments and expands ~", () => {
  const f = join(mkdtempSync(join(tmpdir(), "ex-")), "exclude");
  writeFileSync(f, "# work repos\n\n~/Work/Corp\n/abs/path\n");
  assert.deepEqual(readExcludes(f), [join(homedir(), "Work/Corp"), "/abs/path"]);
});
test("readExcludes without a file is empty", () => assert.deepEqual(readExcludes("/no/such/file"), []));
test("isExcluded matches the prefix dir and its children only", () => {
  const root = mkdtempSync(join(tmpdir(), "pre-"));
  mkdirSync(join(root, "Corp", "repo"), { recursive: true });
  mkdirSync(join(root, "Corp-other"), { recursive: true });
  assert.equal(isExcluded(join(root, "Corp", "repo"), [join(root, "Corp")]), true);
  assert.equal(isExcluded(join(root, "Corp-other"), [join(root, "Corp")]), false);
});
test("adopt CLI refuses an excluded repo", () => {
  const home = mkdtempSync(join(tmpdir(), "home-"));
  const repo = join(home, "Work", "Corp", "app");
  mkdirSync(repo, { recursive: true });
  writeFileSync(join(repo, "package.json"), JSON.stringify({ name: "app", devDependencies: { vite: "7" } }));
  mkdirSync(join(home, ".config", "ai-dev-kit"), { recursive: true });
  writeFileSync(join(home, ".config", "ai-dev-kit", "exclude"), "~/Work/Corp\n");
  const r = spawnSync("node", [ADOPT, "plan", repo, "--tier", "T1"], { encoding: "utf8", env: { ...process.env, HOME: home } });
  assert.equal(r.status, 3);
  assert.match(r.stderr, /excluded/);
});
