"use client"

import Link from "next/link"
import { Settings, Paintbrush, Code2, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

interface HowItWorksProps {
  onGetStarted: () => void
}

const PHASES = [
  {
    number: 1,
    icon: Settings,
    title: "Choose your setup",
    description:
      "Decide how you want to host your widget — we can manage it for you, or you deploy it on your own infrastructure. Then connect your ElevenLabs AI agent.",
  },
  {
    number: 2,
    icon: Paintbrush,
    title: "Customize the look",
    description:
      "Configure colors, layout, branding, and conversation style. Preview every change live before you ship.",
  },
  {
    number: 3,
    icon: Code2,
    title: "Grab your embed code",
    description:
      "Copy a single iframe snippet and paste it into any website. Your voice widget goes live instantly.",
  },
]

export function HowItWorks({ onGetStarted }: HowItWorksProps) {
  return (
    <section className="mx-auto w-full max-w-4xl">
      {/* Section header */}
      <div className="section-stack mb-8">
        <p className="hero-kicker">How it works</p>
        <h2 className="text-3xl font-black tracking-tight md:text-4xl">
          Build an embeddable voice widget in&nbsp;minutes.
        </h2>
        <p className="hero-copy max-w-[52ch]">
          You&rsquo;re here to create a white-label voice &amp; text chat
          widget powered by ElevenLabs AI. Follow three short phases and
          you&rsquo;ll walk away with an iframe snippet ready to drop into any
          website.
        </p>
      </div>

      {/* Three phase cards */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {PHASES.map((phase) => {
          const Icon = phase.icon
          return (
            <div key={phase.number} className="fletch-panel p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full border-[3px] border-black bg-[#c7eb68] text-xs font-black">
                  {phase.number}
                </div>
                <div className="flex size-10 items-center justify-center rounded-md border-2 border-black bg-white">
                  <Icon className="size-5" />
                </div>
              </div>
              <h3 className="text-lg font-black">{phase.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {phase.description}
              </p>
            </div>
          )
        })}
      </div>

      {/* What you'll get panel */}
      <div className="fletch-panel mt-8 p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
          <div className="flex-1">
            <h3 className="text-xl font-black">What you&rsquo;ll get</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed max-w-[48ch]">
              At the end of this setup you&rsquo;ll have a ready-to-use embed
              snippet like the one below. Paste it into your HTML and your
              visitors can talk to your AI agent instantly — by voice or text.
            </p>
            <p className="mt-4 text-sm">
              Want to see it in action first?{" "}
              <Link
                href="/voice-chat"
                className="font-semibold underline underline-offset-2"
              >
                Try the standalone demo&nbsp;&rarr;
              </Link>
            </p>
          </div>
          <div className="flex-1">
            <p className="field-label mb-2">Your embed snippet</p>
            <pre className="field-code overflow-x-auto text-xs leading-relaxed">
{`<iframe
  src="https://your-domain/embed?agentId=agent_..."
  allow="microphone"
  width="100%"
  height="600"
  style="border:none"
></iframe>`}
            </pre>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-10 flex flex-col items-center gap-3">
        <Button variant="brand" size="lg" onClick={onGetStarted}>
          Get Started
          <ArrowRight className="size-4" />
        </Button>
        <p className="text-muted-foreground text-xs">
          Takes about 5 minutes &middot; No account required for self-hosted
        </p>
      </div>
    </section>
  )
}
