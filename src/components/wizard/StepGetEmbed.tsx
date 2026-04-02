"use client"

import { useMemo, useState } from "react"
import { CheckIcon, CopyIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { type WidgetUiConfig } from "@/components/widget/ui-config"
import type { HostingPath } from "@/components/wizard/WizardShell"

interface StepGetEmbedProps {
  hostingPath: HostingPath
  agentId: string
  uiConfig: WidgetUiConfig
  widgetSlug: string | null
  onBack: () => void
}

export function StepGetEmbed({
  hostingPath,
  agentId,
  uiConfig,
  widgetSlug,
  onBack,
}: StepGetEmbedProps) {
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

  const isManaged = hostingPath === "managed"

  const embedPath = isManaged && widgetSlug
    ? `/w/${widgetSlug}/embed`
    : `/embed?${embedQuery}`

  const getEmbedUrl = () => {
    if (typeof window === "undefined") return embedPath
    if (isManaged && widgetSlug) {
      return new URL(embedPath, window.location.origin).toString()
    }
    return `https://your-domain${embedPath}`
  }

  const getDisplayUrl = () => {
    if (isManaged && widgetSlug) {
      return typeof window !== "undefined"
        ? new URL(embedPath, window.location.origin).toString()
        : embedPath
    }
    return `https://your-domain/embed?agentId=${agentId.trim()}&...`
  }

  const getEmbedCode = () =>
    `<iframe src="${getEmbedUrl()}" title="Voice Chat Widget" width="100%" height="${uiConfig.height}" style="border:0;" allow="microphone"></iframe>`

  const copyText = async (value: string, field: "url" | "code") => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const textarea = document.createElement("textarea")
      textarea.value = value
      textarea.setAttribute("readonly", "")
      textarea.style.position = "absolute"
      textarea.style.left = "-9999px"
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand("copy")
      } finally {
        document.body.removeChild(textarea)
      }
    }
    setCopiedField(field)
    window.setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="section-stack">
      <p className="hero-kicker">Step 5</p>
      <h2 className="text-3xl font-black tracking-tight">
        Your widget is ready!
      </h2>
      <p className="text-muted-foreground max-w-[48ch] text-base">
        {isManaged
          ? "Copy the embed code below and paste it into your website."
          : "After deploying, replace \"your-domain\" with your actual domain, then paste the embed code into your website."}
      </p>

      <div className="mt-4 space-y-4">
        <div className="fletch-panel space-y-3 p-5 md:p-6">
          <p className="field-label">Embed URL</p>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <code className="field-code flex-1 truncate text-xs">
              {getDisplayUrl()}
            </code>
            <Button
              type="button"
              variant="brandOutline"
              className="w-full md:w-auto"
              onClick={() => copyText(getEmbedUrl(), "url")}
            >
              {copiedField === "url" ? (
                <CheckIcon className="size-4" />
              ) : (
                <CopyIcon className="size-4" />
              )}
              Copy URL
            </Button>
          </div>
        </div>

        <div className="fletch-panel space-y-3 p-5 md:p-6">
          <p className="field-label">Iframe embed code</p>
          <div className="flex flex-col gap-2 md:flex-row md:items-start">
            <pre className="field-code max-h-48 flex-1 overflow-auto whitespace-pre-wrap p-3 text-xs">
              {getEmbedCode()}
            </pre>
            <Button
              type="button"
              variant="brandOutline"
              className="w-full md:w-auto"
              onClick={() => copyText(getEmbedCode(), "code")}
            >
              {copiedField === "code" ? (
                <CheckIcon className="size-4" />
              ) : (
                <CopyIcon className="size-4" />
              )}
              Copy code
            </Button>
          </div>
        </div>

        <div className="fletch-panel space-y-3 p-5 md:p-6">
          <p className="field-label">What&apos;s next</p>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li>
              <strong>Preview locally:</strong> Visit{" "}
              <Link href="/embed" className="underline">
                /embed
              </Link>{" "}
              or{" "}
              <Link href="/voice-chat" className="underline">
                /voice-chat
              </Link>{" "}
              to test your widget.
            </li>
            <li>
              <strong>Reconfigure:</strong> Visit{" "}
              <Link href="/configure" className="underline">
                /configure
              </Link>{" "}
              to change settings anytime.
            </li>
            {!isManaged && (
              <li>
                <strong>Deploy:</strong> Push your repo and deploy to get your
                widget live on your domain.
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="brandOutline" onClick={onBack}>
          Back
        </Button>
        <Button asChild variant="brand">
          <Link href="/embed">Preview Widget</Link>
        </Button>
      </div>
    </div>
  )
}
