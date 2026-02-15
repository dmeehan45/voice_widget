import { Card, CardContent } from "@/components/ui/card"
import { VoiceWidget } from "@/components/widget/VoiceWidget"

interface EmbedPageProps {
  params: {
    instanceId: string
  }
  searchParams?: Promise<{
    agentId?: string
  }>
}

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID

export default async function EmbedPage({ searchParams }: EmbedPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const agentId = resolvedSearchParams?.agentId ?? AGENT_ID

  if (!agentId) {
    return (
      <div className="flex h-[600px] w-full items-center justify-center bg-transparent">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center text-sm">
            <p className="font-medium">Missing ElevenLabs agent ID</p>
            <p className="text-muted-foreground mt-2">
              Provide an agent ID with the agentId query parameter or set
              NEXT_PUBLIC_ELEVENLABS_AGENT_ID.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-[600px] w-full bg-transparent">
      <VoiceWidget agentId={agentId} compact className="mx-0 h-full w-full" />
    </div>
  )
}
