"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { WizardShell } from "@/components/wizard/WizardShell"

export default function Home() {
  const [wizardStarted, setWizardStarted] = useState(false)
  const wizardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (wizardStarted) {
      wizardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [wizardStarted])

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
            <Link href="/configure">Configure Widget</Link>
          </Button>
          <Button variant="brandOutline" size="icon" className="sm:hidden" aria-label="Menu">
            <Menu />
          </Button>
        </div>
      </header>

      <section className="pt-4 md:pt-10">
        <div className="content-column section-stack mb-8">
          <p className="hero-kicker">White-label voice widget</p>
          <h1 className="hero-title">Launch your voice widget.</h1>
          <p className="hero-copy max-w-[42ch]">
            Choose how to host, connect your ElevenLabs agent, customize the
            look, and get an embed snippet — all in a few steps.
          </p>
        </div>

        <HowItWorks onGetStarted={() => setWizardStarted(true)} />

        {wizardStarted && (
          <div ref={wizardRef} className="mt-16 scroll-mt-8">
            <WizardShell />
          </div>
        )}
      </section>
    </main>
  )
}
