"use client"

import { useSearchParams } from "next/navigation"
import { VoiceWidget } from "@/components/widget/VoiceWidget"

export default function EmbedPage() {
  const searchParams = useSearchParams()
  const agentId = searchParams.get("agentId") ?? ""

  return (
    <div className="h-[600px] w-full bg-transparent">
      <VoiceWidget agentId={agentId} compact />
    </div>
  )
}
