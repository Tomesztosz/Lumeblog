import { parse, parseFragment } from 'parse5';
import { createHash } from 'node:crypto';

const ignored = new Set(['script', 'style', 'nav', 'header', 'footer', 'form', 'noscript', 'svg']);
const wordsOf = node => node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(wordsOf).join(' ');
const cleanText = text => wordsOf(parseFragment(text)).replace(/\s+/g, ' ').trim();
export function newsDate(value) {
  if (typeof value !== 'string') return undefined;
  const match = value.match(/^(\d{4}-\d{2}-\d{2})(?:T|$)/);
  if (match && Number.isFinite(Date.parse(match[1])) && new Date(match[1]).toISOString().slice(0, 10) === match[1]) return match[1];
  // Explicit English feed date, not a release date or a guessed locale.
  if (!/^\d{1,2} [A-Za-z]{3,9} \d{4}$/.test(value)) return undefined;
  const stamp = Date.parse(`${value} 00:00:00 GMT`);
  return Number.isFinite(stamp) ? new Date(stamp).toISOString().slice(0, 10) : undefined;
}
export function candidateKey(value) {
  const normalized = normalUrl(value);
  if (!normalized) return null;
  const url = new URL(normalized);
  url.pathname = url.pathname.replace(/\/+$/, '') || '/';
  // These makers syndicate the same press release across locales.
  if (/^(www\.)?(seikowatches|grand-seiko)\.com$/.test(url.hostname)) url.pathname = url.pathname.replace(/^\/(?:global|[a-z]{2})-[a-z]{2}\/news\//, '/news/');
  url.searchParams.sort();
  return url.href;
}
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
        const title = wordsOf(n).replace(/\s+/g, ' ').trim().slice(0, 180) || attrs['aria-label'] || attrs.title || '';
        const key = candidateKey(href);
        const old = links.get(key);
        if (!old || title.length > old.title.length) links.set(key, { url: href, title });
      }
    }
    for (const c of n.childNodes ?? []) walk(c);
  }
  walk(main ?? root);
  const body = text.join(' ').replace(/\s+/g, ' ').trim();
  const challenge = /^(access denied|just a moment|security check|request rejected)/i.test(body);
  return { text: body, hash: createHash('sha256').update(body).digest('hex'), links: [...links.values()],
    status: challenge ? 'blocked' : body.length < 300 || links.size === 0 ? 'partial' : 'readable',
    characters: body.length };
}
export function updateQueue(previous, candidates, decisions) {
  const resolved = new Set([...decisions].map(candidateKey));
  const queue = new Map();
  for (const candidate of [...previous ?? [], ...candidates]) {
    const key = candidateKey(candidate.url);
    if (!key || resolved.has(key)) continue;
    const old = queue.get(key);
    const merged = { ...old, ...candidate };
    if (old) {
      merged.firstSeen = [old.firstSeen, candidate.firstSeen].filter(Boolean).sort()[0];
      if ((old.title?.length ?? 0) > (candidate.title?.length ?? 0)) merged.title = old.title;
      // Do not relabel a cache baseline as a genuinely new discovery tomorrow.
      merged.baseline = old.baseline ?? candidate.baseline ?? true;
    }
    queue.set(key, merged);
  }
  return [...queue.values()];
}

// Public JSON feed used by Seiko and Grand Seiko's own news pages.
// postedDate is a news publication date, never a product release date.
export function extractNewsFeed(text, url) {
  const records = JSON.parse(text);
  if (!Array.isArray(records) || records.some(item => typeof item.url !== 'string' || typeof item.title !== 'string')) throw Error('News feed schema changed; manual review required');
  const links = records.map(item => ({ url: normalUrl(item.url, url), title: cleanText(item.title).slice(0,180), publishedAt: newsDate(item.postedDate) }))
    .filter(item => item.url && new URL(item.url).hostname === new URL(url).hostname);
  return { status: links.length ? 'readable' : 'partial', characters: text.length, links,
    hash: createHash('sha256').update(JSON.stringify(records.map(item => [item.url,item.title,item.updateDate,item.postedDate]))).digest('hex') };
}

// Triage is not a publishing decision. Background records remain recoverable.
export function rankCandidates(candidates, now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  const age = value => value ? Math.floor((Date.parse(today) - Date.parse(value)) / 86400000) : Infinity;
  return candidates.map(item => {
    const url = new URL(item.url);
    const path = url.pathname.replace(/\/+$/, '');
    const datedNews = item.publishedAt && age(item.publishedAt) >= 0 && age(item.publishedAt) <= 30;
    const historical = item.publishedAt ? age(item.publishedAt) > 60 : /\/(?:news|press)\/(20\d{2})\//.test(path) && Number(path.match(/\/(?:news|press)\/(20\d{2})\//)[1]) < Number(today.slice(0, 4));
    const navigation = /\.(?:zip|pdf|jpe?g|png|webp|mp4)$/i.test(path)
      || /(?:\/|^)(?:news|press|watches|new-watches|collections|products|all-watches|journal|watchmaking|int|en|global-en|downloads|press-landing|press-kit)(?:\.html)?$/i.test(path)
      || /\/(?:account|login|cart|search|legal|privacy|contact|service|retailer|store-locator)(?:\/|$)/i.test(path);
    const bucket = navigation ? 'navigation' : historical ? 'historical' : datedNews || (item.baseline === false && age(item.firstSeen) <= 30) ? 'review' : 'background';
    const priority = bucket === 'review' ? (datedNews ? 100 - age(item.publishedAt) : 60 - age(item.firstSeen)) : bucket === 'background' ? 10 : 0;
    const reason = navigation ? 'Navigáció vagy letölthető csomag, nem önálló hír.' : historical ? 'Korábbi közlemény, nem friss megjelenési bizonyíték.' : datedNews ? 'Az elmúlt 30 napban közzétett gyártói közlemény.' : item.baseline === false ? 'Újonnan észlelt link. A termék újdonsága még ellenőrzendő.' : 'Alaplista vagy katalógustalálat, frissessége nem igazolt.';
    return { ...item, bucket, priority, reason };
  }).sort((a, b) => b.priority - a.priority || (b.publishedAt ?? b.firstSeen ?? '').localeCompare(a.publishedAt ?? a.firstSeen ?? '') || a.url.localeCompare(b.url));
}

export function reviewEntries(entries, sources, acknowledged = [], now = new Date()) {
  const acks = new Set(acknowledged.map(item => `${candidateKey(item.url)}|${item.hash}`));
  return entries.flatMap(entry => {
    const source = Object.entries(sources).find(([url]) => candidateKey(url) === candidateKey(entry.sourceUrl))?.[1];
    const age = Math.floor((Date.parse(now.toISOString().slice(0, 10)) - Date.parse(entry.sourceChecked)) / 86400000);
    const changed = source?.changedAt && source.changedAt.slice(0, 10) >= entry.sourceChecked && !acks.has(`${candidateKey(entry.sourceUrl)}|${source.hash}`);
    if (!changed && age <= 14) return [];
    return [{ id: entry.id, brand: entry.brandKey, title: `${entry.brand} ${entry.model}`, url: entry.sourceUrl,
      sourceChecked: entry.sourceChecked, hash: source?.hash, changedAt: source?.changedAt,
      reason: changed ? 'A már felvett óra hivatalos oldala megváltozott. Dátum, készlet és rendelési ablak ellenőrzendő.' : 'A kártya forrásellenőrzése 14 napnál régebbi.', priority: changed ? 120 : 110 }];
  }).sort((a, b) => b.priority - a.priority || a.sourceChecked.localeCompare(b.sourceChecked));
}
