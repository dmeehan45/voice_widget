"use client"

import { useEffect, useState } from "react"

import {
  UI_CONFIG_LIMITS,
  clampHeight,
  isHexColor,
  minHeightForMode,
  toSixDigitHex,
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

  const isTransparentPage = uiConfig.pageBackground === "transparent"

  return (
    <div className="grid gap-5 border-2 border-black/15 bg-white/50 p-4 text-sm md:p-5">
      <div className="grid gap-4">
        <p className="field-label">Layout</p>
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
              onChange={(e) => {
                const mode = e.target.value as VoiceWidgetMode
                update({ mode, height: clampHeight(uiConfig.height, mode) })
              }}
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

          <HeightField
            mode={uiConfig.mode}
            value={uiConfig.height}
            onCommit={(height) => update({ height })}
          />
        </div>
      </div>

      <div className="grid gap-3">
        <p className="field-label">Content</p>
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
          <InputField
            label="Agent language override (optional)"
            value={uiConfig.language}
            placeholder="e.g. de, es, fr"
            hint="Requires the language override to be enabled in your ElevenLabs agent's security settings."
            onChange={(language) => update({ language })}
          />
        </div>
      </div>

      <div className="grid gap-3">
        <p className="field-label">Brand theme</p>
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
          <ColorField
            label="Your message bubble"
            value={uiConfig.userBubbleColor}
            onChange={(userBubbleColor) => update({ userBubbleColor })}
          />
          <ColorField
            label="Your message text"
            value={uiConfig.userBubbleTextColor}
            onChange={(userBubbleTextColor) => update({ userBubbleTextColor })}
          />
          <ColorField
            label="Assistant message bubble"
            value={uiConfig.assistantBubbleColor}
            onChange={(assistantBubbleColor) => update({ assistantBubbleColor })}
          />
          <ColorField
            label="Widget surface"
            value={uiConfig.surfaceColor}
            onChange={(surfaceColor) => update({ surfaceColor })}
          />
          <ColorField
            label="Widget text"
            value={uiConfig.textColor}
            onChange={(textColor) => update({ textColor })}
          />
          <InputField
            label="Font family (optional)"
            value={uiConfig.fontFamily}
            placeholder='e.g. "Inter", sans-serif'
            hint="Uses fonts already available on the page hosting the widget."
            onChange={(fontFamily) => update({ fontFamily })}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Toggle
            label="Transparent page background"
            value={isTransparentPage}
            onChange={(transparent) =>
              update({ pageBackground: transparent ? "transparent" : "#ffffff" })
            }
          />
          {!isTransparentPage && (
            <ColorField
              label="Page background color"
              value={uiConfig.pageBackground}
              onChange={(pageBackground) => update({ pageBackground })}
            />
          )}
        </div>
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

function HeightField({
  mode,
  value,
  onCommit,
}: {
  mode: VoiceWidgetMode
  value: number
  onCommit: (height: number) => void
}) {
  const [draft, setDraft] = useState(String(value))

  useEffect(() => {
    setDraft(String(value))
  }, [value])

  const min = minHeightForMode(mode)

  // Clamp on commit (blur/Enter) instead of per keystroke so values like
  // "800" can actually be typed.
  const commit = () => {
    const parsed = Number(draft)
    const next =
      draft.trim() && Number.isFinite(parsed)
        ? clampHeight(parsed, mode)
        : UI_CONFIG_LIMITS.defaultHeight
    setDraft(String(next))
    onCommit(next)
  }

  return (
    <label className="flex items-center justify-between gap-3">
      <span>
        Widget height (px)
        <span className="text-muted-foreground block text-xs">
          {min}–{UI_CONFIG_LIMITS.maxHeight}
        </span>
      </span>
      <input
        type="number"
        min={min}
        max={UI_CONFIG_LIMITS.maxHeight}
        value={draft}
        className="field-input w-28 text-right"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            commit()
          }
        }}
      />
    </label>
  )
}

function InputField({
  label,
  value,
  placeholder,
  disabled,
  hint,
  onChange,
}: {
  label: string
  value: string
  placeholder?: string
  disabled?: boolean
  hint?: string
  onChange: (next: string) => void
}) {
  return (
    <label className="grid content-start gap-1">
      <span>{label}</span>
      <input
        className="field-input"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <span className="text-muted-foreground text-xs">{hint}</span>}
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
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    setDraft(value)
  }, [value])

  const draftIsValid = isHexColor(draft)
  const pickerValue = toSixDigitHex(draftIsValid ? draft : value) ?? "#000000"

  return (
    <label className="grid content-start gap-1">
      <span>{label}</span>
      <div className="flex gap-2">
        <input
          type="color"
          className="h-10 w-12 border-2 border-black/20 bg-white"
          value={pickerValue}
          onChange={(e) => {
            setDraft(e.target.value)
            onChange(e.target.value)
          }}
        />
        <input
          className="field-input flex-1"
          value={draft}
          onChange={(e) => {
            const next = e.target.value
            setDraft(next)
            // Only valid colors propagate; junk never reaches the widget.
            if (isHexColor(next)) onChange(next.trim())
          }}
          onBlur={() => {
            if (!draftIsValid) setDraft(value)
          }}
        />
      </div>
      {!draftIsValid && (
        <span className="text-destructive text-xs">
          Use a hex color like #1a2b3c
        </span>
      )}
    </label>
  )
}
