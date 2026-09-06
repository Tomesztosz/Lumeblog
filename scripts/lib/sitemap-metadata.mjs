import { readFile } from 'node:fs/promises';
import { inspectHtml } from './seo-html.mjs';

/** Az elkészült HTML az igazság forrása, nem URL-ekből kitalált fordításpár. */
export async function sitemapMetadata(item, outDir) {
  const pathname = new URL(item.url).pathname;
  const page = inspectHtml(await readFile(new URL(`.${pathname}index.html`, outDir), 'utf8'));
  if (page.noindex) return undefined;
  if (page.canonical.length !== 1 || page.canonical[0] !== item.url) {
    throw new Error(`Sitemap/canonical mismatch: ${item.url}`);
  }
  const modified = page.meta('article:modified_time')[0];
  return {
    ...item,
    links: page.alternates,
    // Csak a szerkesztő által megadott, érdemi frissítési dátumot közöljük.
    ...(modified ? { lastmod: modified } : {}),
  };
}
