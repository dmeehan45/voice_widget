"use client"

import { useEffect, useState } from "react"

import {
  DEFAULT_UI_CONFIG,
  sanitizeWidgetUiConfig,
  type WidgetUiConfig,
} from "@/components/widget/ui-config"
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
}

export const WIZARD_STORAGE_KEY = "voice_widget_wizard_v1"

const STEP_LABELS = [
  "Choose Path",
  "Connect Agent",
  "Customize",
  "Hosting",
  "Embed Code",
]

const INITIAL_STATE: WizardState = {
  hostingPath: null,
  agentId: "",
  uiConfig: DEFAULT_UI_CONFIG,
}

interface PersistedWizard {
  step?: unknown
  state?: {
    hostingPath?: unknown
    agentId?: unknown
    uiConfig?: unknown
  }
}

function restorePersistedWizard(): { step: number; state: WizardState } {
  const fallback = { step: 0, state: INITIAL_STATE }
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.sessionStorage.getItem(WIZARD_STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as PersistedWizard
    const step =
      typeof parsed.step === "number"
        ? Math.min(Math.max(Math.round(parsed.step), 0), STEP_LABELS.length - 1)
        : 0
    return {
      step,
      state: {
        hostingPath: parsed.state?.hostingPath === "self-hosted" ? "self-hosted" : null,
        agentId:
          typeof parsed.state?.agentId === "string" ? parsed.state.agentId : "",
        uiConfig: sanitizeWidgetUiConfig(
          parsed.state?.uiConfig as Partial<WidgetUiConfig> | undefined
        ),
      },
    }
  } catch {
    return fallback
  }
}

export function WizardShell() {
  // The wizard only mounts on client interaction or client-side restore, so
  // the lazy initializer can safely read sessionStorage.
  const [wizard, setWizard] = useState(restorePersistedWizard)
  const { step, state } = wizard

  // Survive refreshes: progress lives in sessionStorage for this tab.
  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        WIZARD_STORAGE_KEY,
        JSON.stringify({ step, state })
      )
    } catch {
      // Storage may be unavailable (private mode); the wizard still works.
    }
  }, [step, state])

  const goNext = () =>
    setWizard((prev) => ({
      ...prev,
      step: Math.min(prev.step + 1, STEP_LABELS.length - 1),
    }))
  const goBack = () =>
    setWizard((prev) => ({ ...prev, step: Math.max(prev.step - 1, 0) }))

  const updateState = (patch: Partial<WizardState>) =>
    setWizard((prev) => ({ ...prev, state: { ...prev.state, ...patch } }))

  return (
    <div className="content-column">
      {/* Progress bar */}
      <nav className="mb-8 flex items-center gap-1" aria-label="Setup progress">
        {STEP_LABELS.map((label, i) => {
          const isActive = i === step
          const isComplete = i < step
          return (
            <div key={label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-center">
                <div
                  aria-current={isActive ? "step" : undefined}
                  className={`mx-auto flex size-8 items-center justify-center rounded-full border-[3px] border-black text-xs font-black transition-colors ${
                    isActive
                      ? "bg-[#c7eb68] text-black"
                      : isComplete
                        ? "bg-black text-white"
                        : "bg-white text-black/40"
                  }`}
                >
                  {isComplete ? "✓" : i + 1}
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
          agentId={state.agentId}
          uiConfig={state.uiConfig}
          onNext={goNext}
          onBack={goBack}
        />
      )}

      {step === 4 && (
        <StepGetEmbed
          agentId={state.agentId}
          uiConfig={state.uiConfig}
          onBack={goBack}
        />
      )}
    </div>
  )
}
