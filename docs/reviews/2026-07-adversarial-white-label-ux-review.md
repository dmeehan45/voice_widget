# Adversarial Review — White Label VoiceWidget (July 2026)

**Scope:** functionality + UX of the end-to-end capability: "easily set up a white-labeled voice widget, embed it into a website, apply your branding on top of an existing ElevenLabs agent."
**Method:** full source read of every route/component, verification against the installed `@elevenlabs/react@0.12.3` / `@elevenlabs/client` type surface, production build (`npm run build` ✅ passes), and bundle inspection. Findings reference `file:line` on branch `claude/white-label-widget-ux-review-zrluba` (base: `main@63cf570`).

---

## Verdict

The demo is polished, but the product promise fails at three levels today:

1. **The setup funnel has two hard dead ends and one silently-broken output.** The "managed" path is a Coming Soon panel discovered *after* the user has done all the work; the "self-hosted" path says "Deploy this app" without ever linking to the app's source; and the final embed snippet contains a literal `https://your-domain` that produces a blank iframe if pasted as-is.
2. **The widget fails silently at the moment of truth.** Every runtime error (mic denied, wrong agent ID, non-public agent, network) goes to `console.error` only. A visitor clicks the phone button, nothing happens, and the status flips back to "Ready to start."
3. **The "white label" surface is thin and leaky.** The customer can recolor the orb and rename some strings — but the tool's own brand (beige paper texture background, lime-green user bubbles, hard-coded English status text, an error card that says "ElevenLabs") ships to their end users and cannot be changed.

Root cause of about half of these: **there is no server-side anything.** Config lives in the operator's browser (`localStorage`) plus a query string. That single architectural choice creates the works-on-my-machine traps, blocks private agents, blocks central brand updates, and blocks every provider (Hume included) whose auth requires a server-minted token.

---

## A. Where users get hung up (journey order)

Severity: **P0** = blocks the core promise · **P1** = severe degradation · **P2** = notable friction with workaround · **P3** = polish.

### Funnel: landing → wizard → embed code

