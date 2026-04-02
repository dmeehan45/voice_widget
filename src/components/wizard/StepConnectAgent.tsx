"use client"

import { Button } from "@/components/ui/button"

interface StepConnectAgentProps {
  agentId: string
  onChange: (agentId: string) => void
  onNext: () => void
  onBack: () => void
}

export function StepConnectAgent({
  agentId,
  onChange,
  onNext,
  onBack,
}: StepConnectAgentProps) {
  const isValid = agentId.trim().length > 0

  return (
    <div className="section-stack">
      <p className="hero-kicker">Step 2</p>
      <h2 className="text-3xl font-black tracking-tight">
        Connect your ElevenLabs agent
      </h2>
      <p className="text-muted-foreground max-w-[48ch] text-base">
        Your voice widget is powered by an ElevenLabs Conversational AI agent.
        Paste your Agent ID below.
      </p>

      <div className="fletch-panel mt-4 space-y-5 p-5 md:p-6">
        <div className="space-y-2 text-sm">
          <p className="field-label">How to find your Agent ID</p>
          <ol className="text-muted-foreground list-decimal space-y-1 pl-5">
            <li>Open your ElevenLabs dashboard.</li>
            <li>Navigate to Conversational AI and choose your agent.</li>
            <li>Copy the Agent ID string from the agent settings.</li>
          </ol>
        </div>

        <div className="space-y-2">
          <label htmlFor="wizard-agent-id" className="field-label">
            ElevenLabs Agent ID
          </label>
          <input
            id="wizard-agent-id"
            className="field-input"
            placeholder="agent_..."
            value={agentId}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="brandOutline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          variant="brand"
          disabled={!isValid}
          onClick={onNext}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
