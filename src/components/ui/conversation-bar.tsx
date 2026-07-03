"use client"

import * as React from "react"
import { useConversation } from "@elevenlabs/react"
import type { Language } from "@elevenlabs/client"
import {
  ArrowUpIcon,
  ChevronDown,
  Keyboard,
  Mic,
  MicOff,
  PhoneIcon,
  XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LiveWaveform } from "@/components/ui/live-waveform"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

export type AgentSessionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "disconnecting"

export type SessionKind = "voice" | "text"

export interface ConversationBarProps {
  /**
   * ElevenLabs Agent ID to connect to
   */
  agentId: string

  /**
   * Custom className for the container
   */
  className?: string

  /**
   * Custom className for the waveform
   */
  waveformClassName?: string

  /**
   * Callback when conversation connects
   */
  onConnect?: () => void

  /**
   * Callback when conversation disconnects
   */
  onDisconnect?: () => void

  /**
   * Callback when an error occurs
   */
  onError?: (error: Error) => void

  /**
   * Callback when a message is received
   */
  onMessage?: (message: { source: "user" | "ai"; message: string }) => void

  /**
   * Callback when user sends a message
   */
  onSendMessage?: (message: string) => void

  /**
   * Callback whenever the session state or kind changes
   */
  onSessionStateChange?: (
    state: AgentSessionState,
    kind: SessionKind | null
  ) => void

  /**
   * Label displayed in the status tile when no voice call is active
   */
  brandLabel?: string

  /**
   * Placeholder shown in the text composer
   */
  textInputPlaceholder?: string

  /**
   * Controls whether the keyboard/text chat UI is available
   */
  allowTextInput?: boolean

  /**
   * Optional agent language override (requires the override to be enabled
   * in the ElevenLabs agent security settings)
   */
  languageOverride?: string
}

function toError(error: unknown): Error {
  if (error instanceof Error) return error
  return new Error(typeof error === "string" ? error : JSON.stringify(error))
}

function describeMicError(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "SecurityError") {
      return "Microphone access is blocked. Allow microphone access for this page in your browser settings, then try again."
    }
    if (error.name === "NotFoundError" || error.name === "OverconstrainedError") {
      return "No microphone was found. Connect a microphone and try again, or send a text message instead."
    }
    if (error.name === "NotReadableError") {
      return "Your microphone appears to be in use by another application."
    }
  }
  return "Could not access your microphone. Check your browser permissions and try again."
}

const CONNECT_ERROR_MESSAGE =
  "Could not connect to the assistant right now. Check your connection and try again."
const SESSION_ERROR_MESSAGE =
  "The conversation ended unexpectedly. Please try again."

export const ConversationBar = React.forwardRef<
  HTMLDivElement,
  ConversationBarProps
