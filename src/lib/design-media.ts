import type { ImageMetadata } from "astro";
import type { Post } from "./posts";

// Preview-only editorial choices. Never change a published article's cover.
// Alt text and credits come from the same existing, translated image caption.
const selected: Record<string, string> = {
  brew: "brew-metric-wrist-detail-v2.webp",
  "atelier-wen": "atelier-wen-perception-dial-transparent-v2.png",
  "rolex-president": "rolex-day-date-1956-transparent-v2.png",
  "rotor-mukodese": "rotor-grand-seiko-transparent-v2.png",
  baltic: "baltic-mr01-transparent.png",
  "christopher-ward": "christopher-ward-bel-canto-classic-transparent.png",
  "frederique-constant-worldtimer": "frederique-constant-worldtimer-dial.webp",
  "furlan-marri": "furlan-marri-disco-volante.png",
  "g-shock-technologia": "g-shock-dw5000c.jpg",
  "spring-drive": "spring-drive-9r.png",
  "kurono-tokyo": "kurono-anniversary-toki-transparent.png",
  speedmaster: "speedmaster-moonwatch-ma.png",
  "percuto-mukodese": "minute-repeater-patek-hammers-v1.webp",
  "santos-dumont": "cartier-santos-dumont-transparent.png",
  "seiko-quartz-astron": "seiko-quartz-astron-35sq-transparent.png",
  "tag-heuer-monaco": "tag-heuer-monaco-modern-transparent.png",
  "vacheron-222": "vacheron-historiques-222.png",
  vilagora: "frederique-constant-worldtimer-dial.webp",
};
const assets = import.meta.glob<{ default: ImageMetadata }>(
  "../content/posts/_images/*.{png,jpg,jpeg,webp}",
  { eager: true },
);
const articles = import.meta.glob<string>("../content/posts/{hu,en}/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});
export type CreditPart = { text: string; href?: string };
export function creditParts(caption: string): CreditPart[] {
  const result: CreditPart[] = [];
  const link = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let cursor = 0;
  for (const match of caption.matchAll(link)) {
    if (match.index! > cursor)
      result.push({ text: caption.slice(cursor, match.index) });
    result.push({ text: match[1], href: match[2] });
    cursor = match.index! + match[0].length;
  }
  if (cursor < caption.length) result.push({ text: caption.slice(cursor) });
  return result;
}
export function designCover(post: Post) {
  let filename = selected[post.data.translationKey ?? ""];
  if (post.data.translationKey === "oszlopkerek")
    filename = `el-primero-400-${post.data.lang}.png`;
  const src = assets[`../content/posts/_images/${filename}`]?.default;
  if (src) {
    const bodies = [
      post.body ?? "",
      ...Object.entries(articles)
        .filter(([path]) => path.includes(`/${post.data.lang}/`))
        .map(([, body]) => body),
    ];
    for (const body of bodies) {
      for (const match of body.matchAll(
        /!\[([^\]]*)\]\(\.\.\/_images\/([^\s)]+)\)\s*\n\*([^\n]+)\*/g,
      )) {
        if (match[2] !== filename) continue;
        return {
          src,
          alt: match[1],
          caption: creditParts(match[3]),
          credit: match[3],
          creditUrl: undefined,
          license: undefined,
          licenseUrl: undefined,
          replaced: true,
        };
      }
    }
    // Missing translated attribution is not permission to invent it.
    throw new Error(`Missing design image caption: ${post.id}: ${filename}`);
  }
  return post.data.cover
    ? { ...post.data.cover, caption: undefined, replaced: false }
    : undefined;
}
