# P0–P3 QA Audit + Fix Plan (Parallel Execution)

## Executive overview
We are building a reliable, embeddable voice widget experience for operators who configure once (`/configure`) and deploy/share across `/embed` and `/voice-chat`. We will run a full criticality-based QA pass (P0 to P3), then deliver minimal, targeted fixes with clear proof. Success is measured by:
1. No P0 defects remain open.
2. All P1 defects are fixed or documented with an approved mitigation.
3. P2/P3 defects are triaged with explicit fix/defer decisions.
4. Validation evidence is reproducible with commands and observable UI checks.

## Contracts first (to prevent drift)

### Contract A: Severity model (must be used verbatim)
- **P0:** Core path unusable, runtime crash, or security/privacy issue.
- **P1:** Core flow works but high-impact degradation.
- **P2:** Correctness/usability defect with workaround.
- **P3:** Cosmetic/low-impact issue.

### Contract B: Runtime resolution precedence
For agent/config resolution in all workstreams, treat behavior as:
1. URL query params,
2. localStorage persisted values,
3. defaults (`DEFAULT_UI_CONFIG` / env fallback).

### Contract C: Shared TS interfaces (no shape changes during this phase)
- `WidgetUiConfig` shape and primitive unions must not be changed in this phase.
- `VoiceWidget` public props must remain backward compatible.

### Contract D: Environment variable names (no additions)
- `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` only.

### Contract E: Stub file map for independent execution
Agents may add/update only within owned files and must not cross ownership boundaries.
- WS1 ownership:
  - `docs/qa/findings-p0-p1.md`
- WS2 ownership:
  - `src/components/ui/orb.tsx`
- WS3 ownership:
  - `src/components/widget/EmbedWidgetPage.tsx`
  - `src/components/widget/VoiceWidgetHost.tsx`
- WS4 ownership:
  - `src/components/widget/VoiceWidget.tsx`
- WS5 ownership:
  - `docs/qa/findings-p2-p3.md`
  - `docs/qa/fix-log.md`

### Contract F: Validation output contract
Every workstream must add:
- exact command(s),
- pass/fail expectation,
- observed result,
- mapping from result to severity criteria.

---

## Parallel workstreams

## Workstream 1 — P0/P1 Audit Triage
**Agent role:** QA lead (critical-path triage)

**File ownership**
- `docs/qa/findings-p0-p1.md`

**Inputs**
- Contracts A–F in this file.
- Existing code in `src/app/*`, `src/components/widget/*`, `src/components/ui/*` (read-only for this stream).

**Outputs**
- Structured defect log for all discovered P0/P1 issues with repro, expected/actual, impacted files, and smallest-fix suggestion.

**Step-by-step tasks**
1. Execute baseline static checks (`npm run lint`, `npm run build`).
2. Run route smoke checks in dev server: `/`, `/configure`, `/embed`, `/voice-chat`.
3. Verify no missing-agent crash scenarios.
4. Verify mode switching (`voice-chat`, `voice-only`) and UX parity.
5. Log each P0/P1 defect in template form.

**Success criteria (binary/observable)**
- `docs/qa/findings-p0-p1.md` exists and contains at least one of:
  - “No P0/P1 defects found” statement with evidence, or
  - one or more defects with reproducible steps and ownership tags.

**Validation steps**
- `npm run lint` → known baseline may fail; capture exact errors.
- `npm run build` → passes or fails with error details captured.
- Manual browser checks: each route loads without blank/crash.

**Edge cases + negative tests**
- Invalid query params (`height=abc`, `rounded=bad`, `mode=invalid`).
- Empty/whitespace agent ID.
- Corrupted localStorage JSON for UI config.

---

## Workstream 2 — P0 Fixes: Rendering/Lint Purity
**Agent role:** Frontend stability engineer

**File ownership**
- `src/components/ui/orb.tsx`

**Inputs**
- WS1 defect IDs tagged for `orb.tsx`.
- Contracts A–F.

**Outputs**
- Minimal patch eliminating P0/P1 purity/immutability issues without API changes.

**Step-by-step tasks**
1. Replace render-time non-deterministic calls with deterministic/stateful initialization.
2. Move hook-returned value mutation into safe initialization paths.
3. Ensure animation loop updates do not violate React hook immutability lint constraints.
4. Re-run lint to verify orb-related errors are resolved.

**Success criteria (binary/observable)**
- No ESLint errors from `src/components/ui/orb.tsx`.
- Visual orb still renders in default widget state.

**Validation steps**
- `npm run lint` → no errors referencing `src/components/ui/orb.tsx`.
- Route smoke check `/voice-chat` to confirm orb presence.

**Edge cases + negative tests**
- Missing `seed` prop.
- Re-renders triggered by parent state changes.
- Dark/light mode document class differences.

---

## Workstream 3 — P1 Fixes: Agent/config resolution hardening
**Agent role:** Widget runtime engineer

