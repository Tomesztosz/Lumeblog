import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { attribute, inspectHtml, textOf } from './lib/seo-html.mjs';

const root = new URL('../', import.meta.url);
const out = new URL('dist/', root);
const site = 'https://lumejournal.com';
const errors = [];
const warnings = new Set();
const check = (condition, message) => { if (!condition) errors.push(message); };
async function walk(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const url = new URL(encodeURIComponent(entry.name) + (entry.isDirectory() ? '/' : ''), directory);
    if (entry.isDirectory()) result.push(...await walk(url));
    else result.push(url);
  }
  return result;
}
const files = await walk(out);
const paths = new Set(files.map((url) => decodeURIComponent(url.href.slice(out.href.length))));
const localPath = (url) => decodeURIComponent(url.pathname).slice(1) + (url.pathname.endsWith('/') ? 'index.html' : '');
const exists = (url) => paths.has(localPath(url));
const pages = new Map();
for (const file of files) {
  const path = decodeURIComponent(file.href.slice(out.href.length));
  if (!path.endsWith('.html') || path.startsWith('widgets/')) continue;
  const url = `${site}/${path.replace(/index\.html$/, '')}`;
  try { pages.set(url, inspectHtml(await readFile(file, 'utf8'))); }
  catch (error) { errors.push(`${url}: invalid HTML/JSON-LD: ${error.message}`); }
}
const indexable = [...pages].filter(([, page]) => !page.noindex);
const launchSettings = await readFile(new URL('src/site.ts', root), 'utf8');
if (/export const LAUNCHED\s*=\s*false\s*;/.test(launchSettings)) {
  check(indexable.length === 0, 'Unlaunched site has indexable pages');
  const robots = await readFile(new URL('robots.txt', out), 'utf8');
  check(/^Disallow:\s*\/\s*$/m.test(robots), 'Unlaunched site is not blocked by robots.txt');
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log('SEO check: intentional site-wide noindex verified (LAUNCHED=false).');
  process.exit(0);
}
const uniqueTitles = new Map();
const uniqueDescriptions = new Map();
const graph = new Map();
let articleCount = 0;
let checkedLinks = 0;
let checkedImages = 0;
const fragmentLinks = [];

