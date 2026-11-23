# Tiers

The tier sits on line 1 of `AGENTS.md`. It sets the baseline once. The task's size sets each task's workflow, so a T3 project still has small tasks.

| Tier | Typical project | Per task | Per merge | Per release | Extras |
|---|---|---|---|---|---|
| T1 | landing page, static site, portfolio, micro-tool | lint, strict TS, build | axe and screenshots at 4 widths | Lighthouse, smoke on the deployed URL | short AGENTS.md, no spec |
| T2 | full-stack app, SaaS MVP, dashboard, CRUD with auth | T1 plus unit tests on logic | build plus Playwright e2e on main flows, automated review | same as T1 | glossary, ADRs, Verification in every plan, migrations before deploy, feature flags for risky changes, `verify-<app>` skill |
| T3 | multi-service, AI/ML, mobile or desktop | same as T2 | contract tests between services | eval set for AI/ML parts | AGENTS.md per service plus a system AGENTS.md in the parent folder, ADRs for cross-service decisions, sensitive paths need explicit approval, stacked PRs, retro per milestone |

## Upgrade signals
Check these when you write a plan:
- login or auth
- database migrations
- a second service
- payments
- real user data
- an ML model

For each signal the current tier does not cover, propose the upgrade once. It is a forced stop. Record the user's answer on the `Tier decisions:` line of `AGENTS.md`, so the same signal is never proposed twice. After an upgrade, re-run `/ai-dev-kit:adopt` to add the new gates.

## T3 contracts
The provider service owns each API schema (OpenAPI or JSON Schema). Consumers test against a pinned copy in their own CI.