**File ownership**
- `src/components/widget/EmbedWidgetPage.tsx`
- `src/components/widget/VoiceWidgetHost.tsx`

**Inputs**
- WS1 defect IDs tagged for host/embed resolution.
- Contracts A–F.

**Outputs**
- Minimal hardening fixes for malformed storage, empty ids, and fallback consistency.

**Step-by-step tasks**
1. Verify and normalize agent ID trimming and fallback sequencing.
2. Ensure malformed localStorage states cannot break render path.
3. Keep missing-agent fallback UI deterministic and actionable.
4. Add tiny guard logic only where defects reproduce.

**Success criteria (binary/observable)**
- `/embed` and `/voice-chat` never crash under malformed storage/query inputs.
- Missing-agent fallback appears when expected.

**Validation steps**
- Manual checks with localStorage permutations.
- Route checks with query param overrides.
- `npm run lint` for touched files clean.

**Edge cases + negative tests**
- `localStorage[UI_CONFIG_STORAGE_KEY] = '{bad json'`.
- `agentId` query param empty string + spaces.
- `mode` invalid value.

---

## Workstream 4 — P2 Fixes: Conversation UX correctness
**Agent role:** Interaction QA engineer

**File ownership**
- `src/components/widget/VoiceWidget.tsx`

**Inputs**
- WS1/WS5 findings for interaction defects.
- Contracts A–F.

**Outputs**
- Minimal UI behavior fixes for copy button state, empty state, and mode-specific controls.

**Step-by-step tasks**
1. Verify copy-to-clipboard state behavior across message list changes.
2. Validate empty-state visibility toggles by mode.
3. Confirm text-input disabled/hidden behavior is consistent for `voice-only`.
4. Apply only narrowly scoped logic fixes.

**Success criteria (binary/observable)**
- No incorrect copy feedback persistence after message list updates.
- `voice-only` mode shows no text input and no chat empty-state section.

**Validation steps**
- Manual message flow checks in `/voice-chat` and `/embed`.
- `npm run lint` for touched file clean.

**Edge cases + negative tests**
- Rapid copy clicks on different assistant messages.
- Disconnect/reconnect resets message list.
- Switching modes via embed query params.

---

## Workstream 5 — P2/P3 Audit Documentation + Release Readiness
**Agent role:** QA documentation engineer

**File ownership**
- `docs/qa/findings-p2-p3.md`
- `docs/qa/fix-log.md`

**Inputs**
- Contracts A–F.
- Outputs from WS2–WS4 (read-only).

**Outputs**
- Full P2/P3 defect list and closure/follow-up log.

**Step-by-step tasks**
1. Audit remaining routes/components for medium/low issues.
2. Record each issue with repro, scope, and fix/defer decision.
3. Summarize fixed items with commit references and verifications.
4. Produce release-readiness note: open defects by severity.

**Success criteria (binary/observable)**
- Both doc files exist and list all non-critical defects with decision status.
- Open defects are explicitly labeled “defer” with rationale.

**Validation steps**
- Link each finding to a file path and check step.
- Verify all acceptance checklist items are traceable.

**Edge cases + negative tests**
- Cosmetic regressions between `/embed` and `/voice-chat`.
- Layout issues at min/max configured widget heights.

---

## Integration plan (dependency-free merge strategy)
- Integration method: contract-first + isolated file ownership.
- No workstream requires another to start; each uses Contracts A–F and can execute immediately.
- Merge order (safe, low conflict): WS1 → WS2 → WS3 → WS4 → WS5.
- Conflict prevention:
  - No shared-file ownership across streams.
  - If cross-cutting need appears, create adapter/helper in owner file instead of modifying another stream’s file.
  - Rebase each stream before merge and rerun validation commands.

## Acceptance checklist (1:1 mapped)
- [ ] AC1 (WS1): P0/P1 findings doc produced with reproducible evidence.
- [ ] AC2 (WS2): `orb.tsx` lint/purity issues resolved; orb still visible.
- [ ] AC3 (WS3): Host/embed fallback behavior robust under malformed input.
- [ ] AC4 (WS4): Conversation behavior correct for copy state + mode gating.
- [ ] AC5 (WS5): P2/P3 docs + fix log completed with decision status.

## Parallel-work risks + mitigations
- **Risk: Contract drift** (agents define different expected behavior).
  - **Mitigation:** Contracts A–F are authoritative; any deviation requires explicit plan.md update first.
- **Risk: Hidden coupling through shared runtime assumptions**.
  - **Mitigation:** Ownership boundaries + mandatory validation in both `/embed` and `/voice-chat`.
- **Risk: Merge conflicts in shared files**.
  - **Mitigation:** strict non-overlapping ownership; adapter pattern instead of cross-file edits.
- **Risk: Over-fixing beyond severity scope**.
  - **Mitigation:** each fix must map to a finding ID and severity in docs.
