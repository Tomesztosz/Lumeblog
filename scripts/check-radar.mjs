// Discovery only. No scraped content becomes a public card, and lastReviewed is never touched.
import { readFile, writeFile, mkdir, appendFile } from 'node:fs/promises';
import { extractSource, extractNewsFeed, normalUrl, updateQueue } from './radar-core.mjs';
const json = async path => JSON.parse(await readFile(path, 'utf8'));
const brands = await json('src/data/brand-radar.json');
const decisions = await json('src/data/calendar-decisions.json');
const entries = [...await json('src/data/releases.json'), ...await json('src/data/announcements.json')];
const resolved = new Set([...entries.map(e => normalUrl(e.sourceUrl)), ...decisions.map(d => normalUrl(d.url))]);
const dir = '.calendar-radar';
await mkdir(dir, { recursive: true });
let previous = { sources: {}, pending: [] };
try { previous = await json(`${dir}/state.json`); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const now = new Date().toISOString();
const state = { sources: { ...previous.sources }, pending: previous.pending, checkedAt: now };
const report = { checkedAt: now, sources: [], pending: [] };
const discovered = [];

async function fetchSource(url, allowedHosts) {
  const signal = AbortSignal.timeout(25000);
  for (let redirects = 0; redirects <= 4; redirects++) {
    if (!allowedHosts.has(new URL(url).hostname)) throw Error('Redirect to an unregistered host; manual review required');
    const response = await fetch(url, { signal, redirect: 'manual', headers: { 'User-Agent': 'LumeCalendarMonitor/1.0 (+https://lumejournal.com)', Accept: 'text/html' } });
    if ([301,302,303,307,308].includes(response.status)) {
      const next = normalUrl(response.headers.get('location'), url);
      await response.body?.cancel();
      if (!next) throw Error('Invalid redirect');
      url = next; continue;
    }
    if (!response.ok) { await response.body?.cancel(); throw Error(`HTTP ${response.status}`); }
    const contentType = response.headers.get('content-type') ?? '';
    if (!/text\/html|application\/json/i.test(contentType)) { await response.body?.cancel(); throw Error('Unsupported content type; manual review required'); }
    const chunks = []; let size = 0;
    for await (const chunk of response.body) {
      size += chunk.length;
      if (size > 8 * 1024 * 1024) throw Error('Source exceeds 8 MB');
      chunks.push(chunk);
    }
    return { url, html: Buffer.concat(chunks).toString('utf8'), json: /application\/json/i.test(contentType) };
  }
  throw Error('Too many redirects');
}
// Sequential per source: predictable, low request rate and no aggressive crawling.
for (const brand of brands) {
  const urls = [brand.sourceUrl, ...(brand.additionalSources ?? [])];
  const allowedHosts = new Set(urls.map(url => new URL(url).hostname));
  for (const sourceUrl of urls) {
    const row = { brand: brand.key, name: brand.name, url: sourceUrl, status: 'failed', change: 'unknown', newLinks: 0 };
    try {
      const result = await fetchSource(sourceUrl, allowedHosts);
      const extracted = result.json ? extractNewsFeed(result.html, result.url) : extractSource(result.html, result.url);
      // A previously human-verified detail page can be watched for text changes
      // even when it has no outgoing product links. An index cannot use this shortcut.
      if (extracted.status === 'partial' && extracted.characters >= 300 && entries.some(entry => normalUrl(entry.sourceUrl) === normalUrl(sourceUrl))) extracted.status = 'readable';
      row.status = extracted.status;
      row.characters = extracted.characters;
      if (extracted.status === 'readable') {
        const old = previous.sources[sourceUrl];
        const seen = new Set(old?.links?.map(l => l.url) ?? []);
        const fresh = extracted.links.filter(link => !seen.has(link.url));
        row.change = !old ? 'baseline' : old.hash === extracted.hash ? 'unchanged' : 'changed';
        row.newLinks = fresh.length;
        discovered.push(...fresh.map(link => ({ ...link, brand: brand.key, firstSeen: now.slice(0,10), from: sourceUrl })));
        state.sources[sourceUrl] = { ...extracted, checkedAt: now };
      }
    } catch (error) { row.error = `${error.message}${error.cause?.code ? ` (${error.cause.code})` : ''}`; }
    report.sources.push(row);
    console.log(`${brand.key}: ${row.status}, ${row.change}, ${row.newLinks} candidate links`);
  }
}
state.pending = updateQueue(previous.pending, discovered, resolved);
report.pending = state.pending;
await writeFile(`${dir}/state.json`, JSON.stringify(state, null, 2) + '\n');
await writeFile(`${dir}/report.json`, JSON.stringify(report, null, 2) + '\n');
const safe = s => String(s).replace(/[<>\[\]`|\r\n]/g, ' ').replace(/@/g, '(at)');
const lines = ['<!-- lume-calendar-radar -->', '# Lume naptár: szerkesztői ellenőrzőlista', '',
  `Futtatás: ${now}. Feldolgozatlan jelölt: ${state.pending.length}.`, '',
  'Ez gépi változásfigyelés, nem teljes szerkesztői ellenőrzés. Az első futás alaplistát képez. A jelöltek között régi termékek is lehetnek. A hibás vagy részleges forrás böngészős ellenőrzést igényel.', '',
  'A bejelentéseket kézzel kell ellenőrizni. Nem kerülhet géppel kitalált dátum vagy ellenőrizetlen termék a nyilvános naptárba.', '',
  '| Márka | Forrás állapota | Változás | Új link |', '| --- | --- | --- | --- |'];
for (const row of report.sources) lines.push(`| ${safe(row.name)} | [${safe(row.status)}](${row.url}) ${safe(row.error ?? '')} | ${row.change} | ${row.newLinks} |`);
lines.push('', '## Feldolgozásra váró jelöltek', '', 'Márkánként legfeljebb 8 link; a teljes sor a letölthető report.json fájlban. Elfogadás után a forrás bekerül a nyilvános adatokba, elutasításkor indoklás kerül a calendar-decisions.json fájlba. A függő jelöltek a következő futásra is megmaradnak.');
for (const brand of brands) {
  const pending = state.pending.filter(item => item.brand === brand.key);
  if (!pending.length) continue;
  lines.push('', `### ${safe(brand.name)} (${pending.length})`, '');
  for (const item of pending.slice(0,8)) lines.push(`- [ ] [${safe(item.title || item.url)}](${item.url})`);
}
await writeFile(`${dir}/report.md`, lines.join('\n') + '\n');
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
