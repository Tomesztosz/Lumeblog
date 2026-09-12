// Shared allowlist: neither the preview route nor its message bridge accepts
// arbitrary paths, external URLs, or user-supplied HTML.
export const MODEL_NAMES = Object.freeze([
  "gatlomu",
  "g-shock",
  "minute-repeater",
  "oszlopkerek",
  "rotor",
  "spring-drive",
  "vilagora",
]);
export function isDesignModelPath(path) {
  return MODEL_NAMES.some((name) => path === `/design/models/${name}.html`);
}
export function isJournalModelPath(path, preview = false) {
  return preview
    ? isDesignModelPath(path)
    : MODEL_NAMES.some((name) => path === `/widgets/${name}.html`);
}
export function designModelSource(source) {
  const [path, query] = source.split("?");
  const name = MODEL_NAMES.find((name) => path === `/widgets/${name}.html`);
  if (!name) throw new Error("Unknown preview model");
  return `/design/models/${name}.html${query ? `?${query}` : ""}`;
}
export function renderDesignModel(html, css, model) {
  if (!MODEL_NAMES.includes(model)) throw new Error("Unknown preview model");
  // Keep all original scripts, SVG geometry and content byte-for-byte. Only
  // add preview metadata and an overriding visual layer after the old styles.
  return html
    .replace(
      "</head>",
      `<meta name="robots" content="noindex,nofollow"><style data-design-model>${css}</style></head>`,
    )
    .replace("<body>", `<body data-design-model="${model}">`);
}
