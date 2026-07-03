export const UI_CONFIG_STORAGE_KEY = "voice_widget_ui_config_v1"

const MIN_HEIGHT = 360
const MIN_HEIGHT_VOICE_ONLY = 160
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
  surfaceColor: string
  textColor: string
  userBubbleColor: string
  userBubbleTextColor: string
  assistantBubbleColor: string
  fontFamily: string
  /** Page background behind the widget on /embed — "transparent" or a hex color. */
  pageBackground: string
  /**
   * Optional agent language override (e.g. "de"). Requires the conversation
   * override to be enabled in the ElevenLabs agent's security settings.
   */
  language: string
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
  surfaceColor: "#eceae6",
  textColor: "#090909",
  userBubbleColor: "#c7eb68",
  userBubbleTextColor: "#090909",
  assistantBubbleColor: "#ffffff",
  fontFamily: "",
  pageBackground: "transparent",
  language: "",
}

const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export function isHexColor(value: string): boolean {
  return HEX_COLOR_RE.test(value.trim())
}

/** Expands #abc to #aabbcc so the value is valid for <input type="color">. */
export function toSixDigitHex(value: string): string | null {
  const trimmed = value.trim()
  if (!HEX_COLOR_RE.test(trimmed)) return null
  if (trimmed.length === 7) return trimmed.toLowerCase()
  const [r, g, b] = trimmed.slice(1)
  return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
}

function sanitizeColor(
  value: unknown,
  fallback: string,
  { allowTransparent = false }: { allowTransparent?: boolean } = {}
): string {
  if (typeof value !== "string") return fallback
  const trimmed = value.trim()
  if (allowTransparent && trimmed === "transparent") return trimmed
  return isHexColor(trimmed) ? trimmed : fallback
}

function sanitizeText(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback
}

// Font families reach an inline style; strip characters that could terminate
// or extend the declaration even though React's CSSOM path already rejects them.
function sanitizeFontFamily(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_UI_CONFIG.fontFamily
  return value.replace(/[;{}<>]/g, "").trim()
}

const LANGUAGE_RE = /^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8})?$/

function sanitizeLanguage(value: unknown): string {
  if (typeof value !== "string") return ""
  const trimmed = value.trim()
  return LANGUAGE_RE.test(trimmed) ? trimmed : ""
}

export function minHeightForMode(mode: VoiceWidgetMode): number {
  return mode === "voice-only" ? MIN_HEIGHT_VOICE_ONLY : MIN_HEIGHT
}

export function clampHeight(value: number, mode: VoiceWidgetMode): number {
  return Math.min(MAX_HEIGHT, Math.max(minHeightForMode(mode), Math.round(value)))
}

export function sanitizeWidgetUiConfig(
  config: Partial<WidgetUiConfig> | null | undefined
): WidgetUiConfig {
  const mode =
    config?.mode === "voice-only" || config?.mode === "voice-chat"
      ? config.mode
      : DEFAULT_UI_CONFIG.mode

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
      typeof config?.height === "number" && Number.isFinite(config.height)
        ? clampHeight(config.height, mode)
        : DEFAULT_UI_CONFIG.height,
    mode,
    brandLabel: sanitizeText(config?.brandLabel, DEFAULT_UI_CONFIG.brandLabel),
    textInputPlaceholder: sanitizeText(
      config?.textInputPlaceholder,
      DEFAULT_UI_CONFIG.textInputPlaceholder
    ),
    emptyStateTitle: sanitizeText(
      config?.emptyStateTitle,
      DEFAULT_UI_CONFIG.emptyStateTitle
    ),
    emptyStateDescription: sanitizeText(
      config?.emptyStateDescription,
      DEFAULT_UI_CONFIG.emptyStateDescription
    ),
    orbPrimaryColor: sanitizeColor(
      config?.orbPrimaryColor,
      DEFAULT_UI_CONFIG.orbPrimaryColor
    ),
    orbSecondaryColor: sanitizeColor(
      config?.orbSecondaryColor,
      DEFAULT_UI_CONFIG.orbSecondaryColor
    ),
    assistantAvatarImageUrl:
      typeof config?.assistantAvatarImageUrl === "string"
        ? config.assistantAvatarImageUrl.trim()
        : DEFAULT_UI_CONFIG.assistantAvatarImageUrl,
    messageStyle:
      config?.messageStyle === "flat" || config?.messageStyle === "contained"
        ? config.messageStyle
        : DEFAULT_UI_CONFIG.messageStyle,
    surfaceColor: sanitizeColor(config?.surfaceColor, DEFAULT_UI_CONFIG.surfaceColor),
    textColor: sanitizeColor(config?.textColor, DEFAULT_UI_CONFIG.textColor),
    userBubbleColor: sanitizeColor(
      config?.userBubbleColor,
      DEFAULT_UI_CONFIG.userBubbleColor
    ),
    userBubbleTextColor: sanitizeColor(
      config?.userBubbleTextColor,
      DEFAULT_UI_CONFIG.userBubbleTextColor
    ),
    assistantBubbleColor: sanitizeColor(
      config?.assistantBubbleColor,
      DEFAULT_UI_CONFIG.assistantBubbleColor
    ),
    fontFamily: sanitizeFontFamily(config?.fontFamily),
    pageBackground: sanitizeColor(
      config?.pageBackground,
      DEFAULT_UI_CONFIG.pageBackground,
      { allowTransparent: true }
    ),
    language: sanitizeLanguage(config?.language),
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

function parseBooleanParam(value: string | undefined): boolean | undefined {
  if (value === "1" || value === "true") return true
  if (value === "0" || value === "false") return false
  return undefined
}

/**
 * Reads widget options from URL query params into a partial config.
 * Absent or unparseable params are omitted so the caller's fallbacks
 * (stored config, then defaults) apply per field.
 */
export function parseUiConfigParams(
  params: Record<string, string | undefined>
): Partial<WidgetUiConfig> {
  const partial: Partial<WidgetUiConfig> = {}

  const compact = parseBooleanParam(params.compact)
  if (compact !== undefined) partial.compact = compact
  const framed = parseBooleanParam(params.framed)
  if (framed !== undefined) partial.framed = framed

  const { rounded, mode, messageStyle, height } = params
  if (rounded === "none" || rounded === "md" || rounded === "xl") {
    partial.rounded = rounded
  }
  if (mode === "voice-chat" || mode === "voice-only") partial.mode = mode
  if (messageStyle === "contained" || messageStyle === "flat") {
    partial.messageStyle = messageStyle
  }
  if (height !== undefined && height.trim() && Number.isFinite(Number(height))) {
    partial.height = Number(height)
  }

  const stringKeys = [
    "brandLabel",
    "textInputPlaceholder",
    "emptyStateTitle",
    "emptyStateDescription",
    "orbPrimaryColor",
    "orbSecondaryColor",
    "assistantAvatarImageUrl",
    "surfaceColor",
    "textColor",
    "userBubbleColor",
    "userBubbleTextColor",
    "assistantBubbleColor",
    "fontFamily",
    "pageBackground",
    "language",
  ] as const

  for (const key of stringKeys) {
    const value = params[key]
    if (value !== undefined) partial[key] = value
  }

  return partial
}

export const UI_CONFIG_LIMITS = {
  minHeight: MIN_HEIGHT,
  minHeightVoiceOnly: MIN_HEIGHT_VOICE_ONLY,
  maxHeight: MAX_HEIGHT,
  defaultHeight: DEFAULT_HEIGHT,
}
