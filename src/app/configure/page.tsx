"use client"

import Link from "next/link"
import { CheckIcon, CopyIcon, Menu } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AGENT_ID_STORAGE_KEY } from "@/components/widget/VoiceWidgetHost"
import {
  DEFAULT_UI_CONFIG,
  UI_CONFIG_LIMITS,
  UI_CONFIG_STORAGE_KEY,
  type MessageStyle,
  type RoundedOption,
  type VoiceWidgetMode,
  type WidgetUiConfig,
  parseStoredUiConfig,
} from "@/components/widget/ui-config"

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

  const copyText = async (value: string, field: "url" | "code") => {
    await navigator.clipboard.writeText(value)
    setCopiedField(field)
    window.setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <main className="site-shell min-h-screen">
      <header className="site-header">
        <div className="site-logo">
          <span className="site-logo-mark" />
          <span>WidgetFlow</span>
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
            <h1 className="text-4xl font-black tracking-tight">Configure Voice Widget</h1>
            <p className="text-muted-foreground text-base">
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

          <div className="grid gap-4 rounded-xl border-2 border-black/15 p-4 text-sm md:p-5">
            <p className="field-label">Widget UI setup</p>

            <div className="grid gap-4 md:grid-cols-2">
              <Toggle label="Use compact layout" value={uiConfig.compact} onChange={(value) => {
                setUiConfig((prev) => ({ ...prev, compact: value }))
                setSaved(false)
              }} />
              <Toggle label="Show frame and border" value={uiConfig.framed} onChange={(value) => {
                setUiConfig((prev) => ({ ...prev, framed: value }))
                setSaved(false)
              }} />

              <Field label="Mode">
                <select
                  value={uiConfig.mode}
                  className="field-select w-full"
                  onChange={(event) => {
                    setUiConfig((prev) => ({ ...prev, mode: event.target.value as VoiceWidgetMode }))
                    setSaved(false)
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
                  onChange={(event) => {
                    setUiConfig((prev) => ({ ...prev, messageStyle: event.target.value as MessageStyle }))
                    setSaved(false)
                  }}
                >
                  <option value="contained">Contained bubbles</option>
                  <option value="flat">Flat bubbles</option>
                </select>
              </Field>

              <Field label="Corner radius">
                <select
                  value={uiConfig.rounded}
                  className="field-select w-full"
                  onChange={(event) => {
                    setUiConfig((prev) => ({ ...prev, rounded: event.target.value as RoundedOption }))
                    setSaved(false)
                  }}
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
                  onChange={(event) => {
                    const nextValue = Number(event.target.value)
                    setUiConfig((prev) => ({
                      ...prev,
                      height: Number.isFinite(nextValue)
                        ? Math.min(UI_CONFIG_LIMITS.maxHeight, Math.max(UI_CONFIG_LIMITS.minHeight, Math.round(nextValue)))
                        : UI_CONFIG_LIMITS.defaultHeight,
                    }))
                    setSaved(false)
                  }}
                />
              </Field>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <InputField label="Brand label (status tile)" value={uiConfig.brandLabel} onChange={(value) => {
                setUiConfig((prev) => ({ ...prev, brandLabel: value }))
                setSaved(false)
              }} />
              <InputField label="Text input placeholder" value={uiConfig.textInputPlaceholder} disabled={uiConfig.mode === "voice-only"} onChange={(value) => {
                setUiConfig((prev) => ({ ...prev, textInputPlaceholder: value }))
                setSaved(false)
              }} />
              <InputField label="Empty state title" value={uiConfig.emptyStateTitle} disabled={uiConfig.mode === "voice-only"} onChange={(value) => {
                setUiConfig((prev) => ({ ...prev, emptyStateTitle: value }))
                setSaved(false)
              }} />
              <InputField label="Empty state description" value={uiConfig.emptyStateDescription} disabled={uiConfig.mode === "voice-only"} onChange={(value) => {
                setUiConfig((prev) => ({ ...prev, emptyStateDescription: value }))
                setSaved(false)
              }} />
              <InputField label="Assistant avatar image URL (optional)" value={uiConfig.assistantAvatarImageUrl} placeholder="https://..." onChange={(value) => {
                setUiConfig((prev) => ({ ...prev, assistantAvatarImageUrl: value }))
                setSaved(false)
              }} />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <ColorField label="Orb primary color" value={uiConfig.orbPrimaryColor} onChange={(value) => {
                setUiConfig((prev) => ({ ...prev, orbPrimaryColor: value }))
                setSaved(false)
              }} />
              <ColorField label="Orb secondary color" value={uiConfig.orbSecondaryColor} onChange={(value) => {
                setUiConfig((prev) => ({ ...prev, orbSecondaryColor: value }))
                setSaved(false)
              }} />
            </div>
          </div>

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

          <div className="space-y-3 rounded-xl border-2 border-black/15 p-4 text-sm md:p-5">
            <p className="field-label">Embeddable widget URL</p>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <code className="field-code flex-1">{embedPath}</code>
              <Button type="button" variant="brandOutline" className="w-full md:w-auto" onClick={() => copyText(getEmbedUrl(), "url")}>
                {copiedField === "url" ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
                Copy URL
              </Button>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border-2 border-black/15 p-4 text-sm md:p-5">
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
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
      <input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} />
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
        onChange={(event) => onChange(event.target.value)}
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
          className="h-10 w-12 rounded-xl border-2 border-black/20 bg-white"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <input
          className="field-input flex-1"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </label>
  )
}
