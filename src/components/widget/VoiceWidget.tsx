"use client"

import { useRef, useState } from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ui/conversation"
import {
  ConversationBar,
  type AgentSessionState,
  type SessionKind,
} from "@/components/ui/conversation-bar"
import { Message, MessageContent } from "@/components/ui/message"
import { OrbLazy } from "@/components/ui/orb-lazy"
import { Response } from "@/components/ui/response"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { type MessageStyle, type VoiceWidgetMode } from "@/components/widget/ui-config"

type TranscriptEntry =
  | { kind: "message"; role: "user" | "assistant"; content: string }
  | { kind: "notice"; content: string }

interface VoiceWidgetProps {
  agentId: string
  compact?: boolean
  framed?: boolean
  rounded?: "none" | "md" | "xl"
  mode?: VoiceWidgetMode
  supportLabel?: string
  textInputPlaceholder?: string
  emptyStateTitle?: string
  emptyStateDescription?: string
  orbColors?: [string, string]
  assistantAvatarImageUrl?: string
  messageStyle?: MessageStyle
  surfaceColor?: string
  textColor?: string
  userBubbleColor?: string
  userBubbleTextColor?: string
  assistantBubbleColor?: string
  fontFamily?: string
  languageOverride?: string
  onSessionStateChange?: (
    state: AgentSessionState,
    kind: SessionKind | null
  ) => void
  className?: string
}

