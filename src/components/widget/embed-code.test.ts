import { describe, expect, it } from "vitest"

import {
  buildEmbedPath,
  buildEmbedQuery,
  buildIframeSnippet,
  buildLauncherSnippet,
  escapeHtmlAttr,
} from "./embed-code"
import { DEFAULT_UI_CONFIG, sanitizeWidgetUiConfig } from "./ui-config"

describe("buildEmbedQuery", () => {
  it("emits only the agent ID when everything is default", () => {
    expect(buildEmbedQuery("agent_123", DEFAULT_UI_CONFIG)).toBe(
      "agentId=agent_123"
    )
  })

  it("omits default values and keeps overrides", () => {
    const config = sanitizeWidgetUiConfig({
      ...DEFAULT_UI_CONFIG,
      brandLabel: "Acme",
      height: 720,
    })
    const query = new URLSearchParams(buildEmbedQuery("agent_1", config))
    expect(query.get("brandLabel")).toBe("Acme")
    expect(query.get("height")).toBe("720")
    expect(query.get("mode")).toBeNull()
    expect(query.get("orbPrimaryColor")).toBeNull()
  })

  it("trims and omits an empty agent ID", () => {
    expect(buildEmbedQuery("   ", DEFAULT_UI_CONFIG)).toBe("")
    expect(buildEmbedPath("", DEFAULT_UI_CONFIG)).toBe("/embed")
  })
})

describe("snippet builders", () => {
  it("escapes attribute values in iframe snippets", () => {
    const snippet = buildIframeSnippet({
      src: 'https://x.test/embed?a="><script>',
      height: 600,
      title: 'Acme "Support" <hi>',
    })
    expect(snippet).not.toContain("<script>")
    expect(snippet).toContain("Acme &quot;Support&quot; &lt;hi&gt;")
    expect(snippet).toContain('height="600"')
    expect(snippet).toContain('allow="microphone"')
  })

  it("builds a launcher script tag with data attributes", () => {
    const snippet = buildLauncherSnippet({
      origin: "https://widget.acme.com",
      embedPath: "/embed?agentId=agent_1",
      color: "#c7eb68",
      label: "Chat with us",
      height: 600,
    })
    expect(snippet).toContain('src="https://widget.acme.com/widget.js"')
    expect(snippet).toContain(
      'data-src="https://widget.acme.com/embed?agentId=agent_1"'
    )
    expect(snippet).toContain('data-color="#c7eb68"')
    expect(snippet).toContain('data-label="Chat with us"')
    expect(snippet).toContain("async")
    expect(snippet).not.toContain("data-position")
  })

  it("escapes html-sensitive characters", () => {
    expect(escapeHtmlAttr('a"b<c>&')).toBe("a&quot;b&lt;c&gt;&amp;")
  })
})