| # | Sev | Finding | Evidence |
|---|-----|---------|----------|
| F1 | P0 | **Managed path is a dead end discovered at step 4 of 5.** "Host it for me" is presented first and promises "an embed snippet that just works," but after Connect → Customize the user hits a "Coming Soon" panel. Worse, "Continue to Embed Code" still proceeds to "Your widget is ready!" and emits a snippet pointing at `https://your-domain` — and the *replace-your-domain* instruction is only shown to self-hosted users. A managed-path user ships a guaranteed-broken iframe. | `StepChoosePath.tsx:26-58`, `StepHostingSetup.tsx:64-79`, `StepGetEmbed.tsx:49-59,101-103` |
| F2 | P0 | **Self-hosted step 1 says "Deploy this app" but never says where the app is.** No repo URL, no clone instructions, no Vercel "Deploy" deep link (`vercel.com/new/clone?repository-url=...`) — just generic `vercel.com/new` / `app.netlify.com/start`, which ask the user to import a Git repo they don't have. Anyone running the wizard on a hosted instance (i.e., the target customer) is stuck at the first real step. | `StepHostingSetup.tsx:130-152` |
| F3 | P1 | **The wizard hardcodes `https://your-domain` in the copied embed code even when the app is already running on the user's real domain.** `window.location.origin` is available (and used for the managed branch two lines up), but the self-hosted branch ignores it. Meanwhile `/configure` *does* use the real origin. Two flows, two different snippets for the same intent. Pasting the wizard snippet unedited yields a DNS-failing, blank iframe with no diagnostic. | `StepGetEmbed.tsx:53-59` vs `configure/page.tsx:56-57` |
| F4 | P1 | **"Save and deploy" deploys nothing, and preview ≠ visitor reality.** Saving writes to the operator's own `localStorage`. `/embed` resolves params → *visitor's* localStorage → env default, so the operator (who has saved config) sees a working styled widget even with a partial URL, while real visitors on the customer site get defaults or the "Missing agent ID" card. The works-on-my-machine trap is built into the resolution order. | `configure/page.tsx:61-67,174`, `EmbedWidgetPage.tsx:71-96`, `use-stored-widget-config.ts` |
| F5 | P1 | **No agent ID validation or test call anywhere.** Step 2 accepts any non-empty string ("Continue" gates on `trim().length > 0`). Nothing checks the `agent_` shape, and nothing offers "test connection" before the user deploys. The first signal that the ID is wrong arrives as a silent runtime failure (see R1) — likely on the customer's production site. | `StepConnectAgent.tsx:18`, no validation in `ui-config.ts` |
| F6 | P2 | **Wizard state is all in memory.** A refresh at step 4 loses the hosting choice, agent ID, and all customization, and even collapses back to the pre-wizard landing state ("Get Started" must be clicked again). Nothing persists until the step-4 "Save to this browser" button — itself developer-speak (localStorage) leaking into user copy. | `WizardShell.tsx:30-36`, `page.tsx:12,53`, `StepHostingSetup.tsx:189-205` |
| F7 | P2 | **Customize step friction.** (a) The live preview is `hidden lg:block` — phone/tablet users customize blind. (b) The height field clamps on every keystroke: typing "8" becomes 360, so entering "800" by hand is effectively impossible. (c) The color text inputs accept anything; a non-`#rrggbb` value breaks the paired `<input type="color">` and reaches `new THREE.Color(...)`, which falls back with console warnings — no user feedback. (d) Avatar is URL-only (no upload, no validation, no preview fallback). | `StepCustomize.tsx:41`, `WidgetConfigForm.tsx:74-93,211-238`, `orb.tsx:97-98` |
| F8 | P2 | **The env-var instruction is a redeploy trap.** `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` is inlined at build time; changing agents means rebuilding — never mentioned. It's also redundant for the iframe path (the agent ID is already in the URL), so the "required" step adds friction without explaining what it's actually for (`/voice-chat` fallback). | `StepHostingSetup.tsx:155-163`, `voice-chat/page.tsx:6` |
| F9 | P2 | **Config can't round-trip.** The embed URL *is* the config, but `/configure` never reads query params back into the form. To tweak one color next month, the user re-enters everything from scratch (or hand-edits a 400-char URL). There's also no way to manage more than one widget. | `configure/page.tsx:20-28` |
| F10 | P2 | **The mobile menu button is dead.** On small screens the header nav collapses to a hamburger button with no `onClick` and no menu — mobile users cannot reach `/configure` or `/voice-chat` from the header at all. | `page.tsx:35-37`, `configure/page.tsx:123-125` |
| F11 | P3 | **Docs drift.** README documents storage keys `voice-widget-agent-id`/`voice-widget-ui-config` (actual: `voice_widget_agent_id`, `voice_widget_ui_config_v1`), and a checklist-progress key that no longer exists; the QA log describes a `getSingleParam` fix in a file where it doesn't live. Trust erosion for self-hosters debugging via docs. | `README.md:28-37` vs `use-stored-widget-config.ts:12`, `ui-config.ts:1` |

### Runtime: the visitor on the customer's site

