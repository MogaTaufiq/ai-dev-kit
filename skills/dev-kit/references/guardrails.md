# Guardrails

## The ladder
For every new rule, or every correction from the user, use the first rung that works:
1. a code design that makes the mistake impossible (types, API shape)
2. a lint rule
3. a test
4. a runtime check
5. one row under Pitfalls in `AGENTS.md`, only when nothing above fits

Judgement calls that no tool can check go in `CODING_STANDARDS.md`, where the reviewer reads them.

## Ratchet for existing repos
- `adopt` records today's violations as a baseline: `npx eslint . --suppress-all` or `ruff check . --add-noqa`.
- New code passes the full rules. ESLint bulk suppressions and ruff `noqa` already fail on any new violation, so the count only goes down with no extra script.
- When a ticket touches an old file, clean only the lines the ticket changes. The rest waits for a ratchet ticket.
- Each retro may add one ratchet ticket that clears one rule.

## Adoption order
1. Checks that catch bugs: strict types, no `any`, an e2e smoke test on the main flows.
2. Slop rules: comments, magic strings, token lint.
3. Style last.
