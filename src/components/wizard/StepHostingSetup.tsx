"use client"

import { useState } from "react"
import { CheckIcon, CopyIcon, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { copyTextToClipboard } from "@/lib/clipboard"
import { AGENT_ID_STORAGE_KEY } from "@/components/widget/VoiceWidgetHost"
import { REPO_URL } from "@/components/widget/embed-code"
import {
  UI_CONFIG_STORAGE_KEY,
  type WidgetUiConfig,
} from "@/components/widget/ui-config"

interface StepHostingSetupProps {
  agentId: string
  uiConfig: WidgetUiConfig
  onNext: () => void
  onBack: () => void
}

export function StepHostingSetup({
  agentId,
  uiConfig,
  onNext,
  onBack,
}: StepHostingSetupProps) {
  const [copiedEnv, setCopiedEnv] = useState(false)

  const envLine = `NEXT_PUBLIC_ELEVENLABS_AGENT_ID=${agentId.trim()}`
  const vercelDeployUrl = `https://vercel.com/new/clone?repository-url=${encodeURIComponent(
    REPO_URL
  )}&env=NEXT_PUBLIC_ELEVENLABS_AGENT_ID&envDescription=${encodeURIComponent(
    "Optional default ElevenLabs agent ID used by /voice-chat"
  )}`
  const netlifyDeployUrl = `https://app.netlify.com/start/deploy?repository=${encodeURIComponent(
    REPO_URL
  )}`

  const handleSaveToLocalStorage = () => {
    const trimmedAgentId = agentId.trim()
    if (trimmedAgentId) {
      window.localStorage.setItem(AGENT_ID_STORAGE_KEY, trimmedAgentId)
    }
    window.localStorage.setItem(UI_CONFIG_STORAGE_KEY, JSON.stringify(uiConfig))
  }

  const copyEnvLine = async () => {
    if (await copyTextToClipboard(envLine)) {
      setCopiedEnv(true)
      window.setTimeout(() => setCopiedEnv(false), 2000)
    }
  }

  return (
    <div className="section-stack">
      <p className="hero-kicker">Step 4 &mdash; Self-Hosted</p>
      <h2 className="text-3xl font-black tracking-tight">
        Deploy on your infrastructure
      </h2>
      <p className="text-muted-foreground max-w-[48ch] text-base">
        Follow these steps to get your widget running on your own domain.
      </p>

      <div className="fletch-panel mt-4 space-y-0 divide-y-2 divide-black/10 p-0">
        <DeployStep
          number={1}
          title="Get the source and deploy it"
          description="This widget is an open Next.js app. Fork or clone the repository, then deploy your copy to your hosting provider — the buttons below prefill everything."
        >
          <code className="field-code block text-xs">git clone {REPO_URL}</code>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={vercelDeployUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-sm border-2 border-black bg-black px-3 py-1.5 text-xs font-bold text-white"
            >
              Deploy to Vercel <ExternalLink className="size-3" />
            </a>
            <a
              href={netlifyDeployUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-sm border-2 border-black bg-white px-3 py-1.5 text-xs font-bold"
            >
              Deploy to Netlify <ExternalLink className="size-3" />
            </a>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold underline underline-offset-2"
            >
              View source on GitHub
            </a>
          </div>
        </DeployStep>

        <DeployStep
          number={2}
          title="Optional: set a default Agent ID"
          description="Your embed snippet already carries the agent ID, so this is only a fallback for the /voice-chat page. Note: NEXT_PUBLIC_ variables are baked in at build time — changing this later requires a redeploy."
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <code className="field-code block min-w-0 flex-1 text-xs">{envLine}</code>
            <Button
              type="button"
              variant="brandOutline"
              size="sm"
              className="w-full md:w-auto"
              onClick={() => void copyEnvLine()}
            >
              {copiedEnv ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
              Copy
            </Button>
          </div>
        </DeployStep>

        <DeployStep
          number={3}
          title="Map your domain"
          description="Create a DNS CNAME record pointing your subdomain (e.g. widget.yourdomain.com) to your deployment. Ensure HTTPS is enabled — microphone access requires it."
        >
          <p className="text-muted-foreground text-xs">
            Optional hardening: set an <code>EMBED_FRAME_ANCESTORS</code>{" "}
            environment variable (e.g.{" "}
            <code>https://www.yourdomain.com</code>) to control which sites are
            allowed to embed your widget.
          </p>
        </DeployStep>

        <DeployStep
          number={4}
          title="Verify deployment"
          description="After deploying, verify these routes load on your domain:"
        >
          <ul className="space-y-1 text-xs">
            <li>
              <code className="field-code">https://your-domain/</code> — Setup
              guide
            </li>
            <li>
              <code className="field-code">https://your-domain/embed</code> —
              Embeddable widget
            </li>
          </ul>
        </DeployStep>
      </div>

      <div className="mt-4 rounded-md border-2 border-black/10 bg-white/50 p-4">
        <p className="text-sm">
          <strong>Save your settings in this browser</strong> so the local
          previews at <code className="text-xs">/embed</code> and{" "}
          <code className="text-xs">/voice-chat</code> use them. Continuing
          saves automatically.
        </p>
        <Button
          type="button"
          variant="brandOutline"
          className="mt-3"
          onClick={handleSaveToLocalStorage}
        >
          Save in this browser
        </Button>
      </div>

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="brandOutline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          variant="brand"
          onClick={() => {
            handleSaveToLocalStorage()
            onNext()
          }}
        >
          Continue to Embed Code
        </Button>
      </div>
    </div>
  )
}

function DeployStep({
  number,
  title,
  description,
  children,
}: {
  number: number
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex gap-4 p-5 md:p-6">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-black bg-white text-xs font-black">
        {number}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <p className="font-bold">{title}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
        {children}
      </div>
    </div>
  )
}
