# Coding standards

The reviewer reads this file; the implementer does not need it in context. Mechanical rules live in lint and tests. This file holds judgement calls only, and the repo's own documented rules win over it.

## Findings
- important: wrong behavior, a broken rule from AGENTS.md or DESIGN.md, or a slop item below. Blocks merge.
- nit: style or naming preference. Never blocks.
- pre-existing: already there before this diff. Report it; do not fix it in this change.

Stop after about 3 review-fix rounds and report what is left.

## Code
- Comments only for a why the code cannot show. Prefer an ADR or a test name. A comment that explains a workaround means the design needs work.
- No interface, factory or helper with a single user. Abstract on the third duplicate.
- Magic strings become types or constants.
- No silent fallback for unknown input: fail loudly or ask. Config comes from env. No demo or test credentials in code.
- One component per UI kind (button, dropdown, tabs, card). A fix lands in that component, not in a copy.
- No one-off patch scripts in the repo root. Fix the source.
- No "for later" code, and no TODO without a ticket.

## UI: what counts as slop
Check every UI change against this table and against `DESIGN.md`. A slop fix reduces repetition; it never deletes a signature move.

| Group | Symptoms |
|---|---|
| Visual | untouched library theme (shadcn or Tailwind default), purple-blue gradient, glassmorphism everywhere (one deliberate use such as a navbar is fine), emoji as icons, mixed icon sets, shadow plus 8px radius on every card, `#000` on `#fff` |
| Layout | the "hero, 3 feature cards, testimonials, CTA" template, centered single column with equal spacing, bento grid without a reason, carousel where a layout is clearer, a default marquee, one effect repeated across many components |
| Type | default 16px system font, headings only 2x body, more than 2 families, stats without `tabular-nums` |
| Motion | everything fades up 20px with one ease, three animations on one element, hover that only changes background, animating anything other than transform, opacity, filter or clip-path |
| Copy and content | generic copy ("Unlock the power of...", "Seamless", "Revolutionize"), generic hero badges ("available for collaboration"), invented metrics or testimonials, lorem ipsum, placeholder avatars, filler words and forced lists of three |
| Flow | screens or steps not in the spec's flow map, dead buttons, happy path only with no empty, loading or error states |
