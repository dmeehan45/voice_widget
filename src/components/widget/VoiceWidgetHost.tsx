"use client"

import { useMemo, useState } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { VoiceWidget } from "@/components/widget/VoiceWidget"

const AGENT_ID_STORAGE_KEY = "voice_widget_agent_id"

interface VoiceWidgetHostProps {
  defaultAgentId?: string
}

function getStoredAgentId() {
  if (typeof window === "undefined") {
    return undefined
  }

  return window.localStorage.getItem(AGENT_ID_STORAGE_KEY)?.trim() || undefined
}

export function VoiceWidgetHost({ defaultAgentId }: VoiceWidgetHostProps) {
  const [agentId] = useState(() => getStoredAgentId() ?? defaultAgentId)

  const isMissingAgentId = useMemo(() => !agentId?.trim(), [agentId])

  if (isMissingAgentId) {
    return (
      <div className="relative mx-auto h-[600px] w-full">
        <Card className="flex h-full w-full items-center justify-center">
          <CardContent className="p-6 text-center text-sm">
            <p className="font-medium">Missing ElevenLabs agent ID</p>
            <p className="text-muted-foreground mt-2">
              Set NEXT_PUBLIC_ELEVENLABS_AGENT_ID or visit /configure to save an
              agent ID for this browser.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <VoiceWidget agentId={agentId} />
}

export { AGENT_ID_STORAGE_KEY }
