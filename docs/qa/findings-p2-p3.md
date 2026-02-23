# P2/P3 Findings

## Scope and evidence
- Manual behavior checks on `/embed` and `/voice-chat` with mode/query combinations.
- Visual/interaction checks for conversation copy state and empty-state behavior.

## Findings

### P2-001 — Potential stale "copied" affordance after list replacement
- **Severity:** P2
- **Status:** Not reproduced in current run (defer)
- **Notes:** Existing code resets message list on connect/disconnect and copied indicator is timed to clear; issue not observed in manual checks.
- **Scope reviewed:** `src/components/widget/VoiceWidget.tsx`

### P3-001 — Generic README lacks product-specific runbook
- **Severity:** P3
- **Status:** Known/defer
- **Notes:** Low-impact documentation gap already captured in baseline reference.
- **Scope:** `README.md`
