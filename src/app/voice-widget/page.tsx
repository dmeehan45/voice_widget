import { VoiceWidgetHost } from "@/components/widget/VoiceWidgetHost"

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID

export default function VoiceWidgetPage() {
  return <VoiceWidgetHost defaultAgentId={AGENT_ID} />
}
