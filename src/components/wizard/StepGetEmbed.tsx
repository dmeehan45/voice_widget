"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { EmbedSnippets } from "@/components/wizard/EmbedSnippets"
import { type WidgetUiConfig } from "@/components/widget/ui-config"

interface StepGetEmbedProps {
  agentId: string
  uiConfig: WidgetUiConfig
  onBack: () => void
}

export function StepGetEmbed({ agentId, uiConfig, onBack }: StepGetEmbedProps) {
  return (
    <div className="section-stack">
      <p className="hero-kicker">Step 5</p>
      <h2 className="text-3xl font-black tracking-tight">
        Your widget is ready to embed
      </h2>
      <p className="text-muted-foreground max-w-[48ch] text-base">
        Pick an embed format and paste the snippet into your website. The
        snippet encodes your agent and every customization you chose.
      </p>

      <div className="mt-4 space-y-4">
        <EmbedSnippets agentId={agentId} uiConfig={uiConfig} />

        <div className="fletch-panel space-y-3 p-5 md:p-6">
          <p className="field-label">What&apos;s next</p>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li>
              <strong>Preview locally:</strong> Visit{" "}
              <Link href="/embed" className="underline">
                /embed
              </Link>{" "}
              or{" "}
              <Link href="/voice-chat" className="underline">
                /voice-chat
              </Link>{" "}
              to test your widget.
            </li>
            <li>
              <strong>Reconfigure:</strong> Visit{" "}
              <Link href="/configure" className="underline">
                /configure
              </Link>{" "}
              anytime — you can import your embed URL there to pick up where you
              left off.
            </li>
            <li>
              <strong>Deploy:</strong> Once your deployment from step 4 is
              live, grab this snippet from your own domain so the URLs fill in
              automatically.
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="brandOutline" onClick={onBack}>
          Back
        </Button>
        <Button asChild variant="brand">
          <Link href="/embed">Preview Widget</Link>
        </Button>
      </div>
    </div>
  )
}
