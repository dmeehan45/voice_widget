"use client"

import { useMemo, useRef, useSyncExternalStore } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { VoiceWidget } from "@/components/widget/VoiceWidget"
import { useStoredWidgetConfig } from "@/components/widget/use-stored-widget-config"
import {
  parseUiConfigParams,
  sanitizeWidgetUiConfig,
} from "@/components/widget/ui-config"

const DEFAULT_AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID

interface EmbedWidgetPageProps {
  searchParams: Record<string, string | undefined>
}

function notifyParent(event: "connected" | "disconnected") {
  if (typeof window === "undefined" || window.parent === window) return
  window.parent.postMessage({ source: "voice-widget", event }, "*")
}

const subscribeNoop = () => () => {}
const isTopLevelSnapshot = () => window.self === window.top

export function EmbedWidgetPage({ searchParams }: EmbedWidgetPageProps) {
  const { storedAgentId, storedUiConfig, hydrated } = useStoredWidgetConfig()
  // False while embedded and during server render — the config hint below
  // must never flash on a customer's site.
  const isTopLevel = useSyncExternalStore(
    subscribeNoop,
    isTopLevelSnapshot,
    () => false
  )
  const hasConnectedRef = useRef(false)

  const resolvedUiConfig = useMemo(() => {
    // Query params win per field; the operator's saved browser config and
    // then the defaults fill the gaps.
    return sanitizeWidgetUiConfig({
      ...storedUiConfig,
      ...parseUiConfigParams(searchParams),
    })
  }, [searchParams, storedUiConfig])

  const resolvedAgentId =
    searchParams.agentId?.trim() || storedAgentId || DEFAULT_AGENT_ID

  if (!resolvedAgentId) {
    // Wait for storage before declaring the widget unconfigured, so the
    // operator's own saved agent ID doesn't flash the error card.
    if (!hydrated) {
      return <div style={{ height: resolvedUiConfig.height }} />
    }

    return (
      <div
        data-vw-embed
        className="flex w-full items-center justify-center p-4"
        style={{
          height: resolvedUiConfig.height,
          background: resolvedUiConfig.pageBackground,
        }}
      >
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center text-sm">
            <p className="text-lg font-black">Voice assistant unavailable</p>
            <p className="text-muted-foreground mt-2 text-sm">
              This widget hasn&apos;t been connected to an agent yet.
            </p>
            {isTopLevel && (
              <div className="mt-4 space-y-2">
                <p className="text-muted-foreground text-xs">
                  Site owner? Add an <code>agentId</code> query parameter or
                  save one in the configurator.
                </p>
                <Button asChild variant="brandOutline">
                  <Link href="/configure">Open /configure</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div
      data-vw-embed
      className="w-full"
      style={{
        height: resolvedUiConfig.height,
        background: resolvedUiConfig.pageBackground,
      }}
    >
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
        surfaceColor={resolvedUiConfig.surfaceColor}
        textColor={resolvedUiConfig.textColor}
        userBubbleColor={resolvedUiConfig.userBubbleColor}
        userBubbleTextColor={resolvedUiConfig.userBubbleTextColor}
        assistantBubbleColor={resolvedUiConfig.assistantBubbleColor}
        fontFamily={resolvedUiConfig.fontFamily}
        languageOverride={resolvedUiConfig.language}
        onSessionStateChange={(state) => {
          if (state === "connected") {
            hasConnectedRef.current = true
            notifyParent("connected")
          } else if (state === "disconnected" && hasConnectedRef.current) {
            hasConnectedRef.current = false
            notifyParent("disconnected")
          }
        }}
        className="mx-0 h-full w-full"
      />
    </div>
  )
}
