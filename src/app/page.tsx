"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"

import { SiteHeader } from "@/components/layout/SiteHeader"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { WIZARD_STORAGE_KEY, WizardShell } from "@/components/wizard/WizardShell"

const subscribeNoop = () => () => {}

// Whether this tab already has wizard progress (checked once per load, after
// hydration, so the wizard reopens automatically on refresh).
function hasWizardProgressSnapshot() {
  try {
    return window.sessionStorage.getItem(WIZARD_STORAGE_KEY) !== null
  } catch {
    return false
  }
}

export default function Home() {
  const [wizardStarted, setWizardStarted] = useState(false)
  const wizardRef = useRef<HTMLDivElement>(null)
  const startedByClickRef = useRef(false)
  const hasWizardProgress = useSyncExternalStore(
    subscribeNoop,
    hasWizardProgressSnapshot,
    () => false
  )
  const showWizard = wizardStarted || hasWizardProgress

  useEffect(() => {
    if (wizardStarted && startedByClickRef.current) {
      wizardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [wizardStarted])

  return (
    <main className="site-shell min-h-screen">
      <SiteHeader />

      <section className="pt-4 md:pt-10">
        <div className="content-column section-stack mb-8">
          <p className="hero-kicker">White-label voice widget</p>
          <h1 className="hero-title">Launch your voice widget.</h1>
          <p className="hero-copy max-w-[42ch]">
            Choose how to host, connect your ElevenLabs agent, customize the
            look, and get an embed snippet — all in a few steps.
          </p>
        </div>

        <HowItWorks
          onGetStarted={() => {
            startedByClickRef.current = true
            setWizardStarted(true)
          }}
        />

        {showWizard && (
          <div ref={wizardRef} className="mt-16 scroll-mt-8">
            <WizardShell />
          </div>
        )}
      </section>
    </main>
  )
}
