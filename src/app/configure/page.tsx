"use client"

import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AGENT_ID_STORAGE_KEY } from "@/components/widget/VoiceWidgetHost"

const DEFAULT_AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID ?? ""

function getInitialAgentId() {
  if (typeof window === "undefined") {
    return DEFAULT_AGENT_ID
  }

  return window.localStorage.getItem(AGENT_ID_STORAGE_KEY) ?? DEFAULT_AGENT_ID
}

export default function ConfigurePage() {
  const [agentId, setAgentId] = useState(getInitialAgentId)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    const trimmedAgentId = agentId.trim()

    if (!trimmedAgentId) {
      window.localStorage.removeItem(AGENT_ID_STORAGE_KEY)
      setSaved(true)
      return
    }

    window.localStorage.setItem(AGENT_ID_STORAGE_KEY, trimmedAgentId)
    setSaved(true)
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <Card>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Configure Voice Widget</h1>
            <p className="text-muted-foreground text-sm">
              Save an ElevenLabs Agent ID to use for this browser&apos;s
              /voice-widget and /voice-chat instances.
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-medium">How to find your Agent ID</p>
            <ol className="text-muted-foreground list-decimal space-y-1 pl-5">
              <li>Open your ElevenLabs dashboard.</li>
              <li>Navigate to Conversational AI and choose your agent.</li>
              <li>Copy the Agent ID string from the agent settings.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <label htmlFor="agent-id" className="text-sm font-medium">
              ElevenLabs Agent ID
            </label>
            <input
              id="agent-id"
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              placeholder="agent_..."
              value={agentId}
              onChange={(event) => {
                setAgentId(event.target.value)
                setSaved(false)
              }}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" onClick={handleSave}>
              Save and deploy
            </Button>
            {saved && (
              <p className="text-muted-foreground text-sm">
                Saved. Open{" "}
                <Link href="/voice-widget" className="underline">
                  /voice-widget
                </Link>{" "}
                to use this Agent ID.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
