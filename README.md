# White Label VoiceWidget

Self-hosted Next.js app for configuring, previewing, and embedding a white-labeled, ElevenLabs-powered voice/chat widget.

## What this repo provides
- `/` — guided setup wizard (hosting → agent → customize → deploy → embed code).
- `/configure` — full configuration studio: agent ID, theming, embed snippets, import-from-URL.
- `/embed` — embeddable host route that resolves query params + saved browser config.
- `/voice-chat` — standalone full-page hosted experience.
- `/widget.js` — dependency-free floating-launcher script for customer sites.

## Quick start
```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Embedding options
Both snippets are generated for you on `/` (wizard) and `/configure`:

1. **Floating launcher** (recommended) — a small branded button that opens the
   widget in a panel:
   ```html
   <script src="https://YOUR-DOMAIN/widget.js"
           data-src="https://YOUR-DOMAIN/embed?agentId=..."
           data-color="#c7eb68" data-label="Chat with us" async></script>
   ```
   The launcher dispatches `voicewidget:open/close/connected/disconnected`
   events on `window` for host-page analytics.
2. **Inline iframe** — a fixed block embedded in the page flow:
   ```html
   <iframe src="https://YOUR-DOMAIN/embed?agentId=..." title="Chat with us"
           width="100%" height="600" style="border:0;" allow="microphone"></iframe>
   ```

## Widget behavior
- **Voice + Chat mode:** visitors can start a voice call *or* text-chat
  without ever granting microphone access (text uses an ElevenLabs
  `textOnly` websocket session).
- Transcripts persist across call start/end with "conversation
  started/ended" dividers.
- Connection and microphone-permission failures surface in the widget with
  actionable messages.

## Runtime precedence rules
For `/embed`, runtime settings resolve per field in this order:
1. query params,
2. localStorage-saved UI config (`voice_widget_ui_config_v1`),
3. defaults from `src/components/widget/ui-config.ts`.

Agent ID resolves in this order:
1. `agentId` query param,
2. browser-saved ID (`voice_widget_agent_id`),
3. `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`.

Generated embed URLs only include options that differ from the defaults.

## Customization surface
Layout (`compact`, `framed`, `rounded`, `height`, `mode`), content
(`brandLabel`, placeholders, empty-state text), branding (`orbPrimaryColor`,
`orbSecondaryColor`, `surfaceColor`, `textColor`, `userBubbleColor`,
`userBubbleTextColor`, `assistantBubbleColor`, `fontFamily`,
`pageBackground` incl. `transparent`, `assistantAvatarImageUrl`,
`messageStyle`), and `language` (agent language override — requires the
override to be enabled in your ElevenLabs agent's security settings).

## Environment
```bash
# Optional fallback agent for /voice-chat (baked in at build time)
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id

# Optional: restrict which sites may iframe /embed (space-separated origins)
EMBED_FRAME_ANCESTORS="https://www.example.com https://example.com"

# Optional: source repo advertised in the wizard's deploy step
NEXT_PUBLIC_WIDGET_REPO_URL=https://github.com/you/your-fork
```

## Validation commands
```bash
npm run lint
npm test
npm run build
```

## Notes for embedding
- Ensure your deployed domain uses HTTPS so microphone permissions work reliably in browsers.
- The widget uses your **public** agent ID, which is visible to anyone who
  inspects the page. Restrict the agent to your domains in ElevenLabs
  (Agent → Security) so others can't reuse it.
- The `/embed` document renders with a transparent background by default so
  it blends into customer sites; set `pageBackground` for a solid color.
