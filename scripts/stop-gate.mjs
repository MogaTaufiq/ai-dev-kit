import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { decide, isKitRepo, markerPath, readTaskCommand, repoRoot, runCheck, treeHash } from "./lib/gate.mjs";

const TIMEOUT_MS = 280_000;
const READ_ONLY_AGENTS = new Set(["Explore", "Plan", "claude-code-guide", "statusline-setup"]);

async function main(input) {
  const cwd = input.cwd || process.cwd();
  const state = {
    isKit: isKitRepo(cwd),
    command: null,
    changed: false,
    stopHookActive: Boolean(input.stop_hook_active),
    lastMessage: input.last_assistant_message ?? "",
    readOnly: input.hook_event_name === "SubagentStop" && READ_ONLY_AGENTS.has(input.agent_type),
  };
  let hash;
  let marker;
  if (state.isKit) {
    const root = repoRoot(cwd);
    state.command = readTaskCommand(readFileSync(join(root, "AGENTS.md"), "utf8"));
    hash = treeHash(root);
    marker = markerPath(root);
    state.changed = !existsSync(marker) || readFileSync(marker, "utf8") !== hash;
    if (state.command && state.changed && !state.readOnly) state.run = await runCheck(state.command, root, TIMEOUT_MS);
  }
  const d = decide(state);
  if (d.markGreen) writeFileSync(marker, hash);
  return d;
}

let input = {};
try {
  input = JSON.parse(readFileSync(0, "utf8") || "{}");
} catch {}

try {
  const d = await main(input);
  if (d.action === "block") process.stdout.write(JSON.stringify({ decision: "block", reason: d.reason }));
  else if (d.systemMessage) process.stdout.write(JSON.stringify({ systemMessage: d.systemMessage }));
} catch (err) {
  process.stdout.write(JSON.stringify({ systemMessage: `ai-dev-kit: the Stop gate failed and let this turn end (${err.message}).` }));
}
