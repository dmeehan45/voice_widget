"use client"

import dynamic from "next/dynamic"

import { cn } from "@/lib/utils"

// three.js + react-three-fiber dominate the widget bundle. Loading the orb
// lazily keeps the WebGL stack out of the critical path; the gradient
// placeholder below shows until (or instead of, if WebGL fails) the canvas.
const OrbCanvas = dynamic(
  () => import("@/components/ui/orb").then((m) => m.Orb),
  { ssr: false, loading: () => null }
)

export function OrbLazy({
  colors = ["#CADCFC", "#A0B9D1"],
  className,
}: {
  colors?: [string, string]
  className?: string
}) {
  return (
    <div className={cn("relative", className)}>
      <div
        aria-hidden
        className="absolute inset-[6%] rounded-full"
        style={{
          background: `radial-gradient(circle at 32% 30%, ${colors[0]}, ${colors[1]})`,
        }}
      />
      <OrbCanvas className="absolute inset-0" colors={colors} />
    </div>
  )
}
