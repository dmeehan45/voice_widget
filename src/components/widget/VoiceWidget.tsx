"use client"

import { useState } from "react"
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
import { ConversationBar } from "@/components/ui/conversation-bar"
import { Message, MessageContent } from "@/components/ui/message"
import { Orb } from "@/components/ui/orb"
import { Response } from "@/components/ui/response"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { type MessageStyle, type VoiceWidgetMode } from "@/components/widget/ui-config"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

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
  className,
}: VoiceWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const isVoiceOnly = mode === "voice-only"

  return (
    <div className={cn("relative mx-auto h-[600px] w-full", className)}>
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
                {messages.length === 0 ? (
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
                  messages.map((message, index) => {
                    return (
                      <div key={index} className="flex w-full flex-col gap-1">
                        <Message from={message.role}>
                          <MessageContent
                            className="max-w-full min-w-0"
                            variant={messageStyle}
                          >
                            <Response className="w-auto [overflow-wrap:anywhere] whitespace-pre-wrap">
                              {message.content}
                            </Response>
                          </MessageContent>
                          {message.role === "assistant" && (
                            <AssistantAvatar
                              imageUrl={assistantAvatarImageUrl}
                              orbColors={orbColors}
                              className="ring-border size-6 flex-shrink-0 self-end overflow-hidden rounded-full ring-1"
                            />
                          )}
                        </Message>
                        {message.role === "assistant" && (
                          <div className="flex items-center gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    className={cn(
                                      "text-muted-foreground hover:text-foreground relative size-9 p-1.5"
                                    )}
                                    size="sm"
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        message.content
                                      )
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
                            </TooltipProvider>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </ConversationContent>
              <ConversationScrollButton className="bottom-[100px]" />
            </Conversation>
          ) : null}
          <div className="absolute right-0 bottom-0 left-0 flex justify-center">
            <ConversationBar
              className={cn("w-full", compact ? "" : "max-w-2xl")}
              brandLabel={supportLabel}
              textInputPlaceholder={textInputPlaceholder}
              allowTextInput={!isVoiceOnly}
              agentId={agentId}
              onConnect={() => setMessages([])}
              onDisconnect={() => setMessages([])}
              onSendMessage={(message) => {
                const userMessage: ChatMessage = {
                  role: "user",
                  content: message,
                }
                setMessages((prev) => [...prev, userMessage])
              }}
              onMessage={(message) => {
                const newMessage: ChatMessage = {
                  role: message.source === "user" ? "user" : "assistant",
                  content: message.message,
                }
                setMessages((prev) => [...prev, newMessage])
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

  return <Orb className={className} colors={orbColors} />
}
