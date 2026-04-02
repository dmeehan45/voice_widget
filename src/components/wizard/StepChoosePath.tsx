"use client"

import { Cloud, Server } from "lucide-react"

import type { HostingPath } from "@/components/wizard/WizardShell"

interface StepChoosePathProps {
  selected: HostingPath | null
  onSelect: (path: HostingPath) => void
}

export function StepChoosePath({ selected, onSelect }: StepChoosePathProps) {
  return (
    <div className="section-stack">
      <p className="hero-kicker">Step 1</p>
      <h2 className="text-3xl font-black tracking-tight">
        How do you want to host your widget?
      </h2>
      <p className="text-muted-foreground max-w-[48ch] text-base">
        Choose whether we manage hosting for you or you deploy it on your own
        infrastructure.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect("managed")}
          className={`fletch-panel motion-gentle cursor-pointer p-6 text-left hover:-translate-y-px ${
            selected === "managed" ? "ring-primary ring-2 ring-offset-2" : ""
          }`}
        >
          <div className="mb-4 flex size-12 items-center justify-center rounded-md border-2 border-black bg-[#c7eb68]">
            <Cloud className="size-6" />
          </div>
          <h3 className="text-xl font-black">Host it for me</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            We handle hosting, SSL, and uptime. You get an embed snippet that
            just works.
          </p>
          <ul className="mt-4 space-y-1.5 text-sm">
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-black" />
              Managed hosting on our platform
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-black" />
              SSL and HTTPS included
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-black" />
              Dashboard to manage your widget
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-black" />
              Monthly subscription
            </li>
          </ul>
        </button>

        <button
          type="button"
          onClick={() => onSelect("self-hosted")}
          className={`fletch-panel motion-gentle cursor-pointer p-6 text-left hover:-translate-y-px ${
            selected === "self-hosted" ? "ring-primary ring-2 ring-offset-2" : ""
          }`}
        >
          <div className="mb-4 flex size-12 items-center justify-center rounded-md border-2 border-black bg-white">
            <Server className="size-6" />
          </div>
          <h3 className="text-xl font-black">I&apos;ll host it myself</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Deploy the widget on your own infrastructure. Full control, no
            ongoing fees to us.
          </p>
          <ul className="mt-4 space-y-1.5 text-sm">
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-black" />
              Deploy to Vercel, Netlify, or your own server
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-black" />
              Use your own domain
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-black" />
              Full source code access
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-black" />
              Free — you manage infrastructure
            </li>
          </ul>
        </button>
      </div>
    </div>
  )
}
