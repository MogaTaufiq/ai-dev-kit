# DESIGN.md

Status: draft. Becomes binding when the user approves it (record the date here). Changing a token, brand color or font family afterwards is a forced stop.

## Identity
- Profile: <showcase | app>
- Audience: <who uses it, in what setting>
- Personality: <3 words>. Not: <3 anti-words>
- References liked: <links and what to take from each>. Disliked: <links and why>
- Existing brand assets: <logo, colors, fonts>
- Devices: <phone, desktop, other>. Theme: <light, dark, both>. Density: <airy | compact>. Motion appetite: <calm | expressive>
- Signature moments: <where the product should feel special>

## Tokens
Components use tokens only. Raw hex and arbitrary values in components fail lint.

### Primitive
| Token | Value |
|---|---|

### Semantic
| Role | Token | Notes |
|---|---|---|
Roles to define: background, surface, text, text-muted, border, accent, success, warning, danger, info. Type scale with line heights, spacing scale on a 4px base, radius, at most 3 elevation levels, 1-2 eases with durations, breakpoints.

### Component
| Component | Tokens used |
|---|---|

## Contrast
Measured ratios for every text and UI pair, in every theme. WCAG 2.2 AA: 4.5:1 for text, 3:1 for large text and UI parts.

| Foreground | Background | Ratio | Pass |
|---|---|---|---|

## Component rules
- One component per UI kind (button, dropdown, tabs, card).
- Every interactive component has default, hover (fine pointer only), focus-visible (never removed), active, disabled and loading states. Every screen or data view has empty, loading, error (with a recovery action) and success. All of them render on `/states`.
- One primary action per screen. Build hierarchy with size, weight and space before color. At most 3 levels of text emphasis. More space between groups than inside a group.
- Targets at least 24x24 px (44 px on touch-first screens). Real labels on inputs, never a placeholder as the label. Semantic HTML before ARIA. Works at 200% zoom. A reduced-motion path for every animation.
- <the user's own component rules, added as feedback arrives>

## Signature moves
<2-3 deliberate moves, and where each lives. Everything else stays calm. Removing one is a forced stop.>

## Project bans
<what this project never does, beyond the slop checklist in CODING_STANDARDS.md>

## Profile rules
### App (dashboards, admin, CRUD)
- Compact spacing. Tables: numbers right-aligned with `tabular-nums`, sticky headers.
- Charts chosen by the question they answer, color-blind-safe palette, direct labels instead of legends, bar axes from zero.
- Every KPI shows number, unit, comparison and data timestamp, plus a stale-data indicator.
- Missing data is not zero. No dual axis unless documented here. Mark unconfirmed values. No hardcoded chart numbers. Group color sits on the card chrome, not the series. Chart grouping is shown by layout, not by title text.
- Motion only to signal a changed value.

### Showcase (landing pages, portfolio)
- Options, not rules: near-black and off-white with 1-2 accents, at most 2 font families, 1-2 project eases, micro motion 0.2-0.4 s and reveals 0.5-0.9 s.
- Animate only transform, opacity, filter and clip-path. Pointer effects only on fine pointers.
- Motion libraries (GSAP, Lenis, Motion) only when AGENTS.md allows them.

## Flows
<links to the flow maps in each spec>
