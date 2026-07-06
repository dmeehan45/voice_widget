"use client"

import { useCallback, useRef, useState } from "react"
import { useConversation } from "@elevenlabs/react"
import { CheckCircle2, CircleAlert, Loader2, PlugZap } from "lucide-react"

import { Button } from "@/components/ui/button"

type TestState = "idle" | "testing" | "success" | "error"

const TEST_TIMEOUT_MS = 15_000

/**
 * Verifies an agent ID by briefly opening a text-only session (no microphone
 * involved) and closing it as soon as the connection is established.
 */
export function AgentConnectionTest({ agentId }: { agentId: string }) {
  const conversation = useConversation()
  const [state, setState] = useState<TestState>("idle")
  const runningRef = useRef(false)

  const runTest = useCallback(async () => {
    const trimmed = agentId.trim()
    if (!trimmed || runningRef.current) return

    runningRef.current = true
    setState("testing")

    let timeoutId: number | undefined
    try {
      await Promise.race([
        conversation.startSession({
          agentId: trimmed,
          connectionType: "websocket",
          textOnly: true,
        }),
        new Promise((_, reject) => {
          timeoutId = window.setTimeout(
            () => reject(new Error("Connection test timed out")),
            TEST_TIMEOUT_MS
          )
        }),
      ])
      setState("success")
    } catch (error) {
      console.error("Agent connection test failed:", error)
      setState("error")
    } finally {
      window.clearTimeout(timeoutId)
      void conversation.endSession().catch(() => undefined)
      runningRef.current = false
    }
  }, [agentId, conversation])

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="brandOutline"
        size="sm"
        disabled={!agentId.trim() || state === "testing"}
        onClick={() => void runTest()}
      >
        {state === "testing" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <PlugZap className="size-4" />
        )}
        Test connection
      </Button>
      {state === "success" && (
        <p className="flex items-start gap-1.5 text-xs font-medium text-green-800">
          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
          Connected — your agent is reachable.
        </p>
      )}
      {state === "error" && (
        <p className="text-destructive flex items-start gap-1.5 text-xs font-medium">
          <CircleAlert className="mt-0.5 size-3.5 shrink-0" />
          Could not connect. Double-check the ID and make sure the agent allows
          public access (ElevenLabs → Agent → Security).
        </p>
      )}
      <p className="text-muted-foreground text-xs">
        Runs a brief text-only session against your agent — no microphone
        needed.
      </p>
    </div>
  )
}
