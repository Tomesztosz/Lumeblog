import { isJournalModelPath } from "./design-models.mjs";

// Same first-party protocol, with separate allowlists for public and preview
// pages. The original widgets' bindChild implementation remains unchanged.
export function bindDesignFrames(isDark: () => boolean, preview = true) {
  const origin = location.origin;
  function local(frame: HTMLIFrameElement) {
    try {
      const url = new URL(frame.getAttribute("src") ?? "", location.href);
      return url.origin === origin && isJournalModelPath(url.pathname, preview);
    } catch {
      return false;
    }
  }
  const tell = (frame: HTMLIFrameElement) => {
    if (local(frame))
      frame.contentWindow?.postMessage(
        { type: "lume:lights", dark: isDark() },
        origin,
      );
  };
  window.addEventListener("message", (event) => {
    if (
      event.origin !== origin ||
      !event.data ||
      typeof event.data !== "object" ||
      Array.isArray(event.data)
    )
      return;
    const frame = [...document.querySelectorAll("iframe")].find(
      (frame) => local(frame) && frame.contentWindow === event.source,
    );
    if (!frame) return;
    if (event.data.type === "lume:ready") tell(frame);
    const height = event.data.height;
    if (
      event.data.type === "lume:height" &&
      typeof height === "number" &&
      Number.isFinite(height) &&
      height > 0 &&
      height <= 6000
    )
      frame.style.height = `${Math.ceil(height)}px`;
  });
  return { broadcast: () => document.querySelectorAll("iframe").forEach(tell) };
}
