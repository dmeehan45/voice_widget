import Link from "next/link"

import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { VoiceWidgetHost } from "@/components/widget/VoiceWidgetHost"

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID

export default function Page() {
  return (
    <main className="site-shell min-h-screen">
      <SiteHeader />

      <section className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="hero-kicker mb-4">Hosted Experience</p>
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">Standalone Voice Chat</h1>
          <p className="text-muted-foreground editorial-copy mt-3 max-w-[48ch] text-lg">
            This page is the full hosted experience you can share directly.
          </p>
        </div>
        <Button asChild variant="brandOutline" className="w-full md:w-auto">
          <Link href="/embed">Open Embed Host</Link>
        </Button>
      </section>

      <section className="fletch-panel organic-offset mt-8 p-3 md:p-5">
        <VoiceWidgetHost defaultAgentId={AGENT_ID} />
      </section>
    </main>
  )
}
