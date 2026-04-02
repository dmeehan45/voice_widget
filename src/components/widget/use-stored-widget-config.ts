"use client"

import { useState } from "react"

import {
  DEFAULT_UI_CONFIG,
  UI_CONFIG_STORAGE_KEY,
  parseStoredUiConfig,
  type WidgetUiConfig,
} from "@/components/widget/ui-config"

export const AGENT_ID_STORAGE_KEY = "voice_widget_agent_id"

function getStoredAgentId(): string | undefined {
  if (typeof window === "undefined") return undefined
  try {
    return window.localStorage.getItem(AGENT_ID_STORAGE_KEY)?.trim() || undefined
  } catch {
    return undefined
  }
}

function getStoredUiConfig(): WidgetUiConfig {
  if (typeof window === "undefined") return DEFAULT_UI_CONFIG
  return parseStoredUiConfig(window.localStorage.getItem(UI_CONFIG_STORAGE_KEY))
}

export function useStoredWidgetConfig() {
  const [storedAgentId] = useState(getStoredAgentId)
  const [storedUiConfig] = useState(getStoredUiConfig)
  return { storedAgentId, storedUiConfig } as const
}
