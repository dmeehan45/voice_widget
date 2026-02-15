"use client"

import Link from "next/link"
import { Menu } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"

const PROGRESS_STORAGE_KEY = "voice_widget_setup_progress_v1"

interface SetupStep {
  id: string
  title: string
  description: string
  href?: string
  hrefLabel?: string
  details?: string[]
}

const SETUP_STEPS: SetupStep[] = [
  {
    id: "domain",
    title: "0. Deploy and set your domain (for self-hosted embeds)",
    description:
      "Deploy this repo first, then map your chosen domain so your embed snippet points to your own host.",
    details: [
      "Deploy this app from GitHub to your host (for example Vercel, Netlify, or your own infra).",
      "Create a DNS record for your chosen subdomain (for example CNAME widget.yourdomain.com).",
      "Enable HTTPS on that domain so microphone access works in-browser.",
      "After deploy, open https://your-domain/ and https://your-domain/embed to verify both routes load.",
      "Use your deployed domain in the copied embed snippet so customers load the widget from your host.",
    ],
  },
  {
    id: "agent-id",
    title: "1. Find your ElevenLabs Agent ID",
    description:
      "In ElevenLabs Console, open Conversational AI, choose your agent, and copy the Agent ID.",
  },
  {
    id: "configure",
    title: "2. Configure widget and save",
    description:
      "Go to /configure, paste your Agent ID, toggle widget UI setup, then click Save and deploy.",
    href: "/configure",
    hrefLabel: "Open /configure",
  },
  {
    id: "embed-code",
    title: "3. Copy and paste your embed code",
    description:
      "On /configure, copy the iframe code and paste it into the destination website where the widget should appear.",
    href: "/configure",
    hrefLabel: "Copy embed code",
  },
  {
    id: "embed-route",
    title: "4. Embeddable widget host route",
    description: "Your embeddable widget is hosted at /embed on your chosen domain.",
    href: "/embed",
    hrefLabel: "Preview /embed",
  },
  {
    id: "voice-chat",
    title: "5. Standalone page route",
    description:
      "If you want to share a full-page voice assistant experience, use /voice-chat.",
    href: "/voice-chat",
    hrefLabel: "Open /voice-chat",
  },
]

function getInitialProgress() {
  if (typeof window === "undefined") {
    return {}
  }

  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY)
    if (!raw) {
      return {}
    }

    return JSON.parse(raw) as Record<string, boolean>
  } catch {
    return {}
  }
}

export default function Home() {
  const [progress, setProgress] = useState<Record<string, boolean>>(getInitialProgress)

  useEffect(() => {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress))
  }, [progress])

  const completedCount = useMemo(() => {
    return SETUP_STEPS.filter((step) => progress[step.id]).length
  }, [progress])

  const currentStep = useMemo(() => {
    return SETUP_STEPS.find((step) => !progress[step.id]) ?? null
  }, [progress])

  const completionPercent = Math.round((completedCount / SETUP_STEPS.length) * 100)

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
            <Link href="/configure">Configure Widget</Link>
          </Button>
          <Button variant="brandOutline" size="icon" className="sm:hidden" aria-label="Menu">
            <Menu />
          </Button>
        </div>
      </header>

      <section className="grid gap-6 pt-4 md:grid-cols-[1.4fr_1fr] md:gap-8 md:pt-10">
        <div className="section-stack">
          <h1 className="hero-title">Launch your white-label voice widget.</h1>
          <p className="hero-copy">
            This setup guide walks you from domain deployment to embed code with a
            progress-driven checklist and one-click actions.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="brand" size="lg" className="w-full sm:w-auto">
              <Link href="/configure">Start Setup</Link>
            </Button>
            <Button asChild variant="brandOutline" size="lg" className="w-full sm:w-auto">
              <Link href="/embed">Preview Embed</Link>
            </Button>
          </div>
        </div>

        <div className="fletch-panel h-fit p-5 md:p-6">
          <p className="text-sm font-semibold uppercase tracking-wide">
            Setup Progress
          </p>
          <p className="mt-3 text-3xl font-black">
            {completedCount}/{SETUP_STEPS.length}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">Steps complete</p>
          <div className="bg-white mt-4 h-3 w-full overflow-hidden rounded-full border-2 border-black">
            <div
              className="bg-primary h-full transition-all"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <p className="mt-4 text-sm font-medium">
            {currentStep ? `Next: ${currentStep.title}` : "All steps completed."}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:mt-10">
        {SETUP_STEPS.map((step) => {
          const done = Boolean(progress[step.id])

          return (
            <article key={step.id} className="fletch-panel p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl space-y-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`size-8 rounded-md border-2 border-black ${done ? "bg-primary" : "bg-white"}`}
                    />
                    <p className="text-xl font-black">{step.title}</p>
                  </div>
                  <p className="text-foreground/85 text-base">{step.description}</p>
                  {step.details ? (
                    <ul className="text-foreground/75 mt-2 list-disc space-y-1 pl-5 text-sm">
                      {step.details.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                  <Button
                    type="button"
                    variant={done ? "brandOutline" : "brand"}
                    className="w-full sm:w-auto"
                    onClick={() =>
                      setProgress((prev) => ({ ...prev, [step.id]: !prev[step.id] }))
                    }
                  >
                    {done ? "Mark Incomplete" : "Mark Complete"}
                  </Button>
                  {step.href ? (
                    <Button asChild variant="brandOutline" className="w-full sm:w-auto">
                      <Link href={step.href}>{step.hrefLabel ?? `Open ${step.href}`}</Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            </article>
          )
        })}
      </section>

      <section className="mt-12">
        <p className="text-muted-foreground mb-5 text-sm font-semibold uppercase tracking-[0.2em]">
          Route Map
        </p>
        <div className="logo-cloud">
          <span>/</span>
          <span>/configure</span>
          <span>/embed</span>
          <span>/voice-chat</span>
          <span>/api</span>
        </div>
      </section>
    </main>
  )
}
