# QA Fix Log

## Completed

1. **P0-001** — orb renderer lint/purity remediation
   - **Files changed:** `src/components/ui/orb.tsx`
   - **Why:** lint-blocking purity/immutability errors prevented CI-quality baseline.
   - **Validation:**
     - `npm run lint` ✅
     - `npm run build` ✅

## Deferred

1. **P2-001** — stale copied affordance (not reproduced)
   - Deferred pending deterministic repro.
2. **P3-001** — README product runbook gap
   - Deferred as non-critical documentation polish.
