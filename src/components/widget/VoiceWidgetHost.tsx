"use client"

import { Card, CardContent } from "@/components/ui/card"
import { VoiceWidget } from "@/components/widget/VoiceWidget"
import { useStoredWidgetConfig } from "@/components/widget/use-stored-widget-config"

export { AGENT_ID_STORAGE_KEY } from "@/components/widget/use-stored-widget-config"

interface VoiceWidgetHostProps {
  defaultAgentId?: string
}

export function VoiceWidgetHost({ defaultAgentId }: VoiceWidgetHostProps) {
  const { storedAgentId, storedUiConfig: uiConfig, hydrated } = useStoredWidgetConfig()
  const resolvedAgentId = storedAgentId ?? defaultAgentId

  if (!hydrated && !resolvedAgentId) {
    return <div className="relative mx-auto h-[600px] w-full" />
  }

  if (!resolvedAgentId) {
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

  return (
    <VoiceWidget
      agentId={resolvedAgentId}
      compact={uiConfig.compact}
      framed={uiConfig.framed}
      rounded={uiConfig.rounded}
      mode={uiConfig.mode}
      supportLabel={uiConfig.brandLabel}
      textInputPlaceholder={uiConfig.textInputPlaceholder}
      emptyStateTitle={uiConfig.emptyStateTitle}
      emptyStateDescription={uiConfig.emptyStateDescription}
      orbColors={[uiConfig.orbPrimaryColor, uiConfig.orbSecondaryColor]}
      assistantAvatarImageUrl={uiConfig.assistantAvatarImageUrl}
      messageStyle={uiConfig.messageStyle}
      surfaceColor={uiConfig.surfaceColor}
      textColor={uiConfig.textColor}
      userBubbleColor={uiConfig.userBubbleColor}
      userBubbleTextColor={uiConfig.userBubbleTextColor}
      assistantBubbleColor={uiConfig.assistantBubbleColor}
      fontFamily={uiConfig.fontFamily}
      languageOverride={uiConfig.language}
      className="mx-0 h-full w-full"
    />
  )
}