>(
  (
    {
      agentId,
      className,
      waveformClassName,
      onConnect,
      onDisconnect,
      onError,
      onMessage,
      onSendMessage,
      onSessionStateChange,
      brandLabel = "Customer Support",
      textInputPlaceholder = "Enter your message...",
      allowTextInput = true,
      languageOverride,
    },
    ref
  ) => {
    const [isMuted, setIsMuted] = React.useState(false)
    const [agentState, setAgentState] =
      React.useState<AgentSessionState>("disconnected")
    const [sessionKind, setSessionKind] = React.useState<SessionKind | null>(
      null
    )
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
    const [keyboardOpen, setKeyboardOpen] = React.useState(false)
    const [textInput, setTextInput] = React.useState("")
    const mediaStreamRef = React.useRef<MediaStream | null>(null)
    const pendingTextRef = React.useRef<string | null>(null)
    const lastActivityPingRef = React.useRef(0)

    const releaseMicStream = React.useCallback(() => {
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop())
      mediaStreamRef.current = null
    }, [])

    const conversation = useConversation({
      onConnect: () => {
        setErrorMessage(null)
        onConnect?.()
      },
      onDisconnect: () => {
        setAgentState("disconnected")
        setSessionKind(null)
        releaseMicStream()
        onDisconnect?.()
      },
      onMessage: (message) => {
        onMessage?.(message)
      },
      micMuted: isMuted,
      onError: (error: unknown) => {
        console.error("Error:", error)
        setAgentState("disconnected")
        setSessionKind(null)
        releaseMicStream()
        setErrorMessage(SESSION_ERROR_MESSAGE)
        onError?.(toError(error))
      },
    })

    const sessionOverrides = React.useMemo(
      () =>
        languageOverride
          ? { agent: { language: languageOverride as Language } }
          : undefined,
      [languageOverride]
    )

    const getMicStream = React.useCallback(async () => {
      if (mediaStreamRef.current) return mediaStreamRef.current

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      return stream
    }, [])

    const startVoiceConversation = React.useCallback(async () => {
      setErrorMessage(null)
      setAgentState("connecting")
      setSessionKind("voice")

      try {
        await getMicStream()
      } catch (error) {
        console.error("Microphone access failed:", error)
        releaseMicStream()
        setAgentState("disconnected")
        setSessionKind(null)
        setErrorMessage(describeMicError(error))
        onError?.(toError(error))
        return
      }

      try {
        await conversation.startSession({
          agentId,
          connectionType: "webrtc",
          overrides: sessionOverrides,
          onStatusChange: (status) => setAgentState(status.status),
        })
      } catch (error) {
        console.error("Error starting conversation:", error)
        setAgentState("disconnected")
        setSessionKind(null)
        setErrorMessage(CONNECT_ERROR_MESSAGE)
        onError?.(toError(error))
      } finally {
        // The SDK captures its own microphone stream; ours only existed to
        // surface the permission prompt early. Never keep the mic hot.
        releaseMicStream()
      }
    }, [
      agentId,
      conversation,
      getMicStream,
      onError,
      releaseMicStream,
      sessionOverrides,
    ])

    const startTextConversation = React.useCallback(async () => {
      setErrorMessage(null)
      setAgentState("connecting")
      setSessionKind("text")

      try {
        await conversation.startSession({
          agentId,
          connectionType: "websocket",
          textOnly: true,
          overrides: sessionOverrides,
          onStatusChange: (status) => setAgentState(status.status),
        })
      } catch (error) {
        console.error("Error starting text conversation:", error)
        const hadPending = pendingTextRef.current !== null
        pendingTextRef.current = null
        setAgentState("disconnected")
        setSessionKind(null)
        setErrorMessage(
          hadPending
            ? `${CONNECT_ERROR_MESSAGE} Your message was not delivered.`
            : CONNECT_ERROR_MESSAGE
        )
        onError?.(toError(error))
      }
    }, [agentId, conversation, onError, sessionOverrides])

    // Deliver a message queued while the session was still connecting.
    React.useEffect(() => {
      if (agentState === "connected" && pendingTextRef.current !== null) {
        const pending = pendingTextRef.current
        pendingTextRef.current = null
        conversation.sendUserMessage(pending)
      }
    }, [agentState, conversation])

    const handleEndSession = React.useCallback(() => {
      conversation.endSession()
      setAgentState("disconnected")
      setSessionKind(null)
      pendingTextRef.current = null
      releaseMicStream()
    }, [conversation, releaseMicStream])

    const toggleMute = React.useCallback(() => {
      setIsMuted((prev) => !prev)
    }, [])

    const handleStartOrEnd = React.useCallback(() => {
      if (agentState === "connected" || agentState === "connecting") {
        handleEndSession()
      } else if (agentState === "disconnected") {
        void startVoiceConversation()
      }
    }, [agentState, handleEndSession, startVoiceConversation])

    const handleSendText = React.useCallback(() => {
      const messageToSend = textInput.trim()
      if (!messageToSend) return

      if (agentState === "connected") {
        conversation.sendUserMessage(messageToSend)
      } else if (agentState === "disconnected") {
        pendingTextRef.current = messageToSend
        void startTextConversation()
      } else {
        return
      }

      setTextInput("")
      onSendMessage?.(messageToSend)
    }, [agentState, conversation, onSendMessage, startTextConversation, textInput])

    const isConnected = agentState === "connected"
    const isBusy = agentState === "connecting" || agentState === "disconnecting"
    const isVoiceLive = sessionKind === "voice" && isConnected

    const statusLabel =
      agentState === "connecting"
        ? "Connecting…"
        : agentState === "connected"
          ? sessionKind === "text"
            ? "Chat live"
            : "Live now"
          : agentState === "disconnecting"
            ? "Ending…"
            : "Ready to start"

    const callActionLabel =
      agentState === "connecting"
        ? "Cancel connection"
        : isConnected
          ? sessionKind === "text"
            ? "End chat"
            : "End call"
          : "Start voice call"

    const handleTextChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value
        setTextInput(value)

        // Let the agent know the user is typing (throttled) without ever
        // transmitting unsent draft text.
        if (isConnected && value.trim()) {
          const now = Date.now()
          if (now - lastActivityPingRef.current > 2000) {
            lastActivityPingRef.current = now
            conversation.sendUserActivity()
          }
        }
      },
      [conversation, isConnected]
    )

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault()
          handleSendText()
        }
      },
      [handleSendText]
    )

    React.useEffect(() => {
      return () => {
        releaseMicStream()
      }
    }, [releaseMicStream])

    React.useEffect(() => {
      if (!allowTextInput) {
        setKeyboardOpen(false)
      }
    }, [allowTextInput])

    React.useEffect(() => {
      onSessionStateChange?.(agentState, sessionKind)
    }, [agentState, sessionKind, onSessionStateChange])

    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full flex-col items-stretch justify-end gap-2 p-4",
          className
        )}
      >
        {errorMessage && (
          <div
            role="alert"
            className="border-destructive/50 bg-card flex items-start justify-between gap-2 rounded-md border-2 px-3 py-2 text-xs font-medium shadow-sm"
          >
            <span className="min-w-0">{errorMessage}</span>
            <button
              type="button"
              aria-label="Dismiss error"
              className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
              onClick={() => setErrorMessage(null)}
            >
              <XIcon className="size-3.5" />
            </button>
          </div>
        )}
        <Card className="m-0 w-full gap-0 border p-0 shadow-lg">
          <div className="flex flex-col-reverse">
            <div>
              {keyboardOpen && <Separator />}
              <div className="flex items-center justify-between gap-2 p-2">
                <div className="min-w-0 flex-1 md:max-w-[240px]">
                  <div
                    className={cn(
                      "flex h-8 items-center gap-2 rounded-md py-1 md:h-10",
                      "bg-foreground/5 text-foreground/70"
                    )}
                  >
                    <div className="h-full min-w-0 flex-1">
                      <div
                        className={cn(
                          "relative flex h-full w-full shrink-0 items-center justify-center overflow-hidden rounded-sm",
                          waveformClassName
                        )}
                      >
                        <LiveWaveform
                          key={isVoiceLive ? "active" : "idle"}
                          active={isVoiceLive && !isMuted}
                          processing={
                            sessionKind === "voice" &&
                            agentState === "connecting"
                          }
                          barWidth={3}
                          barGap={1}
                          barRadius={4}
                          fadeEdges={true}
                          fadeWidth={24}
                          sensitivity={1.8}
                          smoothingTimeConstant={0.85}
                          height={20}
                          mode="static"
                          className={cn(
                            "h-full w-full transition-opacity duration-300",
                            !isVoiceLive && "opacity-0"
                          )}
                        />
                        {!isVoiceLive && sessionKind !== "voice" && (
                          <div className="absolute inset-0 flex items-center justify-center px-2">
                            <span
                              className="text-foreground/50 truncate text-[10px] font-medium"
                              title={brandLabel}
                            >
                              {brandLabel}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <p
                    className="text-muted-foreground mt-0.5 truncate text-[11px] font-medium"
                    aria-live="polite"
                  >
                    {statusLabel}
                  </p>
                </div>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    aria-pressed={isMuted}
                    aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
                    className={cn(
                      "active:scale-95 motion-reduce:transition-none",
                      isMuted ? "bg-foreground/5" : ""
                    )}
                    disabled={!isVoiceLive}
                  >
                    {isMuted ? <MicOff /> : <Mic />}
                  </Button>
                  {allowTextInput ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setKeyboardOpen((v) => !v)}
                        aria-pressed={keyboardOpen}
                        aria-label={
                          keyboardOpen ? "Hide text composer" : "Show text composer"
                        }
                        className="relative active:scale-95 motion-reduce:transition-none"
                      >
                        <Keyboard
                          className={
                            "h-5 w-5 transform-gpu transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none " +
                            (keyboardOpen
                              ? "scale-75 opacity-0"
                              : "scale-100 opacity-100")
                          }
                        />
                        <ChevronDown
                          className={
                            "absolute inset-0 m-auto h-5 w-5 transform-gpu transition-all delay-50 duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none " +
                            (keyboardOpen
                              ? "scale-100 opacity-100"
                              : "scale-75 opacity-0")
                          }
                        />
                      </Button>
                      <Separator orientation="vertical" className="mx-1 -my-2.5" />
                    </>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleStartOrEnd}
                    aria-label={callActionLabel}
                    aria-busy={isBusy}
                    className="active:scale-95 motion-reduce:transition-none"
                    disabled={agentState === "disconnecting"}
                  >
                    {isConnected || agentState === "connecting" ? (
                      <XIcon className="h-5 w-5" />
                    ) : (
                      <PhoneIcon className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div
              className={cn(
                "overflow-hidden transition-all duration-200 ease-out motion-reduce:transition-none",
                keyboardOpen && allowTextInput ? "max-h-[120px]" : "max-h-0"
              )}
            >
              <div className="relative px-2 pt-2 pb-2">
                <Textarea
                  value={textInput}
                  onChange={handleTextChange}
                  onKeyDown={handleKeyDown}
                  placeholder={textInputPlaceholder}
                  className="min-h-[100px] resize-none border-0 pr-12 shadow-none focus-visible:ring-0"
                  disabled={agentState === "disconnecting"}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleSendText}
                  aria-label="Send message"
                  disabled={!textInput.trim() || isBusy}
                  className="absolute right-3 bottom-3 h-8 w-8"
                >
                  <ArrowUpIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }
)

ConversationBar.displayName = "ConversationBar"
