import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  return NextResponse.json({
    hasAgentId: Boolean(process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID),
    agentIdPrefix: (process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "").slice(0, 10),
  })
}