export function VoiceWidget({
  agentId,
  compact = false,
  framed = true,
  rounded = "xl",
  mode = "voice-chat",
  supportLabel = "Customer Support",
  textInputPlaceholder = "Enter your message...",
  emptyStateTitle = "Start a conversation",
  emptyStateDescription = "Tap the phone button or type a message",
  orbColors = ["#CADCFC", "#A0B9D1"],
  assistantAvatarImageUrl = "",
  messageStyle = "contained",
  surfaceColor = "#eceae6",
  textColor = "#090909",
  userBubbleColor = "#c7eb68",
  userBubbleTextColor = "#090909",
  assistantBubbleColor = "#ffffff",
  fontFamily = "",
  languageOverride = "",
  onSessionStateChange,
  className,
}: VoiceWidgetProps) {
  const [entries, setEntries] = useState<TranscriptEntry[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const pendingUserEchoesRef = useRef<string[]>([])
  const sessionWasConnectedRef = useRef(false)
  const isVoiceOnly = mode === "voice-only"

  // The widget UI reads the same semantic tokens as the host site; scoping
  // overrides here re-skins every nested primitive without global bleed.
  const themeStyle = {
    "--background": surfaceColor,
    "--card": surfaceColor,
    "--card-foreground": textColor,
    "--foreground": textColor,
    "--primary": userBubbleColor,
    "--primary-foreground": userBubbleTextColor,
    "--secondary": assistantBubbleColor,
    "--secondary-foreground": textColor,
    "--accent": `color-mix(in srgb, ${textColor} 8%, ${surfaceColor})`,
    "--accent-foreground": textColor,
    "--muted-foreground": `color-mix(in srgb, ${textColor} 62%, transparent)`,
    fontFamily: fontFamily || undefined,
  } as React.CSSProperties

  const appendNotice = (content: string) => {
    setEntries((prev) =>
      prev.some((entry) => entry.kind === "message")
        ? [...prev, { kind: "notice", content }]
        : prev
    )
  }

  return (
    <div
      className={cn("relative mx-auto h-[600px] w-full", className)}
      style={themeStyle}
    >
      <Card
        className={cn(
          "flex h-full w-full flex-col gap-0 overflow-hidden py-0",
          rounded === "none" && "rounded-none",
          rounded === "md" && "rounded-md",
          rounded === "xl" && "rounded-xl",
          !framed && "border-0 bg-transparent shadow-none"
        )}
      >
        <CardContent className="relative flex-1 overflow-hidden p-0">
          {!isVoiceOnly ? (
            <Conversation className="absolute inset-0 pb-[88px]">
              <ConversationContent
                className={cn(
                  "flex min-w-0 flex-col gap-2",
                  compact ? "p-4 pb-4" : "p-6 pb-6"
                )}
              >
                {entries.length === 0 ? (
                  <ConversationEmptyState
                    icon={
                      <AssistantAvatar
                        imageUrl={assistantAvatarImageUrl}
                        orbColors={orbColors}
                        className="size-12"
                      />
                    }
                    title={emptyStateTitle}
                    description={emptyStateDescription}
                  />
                ) : (
                  entries.map((entry, index) => {
                    if (entry.kind === "notice") {
                      return (
                        <div
                          key={index}
                          className="text-muted-foreground flex w-full items-center gap-3 py-1 text-[11px] font-medium"
                        >
                          <span className="bg-foreground/15 h-px flex-1" />
                          {entry.content}
                          <span className="bg-foreground/15 h-px flex-1" />
                        </div>
                      )
                    }

                    return (
                      <div key={index} className="motion-gentle flex w-full flex-col gap-1 animate-in fade-in slide-in-from-bottom-1 duration-200">
                        <Message from={entry.role}>
                          <MessageContent
                            className="max-w-full min-w-0"
                            variant={messageStyle}
                          >
                            <Response className="w-auto [overflow-wrap:anywhere] whitespace-pre-wrap">
                              {entry.content}
                            </Response>
                          </MessageContent>
                          {entry.role === "assistant" && (
                            <AssistantAvatar
                              imageUrl={assistantAvatarImageUrl}
                              orbColors={orbColors}
                              className="ring-border size-6 flex-shrink-0 self-end overflow-hidden rounded-full ring-1"
                            />
                          )}
                        </Message>
                        {entry.role === "assistant" && (
                          <div className="flex items-center gap-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    className={cn(
                                      "text-muted-foreground hover:text-foreground motion-gentle relative size-9 p-1.5 hover:-translate-y-px"
                                    )}
                                    size="sm"
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                      void navigator.clipboard
                                        .writeText(entry.content)
                                        .catch(() => undefined)
                                      setCopiedIndex(index)
                                      setTimeout(
                                        () => setCopiedIndex(null),
                                        2000
                                      )
                                    }}
                                  >
                                    {copiedIndex === index ? (
                                      <CheckIcon className="size-4" />
                                    ) : (
                                      <CopyIcon className="size-4" />
                                    )}
                                    <span className="sr-only">
                                      {copiedIndex === index
                                        ? "Copied!"
                                        : "Copy"}
                                    </span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {copiedIndex === index
                                      ? "Copied!"
                                      : "Copy"}
                                  </p>
                                </TooltipContent>
                            </Tooltip>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </ConversationContent>
              <ConversationScrollButton className="bottom-[100px]" />
            </Conversation>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center pb-[72px]">
              <AssistantAvatar
                imageUrl={assistantAvatarImageUrl}
                orbColors={orbColors}
                className="size-24 overflow-hidden rounded-full"
              />
            </div>
          )}
          <div className="absolute right-0 bottom-0 left-0 flex justify-center">
            <ConversationBar
              className={cn("w-full", compact ? "" : "max-w-2xl")}
              brandLabel={supportLabel}
              textInputPlaceholder={textInputPlaceholder}
              allowTextInput={!isVoiceOnly}
              agentId={agentId}
              languageOverride={languageOverride || undefined}
              onSessionStateChange={onSessionStateChange}
              onConnect={() => {
                if (sessionWasConnectedRef.current) return
                sessionWasConnectedRef.current = true
                setCopiedIndex(null)
                pendingUserEchoesRef.current = []
                appendNotice("New conversation started")
              }}
              onDisconnect={() => {
                pendingUserEchoesRef.current = []
                if (sessionWasConnectedRef.current) {
                  sessionWasConnectedRef.current = false
                  appendNotice("Conversation ended")
                }
              }}
              onSendMessage={(message) => {
                setEntries((prev) => [
                  ...prev,
                  { kind: "message", role: "user", content: message },
                ])
                pendingUserEchoesRef.current.push(message.trim())
              }}
              onMessage={(message) => {
                if (message.source === "user") {
                  const normalizedMessage = message.message.trim()
                  const nextExpected = pendingUserEchoesRef.current[0]
                  if (nextExpected && nextExpected === normalizedMessage) {
                    pendingUserEchoesRef.current.shift()
                    return
                  }
                }

                setEntries((prev) => [
                  ...prev,
                  {
                    kind: "message",
                    role: message.source === "user" ? "user" : "assistant",
                    content: message.message,
                  },
                ])
              }}
              onError={(error) => console.error("Conversation error:", error)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AssistantAvatar({
  imageUrl,
  orbColors,
  className,
}: {
  imageUrl?: string
  orbColors: [string, string]
  className: string
}) {
  if (imageUrl) {
    return (
      <div className={className}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Assistant avatar"
          className="h-full w-full object-cover"
        />
      </div>
    )
  }

  return <OrbLazy className={className} colors={orbColors} />
}
