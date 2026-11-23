import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync } from "node:fs";
import { join } from "node:path";

const TIER_LINE = /^Tier: T[123] \(since \d{4}-\d{2}-\d{2}\)$/;
const MAX_UNTRACKED_BYTES = 1_000_000;

const git = (cwd, args) => execFileSync("git", args, { cwd, stdio: ["ignore", "pipe", "ignore"], maxBuffer: 50e6 }).toString();

export function readTaskCommand(agentsMd) {
  const m = agentsMd.match(/^Per task\s*:\s*(.+)$/m);
  return m ? m[1].trim() : null;
}

export function repoRoot(cwd) {
  try {
    return git(cwd, ["rev-parse", "--show-toplevel"]).trim();
  } catch {
    return null;
  }
}

export function isKitRepo(cwd) {
  const root = repoRoot(cwd);
  if (!root) return false;
  const file = join(root, "AGENTS.md");
  return existsSync(file) && TIER_LINE.test(readFileSync(file, "utf8").split("\n")[0]);
}

export function treeHash(cwd) {
  const hash = createHash("sha256");
  let head = "";
  try {
    head = git(cwd, ["rev-parse", "HEAD"]);
  } catch {}
  hash.update(head);
  hash.update(git(cwd, ["status", "--porcelain=v1", "-uall"]));
  hash.update(head ? git(cwd, ["diff", "HEAD"]) : git(cwd, ["diff"]));
  for (const rel of git(cwd, ["ls-files", "-z", "--others", "--exclude-standard"]).split("\0").filter(Boolean)) {
    hash.update(rel);
    try {
      const st = lstatSync(join(cwd, rel));
      if (st.isFile() && st.size <= MAX_UNTRACKED_BYTES) hash.update(readFileSync(join(cwd, rel)));
    } catch {}
  }
  return hash.digest("hex");
}

export function markerPath(cwd) {
  return join(git(cwd, ["rev-parse", "--absolute-git-dir"]).trim(), "ai-dev-kit-green");
}

export function runCheck(command, cwd, timeoutMs) {
  return new Promise((resolve) => {
    const child = spawn("sh", ["-c", command], { cwd, detached: true, stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    let timedOut = false;
    const keep = (chunk) => { out = (out + chunk).slice(-20_000); };
    child.stdout.on("data", keep);
    child.stderr.on("data", keep);
    const timer = setTimeout(() => {
      timedOut = true;
      try { process.kill(-child.pid, "SIGKILL"); } catch {}
    }, timeoutMs);
    child.on("close", (code) => {
      clearTimeout(timer);
      try { process.kill(-child.pid, "SIGKILL"); } catch {}
      resolve({ code, timedOut, tail: out.trimEnd().split("\n").slice(-40).join("\n") });
    });
  });
}

export function decide({ isKit, command, changed, run, stopHookActive, lastMessage, readOnly }) {
  if (!isKit || !changed) return { action: "allow" };
  if (!command) return { action: "allow", markGreen: true, systemMessage: "ai-dev-kit: AGENTS.md has no \"Per task :\" line, so the per-task check was skipped." };
  if (readOnly) return { action: "allow" };
  if (run.code === 0 && !run.timedOut) return { action: "allow", markGreen: true };
  if (run.timedOut) return { action: "allow", systemMessage: `ai-dev-kit: per-task check \`${command}\` timed out after 280 s, so this turn ended without a green check.` };
  if (run.code === 127) return { action: "allow", systemMessage: `ai-dev-kit: per-task check \`${command}\` could not run (command not found). Install its tools or fix the "Per task" line in AGENTS.md.` };
  if (/^\s*\[STOP:/.test(lastMessage ?? "")) return { action: "allow", systemMessage: "ai-dev-kit: the per-task check is red at a forced stop." };
  if (stopHookActive) return { action: "allow", systemMessage: `ai-dev-kit: per-task check \`${command}\` is still red after one retry.\n${run.tail}` };
  return {
    action: "block",
    reason: `Per-task check failed: \`${command}\`\n${run.tail}\nFix it before finishing. If you are at a forced stop, asking the user a question, or your task was read-only (review or exploration), start your message with [STOP: <reason>].`,
  };
}
