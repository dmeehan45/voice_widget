"use client"

import { useMemo, useState, useSyncExternalStore } from "react"
import { CheckIcon, CopyIcon, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { copyTextToClipboard } from "@/lib/clipboard"
import {
  PLACEHOLDER_ORIGIN,
  SERVER_EMBED_ORIGIN,
  buildEmbedPath,
  buildIframeSnippet,
  buildLauncherSnippet,
  getEmbedOriginSnapshot,
} from "@/components/widget/embed-code"
import { type WidgetUiConfig } from "@/components/widget/ui-config"

type SnippetTab = "launcher" | "iframe" | "url"

const subscribeNoop = () => () => {}

const TABS: Array<{ id: SnippetTab; label: string; description: string }> = [
  {
    id: "launcher",
    label: "Floating launcher",
    description:
      "A small button in the corner of your site that opens the widget in a panel. Paste before </body>.",
  },
  {
    id: "iframe",
    label: "Inline iframe",
    description:
      "Embeds the widget as a fixed block wherever you paste it in your page.",
  },
  {
    id: "url",
    label: "Direct URL",
    description: "A full-page link you can open, share, or wire up yourself.",
  },
]

export function EmbedSnippets({
  agentId,
  uiConfig,
}: {
  agentId: string
  uiConfig: WidgetUiConfig
}) {
  const [tab, setTab] = useState<SnippetTab>("launcher")
  const [copied, setCopied] = useState(false)
  // Hydration-safe: server render shows the placeholder, the real origin
  // arrives right after hydration.
  const embedOrigin = useSyncExternalStore(
    subscribeNoop,
    getEmbedOriginSnapshot,
    () => SERVER_EMBED_ORIGIN
  )

  const embedPath = useMemo(
    () => buildEmbedPath(agentId, uiConfig),
    [agentId, uiConfig]
  )
  const embedUrl = `${embedOrigin.origin}${embedPath}`

  const snippet = useMemo(() => {
    if (tab === "iframe") {
      return buildIframeSnippet({
        src: embedUrl,
        height: uiConfig.height,
        title: uiConfig.brandLabel,
      })
    }
    if (tab === "launcher") {
      return buildLauncherSnippet({
        origin: embedOrigin.origin,
        embedPath,
        color: uiConfig.userBubbleColor,
        label: uiConfig.brandLabel,
        height: uiConfig.height,
      })
    }
    return embedUrl
  }, [tab, embedUrl, embedOrigin.origin, embedPath, uiConfig])

  const activeTab = TABS.find((t) => t.id === tab) ?? TABS[0]

  const handleCopy = async () => {
    const ok = await copyTextToClipboard(snippet)
    if (!ok) return
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fletch-panel space-y-4 p-5 md:p-6">
      {embedOrigin.isPlaceholder && (
        <div
          role="note"
          className="flex items-start gap-2 border-2 border-black/20 bg-[#fff3c4] p-3 text-xs font-medium"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>
            You&apos;re viewing this from a local or unknown host, so the
            snippet uses <code>{PLACEHOLDER_ORIGIN}</code> as a stand-in.
            Replace it with the domain where you deployed this app before
            pasting.
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-1" role="tablist" aria-label="Embed format">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`border-2 border-black px-3 py-1.5 text-xs font-bold transition-colors ${
              tab === t.id ? "bg-black text-white" : "bg-white hover:bg-black/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="text-muted-foreground text-xs">{activeTab.description}</p>

      <div className="flex flex-col gap-2 md:flex-row md:items-start">
        <pre className="field-code max-h-48 min-w-0 flex-1 overflow-auto whitespace-pre-wrap p-3 text-xs">
          {snippet}
        </pre>
        <Button
          type="button"
          variant="brandOutline"
          className="w-full md:w-auto"
          onClick={() => void handleCopy()}
        >
          {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  )
}
