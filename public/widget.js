/*
 * White Label VoiceWidget — floating launcher.
 *
 * Usage:
 *   <script src="https://YOUR-DOMAIN/widget.js"
 *           data-src="https://YOUR-DOMAIN/embed?agentId=..."
 *           data-color="#c7eb68"
 *           data-label="Chat with us"
 *           data-position="right"   (or "left")
 *           data-width="380"
 *           data-height="600"
 *           async></script>
 *
 * Events (dispatched on window for host-page analytics):
 *   "voicewidget:open", "voicewidget:close",
 *   "voicewidget:connected", "voicewidget:disconnected"
 */
(function () {
  if (window.__voiceWidgetLauncher) return;
  window.__voiceWidgetLauncher = true;

  var script = document.currentScript;
  if (!script) return;

  var src = script.getAttribute("data-src");
  if (!src) {
    console.error("[voice-widget] Missing required data-src attribute.");
    return;
  }

  var embedOrigin;
  try {
    embedOrigin = new URL(src, window.location.href).origin;
  } catch {
    console.error("[voice-widget] Invalid data-src URL:", src);
    return;
  }

  var color = script.getAttribute("data-color") || "#0b0b0b";
  var label = script.getAttribute("data-label") || "Open voice assistant";
  var position = script.getAttribute("data-position") === "left" ? "left" : "right";
  var panelWidth = parseInt(script.getAttribute("data-width") || "380", 10) || 380;
  var panelHeight = parseInt(script.getAttribute("data-height") || "600", 10) || 600;

  var Z_INDEX = "2147483000";
  var BUTTON_SIZE = 56;
  var MARGIN = 20;

  var open = false;
  var panel = null;
  var iframe = null;

  function dispatch(name) {
    try {
      window.dispatchEvent(new CustomEvent("voicewidget:" + name));
    } catch {
      /* CustomEvent unsupported — ignore */
    }
  }

  // Contrast-aware icon color for the launcher glyph.
  function iconColor(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex.replace(/^#([0-9a-f]{3})$/i, function (_, s) {
      return "#" + s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    }));
    if (!m) return "#ffffff";
    var n = parseInt(m[1], 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? "#0b0b0b" : "#ffffff";
  }

  var glyph = iconColor(color);

  var MIC_ICON =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="' + glyph + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>';
  var CLOSE_ICON =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="' + glyph + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

  var button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", label);
  button.setAttribute("aria-expanded", "false");
  button.innerHTML = MIC_ICON;
  button.style.cssText =
    "position:fixed;bottom:" + MARGIN + "px;" + position + ":" + MARGIN + "px;" +
    "width:" + BUTTON_SIZE + "px;height:" + BUTTON_SIZE + "px;border-radius:50%;" +
    "background:" + color + ";border:none;cursor:pointer;z-index:" + Z_INDEX + ";" +
    "display:flex;align-items:center;justify-content:center;padding:0;" +
    "box-shadow:0 4px 16px rgba(0,0,0,0.24);transition:transform 0.15s ease;";

  button.addEventListener("mouseenter", function () {
    button.style.transform = "scale(1.06)";
  });
  button.addEventListener("mouseleave", function () {
    button.style.transform = "scale(1)";
  });

  function ensurePanel() {
    if (panel) return;

    panel = document.createElement("div");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", label);
    panel.style.cssText =
      "position:fixed;bottom:" + (MARGIN + BUTTON_SIZE + 12) + "px;" + position + ":" + MARGIN + "px;" +
      "width:min(" + panelWidth + "px, calc(100vw - " + MARGIN * 2 + "px));" +
      "height:min(" + panelHeight + "px, calc(100vh - " + (MARGIN * 2 + BUTTON_SIZE + 12) + "px));" +
      "z-index:" + Z_INDEX + ";display:none;border-radius:12px;overflow:hidden;" +
      "box-shadow:0 12px 40px rgba(0,0,0,0.28);background:transparent;";

    iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.title = label;
    iframe.allow = "microphone";
    iframe.style.cssText = "width:100%;height:100%;border:0;display:block;background:transparent;";

    panel.appendChild(iframe);
    document.body.appendChild(panel);
  }

  function setOpen(next) {
    open = next;
    if (open) {
      ensurePanel();
      panel.style.display = "block";
      button.innerHTML = CLOSE_ICON;
      button.setAttribute("aria-expanded", "true");
      dispatch("open");
    } else if (panel) {
      panel.style.display = "none";
      button.innerHTML = MIC_ICON;
      button.setAttribute("aria-expanded", "false");
      dispatch("close");
    }
  }

  button.addEventListener("click", function () {
    setOpen(!open);
  });

  // Relay session events from the embedded widget to the host page.
  window.addEventListener("message", function (event) {
    if (event.origin !== embedOrigin) return;
    var data = event.data;
    if (!data || data.source !== "voice-widget") return;
    if (data.event === "connected") dispatch("connected");
    if (data.event === "disconnected") dispatch("disconnected");
  });

  function mount() {
    document.body.appendChild(button);
  }

  if (document.body) {
    mount();
  } else {
    document.addEventListener("DOMContentLoaded", mount);
  }
})();
