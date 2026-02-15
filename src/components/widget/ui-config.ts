export const UI_CONFIG_STORAGE_KEY = "voice_widget_ui_config_v1"

const MIN_HEIGHT = 360
const MAX_HEIGHT = 900
const DEFAULT_HEIGHT = 600

export type VoiceWidgetMode = "voice-chat" | "voice-only"
export type RoundedOption = "none" | "md" | "xl"
export type MessageStyle = "contained" | "flat"

export interface WidgetUiConfig {
  compact: boolean
  framed: boolean
  rounded: RoundedOption
  height: number
  mode: VoiceWidgetMode
  brandLabel: string
  textInputPlaceholder: string
  emptyStateTitle: string
  emptyStateDescription: string
  orbPrimaryColor: string
  orbSecondaryColor: string
  assistantAvatarImageUrl: string
  messageStyle: MessageStyle
}

export const DEFAULT_UI_CONFIG: WidgetUiConfig = {
  compact: true,
  framed: true,
  rounded: "xl",
  height: DEFAULT_HEIGHT,
  mode: "voice-chat",
  brandLabel: "Customer Support",
  textInputPlaceholder: "Enter your message...",
  emptyStateTitle: "Start a conversation",
  emptyStateDescription: "Tap the phone button or type a message",
  orbPrimaryColor: "#CADCFC",
  orbSecondaryColor: "#A0B9D1",
  assistantAvatarImageUrl: "",
  messageStyle: "contained",
}

export function sanitizeWidgetUiConfig(
  config: Partial<WidgetUiConfig> | null | undefined
): WidgetUiConfig {
  return {
    compact:
      typeof config?.compact === "boolean"
        ? config.compact
        : DEFAULT_UI_CONFIG.compact,
    framed:
      typeof config?.framed === "boolean"
        ? config.framed
        : DEFAULT_UI_CONFIG.framed,
    rounded:
      config?.rounded === "none" || config?.rounded === "md" || config?.rounded === "xl"
        ? config.rounded
        : DEFAULT_UI_CONFIG.rounded,
    height:
      typeof config?.height === "number"
        ? Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.round(config.height)))
        : DEFAULT_UI_CONFIG.height,
    mode:
      config?.mode === "voice-only" || config?.mode === "voice-chat"
        ? config.mode
        : DEFAULT_UI_CONFIG.mode,
    brandLabel:
      typeof config?.brandLabel === "string" && config.brandLabel.trim()
        ? config.brandLabel.trim()
        : DEFAULT_UI_CONFIG.brandLabel,
    textInputPlaceholder:
      typeof config?.textInputPlaceholder === "string" &&
      config.textInputPlaceholder.trim()
        ? config.textInputPlaceholder.trim()
        : DEFAULT_UI_CONFIG.textInputPlaceholder,
    emptyStateTitle:
      typeof config?.emptyStateTitle === "string" && config.emptyStateTitle.trim()
        ? config.emptyStateTitle.trim()
        : DEFAULT_UI_CONFIG.emptyStateTitle,
    emptyStateDescription:
      typeof config?.emptyStateDescription === "string" &&
      config.emptyStateDescription.trim()
        ? config.emptyStateDescription.trim()
        : DEFAULT_UI_CONFIG.emptyStateDescription,
    orbPrimaryColor:
      typeof config?.orbPrimaryColor === "string" && config.orbPrimaryColor.trim()
        ? config.orbPrimaryColor.trim()
        : DEFAULT_UI_CONFIG.orbPrimaryColor,
    orbSecondaryColor:
      typeof config?.orbSecondaryColor === "string" && config.orbSecondaryColor.trim()
        ? config.orbSecondaryColor.trim()
        : DEFAULT_UI_CONFIG.orbSecondaryColor,
    assistantAvatarImageUrl:
      typeof config?.assistantAvatarImageUrl === "string"
        ? config.assistantAvatarImageUrl.trim()
        : DEFAULT_UI_CONFIG.assistantAvatarImageUrl,
    messageStyle:
      config?.messageStyle === "flat" || config?.messageStyle === "contained"
        ? config.messageStyle
        : DEFAULT_UI_CONFIG.messageStyle,
  }
}

export function parseStoredUiConfig(raw: string | null): WidgetUiConfig {
  if (!raw) {
    return DEFAULT_UI_CONFIG
  }

  try {
    const parsed = JSON.parse(raw) as Partial<WidgetUiConfig>
    return sanitizeWidgetUiConfig(parsed)
  } catch {
    return DEFAULT_UI_CONFIG
  }
}

export const UI_CONFIG_LIMITS = {
  minHeight: MIN_HEIGHT,
  maxHeight: MAX_HEIGHT,
  defaultHeight: DEFAULT_HEIGHT,
}
