"use client"

import { useMemo } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { VoiceWidget } from "@/components/widget/VoiceWidget"
import { useStoredWidgetConfig } from "@/components/widget/use-stored-widget-config"
import {
  UI_CONFIG_LIMITS,
  sanitizeWidgetUiConfig,
} from "@/components/widget/ui-config"

const DEFAULT_AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID

interface EmbedWidgetPageProps {
  searchParams: Record<string, string | undefined>
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === "1" || value === "true") {
    return true
  }

  if (value === "0" || value === "false") {
    return false
  }

  return fallback
}

function parseHeight(value: string | undefined, fallback = UI_CONFIG_LIMITS.defaultHeight) {
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    return fallback
  }

  return Math.min(UI_CONFIG_LIMITS.maxHeight, Math.max(UI_CONFIG_LIMITS.minHeight, Math.round(parsed)))
}

function parseRounded(
  value: string | undefined,
  fallback: "none" | "md" | "xl"
): "none" | "md" | "xl" {
  if (value === "none" || value === "md" || value === "xl") {
    return value
  }

  return fallback
}

function parseMode(value: string | undefined): "voice-chat" | "voice-only" | undefined {
  if (value === "voice-chat" || value === "voice-only") {
    return value
  }

  return undefined
}

function parseMessageStyle(value: string | undefined): "contained" | "flat" | undefined {
  if (value === "contained" || value === "flat") {
    return value
  }

  return undefined
}

export function EmbedWidgetPage({ searchParams }: EmbedWidgetPageProps) {
  const { storedAgentId, storedUiConfig } = useStoredWidgetConfig()

  const settings = useMemo(() => {
    return {
      agentId: searchParams.agentId?.trim(),
      compact: parseBoolean(searchParams.compact, storedUiConfig.compact),
      framed: parseBoolean(searchParams.framed, storedUiConfig.framed),
      rounded: parseRounded(searchParams.rounded, storedUiConfig.rounded),
      height: parseHeight(searchParams.height, storedUiConfig.height),
      mode: parseMode(searchParams.mode) ?? storedUiConfig.mode,
      brandLabel: searchParams.brandLabel ?? storedUiConfig.brandLabel,
      textInputPlaceholder:
        searchParams.textInputPlaceholder ?? storedUiConfig.textInputPlaceholder,
      emptyStateTitle: searchParams.emptyStateTitle ?? storedUiConfig.emptyStateTitle,
      emptyStateDescription:
        searchParams.emptyStateDescription ?? storedUiConfig.emptyStateDescription,
      orbPrimaryColor: searchParams.orbPrimaryColor ?? storedUiConfig.orbPrimaryColor,
      orbSecondaryColor: searchParams.orbSecondaryColor ?? storedUiConfig.orbSecondaryColor,
      assistantAvatarImageUrl:
        searchParams.assistantAvatarImageUrl ?? storedUiConfig.assistantAvatarImageUrl,
      messageStyle: parseMessageStyle(searchParams.messageStyle) ?? storedUiConfig.messageStyle,
    }
  }, [searchParams, storedUiConfig])
  const resolvedUiConfig = sanitizeWidgetUiConfig(settings)

  const resolvedAgentId = settings.agentId || storedAgentId || DEFAULT_AGENT_ID

  if (!resolvedAgentId) {
    return (
      <div className="flex h-[600px] w-full items-center justify-center bg-transparent p-4">
        <Card className="fletch-panel w-full max-w-md border-[3px] shadow-[0_2px_0_0_#000]">
          <CardContent className="p-6 text-center text-sm">
            <p className="text-lg font-black">Missing ElevenLabs agent ID</p>
            <p className="text-muted-foreground mt-2 text-sm">
              Provide an <code>agentId</code> query parameter, or set your ID on
              <code> /configure</code>.
            </p>
            <div className="mt-4">
              <Button asChild variant="brandOutline">
                <Link href="/configure">Open /configure</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full bg-transparent" style={{ height: resolvedUiConfig.height }}>
      <VoiceWidget
        agentId={resolvedAgentId}
        compact={resolvedUiConfig.compact}
        framed={resolvedUiConfig.framed}
        rounded={resolvedUiConfig.rounded}
        mode={resolvedUiConfig.mode}
        supportLabel={resolvedUiConfig.brandLabel}
        textInputPlaceholder={resolvedUiConfig.textInputPlaceholder}
        emptyStateTitle={resolvedUiConfig.emptyStateTitle}
        emptyStateDescription={resolvedUiConfig.emptyStateDescription}
        orbColors={[
          resolvedUiConfig.orbPrimaryColor,
          resolvedUiConfig.orbSecondaryColor,
        ]}
        assistantAvatarImageUrl={resolvedUiConfig.assistantAvatarImageUrl}
        messageStyle={resolvedUiConfig.messageStyle}
        className="mx-0 h-full w-full"
      />
    </div>
  )
}
