# P0/P1 Findings

## Scope and evidence
- Static checks: `npm run lint`, `npm run build`.
- Route checks: `/`, `/configure`, `/embed`, `/voice-chat`.
- Input robustness checks: malformed query params, missing agent id, malformed localStorage config.

## Findings

### P0-001 — ESLint hard failure in orb renderer (fixed)
- **Severity:** P0
- **Status:** Fixed
- **Repro:** Run `npm run lint` on baseline branch.
- **Expected:** Lint passes.
- **Actual:** Lint fails in `src/components/ui/orb.tsx` due to purity/immutability violations.
- **Scope:** `src/components/ui/orb.tsx`
- **Fix summary:**
  - Removed render-time randomness fallback and replaced with deterministic seed fallback.
  - Moved uniform mutation path to a mutable ref dedicated for frame updates.
  - Cloned the texture before applying wrap settings to avoid mutating hook-returned values.
- **Verification:** `npm run lint` now passes.

## P1 findings

### P1-001 — `searchParams` array input crash risk on `/embed` (fixed)
- **Severity:** P1
- **Status:** Fixed
- **Repro:** Access `/embed` with repeated query keys where values may be arrays in App Router search params.
- **Expected:** Page normalizes first value and renders/falls back safely.
- **Actual (before):** Type assumptions expected only strings, risking runtime errors when calling string methods on array values.
- **Scope:** `src/components/widget/EmbedWidgetPage.tsx`
- **Fix summary:** Added `getSingleParam` normalization for every consumed query param before parsing/trimming.
- **Verification:** Route smoke checks pass for `/embed` and malformed query combinations.

### P1-002 — localStorage read exception risk in restricted browser contexts (fixed)
- **Severity:** P1
- **Status:** Fixed
- **Repro:** In environments where `window.localStorage` access throws, load `/voice-chat`.
- **Expected:** Widget host should gracefully fall back without crashing.
- **Actual (before):** Uncaught storage access could break initialization.
- **Scope:** `src/components/widget/VoiceWidgetHost.tsx`
- **Fix summary:** Wrapped localStorage reads in defensive `try/catch` fallbacks for agent id and UI config.
- **Verification:** `npm run lint` and `npm run build` pass after change.
