# Process detail

## Specs and data
- The spec opens with the problem, and with why each feature exists.
- The flow map lists every screen, step, field and state. Build nothing outside it. Standard flows marked `assumed` are confirmed when the user approves the spec.
- Name each data source in the spec, and read one real payload before building on it. An unclear source is a question for the user.

## AFK builds
`/implement-spec` runs the tickets as a task graph, with a fresh implementer per ticket. Mark each ticket that hits a forced stop with a `Forced stop: <which>` line, so the build pauses there. The first UI ticket always pauses, to compare the result with the chosen prototype.

## Drift controls
- Update the progress file before heavy work.
- Compact after the spec.
- Use a fresh sub-agent per ticket and per review.
- Keep `AGENTS.md` short: history goes to `CHANGELOG.md` or `docs/adr/`.

## Keeping it small
- Scope is the ticket. The spec has an out-of-scope list.
- Simplest thing that works. Abstract on the third duplicate.
- Deployed behavior is checked by the smoke test on the real URL at each release. For a failure only the deployed environment shows, get the real error from its logs before pushing a fix.
