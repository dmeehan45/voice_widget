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

export default async function EmbedPage({ searchParams }: EmbedPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {}

  return <EmbedWidgetPage searchParams={flattenSearchParams(resolvedSearchParams)} />
}
