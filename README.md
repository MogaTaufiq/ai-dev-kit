# ai-dev-kit

Tier-based guardrails for AI coding agents, packaged as a Claude Code plugin.

- `adopt` (type `/ai-dev-kit:adopt`): installs AGENTS.md, CODING_STANDARDS.md, check presets, pre-commit and CI into a repo, never overwriting a file.
- `dev-kit`: runs every coding task at the depth its tier and size need, with forced stops and a verification gate.
- `design-session`: settles a project's design system (DESIGN.md) and user flows before any UI code.
- A Stop/SubagentStop hook blocks "done" while the repo's per-task check is red.

Install locally:

```bash
claude plugin marketplace add ~/Active/Projects/ai-dev-kit
claude plugin install ai-dev-kit@ai-dev-kit
```

To keep adopt away from some repos (for example an employer's), list their path prefixes, one per line, in `~/.config/ai-dev-kit/exclude`; adopt refuses them.

Requires Node 22.
