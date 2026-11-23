---
name: adopt
description: Install ai-dev-kit guardrails into a repo (AGENTS.md, CODING_STANDARDS.md, check presets, pre-commit, CI), never overwriting a file.
disable-model-invocation: true
allowed-tools: Bash(node ${CLAUDE_SKILL_DIR}/../../scripts/adopt.mjs *)
---

# adopt

Install the kit into the repo the user names, by default the current one. The script never overwrites a file. Files that already exist come back under `merge`, for you to propose as diffs. The script refuses any repo under a path listed in `~/.config/ai-dev-kit/exclude` (exit code 3); tell the user and stop.

1. **Plan.** Run `node "${CLAUDE_SKILL_DIR}/../../scripts/adopt.mjs" plan <repo> --tier <T1|T2|T3> --profile <showcase|app>` with your best guess.
   - Show the user the detected stack, the files to create, the files to merge and the notes.
   - Propose a tier, using the signals in the `dev-kit` skill's tiers reference, and a profile.
   - Re-run `plan` with the values the user confirms.
2. **Apply** after a yes: `node "${CLAUDE_SKILL_DIR}/../../scripts/adopt.mjs" apply <repo> --tier <T> --profile <p>`.
3. **Merge.** For each `merge` entry, show a minimal diff and apply it only once approved.
   - An existing `AGENTS.md` is restructured, which is a forced stop. Rules, commands and pitfalls stay; history moves to `CHANGELOG.md` or `docs/adr/`. Content is restructured, not translated.
While adopt is in progress the per-task check can be red, for example before the `package.json` scripts are merged. Open every question to the user with `[STOP: adopt in progress]` so the Stop gate lets the turn end.

4. **Notes.** Walk through each note one at a time, with your recommendation:
   - `git init`
   - the hooks path
   - dependencies (a forced stop)
   - the ratchet baseline, once dependencies are installed
   - `/setup-matt-pocock-skills`: tell the user to run it, since no skill can call it
   - branch protection, which the user applies
5. **Report** which reused skills the tier needs but this session lacks: `mattpocock-skills` (`grill-with-docs`, `to-spec`, `to-tickets`, `implement-spec`, `tdd`, `code-review`, `retro`), `superpowers`, `ponytail`, `ui-ux-pro-max`. Do not install them.
6. **Re-runs.** On a tier upgrade or a kit update, run `plan` again. New files are created; existing ones come back as merge diffs.

Never overwrite a file, and change existing ones only through approved diffs.
