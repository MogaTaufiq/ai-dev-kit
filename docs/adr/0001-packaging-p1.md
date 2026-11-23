# 0001: Ship as 2 skills plus an installer (P1)

Status: accepted 2026-11-20 by the owner.

The kit is one Claude Code plugin with two model-invoked skills (`dev-kit`, `design-session`), one user-invoked installer skill (`adopt`) backed by a Node script, plus templates, presets and a Stop/SubagentStop gate. Project rules live in files written into each repo (AGENTS.md, CODING_STANDARDS.md, DESIGN.md), so other harnesses read the same rules.

Rejected: one skill per phase (P2), installer only (P3); see `.out-of-scope/`.
