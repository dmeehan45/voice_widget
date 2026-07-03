import { describe, expect, it } from "vitest"

import {
  DEFAULT_UI_CONFIG,
  clampHeight,
  isHexColor,
  minHeightForMode,
  parseStoredUiConfig,
  parseUiConfigParams,
  sanitizeWidgetUiConfig,
  toSixDigitHex,
} from "./ui-config"

describe("sanitizeWidgetUiConfig", () => {
  it("returns defaults for null/undefined/garbage", () => {
    expect(sanitizeWidgetUiConfig(null)).toEqual(DEFAULT_UI_CONFIG)
    expect(sanitizeWidgetUiConfig(undefined)).toEqual(DEFAULT_UI_CONFIG)
    expect(
      sanitizeWidgetUiConfig({
        compact: "yes",
        height: "tall",
        rounded: "circle",
        mode: "video",
        orbPrimaryColor: "not-a-color",
        pageBackground: "red",
        language: "not a language!!",
      } as unknown as Record<string, unknown>)
    ).toEqual(DEFAULT_UI_CONFIG)
  })

  it("clamps height by mode", () => {
    expect(sanitizeWidgetUiConfig({ height: 100 }).height).toBe(360)
    expect(sanitizeWidgetUiConfig({ height: 5000 }).height).toBe(900)
    expect(
      sanitizeWidgetUiConfig({ height: 200, mode: "voice-only" }).height
    ).toBe(200)
    expect(
      sanitizeWidgetUiConfig({ height: 100, mode: "voice-only" }).height
    ).toBe(160)
  })

  it("accepts valid theme colors and rejects junk", () => {
    const config = sanitizeWidgetUiConfig({
      userBubbleColor: "#123abc",
      surfaceColor: "#fff",
      textColor: "javascript:alert(1)",
    })
    expect(config.userBubbleColor).toBe("#123abc")
    expect(config.surfaceColor).toBe("#fff")
    expect(config.textColor).toBe(DEFAULT_UI_CONFIG.textColor)
  })

  it("allows transparent only for pageBackground", () => {
    expect(sanitizeWidgetUiConfig({ pageBackground: "transparent" }).pageBackground).toBe(
      "transparent"
    )
    expect(sanitizeWidgetUiConfig({ pageBackground: "#222222" }).pageBackground).toBe(
      "#222222"
    )
    expect(
      sanitizeWidgetUiConfig({ surfaceColor: "transparent" }).surfaceColor
    ).toBe(DEFAULT_UI_CONFIG.surfaceColor)
  })

  it("strips dangerous characters from fontFamily and validates language", () => {
    expect(
      sanitizeWidgetUiConfig({ fontFamily: '"Inter"; background: red <img>' }).fontFamily
    ).toBe('"Inter" background: red img')
    expect(sanitizeWidgetUiConfig({ language: "de" }).language).toBe("de")
    expect(sanitizeWidgetUiConfig({ language: "pt-BR" }).language).toBe("pt-BR")
    expect(sanitizeWidgetUiConfig({ language: "<script>" }).language).toBe("")
  })
})

describe("parseUiConfigParams", () => {
  it("omits absent or invalid params so fallbacks apply", () => {
    expect(parseUiConfigParams({})).toEqual({})
    expect(
      parseUiConfigParams({ compact: "maybe", rounded: "circle", height: "abc" })
    ).toEqual({})
  })

  it("parses booleans, enums, and height", () => {
    expect(
      parseUiConfigParams({
        compact: "false",
        framed: "1",
        rounded: "md",
        mode: "voice-only",
        messageStyle: "flat",
        height: "480",
      })
    ).toEqual({
      compact: false,
      framed: true,
      rounded: "md",
      mode: "voice-only",
      messageStyle: "flat",
      height: 480,
    })
  })

  it("passes string params through for sanitize to vet", () => {
    const parsed = parseUiConfigParams({
      brandLabel: "Acme Support",
      userBubbleColor: "#ff0000",
      language: "es",
    })
    expect(parsed.brandLabel).toBe("Acme Support")
    expect(parsed.userBubbleColor).toBe("#ff0000")
    expect(parsed.language).toBe("es")
  })

  it("round-trips params over stored config with params winning", () => {
    const stored = sanitizeWidgetUiConfig({ brandLabel: "Stored", height: 700 })
    const resolved = sanitizeWidgetUiConfig({
      ...stored,
      ...parseUiConfigParams({ brandLabel: "FromUrl" }),
    })
    expect(resolved.brandLabel).toBe("FromUrl")
    expect(resolved.height).toBe(700)
  })
})

describe("parseStoredUiConfig", () => {
  it("survives malformed JSON", () => {
    expect(parseStoredUiConfig("{not json")).toEqual(DEFAULT_UI_CONFIG)
    expect(parseStoredUiConfig(null)).toEqual(DEFAULT_UI_CONFIG)
  })
})

describe("color helpers", () => {
  it("validates hex colors", () => {
    expect(isHexColor("#abc")).toBe(true)
    expect(isHexColor("#a1b2c3")).toBe(true)
    expect(isHexColor("abc")).toBe(false)
    expect(isHexColor("#abcd")).toBe(false)
    expect(isHexColor("red")).toBe(false)
  })

  it("expands shorthand hex", () => {
    expect(toSixDigitHex("#abc")).toBe("#aabbcc")
    expect(toSixDigitHex("#A1B2C3")).toBe("#a1b2c3")
    expect(toSixDigitHex("nope")).toBeNull()
  })
})

describe("height helpers", () => {
  it("uses a lower floor for voice-only", () => {
    expect(minHeightForMode("voice-chat")).toBe(360)
    expect(minHeightForMode("voice-only")).toBe(160)
    expect(clampHeight(0, "voice-only")).toBe(160)
    expect(clampHeight(10_000, "voice-chat")).toBe(900)
  })
})
