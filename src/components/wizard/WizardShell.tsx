"use client"

import { useState } from "react"

import { DEFAULT_UI_CONFIG, type WidgetUiConfig } from "@/components/widget/ui-config"
import { StepChoosePath } from "@/components/wizard/StepChoosePath"
import { StepConnectAgent } from "@/components/wizard/StepConnectAgent"
import { StepCustomize } from "@/components/wizard/StepCustomize"
import { StepHostingSetup } from "@/components/wizard/StepHostingSetup"
import { StepGetEmbed } from "@/components/wizard/StepGetEmbed"

export type HostingPath = "managed" | "self-hosted"

export interface WizardState {
  hostingPath: HostingPath | null
  agentId: string
  uiConfig: WidgetUiConfig
  widgetSlug: string | null
}

const STEP_LABELS = [
  "Choose Path",
  "Connect Agent",
  "Customize",
  "Hosting",
  "Embed Code",
]

export function WizardShell() {
  const [step, setStep] = useState(0)
  const [state, setState] = useState<WizardState>({
    hostingPath: null,
    agentId: "",
    uiConfig: DEFAULT_UI_CONFIG,
    widgetSlug: null,
  })

  const goNext = () => setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1))
  const goBack = () => setStep((s) => Math.max(s - 1, 0))

  const updateState = (patch: Partial<WizardState>) =>
    setState((prev) => ({ ...prev, ...patch }))

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Progress bar */}
      <nav className="mb-8 flex items-center gap-1" aria-label="Setup progress">
        {STEP_LABELS.map((label, i) => {
          const isActive = i === step
          const isComplete = i < step
          return (
            <div key={label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-center">
                <div
                  className={`mx-auto flex size-8 items-center justify-center rounded-full border-[3px] border-black text-xs font-black transition-colors ${
                    isActive
                      ? "bg-[#c7eb68] text-black"
                      : isComplete
                        ? "bg-black text-white"
                        : "bg-white text-black/40"
                  }`}
                >
                  {isComplete ? "\u2713" : i + 1}
                </div>
              </div>
              <span
                className={`text-center text-xs font-medium ${
                  isActive
                    ? "text-black"
                    : isComplete
                      ? "text-black/70"
                      : "text-black/35"
                }`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </nav>

      {/* Step content */}
      {step === 0 && (
        <StepChoosePath
          selected={state.hostingPath}
          onSelect={(hostingPath) => {
            updateState({ hostingPath })
            goNext()
          }}
        />
      )}

      {step === 1 && (
        <StepConnectAgent
          agentId={state.agentId}
          onChange={(agentId) => updateState({ agentId })}
          onNext={goNext}
          onBack={goBack}
        />
      )}

      {step === 2 && (
        <StepCustomize
          agentId={state.agentId}
          uiConfig={state.uiConfig}
          onChange={(uiConfig) => updateState({ uiConfig })}
          onNext={goNext}
          onBack={goBack}
        />
      )}

      {step === 3 && (
        <StepHostingSetup
          hostingPath={state.hostingPath!}
          agentId={state.agentId}
          uiConfig={state.uiConfig}
          onNext={(widgetSlug?: string) => {
            if (widgetSlug) updateState({ widgetSlug })
            goNext()
          }}
          onBack={goBack}
        />
      )}

      {step === 4 && (
        <StepGetEmbed
          hostingPath={state.hostingPath!}
          agentId={state.agentId}
          uiConfig={state.uiConfig}
          widgetSlug={state.widgetSlug}
          onBack={goBack}
        />
      )}
    </div>
  )
}
