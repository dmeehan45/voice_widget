import { Card, CardContent } from "@/components/ui/card"
import { VoiceWidget } from "@/components/widget/VoiceWidget"

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID

export default function Page() {
  if (!AGENT_ID) {
    return (
      <div className="relative mx-auto h-[600px] w-full">
        <Card className="flex h-full w-full items-center justify-center">
          <CardContent className="p-6 text-center text-sm">
            <p className="font-medium">Missing ElevenLabs agent ID</p>
            <p className="text-muted-foreground mt-2">
              Set NEXT_PUBLIC_ELEVENLABS_AGENT_ID to enable the voice chat demo.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <VoiceWidget agentId={AGENT_ID} />
}
