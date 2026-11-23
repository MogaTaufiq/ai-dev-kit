---
name: dev-kit
description: Run any coding task in a repo whose AGENTS.md starts with "Tier:". Sizes the task, picks its workflow, holds the forced stops, and proves the work before it is called done.
---

# dev-kit

The repo's own files hold the rules: `AGENTS.md` (tier, Definition of Done, `## Forced stops`, Spec extras), `CODING_STANDARDS.md` (review rules and the UI slop checklist) and `DESIGN.md` (design system and flows). This skill is the order you run them in.

## 1. Session start
1. `git fetch` and pull.
2. Read `AGENTS.md`, plus the progress file when the work spans sessions.

Done when you can name the tier and the three Definition of Done commands.

## 2. Size the task and plan
- **Small** (a fix, or a change one sitting finishes): plan in 3-5 lines with a Verification section, then build. For a bug, Call the Skill tool with `mattpocock-skills:diagnosing-bugs`. For new logic, Call the Skill tool with `mattpocock-skills:tdd`.
- **Feature, or anything unclear:**
  1. Ask the user to run `/grill-with-docs`. When terms or decisions need sharpening, Call the Skill tool with `mattpocock-skills:domain-modeling`.
  2. If the work touches UI and `DESIGN.md` is missing or unapproved, run the `design-session` skill first.
  3. For UI, Call the Skill tool with `mattpocock-skills:prototype` to show 2-3 variants on the real route.
  4. Ask the user to run `/to-spec`. The spec must carry the Spec extras from `AGENTS.md`.
  5. Ask the user to run `/to-tickets`, then `/implement-spec` for the AFK build.
- **Multi-week:** ask the user to run `/wayfinder`, and update a progress file before heavy work.

At plan time, check the tier-upgrade signals in [references/tiers.md](references/tiers.md). Propose each signal once.

Done when the plan has a Verification section with the exact Definition of Done commands.

## 3. Build
Build only what the ticket says. New scope becomes a new ticket. Before any install, confirm the package exists, its current version and that it is maintained.

## 4. Forced stops
Stop at every item under `## Forced stops` in `AGENTS.md`. Ask one question with your recommended answer, and batch stops that fall due together into one message. While the per-task check is red at a stop, open your message with `[STOP: <reason>]` so the Stop gate lets the turn end.

## 5. Verify
1. Run the per-task command until it is green.
2. For a user-facing change on T2 or T3, drive the real app with the repo's `verify-<app>` skill and attach the evidence.
3. For UI, open your own screenshots at 320, 768, 1024 and 1440 px and on `/states`, and report what you checked: overlap, crop, alignment, contrast.

Done when the per-task check is green and the evidence is in your report.

## 6. Review
Call the Skill tool with `mattpocock-skills:code-review` against the branch base. It reads `CODING_STANDARDS.md` and `DESIGN.md`. Fix every important finding. Stop after about 3 fix rounds. Nits never block.

## 7. Retro (T2 and T3)
After each spec, and per milestone on T3, ask the user to run `/retro`. Turn each correction into a check using the ladder in [references/guardrails.md](references/guardrails.md). Propose checks that would help every repo as a ticket on the kit repo.

Detail for steps 2-5: [references/process.md](references/process.md).
