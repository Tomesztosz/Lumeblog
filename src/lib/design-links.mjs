// Only rewrite known, published article paths on this preview or the site.
// Unknown links and credits retain their original destination and spelling.
export function previewArticleHref(href, links, previewUrl, siteOrigin) {
  try {
    const base = new URL(previewUrl);
    const url = new URL(href, base);
    if (!["http:", "https:"].includes(url.protocol)) return href;
    if (url.origin !== base.origin && url.origin !== siteOrigin) return href;
    const target = links[url.pathname];
    return typeof target === "string" && target.startsWith("/design/")
      ? target + url.search + url.hash
      : href;
  } catch {
    return href;
  }
}
