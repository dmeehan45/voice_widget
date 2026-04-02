"use client"

import {
  UI_CONFIG_LIMITS,
  type MessageStyle,
  type RoundedOption,
  type VoiceWidgetMode,
  type WidgetUiConfig,
} from "@/components/widget/ui-config"

interface WidgetConfigFormProps {
  uiConfig: WidgetUiConfig
  onChange: (config: WidgetUiConfig) => void
}

export function WidgetConfigForm({ uiConfig, onChange }: WidgetConfigFormProps) {
  const update = (patch: Partial<WidgetUiConfig>) =>
    onChange({ ...uiConfig, ...patch })

  return (
    <div className="grid gap-4 border-2 border-black/15 bg-white/50 p-4 text-sm md:p-5">
      <p className="field-label">Widget UI setup</p>

      <div className="grid gap-4 md:grid-cols-2">
        <Toggle
          label="Use compact layout"
          value={uiConfig.compact}
          onChange={(compact) => update({ compact })}
        />
        <Toggle
          label="Show frame and border"
          value={uiConfig.framed}
          onChange={(framed) => update({ framed })}
        />

        <Field label="Mode">
          <select
            value={uiConfig.mode}
            className="field-select w-full"
            onChange={(e) => update({ mode: e.target.value as VoiceWidgetMode })}
          >
            <option value="voice-chat">Voice + Chat</option>
            <option value="voice-only">Voice only</option>
          </select>
        </Field>

        <Field label="Message style">
          <select
            value={uiConfig.messageStyle}
            className="field-select w-full"
            onChange={(e) =>
              update({ messageStyle: e.target.value as MessageStyle })
            }
          >
            <option value="contained">Contained bubbles</option>
            <option value="flat">Flat bubbles</option>
          </select>
        </Field>

        <Field label="Corner radius">
          <select
            value={uiConfig.rounded}
            className="field-select w-full"
            onChange={(e) =>
              update({ rounded: e.target.value as RoundedOption })
            }
          >
            <option value="none">Square</option>
            <option value="md">Medium</option>
            <option value="xl">Rounded</option>
          </select>
        </Field>

        <Field label="Widget height (px)">
          <input
            type="number"
            min={UI_CONFIG_LIMITS.minHeight}
            max={UI_CONFIG_LIMITS.maxHeight}
            value={uiConfig.height}
            className="field-input w-28 text-right"
            onChange={(e) => {
              const v = Number(e.target.value)
              update({
                height: Number.isFinite(v)
                  ? Math.min(
                      UI_CONFIG_LIMITS.maxHeight,
                      Math.max(UI_CONFIG_LIMITS.minHeight, Math.round(v))
                    )
                  : UI_CONFIG_LIMITS.defaultHeight,
              })
            }}
          />
        </Field>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <InputField
          label="Brand label (status tile)"
          value={uiConfig.brandLabel}
          onChange={(brandLabel) => update({ brandLabel })}
        />
        <InputField
          label="Text input placeholder"
          value={uiConfig.textInputPlaceholder}
          disabled={uiConfig.mode === "voice-only"}
          onChange={(textInputPlaceholder) => update({ textInputPlaceholder })}
        />
        <InputField
          label="Empty state title"
          value={uiConfig.emptyStateTitle}
          disabled={uiConfig.mode === "voice-only"}
          onChange={(emptyStateTitle) => update({ emptyStateTitle })}
        />
        <InputField
          label="Empty state description"
          value={uiConfig.emptyStateDescription}
          disabled={uiConfig.mode === "voice-only"}
          onChange={(emptyStateDescription) =>
            update({ emptyStateDescription })
          }
        />
        <InputField
          label="Assistant avatar image URL (optional)"
          value={uiConfig.assistantAvatarImageUrl}
          placeholder="https://..."
          onChange={(assistantAvatarImageUrl) =>
            update({ assistantAvatarImageUrl })
          }
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ColorField
          label="Orb primary color"
          value={uiConfig.orbPrimaryColor}
          onChange={(orbPrimaryColor) => update({ orbPrimaryColor })}
        />
        <ColorField
          label="Orb secondary color"
          value={uiConfig.orbSecondaryColor}
          onChange={(orbSecondaryColor) => update({ orbSecondaryColor })}
        />
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span>{label}</span>
      {children}
    </label>
  )
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  )
}

function InputField({
  label,
  value,
  placeholder,
  disabled,
  onChange,
}: {
  label: string
  value: string
  placeholder?: string
  disabled?: boolean
  onChange: (next: string) => void
}) {
  return (
    <label className="grid gap-1">
      <span>{label}</span>
      <input
        className="field-input"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (next: string) => void
}) {
  return (
    <label className="grid gap-1">
      <span>{label}</span>
      <div className="flex gap-2">
        <input
          type="color"
          className="h-10 w-12 border-2 border-black/20 bg-white"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          className="field-input flex-1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </label>
  )
}