for (const [url, page] of pages) {
  if (new URL(url).pathname === '/404.html') {
    check(page.noindex, '404 must be noindex');
    check(page.alternates.length === 0, '404 must not claim to be a translation of the home page');
    continue;
  }
  check(!page.noindex, `${url}: unexpectedly noindex`);
  check(page.titles.length === 1 && Boolean(page.titles[0]?.trim()), `${url}: missing/duplicate title`);
  const title = page.titles[0];
  check(!uniqueTitles.has(title), `${url}: title duplicated with ${uniqueTitles.get(title)}`);
  uniqueTitles.set(title, url);
  const descriptions = page.meta('description');
  check(descriptions.length === 1 && Boolean(descriptions[0]?.trim()), `${url}: missing/duplicate description`);
  check(!uniqueDescriptions.has(descriptions[0]), `${url}: duplicate description`);
  uniqueDescriptions.set(descriptions[0], url);
  check(page.canonical.length === 1 && page.canonical[0] === url, `${url}: canonical mismatch`);
  check(page.elements.filter((node) => node.tagName === 'h1').length === 1, `${url}: expected one h1`);
  check(page.lang === (new URL(url).pathname.startsWith('/en/') ? 'en' : 'hu'), `${url}: wrong language`);
  check(page.meta('robots').length === 1 && page.meta('robots')[0].includes('max-image-preview:large'), `${url}: image previews not enabled`);
  for (const name of ['og:title', 'og:description', 'og:type', 'og:url', 'og:image', 'og:image:alt', 'twitter:card', 'twitter:image']) {
    check(page.meta(name).length === 1 && Boolean(page.meta(name)[0]), `${url}: missing/duplicate ${name}`);
  }
  check(page.meta('og:url')[0] === url, `${url}: Open Graph canonical mismatch`);
  for (const alternate of page.alternates) {
    const target = pages.get(alternate.url);
    check(Boolean(target) && !target.noindex, `${url}: missing/index-excluded hreflang ${alternate.url}`);
    check(target?.alternates.some((item) => item.lang === page.lang && item.url === url), `${url}: nonreciprocal hreflang ${alternate.url}`);
    check(alternate.lang === 'x-default' || target?.lang === alternate.lang, `${url}: hreflang language mismatch`);
  }
  const social = page.meta('og:image')[0];
  if (social) check(exists(new URL(social)), `${url}: missing social image ${social}`);
  check(Number(page.meta('og:image:width')[0]) > 0 && Number(page.meta('og:image:height')[0]) > 0, `${url}: missing image dimensions`);

  const article = page.schemas.find((item) => ['Article', 'BlogPosting', 'NewsArticle'].includes(item['@type']));
  if (article) {
    articleCount++;
    check(page.meta('og:type')[0] === 'article', `${url}: wrong social type`);
    check(article.headline === textOf(page.elements.find((node) => node.tagName === 'h1')), `${url}: schema headline differs from visible heading`);
    check(Boolean(article.author?.name && article.author?.url), `${url}: missing author`);
    check(Boolean(page.elements.find((node) => attribute(node, 'rel') === 'author')), `${url}: no visible author link`);
    check(new Date(article.datePublished) <= new Date(), `${url}: future article leaked`);
    check(article.mainEntityOfPage?.['@id'] === url, `${url}: schema URL differs`);
    if (article.image) {
      check(article.image.url === social, `${url}: schema/social images differ`);
      if (Number(page.meta('og:image:width')[0]) < 1200) warnings.add(`${url}: use a 1200px or wider original cover`);
    } else warnings.add(`${url}: add a cover for a representative social image`);
    const breadcrumb = page.schemas.find((item) => item['@type'] === 'BreadcrumbList');
    check(breadcrumb?.itemListElement?.length >= 2, `${url}: missing breadcrumb schema`);
    const lead = page.elements.find((node) => node.tagName === 'img' && attribute(node, 'fetchpriority') === 'high');
    if (article.image) check(Boolean(lead) && attribute(lead, 'loading') === 'eager', `${url}: lead image not prioritized`);
  }

  const links = [];
  for (const node of page.elements) {
    if (node.tagName === 'img') {
      checkedImages++;
      check(attribute(node, 'alt') !== undefined, `${url}: image without alt`);
      const src = attribute(node, 'src');
      if (src) {
        const target = new URL(src, url);
        if (target.origin === site) check(exists(target), `${url}: missing image ${target.pathname}`);
      }
      check(Number(attribute(node, 'width')) > 0 && Number(attribute(node, 'height')) > 0, `${url}: image without dimensions ${src}`);
    }
    if (node.tagName !== 'a') continue;
    const href = attribute(node, 'href');
    if (!href) continue;
    const target = new URL(href, url);
    if (target.origin !== site) continue;
    checkedLinks++;
    check(exists(target), `${url}: broken link ${href}`);
    if (target.hash) fragmentLinks.push({ from: url, target });
    links.push(`${target.origin}${target.pathname}`);
  }
  graph.set(url, links);
}
for (const { from, target } of fragmentLinks) {
  const page = pages.get(`${target.origin}${target.pathname}`);
  if (!page) continue;
  const fragment = decodeURIComponent(target.hash.slice(1));
  check(page.elements.some((node) => attribute(node, 'id') === fragment || attribute(node, 'name') === fragment), `${from}: missing fragment ${target.href}`);
}

// A kereső főoldalról indulva is érjen el minden indexelhető oldalt.
const distances = new Map([[`${site}/`, 0]]);
const queue = [`${site}/`];
for (const url of queue) {
  for (const link of graph.get(url) ?? []) {
    if (!pages.has(link) || distances.has(link)) continue;
    distances.set(link, distances.get(url) + 1);
    queue.push(link);
  }
}
for (const [url] of indexable) check(distances.has(url), `${url}: orphan page`);

