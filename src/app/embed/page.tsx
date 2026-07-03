import type { Metadata } from "next"

import { EmbedWidgetPage } from "@/components/widget/EmbedWidgetPage"

interface EmbedPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function flattenSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): Record<string, string | undefined> {
  const flattened: Record<string, string | undefined> = {}

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      flattened[key] = value[0]
    } else {
      flattened[key] = value
    }
  }

  return flattened
}

export async function generateMetadata({
  searchParams,
}: EmbedPageProps): Promise<Metadata> {
  const resolved = searchParams ? await searchParams : {}
  const rawLabel = resolved.brandLabel
  const label = (Array.isArray(rawLabel) ? rawLabel[0] : rawLabel)?.trim()

  // Keep the embedded document vendor-neutral: the tab/iframe title should
  // carry the customer's brand, not this tool's.
  return {
    title: label || "Voice assistant",
    description: "Talk to our assistant by voice or text.",
  }
}

export default async function EmbedPage({ searchParams }: EmbedPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {}

  return <EmbedWidgetPage searchParams={flattenSearchParams(resolvedSearchParams)} />
}
