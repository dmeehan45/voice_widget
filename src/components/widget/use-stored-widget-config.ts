"use client"

import { useSyncExternalStore } from "react"

import {
  DEFAULT_UI_CONFIG,
  UI_CONFIG_STORAGE_KEY,
  parseStoredUiConfig,
  type WidgetUiConfig,
} from "@/components/widget/ui-config"

export const AGENT_ID_STORAGE_KEY = "voice_widget_agent_id"

export function getStoredAgentId(): string | undefined {
  if (typeof window === "undefined") return undefined
  try {
    return window.localStorage.getItem(AGENT_ID_STORAGE_KEY)?.trim() || undefined
  } catch {
    return undefined
  }
}

export function getStoredUiConfig(): WidgetUiConfig {
  if (typeof window === "undefined") return DEFAULT_UI_CONFIG
  try {
    return parseStoredUiConfig(window.localStorage.getItem(UI_CONFIG_STORAGE_KEY))
  } catch {
    return DEFAULT_UI_CONFIG
  }
}

interface StoredWidgetConfig {
  storedAgentId: string | undefined
  storedUiConfig: WidgetUiConfig
  /** False during server render/hydration, true once storage has been read. */
  hydrated: boolean
}

const SERVER_SNAPSHOT: StoredWidgetConfig = {
  storedAgentId: undefined,
  storedUiConfig: DEFAULT_UI_CONFIG,
  hydrated: false,
}

// Snapshot cache keyed on the raw storage strings so repeated reads return
// a referentially-stable object (required by useSyncExternalStore).
let snapshotCache: {
  agentRaw: string | null
  configRaw: string | null
  value: StoredWidgetConfig
} | null = null

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function getSnapshot(): StoredWidgetConfig {
  const agentRaw = readRaw(AGENT_ID_STORAGE_KEY)
  const configRaw = readRaw(UI_CONFIG_STORAGE_KEY)

  if (
    snapshotCache &&
    snapshotCache.agentRaw === agentRaw &&
    snapshotCache.configRaw === configRaw
  ) {
    return snapshotCache.value
  }

  snapshotCache = {
    agentRaw,
    configRaw,
    value: {
      storedAgentId: agentRaw?.trim() || undefined,
      storedUiConfig: parseStoredUiConfig(configRaw),
      hydrated: true,
    },
  }
  return snapshotCache.value
}

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange)
  return () => window.removeEventListener("storage", onStoreChange)
}

/**
 * Reads saved widget config with hydration-safe semantics: the server and
 * hydration renders see defaults, and the real values arrive right after
 * hydration (plus live updates from other tabs).
 */
export function useStoredWidgetConfig(): StoredWidgetConfig {
  return useSyncExternalStore(subscribe, getSnapshot, () => SERVER_SNAPSHOT)
}
