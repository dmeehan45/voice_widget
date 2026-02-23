# Current State Reference (QA Baseline)

_Last updated: 2026-02-23_

## Purpose
This document is the single reference snapshot of the repository before QA audit work. It captures what exists today, how the app is wired, and where to focus issue triage by criticality.

## Tech stack and runtime
- Framework: Next.js App Router (`next@16`) with React 19 and TypeScript.
- Styling/UI: Tailwind CSS v4 + custom UI primitives under `src/components/ui`.
- Voice SDK integration: `@elevenlabs/react` dependency is installed.
- Local tooling scripts: `dev`, `build`, `start`, `lint`.

## Application routes (current)
- `/` — Setup guide checklist and navigation hub.
- `/configure` — Widget configuration UI with local persistence of settings.
- `/embed` — Host page that resolves query params/local storage into widget props.
- `/voice-chat` — Standalone full-page host for the widget.

## Core widget architecture
- `VoiceWidget` is the central UI component. It accepts configuration props for mode (`voice-chat` or `voice-only`), framing, rounding, labels/text, orb colors, avatar image, and message style.
- `VoiceWidgetHost` loads/saves the agent id from `localStorage` key `voice-widget-agent-id`, then passes resolved configuration into `VoiceWidget`.
- `EmbedWidgetPage` resolves runtime settings in this order:
  1. query params,
  2. locally stored UI config,
  3. defaults from `ui-config.ts`.
- Configuration schema and sanitization live in `src/components/widget/ui-config.ts` and include:
  - layout (`compact`, `framed`, `rounded`, `height`),
  - content labels (`brandLabel`, placeholders, empty-state text),
  - visuals (orb primary/secondary, assistant avatar URL),
  - message style and mode.

## Data/state persistence points
- Agent ID storage key: `voice-widget-agent-id`.
- UI config storage key: `voice-widget-ui-config`.
- Setup checklist progress key: `voice-widget-setup-progress`.

## Environment dependency
- `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` is read by `/voice-chat` and `/embed` fallback resolution logic.

## QA criticality rubric for upcoming audit
Use this classification during defect logging:

- **P0 (Critical):** Broken core path (cannot start or use widget), runtime crash, or security/privacy defect.
- **P1 (High):** Core flow works but severe degradation (major accessibility break, wrong agent routing, embed host unusable in common scenario).
- **P2 (Medium):** Noticeable correctness/usability defect with workaround.
- **P3 (Low):** Cosmetic/informational issues, minor UX polish.

## Initial QA focus map (prioritized)
1. **P0/P1 target:** Agent resolution and missing-agent fallback behavior on `/embed` and `/voice-chat`.
2. **P0/P1 target:** Local storage reads/writes across configure/embed/host pages (load, sanitize, recover from malformed data).
3. **P1 target:** Voice modes (`voice-chat` vs `voice-only`) and control visibility for each mode.
4. **P1/P2 target:** Query param parsing boundaries (`height`, booleans, enum-like values).
5. **P2 target:** Visual customization rendering consistency (orb colors, avatar URL, rounded/frame/message style).
6. **P2/P3 target:** Copy interactions and empty-state messaging in conversation UI.

## Known constraints of this snapshot
- README is generic boilerplate and does not document project-specific workflows.
- No explicit test suite scripts are currently defined in `package.json` beyond linting.

## Suggested audit output format (next step)
For each finding:
- ID
- Severity (P0–P3)
- Repro steps
- Expected vs actual
- Scope (route/component/file)
- Suggested fix (smallest change)
- Verification command or manual check
