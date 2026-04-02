"use client"

import { Button } from "@/components/ui/button"
import { VoiceWidget } from "@/components/widget/VoiceWidget"
import { type WidgetUiConfig } from "@/components/widget/ui-config"
import { WidgetConfigForm } from "@/components/wizard/WidgetConfigForm"

interface StepCustomizeProps {
  agentId: string
  uiConfig: WidgetUiConfig
  onChange: (config: WidgetUiConfig) => void
  onNext: () => void
  onBack: () => void
}

export function StepCustomize({
  agentId,
  uiConfig,
  onChange,
  onNext,
  onBack,
}: StepCustomizeProps) {
  return (
    <div className="section-stack">
      <p className="hero-kicker">Step 3</p>
      <h2 className="text-3xl font-black tracking-tight">
        Customize your widget
      </h2>
      <p className="text-muted-foreground max-w-[48ch] text-base">
        Configure the look and feel of your voice widget. See the live preview
        on the right.
      </p>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Config form */}
        <div>
          <WidgetConfigForm uiConfig={uiConfig} onChange={onChange} />
        </div>

        {/* Live preview */}
        <div className="hidden lg:block">
          <p className="field-label mb-3">Live Preview</p>
          <div
            className="overflow-hidden rounded-lg border-2 border-black/15"
            style={{ height: Math.min(uiConfig.height, 500) }}
          >
            <VoiceWidget
              agentId={agentId}
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
              className="mx-0 h-full w-full"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="brandOutline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" variant="brand" onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  )
}
