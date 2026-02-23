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

### P3-001 — Generic README lacks product-specific runbook
- **Severity:** P3
- **Status:** Known/defer
- **Notes:** Low-impact documentation gap already captured in baseline reference.
- **Scope:** `README.md`
