Tier: {{TIER}} (since {{SINCE}})
Kit: ai-dev-kit {{KIT_VERSION}}
Profile: {{PROFILE}}
Stack: {{STACK}}
Tier decisions: none yet

# {{APP_NAME}}

Rules for any coding agent in this repo. Read this file at the start of every session.

## Session start
1. `git fetch` and pull before reading or changing code. Work often lands from other sessions.
2. Read this file, then the progress file if one exists.

## Definition of Done (required in every plan)
Per task : {{CHECK_TASK}}
Per merge: {{CHECK_MERGE}}
Per release: {{CHECK_RELEASE}}
A plan without a "Verification" section listing these commands is not ready.
Before reporting UI work done, open your own screenshots at 320, 768, 1024 and 1440 px and on `/states`, and say what you checked: overlap, crop, alignment, contrast.

## Non-negotiable rules
| Priority | Rule |
|---|---|
| P0 | Never merge a PR with red checks. |
| P0 | Never delete or overwrite user data without a forced stop. |
| P1 | Every correction becomes a check (type, lint, test or runtime check). Only when none fits, add a row under Pitfalls. |
| P1 | Do only what the ticket says. New scope becomes a new ticket. |
| P1 | Before installing a package, confirm it exists, its current version and that it is maintained. Use the docs for the installed version. |
| P2 | Simplest thing that works. |

## Forced stops
Stop and ask the user before any of these: one question at a time, with your recommended answer. To end a turn while the per-task check is red at a stop, start your message with `[STOP: <reason>]`.
- spec approval (including `assumed` flows)
- `DESIGN.md` approval
- database migrations
- deleting data
- auth changes
- new dependencies
- the first UI ticket
- T3 sensitive paths
- tier upgrade proposals
- the AGENTS.md restructure during adopt
- changing a DESIGN.md token, brand color or font family
- removing a visible feature or effect
- creating or reusing cloud resources

Never merge a PR with red checks.

## Spec extras
Every spec also has:
- `## Verification`: the Definition of Done commands that prove it.
- `## Flow map`: each flow's screens, steps, fields and states (empty, loading, error, success). Add nothing outside it; ask instead. Standard flows (sign-up, login, forgot password, email verification, checkout or payment, logout, profile settings, search and filter) may follow common conventions, each marked `assumed`.
- Data sources: each source and its owner. Read one real payload before building on it.

A ticket that hits a forced stop carries a `Forced stop: <which>` line.

## Pitfalls
| Pitfall | Do instead |
|---|---|

## Pointers
- Design system and flows: `DESIGN.md`
- Review rules and the UI slop checklist: `CODING_STANDARDS.md`
- Vocabulary: `GLOSSARY.md`
- Decisions: `docs/adr/`
- History: `CHANGELOG.md`