const indexXml = await readFile(new URL('sitemap-index.xml', out), 'utf8');
const sitemapUrls = [...indexXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const sitemapEntries = new Map();
for (const sitemapUrl of sitemapUrls) {
  check(exists(new URL(sitemapUrl)), `Missing sitemap ${sitemapUrl}`);
  const xml = await readFile(new URL(`.${new URL(sitemapUrl).pathname}`, out), 'utf8');
  for (const match of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = match[1].match(/<loc>(.*?)<\/loc>/)?.[1];
    check(!sitemapEntries.has(loc), `Duplicate sitemap URL ${loc}`);
    sitemapEntries.set(loc, match[1]);
  }
}
for (const [url, page] of indexable) {
  const xml = sitemapEntries.get(url);
  check(Boolean(xml), `${url}: absent from sitemap`);
  for (const alt of page.alternates) check(xml?.includes(`hreflang="${alt.lang}" href="${alt.url}"`), `${url}: sitemap hreflang mismatch`);
}
for (const url of sitemapEntries.keys()) check(pages.has(url) && !pages.get(url).noindex, `Nonindexable URL in sitemap ${url}`);
const robots = await readFile(new URL('robots.txt', out), 'utf8');
check(robots.includes(`Sitemap: ${site}/sitemap-index.xml`), 'robots.txt lacks sitemap');
check(!/^Disallow:\s*\/\s*$/m.test(robots), 'robots.txt blocks the whole site');

// Külön ellenőrzés a forrásokra: a még időzített cikk URL-je, RSS-e és ajánlása se szivárogjon ki.
const columnSlugs = { hu: { 'in-hand': 'kezben', origins: 'eredet', movement: 'szerkezet' }, en: { 'in-hand': 'in-hand', origins: 'origins', movement: 'movement' } };
let hiddenCount = 0;
for (const lang of ['hu', 'en']) {
  const rss = await readFile(new URL(lang === 'hu' ? 'rss.xml' : 'en/rss.xml', out), 'utf8');
  for (const file of await walk(new URL(`src/content/posts/${lang}/`, root))) {
    if (!file.pathname.endsWith('.md')) continue;
    const source = await readFile(file, 'utf8');
    const data = parseYaml(source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '');
    const slug = data.slug ?? decodeURIComponent(file.pathname.split('/').at(-1)).replace(/\.md$/, '');
    const url = `${site}/${lang === 'en' ? 'en/' : ''}${columnSlugs[lang][data.column]}/${slug}/`;
    const hidden = data.draft || new Date(data.date) > new Date();
    check(pages.has(url) !== Boolean(hidden), `${url}: publication visibility mismatch`);
    if (hidden) {
      hiddenCount++;
      check(!sitemapEntries.has(url) && !rss.includes(url), `${url}: scheduled article in feed or sitemap`);
    } else {
      check(rss.includes(url), `${url}: missing from RSS`);
      const archive = pages.get(`${site}${lang === 'hu' ? '/cikkek/' : '/en/articles/'}`);
      check(archive?.elements.some((node) => node.tagName === 'a' && new URL(attribute(node, 'href') ?? '/', url).href === url), `${url}: missing from archive`);
    }
  }
}
const headers = await readFile(new URL('_headers', out), 'utf8');
check(/\/widgets\/\*\s+X-Robots-Tag: noindex/.test(headers), 'Standalone widgets need noindex header');
const widgetFonts = await readFile(new URL('widgets/fonts.css', out), 'utf8');
for (const match of widgetFonts.matchAll(/url\((\/[^)]+)\)/g)) check(exists(new URL(match[1], site)), `Missing shared font ${match[1]}`);
for (const file of files.filter((file) => file.pathname.includes('/widgets/') && file.pathname.endsWith('.html'))) {
  const widget = await readFile(file, 'utf8');
  check(!/fonts\.(googleapis|gstatic)\.com/.test(widget), `External font request in ${file.pathname}`);
}
for (const file of files.filter((url) => url.pathname.endsWith('.ics'))) {
  const ics = await readFile(file, 'utf8');
  check(ics.startsWith('BEGIN:VCALENDAR') && ics.includes('END:VCALENDAR'), `Broken calendar ${fileURLToPath(file)}`);
}
for (const warning of warnings) console.warn(`WARN: ${warning}`);
for (const error of errors) console.error(`FAIL: ${error}`);
console.log(JSON.stringify({ pages: indexable.length, articles: articleCount, checkedLinks, checkedImages, scheduledOrDraft: hiddenCount, sitemapUrls: sitemapEntries.size, maxClickDepth: Math.max(...distances.values()), errors: errors.length }, null, 2));
assert.equal(errors.length, 0, 'SEO regression check failed');
