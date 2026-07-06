"use client"

import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { AgentConnectionTest } from "@/components/widget/AgentConnectionTest"
import { buildEmbedPath } from "@/components/widget/embed-code"
import {
  AGENT_ID_STORAGE_KEY,
  useStoredWidgetConfig,
} from "@/components/widget/use-stored-widget-config"
import {
  UI_CONFIG_STORAGE_KEY,
  parseUiConfigParams,
  sanitizeWidgetUiConfig,
  type WidgetUiConfig,
} from "@/components/widget/ui-config"
import { EmbedSnippets } from "@/components/wizard/EmbedSnippets"
import { WidgetConfigForm } from "@/components/wizard/WidgetConfigForm"

const DEFAULT_AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID ?? ""

export default function ConfigurePage() {
  // Unedited fields track saved browser config (hydration-safe); edits
  // shadow it until saved.
  const { storedAgentId, storedUiConfig } = useStoredWidgetConfig()
  const [agentIdEdit, setAgentIdEdit] = useState<string | null>(null)
  const [uiConfigEdit, setUiConfigEdit] = useState<WidgetUiConfig | null>(null)
  const [saved, setSaved] = useState(false)
  const [importValue, setImportValue] = useState("")
  const [importStatus, setImportStatus] = useState<"idle" | "done" | "invalid">(
    "idle"
  )

  const agentId = agentIdEdit ?? storedAgentId ?? DEFAULT_AGENT_ID
  const uiConfig = uiConfigEdit ?? storedUiConfig
  const setAgentId = (next: string) => setAgentIdEdit(next)
  const setUiConfig = (next: WidgetUiConfig) => setUiConfigEdit(next)

  const handleSave = () => {
    const trimmedAgentId = agentId.trim()
    if (!trimmedAgentId) window.localStorage.removeItem(AGENT_ID_STORAGE_KEY)
    else window.localStorage.setItem(AGENT_ID_STORAGE_KEY, trimmedAgentId)
    window.localStorage.setItem(UI_CONFIG_STORAGE_KEY, JSON.stringify(uiConfig))
    setSaved(true)
  }

  const handleImport = () => {
    try {
      const url = new URL(importValue.trim(), window.location.origin)
      const params = Object.fromEntries(url.searchParams.entries())
      const partial = parseUiConfigParams(params)
      const importedAgentId = params.agentId?.trim()

      if (!importedAgentId && Object.keys(partial).length === 0) {
        setImportStatus("invalid")
        return
      }

      setUiConfig(sanitizeWidgetUiConfig({ ...uiConfig, ...partial }))
      if (importedAgentId) setAgentId(importedAgentId)
      setImportValue("")
      setImportStatus("done")
      setSaved(false)
    } catch {
      setImportStatus("invalid")
    }
  }

  const embedPath = buildEmbedPath(agentId, uiConfig)

  return (
    <main className="site-shell min-h-screen">
      <SiteHeader />

      <Card className="fletch-panel border-[3px] shadow-[0_2px_0_0_#000]">
        <CardContent className="space-y-6 p-5 md:space-y-8 md:p-8">
          <div className="section-stack">
            <p className="hero-kicker">Customization Studio</p>
            <h1 className="text-4xl font-black tracking-tight">Configure Voice Widget</h1>
            <p className="text-muted-foreground editorial-copy max-w-[56ch] text-base">
              Set your ElevenLabs Agent ID, customize the widget, and copy an
              embeddable snippet hosted on <code>/embed</code>.
            </p>
          </div>

          <div className="space-y-3 border-2 border-black/15 bg-white/40 p-4 text-sm md:p-5">
            <p className="field-label">Already have an embed URL?</p>
            <p className="text-muted-foreground text-xs">
              Paste it here to load its settings into the form — no need to
              re-enter anything.
            </p>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <input
                className="field-input min-w-0 flex-1"
                placeholder="https://your-domain/embed?agentId=..."
                value={importValue}
                onChange={(e) => {
                  setImportValue(e.target.value)
                  setImportStatus("idle")
                }}
              />
              <Button
                type="button"
                variant="brandOutline"
                className="w-full md:w-auto"
                disabled={!importValue.trim()}
                onClick={handleImport}
              >
                Import settings
              </Button>
            </div>
            {importStatus === "done" && (
              <p className="text-xs font-medium text-green-800">
                Settings imported. Review below, then save.
              </p>
            )}
            {importStatus === "invalid" && (
              <p className="text-destructive text-xs font-medium">
                That doesn&apos;t look like a widget embed URL.
              </p>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <p className="field-label">How to find your Agent ID</p>
            <ol className="text-muted-foreground list-decimal space-y-1 pl-5">
              <li>Open your ElevenLabs dashboard.</li>
              <li>Navigate to Conversational AI and choose your agent.</li>
              <li>Copy the Agent ID string from the agent settings.</li>
            </ol>
          </div>

          <div className="space-y-3">
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
            <AgentConnectionTest agentId={agentId} />
          </div>

          <WidgetConfigForm
            uiConfig={uiConfig}
            onChange={(next) => {
              setUiConfig(next)
              setSaved(false)
            }}
          />

          <div className="space-y-2">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Button type="button" variant="brand" className="w-full sm:w-auto" onClick={handleSave}>
                Save settings
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
            <p className="text-muted-foreground text-xs">
              Saving stores your settings in this browser for previews. Your
              live widget is configured entirely by the embed snippet below —
              nothing is deployed from here.
            </p>
          </div>

          <EmbedSnippets agentId={agentId} uiConfig={uiConfig} />
        </CardContent>
      </Card>
    </main>
  )
}
