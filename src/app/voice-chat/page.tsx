import Link from "next/link"

import { Button } from "@/components/ui/button"
import { VoiceWidgetHost } from "@/components/widget/VoiceWidgetHost"

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID

export default function Page() {
  return (
    <main className="site-shell min-h-screen">
      <header className="site-header">
        <div className="site-logo">
          <span className="site-logo-mark" />
          <span>WidgetFlow</span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Button asChild variant="brandOutline" className="hidden sm:inline-flex">
            <Link href="/">Setup Guide</Link>
          </Button>
          <Button asChild variant="brand" className="w-full sm:w-auto">
            <Link href="/configure">Configure</Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">Standalone Voice Chat</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            This page is the full hosted experience you can share directly.
          </p>
        </div>
        <Button asChild variant="brandOutline" className="w-full md:w-auto">
          <Link href="/embed">Open Embed Host</Link>
        </Button>
      </section>

      <section className="fletch-panel mt-8 p-3 md:p-5">
        <VoiceWidgetHost defaultAgentId={AGENT_ID} />
      </section>
    </main>
  )
}
