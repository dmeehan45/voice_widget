# QA Fix Log

## Completed

1. **P0-001** — orb renderer lint/purity remediation
   - **Files changed:** `src/components/ui/orb.tsx`
   - **Why:** lint-blocking purity/immutability errors prevented CI-quality baseline.
   - **Validation:**
     - `npm run lint` ✅
     - `npm run build` ✅

2. **P1-001/P1-002** — embed/host input hardening
   - **Files changed:** `src/components/widget/EmbedWidgetPage.tsx`, `src/components/widget/VoiceWidgetHost.tsx`
   - **Why:** Prevent query-array type errors and storage-access exceptions from breaking runtime initialization.
   - **Validation:**
     - `npm run lint` ✅
     - `npm run build` ✅

3. **P2-001/P2-002** — conversation copy interaction hardening
   - **Files changed:** `src/components/widget/VoiceWidget.tsx`
   - **Why:** Ensure copied indicator resets with session resets and clipboard rejection does not leak promise noise.
   - **Validation:**
     - `npm run lint` ✅
     - `npm run build` ✅
     - Playwright route checks on `/embed` and `/voice-chat` ✅

## Deferred

1. **P3-001** — README product runbook gap
   - Deferred as non-critical documentation polish.
