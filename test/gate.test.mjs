import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { decide, markerPath, readTaskCommand, runCheck } from "../scripts/lib/gate.mjs";
import { writeFileSync, symlinkSync } from "node:fs";
import { tmpRepo } from "./helpers/tmp.mjs";

const GATE = fileURLToPath(new URL("../scripts/stop-gate.mjs", import.meta.url));
const TIER = "Tier: T2 (since 2026-11-20)\n";
const base = { isKit: true, command: "npm run check", changed: true, stopHookActive: false, lastMessage: "done" };
const runGate = (input) => spawnSync("node", [GATE], { input: JSON.stringify(input), encoding: "utf8" }).stdout;
const kitRepo = (perTask) => { const r = tmpRepo({ "AGENTS.md": `${TIER}Per task : ${perTask}\n` }); execFileSync("git", ["init", "-q"], { cwd: r }); return r; };

test("non-kit: allow silently", () => assert.deepEqual(decide({ ...base, isKit: false }), { action: "allow" }));
test("no Per task line: allow + warn", () => assert.match(decide({ ...base, command: null }).systemMessage, /Per task/));
test("unchanged: allow without run", () => assert.deepEqual(decide({ ...base, changed: false }), { action: "allow" }));
test("green: allow + mark", () => assert.deepEqual(decide({ ...base, run: { code: 0, timedOut: false, tail: "" } }), { action: "allow", markGreen: true }));
test("red: block with escape hint", () => { const d = decide({ ...base, run: { code: 1, timedOut: false, tail: "x failed" } }); assert.equal(d.action, "block"); assert.match(d.reason, /x failed[\s\S]*\[STOP: <reason>\]/); assert.match(d.reason, /read-only/); });
test("red at forced stop: allow + warn", () => assert.equal(decide({ ...base, lastMessage: "[STOP: migration needs approval] ...", run: { code: 1, timedOut: false, tail: "" } }).action, "allow"));
test("red after retry: allow + warn", () => assert.match(decide({ ...base, stopHookActive: true, run: { code: 1, timedOut: false, tail: "" } }).systemMessage, /still red/));
test("missing tool 127: allow + warn", () => assert.equal(decide({ ...base, run: { code: 127, timedOut: false, tail: "" } }).action, "allow"));
test("gate: timeout allows with warning", () => assert.match(decide({ ...base, run: { code: null, timedOut: true, tail: "" } }).systemMessage, /timed out/));
test("readTaskCommand reads the DoD line", () => assert.equal(readTaskCommand(`${TIER}Per task : npm run check\nPer merge: x\n`), "npm run check"));

test("gate: non-kit dir is silent", () => assert.equal(runGate({ cwd: mkdtempSync(join(tmpdir(), "nokit-")) }), ""));
test("gate: red check blocks", () => assert.match(runGate({ cwd: kitRepo("false") }), /"decision":"block"/));
test("gate: [STOP:] lets a red turn end with a warning", () => { const out = runGate({ cwd: kitRepo("false"), last_assistant_message: "[STOP: needs approval] waiting" }); assert.doesNotMatch(out, /block/); assert.match(out, /systemMessage/); });
test("gate: green writes the marker and skips an unchanged tree", () => {
  const sentinel = join(mkdtempSync(join(tmpdir(), "sent-")), "runs.txt");
  const r = kitRepo(`echo run >> ${sentinel}`);
  assert.equal(runGate({ cwd: r }), "");
  assert.ok(existsSync(markerPath(r)));
  runGate({ cwd: r });
  assert.equal(readFileSync(sentinel, "utf8").trim().split("\n").length, 1);
});
test("gate: marker is per worktree", () => {
  const r = kitRepo("true");
  execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", "commit", "-qam", "init", "--allow-empty"], { cwd: r });
  execFileSync("git", ["add", "-A"], { cwd: r });
  execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", "commit", "-qm", "files"], { cwd: r });
  const wt = join(mkdtempSync(join(tmpdir(), "wt-")), "wt");
  execFileSync("git", ["worktree", "add", "-q", wt], { cwd: r });
  assert.notEqual(markerPath(r), markerPath(wt));
});
test("hooks.json registers Stop and SubagentStop with the gate", () => {
  const h = JSON.parse(readFileSync(new URL("../hooks/hooks.json", import.meta.url), "utf8")).hooks;
  assert.equal(h.SubagentStop[0].matcher, ".+");
  for (const ev of ["Stop", "SubagentStop"]) { const c = h[ev][0].hooks[0]; assert.equal(c.command, 'node "${CLAUDE_PLUGIN_ROOT}/scripts/stop-gate.mjs"'); assert.equal(c.timeout, 300); }
});

test("decide: read-only subagent is never blocked", () => assert.equal(decide({ ...base, readOnly: true, run: { code: 1, timedOut: false, tail: "" } }).action, "allow"));
test("decide: no Per task line and unchanged is silent", () => assert.deepEqual(decide({ ...base, command: null, changed: false }), { action: "allow" }));
test("decide: no Per task line warns once, then marks green", () => assert.equal(decide({ ...base, command: null }).markGreen, true));
test("gate: untracked non-ASCII file and broken symlink do not crash", () => {
  const r = kitRepo("true");
  writeFileSync(join(r, "caf\u00e9.txt"), "x");
  symlinkSync(join(r, "nowhere"), join(r, "dangling"));
  const res = spawnSync("node", [GATE], { input: JSON.stringify({ cwd: r }), encoding: "utf8" });
  assert.equal(res.status, 0, res.stderr);
  assert.equal(res.stdout, "");
});
test("runCheck kills the whole process group on timeout", async () => {
  const dir = mkdtempSync(join(tmpdir(), "rc-"));
  const res = await runCheck("sleep 30 & echo $! > pid; wait", dir, 500);
  assert.equal(res.timedOut, true);
  const pid = Number(readFileSync(join(dir, "pid"), "utf8"));
  await new Promise((r) => setTimeout(r, 200));
  assert.throws(() => process.kill(pid, 0), /ESRCH/);
});
test("decide: read-only subagent is allowed without running the check", () => assert.deepEqual(decide({ ...base, readOnly: true }), { action: "allow" }));