| # | Sev | Finding | Evidence |
|---|-----|---------|----------|
| R1 | P0 | **All failures are invisible.** `onError` chains end at `console.error`; mic-permission denial, invalid/non-public agent, and connection loss all silently reset the status to "Ready to start." No retry hint, no "check mic permissions," nothing. For the intended buyer this is the single worst defect: their customers experience a button that does nothing, and the operator gets zero signal. | `VoiceWidget.tsx:213`, `conversation-bar.tsx:120-131,153-157` |
| R2 | P1 | **"Voice + Chat" requires a live voice call to chat.** The keyboard toggle, textarea, and send button are all `disabled={!isConnected}`. The empty state literally says "Tap the phone button **or type a message**" and the landing page promises "by voice or text" — both false. Visitors without a mic (or unwilling to grant one) are locked out entirely. The installed SDK supports `textOnly` sessions (`BaseSessionConfig.textOnly`, `overrides.conversation.textOnly`) — this is a product gap, not an SDK limit. | `conversation-bar.tsx:333,387,393`, `ui-config.ts:36`, SDK: `@elevenlabs/client/dist/utils/BaseConnection.d.ts:34-46` |
| R3 | P1 | **Every keystroke is transmitted to the agent as a contextual update.** `handleTextChange` calls `conversation.sendContextualUpdate(value)` on each change event with the full partial text ("h", "he", "hel"…). This floods the agent's context (behavior + cost), and it's a privacy defect: text the visitor typed and then deleted *was already sent*. | `conversation-bar.tsx:210-220` |
| R4 | P1 | **The transcript is destroyed the instant the call ends.** `onDisconnect` clears `messages`. A visitor who was read a confirmation number and hangs up loses it; a dropped connection wipes the record mid-conversation. Combined with R2 there is no way to re-read anything after disconnect. | `VoiceWidget.tsx:184-188` |
| R5 | P2 | **Mic stream leaks on failed connect.** `startConversation` acquires a raw `getUserMedia` stream (redundantly — the SDK acquires its own for WebRTC) and only stops tracks in `handleEndSession`/unmount. If `startSession` throws after the grant, the browser's mic indicator stays hot until the tab closes. | `conversation-bar.tsx:133-158,160-168,232-238` |
| R6 | P2 | **Voice-only mode renders a mostly-empty box.** The conversation area isn't rendered, but the container keeps the configured height (min 360px) with a small bar at the bottom — hundreds of blank pixels that read as broken. The 360px floor also prevents the compact "voice pill" this mode implies. | `VoiceWidget.tsx:79-171`, `ui-config.ts:3` |
| R7 | P2 | **The iframe ships the tool's beige, textured page background.** `body { background: #e4e2de + radial-gradient }` applies to `/embed` too; `bg-transparent` on the wrapper can't undo it. On any non-beige customer site the widget sits in an off-brand beige slab. No background/transparency control exists. | `globals.css:54,128-131`, `EmbedWidgetPage.tsx:120` |
| R8 | P2 | **Hydration mismatches from localStorage-seeded `useState`.** Server HTML renders defaults; the client's first render reads localStorage. React 19 logs hydration errors and re-renders — console noise in every configured browser, and a flash of defaults. | `configure/page.tsx:20-28`, `use-stored-widget-config.ts:28-32` |
| R9 | P2 | **~1MB+ of WebGL just to idle.** The orb pulls `three` + `@react-three/fiber` + `@react-three/drei` eagerly on every embed load (largest chunks 764K/608K/572K uncompressed; `.next/static/chunks` totals 16MB). That's a heavy tax on the customer's page for a decorative idle orb, with no lazy-load or lightweight fallback. | `package.json:17-19`, build output |
| R10 | P3 | **Status tile layout is fragile.** The brand label lives in a fixed `w-[120px] h-8` box with the status line overflowing beneath it; long brand labels truncate at 10px font. "Customer Support" barely fits; real brand names won't. | `conversation-bar.tsx:256-306` |

### Security / abuse (matters for trust and for the managed offering)

| # | Sev | Finding | Evidence |
|---|-----|---------|----------|
| S1 | P1 | **The agent ID is public and reusable, and only public agents work.** The embed URL prints the agent ID into every customer page (view-source harvestable); anyone can lift it and run conversations against the operator's ElevenLabs quota from any site. The SDK's private-agent auth (`signedUrl` / `conversationToken`) is unused — there is no server to mint tokens — and the wizard never mentions ElevenLabs' own domain-allowlist mitigation. | `StepGetEmbed.tsx:30`, SDK: `BaseConnection.d.ts:49-68` |
| S2 | P2 | **The deployment is an open widget host.** No `frame-ancestors` CSP / `X-Frame-Options` policy and no agent allowlist means any third party can iframe `https://operator-domain/embed?agentId=THEIRS` — free-riding on the operator's hosting, with the mic-permission prompt displaying the *operator's* domain (brand impersonation). | `next.config.ts` (empty), no middleware |
| S3 | P3 | **The end-user error card leaks the vendor and the internal tool.** A visitor hitting `/embed` without an agent ID sees "Missing ElevenLabs agent ID" plus an "Open /configure" button — on the customer's branded site. | `EmbedWidgetPage.tsx:98-117` |

---

## B. Where the feature set is incomplete

Measured against "simple + easy white-label on top of your existing agent":

