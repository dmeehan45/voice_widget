"use client"

import { ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AGENT_ID_STORAGE_KEY } from "@/components/widget/VoiceWidgetHost"
import {
  UI_CONFIG_STORAGE_KEY,
  type WidgetUiConfig,
} from "@/components/widget/ui-config"
import type { HostingPath } from "@/components/wizard/WizardShell"

interface StepHostingSetupProps {
  hostingPath: HostingPath
  agentId: string
  uiConfig: WidgetUiConfig
  onNext: (widgetSlug?: string) => void
  onBack: () => void
}

export function StepHostingSetup({
  hostingPath,
  agentId,
  uiConfig,
  onNext,
  onBack,
}: StepHostingSetupProps) {
  if (hostingPath === "managed") {
    return (
      <ManagedSetup onNext={onNext} onBack={onBack} />
    )
  }

  return (
    <SelfHostedSetup
      agentId={agentId}
      uiConfig={uiConfig}
      onNext={() => onNext()}
      onBack={onBack}
    />
  )
}

function ManagedSetup({
  onNext,
  onBack,
}: {
  onNext: (slug?: string) => void
  onBack: () => void
}) {
  return (
    <div className="section-stack">
      <p className="hero-kicker">Step 4 &mdash; Managed Hosting</p>
      <h2 className="text-3xl font-black tracking-tight">
        We&apos;ll host it for you
      </h2>
      <p className="text-muted-foreground max-w-[48ch] text-base">
        Sign in and subscribe to get your widget hosted on our platform with a
        dedicated embed URL.
      </p>

      <div className="fletch-panel mt-4 space-y-5 p-6">
        <div className="flex items-center gap-4 rounded-md border-2 border-dashed border-black/20 bg-white/60 p-6">
          <div className="flex-1 space-y-2">
            <p className="text-lg font-black">Coming Soon</p>
            <p className="text-muted-foreground text-sm">
              Managed hosting with OAuth sign-in and Stripe monthly subscription
              is under development. For now, use the self-hosted path to get
              your widget live.
            </p>
            <p className="text-muted-foreground text-sm">
              When available, you&apos;ll be able to:
            </p>
            <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 text-sm">
              <li>Sign in with Google or GitHub</li>
              <li>Subscribe for a monthly hosting plan</li>
              <li>Get a managed embed URL instantly</li>
              <li>Manage your widget from a dashboard</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="brandOutline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          variant="brand"
          onClick={() => onNext()}
        >
          Continue to Embed Code
        </Button>
      </div>
    </div>
  )
}

function SelfHostedSetup({
  agentId,
  uiConfig,
  onNext,
  onBack,
}: {
  agentId: string
  uiConfig: WidgetUiConfig
  onNext: () => void
  onBack: () => void
}) {
  const handleSaveToLocalStorage = () => {
    const trimmedAgentId = agentId.trim()
    if (trimmedAgentId) {
      window.localStorage.setItem(AGENT_ID_STORAGE_KEY, trimmedAgentId)
    }
    window.localStorage.setItem(UI_CONFIG_STORAGE_KEY, JSON.stringify(uiConfig))
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
          title="Deploy this app"
          description="Deploy the WidgetFlow repository to your hosting provider."
        >
          <div className="flex flex-wrap gap-2">
            <a
              href="https://vercel.com/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-sm border-2 border-black bg-black px-3 py-1.5 text-xs font-bold text-white"
            >
              Deploy to Vercel <ExternalLink className="size-3" />
            </a>
            <a
              href="https://app.netlify.com/start"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-sm border-2 border-black bg-white px-3 py-1.5 text-xs font-bold"
            >
              Deploy to Netlify <ExternalLink className="size-3" />
            </a>
          </div>
        </DeployStep>

        <DeployStep
          number={2}
          title="Set your Agent ID"
          description="Add this environment variable to your deployment:"
        >
          <code className="field-code block text-xs">
            NEXT_PUBLIC_ELEVENLABS_AGENT_ID={agentId.trim()}
          </code>
        </DeployStep>

        <DeployStep
          number={3}
          title="Map your domain"
          description="Create a DNS CNAME record pointing your subdomain (e.g. widget.yourdomain.com) to your deployment. Ensure HTTPS is enabled — microphone access requires it."
        />

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
          <strong>Save config to this browser:</strong> Click below to save your
          Agent ID and widget settings to localStorage. This lets you preview
          the widget locally at{" "}
          <code className="text-xs">/embed</code> and{" "}
          <code className="text-xs">/voice-chat</code>.
        </p>
        <Button
          type="button"
          variant="brandOutline"
          className="mt-3"
          onClick={handleSaveToLocalStorage}
        >
          Save to this browser
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
