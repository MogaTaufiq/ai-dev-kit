# ai-dev-kit

Claude Code plugin that installs tier-based guardrails into any repo: skills `dev-kit`, `design-session`, `adopt`, plus templates, check presets and a Stop gate.

## Commands
- `npm test`: unit and integration tests (`node --test test/`).
- `npm run check`: frontmatter check on every skill, then the tests.
- `claude plugin validate .`: manifest validation.

## Rules
- Node 22 stdlib only in `scripts/`. Dev dependencies exist only to test presets.
- Every behavior change starts with a failing test.
- No code comments unless the why cannot live in code, a test name or an ADR.
- Never write into a target repo from tests; use temp dirs.

## Pointers
- Usage: `README.md`
- Decisions: `docs/adr/`, rejected ideas: `.out-of-scope/`
