---
name: design-session
description: Settle a product's design system and user flows before any UI code. Use when a UI task finds DESIGN.md missing or unapproved, or when the user wants to define how a product should look.
---

# design-session

The output is an approved `DESIGN.md`, built from [DESIGN.template.md](DESIGN.template.md), plus a flow map in the spec. UI code waits for the user's approval of `DESIGN.md`.

## 1. Entry
Read the program definition first: the spec on T2 and T3, or a short brief on T1. Then let the user pick how to start:
- they bring a list of points the design must meet, or
- you draft that list from the definition and the two of you refine it.

## 2. Interview
Ask one question per message, with your recommended answer first. Cover every topic in [references/session.md](references/session.md).

Done when every topic has an answer, or the user has left it to you.

## 3. Directions
Show 2-3 directions that differ on purpose: palette, type, density, signature moves. Call the Skill tool with `mattpocock-skills:prototype` to render them on the real route behind `?variant=`. Give each direction its reasoning. The user picks one, or mixes them.

## 4. Write DESIGN.md
- Fill every section of the template. Each value is a decision, stored as a token.
- Measure the contrast of every text and UI pair in each theme.
- Draw ideas from `ui-ux-pro-max` and `ckm:design-system`, and on the showcase profile from AntiSlopUI.
- Check the result against the slop checklist in `CODING_STANDARDS.md`.

## 5. Approval (forced stop)
Ask the user to approve `DESIGN.md`, and record the date in its Status line. From then on, these are forced stops:
- changing a token, brand color or font family
- removing a signature move

When the user gives visual feedback later, write it into `DESIGN.md` as a component rule, so it outlives the chat.

## Flow map
- The spec lists each flow's screens, steps, fields and states (empty, loading, error, success).
- Add nothing outside the map. When something is missing, ask.
- Standard flows may follow common conventions, each marked `assumed` for the user to confirm with the spec: sign-up, login, forgot password, email verification, checkout or payment, logout, profile settings, search and filter.
