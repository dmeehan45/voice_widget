# P2/P3 Findings

## Scope and evidence
- Manual behavior checks on `/embed` and `/voice-chat` with mode/query combinations.
- Visual/interaction checks for conversation copy state and empty-state behavior.

## Findings

### P2-001 — Potential stale "copied" affordance after list replacement (fixed)
- **Severity:** P2
- **Status:** Fixed
- **Repro (before):** Copy an assistant message, reconnect/disconnect quickly, then receive a fresh assistant message at the same index before timer expires.
- **Expected:** Copy indicator should reset for fresh conversation state.
- **Actual (before):** Previous copied index could persist briefly after list reset.
- **Fix:** Reset `copiedIndex` on connect/disconnect when message list resets.
- **Scope:** `src/components/widget/VoiceWidget.tsx`

### P2-002 — Clipboard rejection can trigger unhandled promise noise (fixed)
- **Severity:** P2
- **Status:** Fixed
- **Repro (before):** Browser denies clipboard permissions while pressing copy button.
- **Expected:** UI should remain stable without unhandled promise noise.
- **Actual (before):** Clipboard promise rejection was not handled.
- **Fix:** Add defensive `.catch(() => undefined)` on clipboard write call.
- **Scope:** `src/components/widget/VoiceWidget.tsx`

### P3-001 — Generic README lacked product-specific runbook (fixed)
- **Severity:** P3
- **Status:** Fixed
- **Repro (before):** Open `README.md`; content described generic create-next-app defaults instead of project workflows.
- **Expected:** README should document setup, routes, config flow, precedence behavior, and verification commands for this project.
- **Actual (before):** No project-specific operational runbook.
- **Fix:** Replaced README with a focused voice-widget runbook for local setup, route map, runtime precedence, environment usage, and validation commands.
- **Scope:** `README.md`
