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
        Today you deploy the widget on your own infrastructure — it takes a few
        minutes and we walk you through it. Managed hosting is on the way.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect("self-hosted")}
          className={`fletch-panel motion-gentle cursor-pointer p-6 text-left hover:-translate-y-px ${
            selected === "self-hosted" ? "ring-primary ring-2 ring-offset-2" : ""
          }`}
        >
          <div className="mb-4 flex size-12 items-center justify-center rounded-md border-2 border-black bg-[#c7eb68]">
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

        <div
          aria-disabled="true"
          className="fletch-panel relative p-6 text-left opacity-75"
        >
          <span className="absolute top-4 right-4 border-2 border-black bg-[#fff3c4] px-2 py-0.5 text-[10px] font-black tracking-wide uppercase">
            Coming soon
          </span>
          <div className="mb-4 flex size-12 items-center justify-center rounded-md border-2 border-black bg-white">
            <Cloud className="size-6" />
          </div>
          <h3 className="text-xl font-black">Host it for me</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Managed hosting with sign-in, billing, and a dashboard is under
            development — it isn&apos;t available yet.
          </p>
          <ul className="text-muted-foreground mt-4 space-y-1.5 text-sm">
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-black/40" />
              Managed hosting on our platform
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-black/40" />
              SSL and HTTPS included
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-black/40" />
              Dashboard to manage your widget
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-black/40" />
              Monthly subscription
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