1. **Managed hosting doesn't exist** — no auth, no billing, no dashboard, no `/w/:slug/embed` route. Notably, `widgetSlug` plumbing already exists in wizard state (`WizardShell.tsx:18,117-119`, `StepGetEmbed.tsx:49-51`) but nothing ever sets it. The intended design is visible; none of it is implemented.
2. **No config service.** No server-persisted config, no config ID, no multi-widget, no team sharing, no "update branding without re-embedding." The embed URL is the database.
3. **No floating launcher.** The only embed form is a fixed inline iframe block (min 360px tall). The category-standard pattern — a small bubble that expands over the page, via a one-line `<script>` tag — doesn't exist. This is the #1 expectation gap for "embed a chat widget."
4. **No text-only chat**, despite SDK support (R2).
5. **Branding depth is two orb colors + five strings.** No background/surface color, no user/assistant bubble colors (user bubbles are hardcoded to the tool's lime `--primary: #c7eb68`; `message.tsx:26-33`, `globals.css:60`), no font, no logo, no launcher icon, no dark mode, no custom CSS.
6. **No i18n.** "Connecting…", "Live now", "Ready to start", "Copy", aria-labels, and `<html lang="en">` are hardcoded; the SDK's `overrides.agent.language` is unexposed. Non-English customers cannot white-label.
7. **No error/permission UX** (R1) and no connection-recovery/reconnect story.
8. **No private-agent support** (S1) — the serious buyer with an authenticated agent is excluded.
9. **No agent overrides / dynamic variables.** `overrides` (first message, voice, prompt, language) and `dynamicVariables` — the cheapest per-deployment personalization the SDK offers — are entirely unexposed.
10. **No analytics/transcripts for the operator** (conversation started/ended events, transcript webhook/email), and no consent/disclaimer slot for recording-consent compliance.
11. **No tests and no CI.** `package.json` has no test script; nothing guards the config-resolution matrix (params → storage → env) that the whole product depends on.

---

## C. How this capability should improve (roadmap by leverage)

### Tier 1 — Make the current promise true (days, no architecture change)
- Fix F1–F3: hide or honestly gate the managed card ("waitlist"); add the repo URL + a real `vercel.com/new/clone?repository-url=` button; use `window.location.origin` in the wizard snippet with a highlighted, explicit "replace this" token only when genuinely unknown.
- Surface errors (R1): visible states for mic-denied / connect-failed / agent-invalid, with a retry.
- Unlock text chat via `textOnly`/text-first sessions (R2); stop the per-keystroke `sendContextualUpdate` (R3); keep the transcript after disconnect with a "conversation ended" divider (R4); stop mic tracks on failed connect (R5).
- Add an **agent test call** to wizard step 2 ("Test connection" → speaks the first message) so bad IDs die in the wizard, not in production.
- Fix the height-input clamp, validate hex colors, persist wizard state to sessionStorage, fix the dead mobile menu, make `/configure` import config from a pasted embed URL (F9).

### Tier 2 — Real white-label depth (the actual product)
- **Theme tokens:** background (incl. transparent), surface, user-bubble, assistant-bubble, text, accent, font family, logo image, corner radius scale, dark mode. Kill the beige body background on `/embed` (R7).
- **String pack / locale:** every UI string configurable or locale-selected; expose `overrides.agent.language`.
- **De-brand end-user surfaces:** vendor-neutral error card (S3), configurable iframe/page title, brand-label width that fits real names (R10).
- **Compact voice-only pill** layout (R6) and a lazy-loaded orb with a lightweight CSS fallback (R9).

### Tier 3 — Structural (unlocks managed + everything else)
- **Hosted config service:** store config server-side (Supabase is already in this stack's orbit) under a slug → embed URL becomes `https://host/w/:slug/embed`. Operators update branding centrally without touching customer sites; the wizard's existing `widgetSlug` plumbing finally gets a producer. This also kills the URL-as-database fragility (F4, F9).
- **Script-tag embed + floating launcher:** `<script src=".../widget.js" data-widget="slug">` injecting a positioned, expandable iframe, with a `postMessage` API (open/close, conversation-started/ended events) so host pages can integrate and track.
- **Server token exchange:** `/api/session` mints ElevenLabs `conversationToken`/`signedUrl` with a server-held API key → private agents work, the public agent ID disappears from customer pages (S1), per-slug domain allowlists + `frame-ancestors` CSP stop free-riding (S2).
- **Operator analytics:** conversation counts, durations, error rates per widget; optional transcript webhook.

### Tier 4 — Platform value
- Passthrough for `overrides` (first message, voice, prompt) and `dynamicVariables` fed from the host page via the script-tag API (e.g., logged-in user name) — high perceived personalization for near-zero effort.
- Client-tools bridge (agent triggers host-page actions), consent text slot, multiple named widgets per account.

**Honesty note:** visual white-labeling is achievable; *network-layer* white-labeling is not — devtools will always show ElevenLabs/LiveKit endpoints. Position the offering accordingly ("your brand, your domain, your UX" — not "invisible vendor").

---

## D. Can this extend to Hume and other voice platforms?

**Yes at the UI layer — the coupling is already narrow. But "easily" is conditional on building the Tier-3 backend first.**

### What's already portable
`ConversationBar` is the **only** file importing `@elevenlabs/react`. `VoiceWidget`, `Conversation`, `Message`, `Orb`, `LiveWaveform` (it runs its own mic analyser), the wizard, and the theming system are all provider-neutral. The seam is one component + the `agentId` concept.

### The adapter design
Define a provider interface and make `ConversationBar` consume it:

```ts
interface VoiceSessionAdapter {
  status: "disconnected" | "connecting" | "connected" | "disconnecting"
  start(opts: { connection: ProviderConnection }): Promise<void>
  end(): Promise<void>
  setMuted(muted: boolean): void
  sendText(text: string): void            // capability-gated
  on(event: "message", cb: (m: { role: "user" | "assistant"; text: string }) => void): void
  on(event: "error" | "status", cb: (payload: unknown) => void): void
  capabilities: {
    textOnly: boolean; textDuringVoice: boolean
    requiresServerToken: boolean; overrides: boolean
  }
}
```

- **ElevenLabs adapter:** wraps `useConversation` (today's code, minus the keystroke-context bug). Public agents connect client-side; private agents via server-minted `conversationToken`.
- **Hume EVI adapter:** wraps `@humeai/voice-react` (`VoiceProvider`/`useVoice`), connecting with a **server-minted access token** and a `configId` instead of an `agentId`. Text input maps to `sendUserInput`. Bonus differentiator: EVI returns prosody/emotion scores per message — a "show sentiment" toggle no single-vendor widget offers. *(Verify current Hume SDK package/API at implementation time.)*
- Same shape fits OpenAI Realtime, Vapi, Retell, Pipecat/LiveKit agents — nearly all of which also require ephemeral server-minted credentials.

### The two real blockers
1. **Auth architecture.** Hume (and every other serious platform) cannot be driven from a purely static site — API keys must stay server-side and tokens must be minted per session. The current app has zero server runtime. The Tier-3 token-exchange/config service is therefore *the* prerequisite for multi-provider — and once it exists for Hume, ElevenLabs private agents come free (and vice versa).
2. **Config schema.** `agentId` is baked into the query-string contract, storage keys, and env names. Version the config (`v2`) to `{ provider: "elevenlabs" | "hume", connection: {...per-provider...}, theme: {...}, behavior: {...} }`, referenced by slug rather than serialized into URLs. Wizard step 2 becomes a provider picker whose field label, help steps ("where to find your Config ID"), and test-call routine come from a per-provider descriptor.

### Strategic read
This is the right move, and arguably the product's only durable moat. ElevenLabs already ships its own embeddable widget with basic customization (and de-branding on paid tiers), so "a nicer config UI for ElevenLabs" is a thin, erodible position. **"One white-label widget + config service + floating launcher that works across ElevenLabs, Hume, and friends — swap the brain, keep the brand"** is a position none of the platform vendors can occupy, because each is structurally locked to its own stack. The adapter cost is modest precisely because the current UI coupling is one file wide; the backend it forces (token mint + hosted config) is the same backend the managed-hosting business model needs anyway. Build it once, unlock both.

---

## Appendix — verified environment facts

- `npm run build` ✅ (Next 16.1.1, 7/7 static pages; `/embed` is the only dynamic route).
- `@elevenlabs/react@0.12.3` confirms: `startSession` accepts `onStatusChange` (current usage is valid); `SessionConfig` = `PublicSessionConfig | PrivateWebSocketSessionConfig (signedUrl) | PrivateWebRTCSessionConfig (conversationToken)`; `BaseSessionConfig` exposes `textOnly`, `overrides` (agent prompt/first message/language, TTS voice/speed, `conversation.textOnly`), and `dynamicVariables` — all currently unused by the widget.
- Largest client chunks: 764K / 608K / 572K / 420K / 412K uncompressed (three.js + R3F + drei dominate); `.next/static/chunks` totals 16MB.
- No `middleware.ts`, no headers config in `next.config.ts` → no CSP / frame-ancestors policy on `/embed`.
