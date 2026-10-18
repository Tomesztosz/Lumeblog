// Discovery only. No scraped content becomes a public card, and lastReviewed is never touched.
import { readFile, writeFile, mkdir, appendFile } from 'node:fs/promises';
import { extractSource, extractNewsFeed, normalUrl, candidateKey, updateQueue, rankCandidates, reviewEntries } from './radar-core.mjs';
import { radarMarkdown, radarHtml } from './radar-report.mjs';
import { fetchOfficial } from './calendar-http.mjs';
import { atomicJson, withStoreLock } from './calendar-update-core.mjs';
const json = async path => JSON.parse(await readFile(path, 'utf8'));
const brands = await json('src/data/brand-radar.json');
const decisions = await json('src/data/calendar-decisions.json');
const sourceReviews = await json('src/data/calendar-source-reviews.json');
const entries = [...await json('src/data/releases.json'), ...await json('src/data/announcements.json')];
const resolved = new Set([...entries.map(e => normalUrl(e.sourceUrl)), ...decisions.map(d => normalUrl(d.url))]);
const dir = '.calendar-radar';
await mkdir(dir, { recursive: true });
await withStoreLock(`${dir}/state.json`, async () => {
let previous = { sources: {}, pending: [] };
try { previous = await json(`${dir}/state.json`); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const now = new Date().toISOString();
const state = { sources: { ...previous.sources }, pending: previous.pending, checkedAt: now };
const report = { checkedAt: now, sources: [], pending: [], reviews: [] };
const discovered = [];

// Sequential per source: predictable, low request rate and no aggressive crawling.
for (const brand of brands) {
  const urls = [...new Set([brand.sourceUrl, ...(brand.additionalSources ?? []), ...entries.filter(entry => entry.brandKey === brand.key).map(entry => entry.sourceUrl)])];
  const allowedHosts = new Set(urls.map(url => new URL(url).hostname));
  for (const sourceUrl of urls) {
    const row = { brand: brand.key, name: brand.name, url: sourceUrl, status: 'failed', change: 'unknown', newLinks: 0 };
    try {
      const oldState = previous.sources[sourceUrl] ?? {};
      state.sources[sourceUrl] = {...oldState, lastAttemptAt:now};
      const retryHours = Math.min(168, 2 ** Math.min(oldState.failures ?? 0, 10));
      if (oldState.failures && Date.parse(now)-Date.parse(oldState.lastAttemptAt) < retryHours*3600000) { row.status='backoff';report.sources.push(row);continue; }
      await new Promise(resolve=>setTimeout(resolve,1500));
      const result = await fetchOfficial(sourceUrl, allowedHosts, oldState);
      Object.assign(state.sources[sourceUrl],{lastSuccessfulFetchAt:now,failures:0});
      if(result.notModified){row.status=oldState.status;row.change='unchanged';report.sources.push(row);continue;}
      const extracted = result.json ? extractNewsFeed(result.html, result.url) : extractSource(result.html, result.url);
      // A previously human-verified detail page can be watched for text changes
      // even when it has no outgoing product links. An index cannot use this shortcut.
      if (extracted.status === 'partial' && extracted.characters >= 300 && entries.some(entry => normalUrl(entry.sourceUrl) === normalUrl(sourceUrl))) extracted.status = 'readable';
      row.status = extracted.status;
      row.characters = extracted.characters;
      if (extracted.status === 'readable') {
        const old = previous.sources[sourceUrl];
        const seen = new Set(old?.links?.map(l => candidateKey(l.url)) ?? []);
        const fresh = extracted.links.filter(link => !seen.has(candidateKey(link.url)));
        row.change = !old ? 'baseline' : old.hash === extracted.hash ? 'unchanged' : 'changed';
        row.newLinks = fresh.length;
        // Refresh metadata on existing links too; a later check is not a new firstSeen.
        discovered.push(...extracted.links.map(link => ({ ...link, brand: brand.key, firstSeen: now.slice(0,10), lastSeen: now.slice(0,10), baseline: !old || seen.has(candidateKey(link.url)), from: sourceUrl })));
        const {text: unusedText, ...metadata} = extracted;
        state.sources[sourceUrl] = { ...metadata, etag:result.etag, lastModified:result.lastModified, lastAttemptAt:now, lastSuccessfulFetchAt:now, failures:0, checkedAt: now, changedAt: row.change === 'changed' ? now : old?.changedAt };
      }
    } catch (error) { state.sources[sourceUrl]={...(state.sources[sourceUrl]??previous.sources[sourceUrl]),lastAttemptAt:now,failures:(previous.sources[sourceUrl]?.failures??0)+1}; row.error = `${error.message}${error.cause?.code ? ` (${error.cause.code})` : ''}`; }
    report.sources.push(row);
    console.log(`${brand.key}: ${row.status}, ${row.change}, ${row.newLinks} candidate links`);
  }
}
state.pending = rankCandidates(updateQueue(previous.pending, discovered, resolved), new Date(now));
report.pending = state.pending;
report.reviews = reviewEntries(entries, state.sources, sourceReviews, new Date(now));
try {
  const eventState = await json(`${dir}/event-state.json`);
  for (const item of Object.values(eventState.reviews ?? {})) {
    const entry=entries.find(e=>e.id===item.eventId);
    if(entry) report.reviews.push({title:`${entry.brand} ${entry.model}`,url:item.url,reason:`Eseményadat ellenőrzése: ${item.reason}`,sourceChecked:entry.sourceChecked,hash:item.hash});
  }
} catch(error) {if(error.code!=='ENOENT')throw error;}
await atomicJson(`${dir}/state.json`, state);
await atomicJson(`${dir}/report.json`, report);
const markdown = radarMarkdown(report);
await writeFile(`${dir}/report.md`, markdown);
await writeFile(`${dir}/megnezes.html`, radarHtml(report));
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, markdown);
console.log(`Ranked radar: ${report.pending.filter(item => item.bucket === 'review').length} priority candidates; ${report.reviews.length} existing cards to review. Local preview: ${dir}/megnezes.html`);
});
