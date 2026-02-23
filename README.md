# Voice Widget

Self-hosted Next.js app for configuring, previewing, and embedding an ElevenLabs-powered voice/chat widget.

## What this repo provides
- `/` — setup guide and progress checklist.
- `/configure` — set agent ID, customize widget UI, and generate embed snippet.
- `/embed` — embeddable host route that resolves query params + saved browser config.
- `/voice-chat` — standalone full-page hosted experience.

## Quick start
```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Configuration flow
1. Open `/configure`.
2. Enter your ElevenLabs Agent ID.
3. Customize widget options (mode, framing, labels, colors, avatar, etc.).
4. Click **Save and deploy**.
5. Copy either:
   - direct `/embed?...` URL, or
   - `<iframe ...>` embed code generated on the page.

## Runtime precedence rules
For `/embed`, runtime settings resolve in this order:
1. query params,
2. localStorage-saved UI config,
3. defaults from `src/components/widget/ui-config.ts`.

Agent ID resolves in this order:
1. `agentId` query param,
2. browser-saved ID,
3. `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`.

## Environment
Set this optional variable for default/fallback behavior:

```bash
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id
```

## Validation commands
```bash
npm run lint
npm run build
```

## Notes for embedding
- Ensure your deployed domain uses HTTPS so microphone permissions work reliably in browsers.
- The generated iframe includes `allow="microphone"` and uses the configured widget height.
