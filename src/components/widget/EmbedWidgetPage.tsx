"use client"

import { useMemo, useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AGENT_ID_STORAGE_KEY } from "@/components/widget/VoiceWidgetHost"
import { VoiceWidget } from "@/components/widget/VoiceWidget"
import {
  DEFAULT_UI_CONFIG,
  UI_CONFIG_STORAGE_KEY,
  parseStoredUiConfig,
  sanitizeWidgetUiConfig,
} from "@/components/widget/ui-config"

const DEFAULT_AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID

const MIN_HEIGHT = 360
const MAX_HEIGHT = 900
const DEFAULT_HEIGHT = 600

interface EmbedWidgetPageProps {
  searchParams: Record<string, string | string[] | undefined>
}

function getSingleParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
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

function parseHeight(value: string | undefined, fallback = DEFAULT_HEIGHT) {
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    return fallback
  }

  return Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.round(parsed)))
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
  const [storedAgentId] = useState<string | undefined>(() => {
    if (typeof window === "undefined") {
      return undefined
    }

    const id = window.localStorage.getItem(AGENT_ID_STORAGE_KEY)?.trim()
    return id || undefined
  })
  const [storedUiConfig] = useState(() => {
    if (typeof window === "undefined") {
      return DEFAULT_UI_CONFIG
    }

    return parseStoredUiConfig(window.localStorage.getItem(UI_CONFIG_STORAGE_KEY))
  })

  const settings = useMemo(() => {
    const params = {
      agentId: getSingleParam(searchParams.agentId),
      compact: getSingleParam(searchParams.compact),
      framed: getSingleParam(searchParams.framed),
      rounded: getSingleParam(searchParams.rounded),
      height: getSingleParam(searchParams.height),
      mode: getSingleParam(searchParams.mode),
      brandLabel: getSingleParam(searchParams.brandLabel),
      textInputPlaceholder: getSingleParam(searchParams.textInputPlaceholder),
      emptyStateTitle: getSingleParam(searchParams.emptyStateTitle),
      emptyStateDescription: getSingleParam(searchParams.emptyStateDescription),
      orbPrimaryColor: getSingleParam(searchParams.orbPrimaryColor),
      orbSecondaryColor: getSingleParam(searchParams.orbSecondaryColor),
      assistantAvatarImageUrl: getSingleParam(searchParams.assistantAvatarImageUrl),
      messageStyle: getSingleParam(searchParams.messageStyle),
    }

    return {
      agentId: params.agentId?.trim(),
      compact: parseBoolean(params.compact, storedUiConfig.compact),
      framed: parseBoolean(params.framed, storedUiConfig.framed),
      rounded: parseRounded(params.rounded, storedUiConfig.rounded),
      height: parseHeight(params.height, storedUiConfig.height),
      mode: parseMode(params.mode) ?? storedUiConfig.mode,
      brandLabel: params.brandLabel ?? storedUiConfig.brandLabel,
      textInputPlaceholder:
        params.textInputPlaceholder ?? storedUiConfig.textInputPlaceholder,
      emptyStateTitle: params.emptyStateTitle ?? storedUiConfig.emptyStateTitle,
      emptyStateDescription:
        params.emptyStateDescription ?? storedUiConfig.emptyStateDescription,
      orbPrimaryColor: params.orbPrimaryColor ?? storedUiConfig.orbPrimaryColor,
      orbSecondaryColor: params.orbSecondaryColor ?? storedUiConfig.orbSecondaryColor,
      assistantAvatarImageUrl:
        params.assistantAvatarImageUrl ?? storedUiConfig.assistantAvatarImageUrl,
      messageStyle: parseMessageStyle(params.messageStyle) ?? storedUiConfig.messageStyle,
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
