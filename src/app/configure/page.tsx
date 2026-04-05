"use client"

import Link from "next/link"
import { CheckIcon, CopyIcon, Menu } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AGENT_ID_STORAGE_KEY } from "@/components/widget/VoiceWidgetHost"
import {
  DEFAULT_UI_CONFIG,
  UI_CONFIG_STORAGE_KEY,
  type WidgetUiConfig,
  parseStoredUiConfig,
} from "@/components/widget/ui-config"
import { WidgetConfigForm } from "@/components/wizard/WidgetConfigForm"

const DEFAULT_AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID ?? ""

function getInitialAgentId() {
  if (typeof window === "undefined") return DEFAULT_AGENT_ID
  return window.localStorage.getItem(AGENT_ID_STORAGE_KEY) ?? DEFAULT_AGENT_ID
}

function getInitialUiConfig(): WidgetUiConfig {
  if (typeof window === "undefined") return DEFAULT_UI_CONFIG
  return parseStoredUiConfig(window.localStorage.getItem(UI_CONFIG_STORAGE_KEY))
}

export default function ConfigurePage() {
  const [agentId, setAgentId] = useState(getInitialAgentId)
  const [uiConfig, setUiConfig] = useState(getInitialUiConfig)
  const [saved, setSaved] = useState(false)
  const [copiedField, setCopiedField] = useState<"url" | "code" | null>(null)

  const embedQuery = useMemo(() => {
    const params = new URLSearchParams()
    if (agentId.trim()) params.set("agentId", agentId.trim())
    params.set("compact", String(uiConfig.compact))
    params.set("framed", String(uiConfig.framed))
    params.set("rounded", uiConfig.rounded)
    params.set("height", String(uiConfig.height))
    params.set("mode", uiConfig.mode)
    params.set("brandLabel", uiConfig.brandLabel)
    params.set("textInputPlaceholder", uiConfig.textInputPlaceholder)
    params.set("emptyStateTitle", uiConfig.emptyStateTitle)
    params.set("emptyStateDescription", uiConfig.emptyStateDescription)
    params.set("orbPrimaryColor", uiConfig.orbPrimaryColor)
    params.set("orbSecondaryColor", uiConfig.orbSecondaryColor)
    params.set("assistantAvatarImageUrl", uiConfig.assistantAvatarImageUrl)
    params.set("messageStyle", uiConfig.messageStyle)
    return params.toString()
  }, [agentId, uiConfig])

  const embedPath = `/embed?${embedQuery}`
  const getEmbedUrl = () =>
    typeof window === "undefined" ? embedPath : new URL(embedPath, window.location.origin).toString()
  const getEmbedCode = (src: string) =>
    `<iframe src="${src}" title="Voice Chat Widget" width="100%" height="${uiConfig.height}" style="border:0;" allow="microphone"></iframe>`

  const handleSave = () => {
    const trimmedAgentId = agentId.trim()
    if (!trimmedAgentId) window.localStorage.removeItem(AGENT_ID_STORAGE_KEY)
    else window.localStorage.setItem(AGENT_ID_STORAGE_KEY, trimmedAgentId)
    window.localStorage.setItem(UI_CONFIG_STORAGE_KEY, JSON.stringify(uiConfig))
    setSaved(true)
  }

  const copyWithFallback = (value: string) => {
    const textarea = document.createElement("textarea")
    textarea.value = value
    textarea.setAttribute("readonly", "")
    textarea.style.position = "absolute"
    textarea.style.left = "-9999px"
    document.body.appendChild(textarea)
    textarea.select()

    try {
      return document.execCommand("copy")
    } finally {
      document.body.removeChild(textarea)
    }
  }

  const copyText = async (value: string, field: "url" | "code") => {
    let copied = false

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(value)
        copied = true
      } catch {
        copied = false
      }
    }

    if (!copied) {
      copied = copyWithFallback(value)
    }

    if (!copied) {
      return
    }

    setCopiedField(field)
    window.setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <main className="site-shell min-h-screen">
      <header className="site-header">
        <div className="site-logo">
          <span className="site-logo-mark" />
          <span>White Label VoiceWidget</span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Button asChild variant="brandOutline" className="hidden sm:inline-flex">
            <Link href="/voice-chat">Standalone Demo</Link>
          </Button>
          <Button asChild variant="brandOutline" className="hidden md:inline-flex">
            <Link href="/">Back To Guide</Link>
          </Button>
          <Button variant="brandOutline" size="icon" className="sm:hidden" aria-label="Menu">
            <Menu />
          </Button>
        </div>
      </header>

      <Card className="fletch-panel border-[3px] shadow-[0_2px_0_0_#000]">
        <CardContent className="space-y-6 p-5 md:space-y-8 md:p-8">
          <div className="section-stack">
            <p className="hero-kicker">Customization Studio</p>
            <h1 className="text-4xl font-black tracking-tight">Configure Voice Widget</h1>
            <p className="text-muted-foreground editorial-copy max-w-[56ch] text-base">
              Save your ElevenLabs Agent ID, customize widget UI, and copy an
              embeddable snippet hosted on <code>/embed</code>.
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <p className="field-label">How to find your Agent ID</p>
            <ol className="text-muted-foreground list-decimal space-y-1 pl-5">
              <li>Open your ElevenLabs dashboard.</li>
              <li>Navigate to Conversational AI and choose your agent.</li>
              <li>Copy the Agent ID string from the agent settings.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <label htmlFor="agent-id" className="field-label">
              ElevenLabs Agent ID
            </label>
            <input
              id="agent-id"
              className="field-input"
              placeholder="agent_..."
              value={agentId}
              onChange={(event) => {
                setAgentId(event.target.value)
                setSaved(false)
              }}
            />
          </div>

          <WidgetConfigForm
            uiConfig={uiConfig}
            onChange={(next) => {
              setUiConfig(next)
              setSaved(false)
            }}
          />

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Button type="button" variant="brand" className="w-full sm:w-auto" onClick={handleSave}>
              Save and deploy
            </Button>
            {saved && (
              <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:flex-row sm:items-center">
                <p className="text-muted-foreground text-sm">Saved.</p>
                <Button asChild variant="brandOutline" size="sm" className="w-full sm:w-auto">
                  <Link href={embedPath}>Preview /embed</Link>
                </Button>
                <Button asChild variant="brandOutline" size="sm" className="w-full sm:w-auto">
                  <Link href="/voice-chat">Open /voice-chat</Link>
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-3 border-2 border-black/15 bg-white/40 p-4 text-sm md:p-5">
            <p className="field-label">Embeddable widget URL</p>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <code className="field-code flex-1">{embedPath}</code>
              <Button type="button" variant="brandOutline" className="w-full md:w-auto" onClick={() => copyText(getEmbedUrl(), "url")}>
                {copiedField === "url" ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
                Copy URL
              </Button>
            </div>
          </div>

          <div className="space-y-3 border-2 border-black/15 bg-white/40 p-4 text-sm md:p-5">
            <p className="field-label">Copy/paste iframe code</p>
            <div className="flex flex-col gap-2 md:flex-row md:items-start">
              <pre className="field-code max-h-48 flex-1 whitespace-pre-wrap p-3">{getEmbedCode(embedPath)}</pre>
              <Button type="button" variant="brandOutline" className="w-full md:w-auto" onClick={() => copyText(getEmbedCode(getEmbedUrl()), "code")}>
                {copiedField === "code" ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
                Copy code
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

