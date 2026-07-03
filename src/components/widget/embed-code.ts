import { DEFAULT_UI_CONFIG, type WidgetUiConfig } from "@/components/widget/ui-config"

export const PLACEHOLDER_ORIGIN = "https://your-domain"

export const REPO_URL =
  process.env.NEXT_PUBLIC_WIDGET_REPO_URL ??
  "https://github.com/dmeehan45/voice_widget"

/**
 * Serializes the config into query params, omitting values that match the
 * defaults so embed URLs stay short and unchanged options keep tracking
 * future default improvements.
 */
export function buildEmbedQuery(agentId: string, config: WidgetUiConfig): string {
  const params = new URLSearchParams()
  const trimmedAgentId = agentId.trim()
  if (trimmedAgentId) params.set("agentId", trimmedAgentId)

  for (const key of Object.keys(DEFAULT_UI_CONFIG) as (keyof WidgetUiConfig)[]) {
    const value = config[key]
    if (value !== DEFAULT_UI_CONFIG[key]) {
      params.set(key, String(value))
    }
  }

  return params.toString()
}

export function buildEmbedPath(agentId: string, config: WidgetUiConfig): string {
  const query = buildEmbedQuery(agentId, config)
  return query ? `/embed?${query}` : "/embed"
}

export interface EmbedOrigin {
  origin: string
  /** True when we could not detect a real deployed origin (SSR or localhost). */
  isPlaceholder: boolean
}

export const SERVER_EMBED_ORIGIN: EmbedOrigin = {
  origin: PLACEHOLDER_ORIGIN,
  isPlaceholder: true,
}

export function resolveEmbedOrigin(): EmbedOrigin {
  if (typeof window === "undefined") {
    return SERVER_EMBED_ORIGIN
  }
  const { hostname, origin } = window.location
  const isLocal =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local")
  return isLocal
    ? { origin: PLACEHOLDER_ORIGIN, isPlaceholder: true }
    : { origin, isPlaceholder: false }
}

// Stable snapshot for useSyncExternalStore consumers (the origin cannot
// change within a page's lifetime).
let embedOriginSnapshot: EmbedOrigin | null = null

export function getEmbedOriginSnapshot(): EmbedOrigin {
  if (!embedOriginSnapshot) embedOriginSnapshot = resolveEmbedOrigin()
  return embedOriginSnapshot
}

export function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export function buildIframeSnippet({
  src,
  height,
  title,
}: {
  src: string
  height: number
  title: string
}): string {
  return `<iframe src="${escapeHtmlAttr(src)}" title="${escapeHtmlAttr(title)}" width="100%" height="${height}" style="border:0;" allow="microphone"></iframe>`
}

export function buildLauncherSnippet({
  origin,
  embedPath,
  color,
  label,
  position = "right",
  width = 380,
  height,
}: {
  origin: string
  embedPath: string
  color: string
  label: string
  position?: "left" | "right"
  width?: number
  height: number
}): string {
  const attrs = [
    `src="${escapeHtmlAttr(`${origin}/widget.js`)}"`,
    `data-src="${escapeHtmlAttr(`${origin}${embedPath}`)}"`,
    `data-color="${escapeHtmlAttr(color)}"`,
    `data-label="${escapeHtmlAttr(label)}"`,
    position !== "right" ? `data-position="${position}"` : null,
    `data-width="${width}"`,
    `data-height="${height}"`,
    "async",
  ].filter(Boolean)

  return `<script ${attrs.join(" ")}></script>`
}
