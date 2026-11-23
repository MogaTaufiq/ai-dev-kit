---
name: verify-{{APP_NAME}}
description: Use to prove a {{APP_NAME}} feature works by driving the real app the way a user does and capturing evidence. Use before reporting any user-facing change done.
---

# Verify {{APP_NAME}}

On first use, fill every section from this repo, then run the whole skill once end to end. Replace each angle-bracket line with real commands and selectors.

## Launch
<the exact command that starts the app from an empty data dir, including migrations and seed data, and the log line that means it is usable>

## Doctor
<one read-only check that this instance is worth driving: process up, right build, port owned by this run>

## Drive
<the harness recipe with real selectors from this repo. Prefer ARIA labels and data attributes over coordinates>

## Evidence
Capture the action and the resulting state, not only the final screen, plus side effects (rows written, requests sent). Use the real user path, never test-only endpoints. Save evidence under `.verify/evidence/`.

## Cleanup
Stop only what this run started. Never kill by process name. Keep the evidence.

## Feature map
Flows to cover: [features/README.md](features/README.md).
