import { parse } from 'parse5';
import { createHash } from 'node:crypto';

const ignored = new Set(['script', 'style', 'nav', 'header', 'footer', 'form', 'noscript', 'svg']);
export function normalUrl(value, base) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const u = new URL(value, base);
    if (u.protocol !== 'https:' || u.username || u.password || u.port) return null;
    u.hash = '';
    for (const key of [...u.searchParams.keys()]) if (/^(utm_|fbclid|gclid|dwvar_)/i.test(key)) u.searchParams.delete(key);
    return u.href;
  } catch { return null; }
}
export function extractSource(html, url) {
  const root = parse(html);
  const links = new Map();
  const text = [];
  let main;
  const findMain = n => { if (n.tagName === 'main') main ??= n; for (const c of n.childNodes ?? []) findMain(c); };
  findMain(root);
  function walk(n) {
    if (ignored.has(n.tagName)) return;
    if (n.nodeName === '#text') text.push(n.value.trim());
    if (n.tagName === 'a') {
      const attrs = Object.fromEntries(n.attrs.map(a => [a.name, a.value]));
      const href = normalUrl(attrs.href, url);
      // Candidates stay on the official source host, never arbitrary external links.
      const target = href ? new URL(href) : null;
      if (target && target.hostname === new URL(url).hostname
        && !/(account|login|register|cart\/|checkout|privacy|terms|contact|search|store-locator|cookies|preferences|warranty|support|delivery|returns)/i.test(target.pathname)
        && (/\/(news|press|products?|watches|watch|new-watches|featured-product|journal|collections|pages|int)\//i.test(target.pathname)
          || /^(press|pressroom)\./.test(target.hostname))) {
        const words = [];
        const collect = c => { if (c.nodeName === '#text') words.push(c.value); for (const ch of c.childNodes ?? []) collect(ch); };
        collect(n);
        links.set(href, { url: href, title: words.join(' ').replace(/\s+/g, ' ').trim().slice(0, 180) });
      }
    }
    for (const c of n.childNodes ?? []) walk(c);
  }
  walk(main ?? root);
  const body = text.join(' ').replace(/\s+/g, ' ').trim();
  const challenge = /^(access denied|just a moment|security check|request rejected)/i.test(body);
  return { hash: createHash('sha256').update(body).digest('hex'), links: [...links.values()],
    status: challenge ? 'blocked' : body.length < 300 || links.size === 0 ? 'partial' : 'readable',
    characters: body.length };
}
export function updateQueue(previous, candidates, decisions) {
  const queue = new Map((previous ?? []).map(item => [item.url, item]));
  for (const candidate of candidates) if (!queue.has(candidate.url)) queue.set(candidate.url, candidate);
  return [...queue.values()].filter(item => !decisions.has(item.url));
}

// Public JSON feed used by Seiko and Grand Seiko's own news pages.
// postedDate is a news publication date, never a product release date.
export function extractNewsFeed(text, url) {
  const records = JSON.parse(text);
  if (!Array.isArray(records) || records.some(item => typeof item.url !== 'string' || typeof item.title !== 'string')) throw Error('News feed schema changed; manual review required');
  const links = records.map(item => ({ url: normalUrl(item.url, url), title: item.title.replace(/<[^>]*>/g, '').slice(0,180) }))
    .filter(item => item.url && new URL(item.url).hostname === new URL(url).hostname);
  return { status: links.length ? 'readable' : 'partial', characters: text.length, links,
    hash: createHash('sha256').update(JSON.stringify(records.map(item => [item.url,item.title,item.updateDate,item.postedDate]))).digest('hex') };
}
