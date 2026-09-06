import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { calendarDay, phaseFor, matchesCalendar, daysAway } from '../src/lib/calendar-state.mjs';
import { extractSource, extractNewsFeed, normalUrl, updateQueue } from './radar-core.mjs';
import { validateCalendar } from './calendar-validation.mjs';
import { foldIcsLine } from '../src/lib/ical-lines.mjs';
test('Calendar lines fold without corrupting Hungarian accents', () => {
  const input = 'DESCRIPTION:' + 'Árvíztűrő tükörfúrógép '.repeat(20);
  const folded = foldIcsLine(input);
  for (const line of folded.split('\r\n')) assert(Buffer.byteLength(line) <= 75);
  assert.equal(folded.replace(/\r\n /g,''),input);
});
const release = { date: '2026-09-01', dateEnd: '2026-09-01', brand:'Studio Underd0g',brandKey:'studio-underd0g', model:'Mantis', family:'02',reference:'02' };
test('Official JavaScript-backed news feeds yield links, never invented release dates', () => {
  const result = extractNewsFeed(JSON.stringify([{url:'/global-en/news/new-watch',title:'<b>New watch</b>',postedDate:'6 Sep 2026'}]),'https://www.seikowatches.com/v3/api/news');
  assert.equal(result.status,'readable'); assert.equal(result.links[0].title,'New watch');
  assert(!('date' in result.links[0]));
  assert.throws(()=>extractNewsFeed('{"error":"changed"}','https://www.seikowatches.com/v3/api/news'));
});
test('Budapest date and countdown respect summer and winter midnight', () => {
  assert.equal(calendarDay(new Date('2026-08-31T22:30:00Z')), '2026-09-01');
  assert.equal(calendarDay(new Date('2026-12-31T23:30:00Z')), '2027-01-01');
  assert.equal(daysAway(release,new Date('2026-08-31T22:30:00Z')),0);
});
test('Exact-day releases stay visible for 60 days, without implying stock', () => {
  assert.equal(phaseFor(release,new Date('2026-09-02')), 'archived');
  assert(matchesCalendar(release,{},new Date('2026-09-06')));
  assert(matchesCalendar(release,{},new Date('2026-10-31')));
  assert(!matchesCalendar(release,{},new Date('2026-11-01')));
  assert(matchesCalendar(release,{status:'all'},new Date('2027-01-01')));
});
test('Month windows, undated announcements and filter combinations', () => {
  assert.equal(phaseFor({...release,dateEnd:'2026-09-30'},new Date('2026-09-06')),'current');
  const cw = { brand:'Christopher Ward',brandKey:'christopher-ward',model:'C60 Trident Biscay', family:'Biscay', reference:'C60',status:'introduced' };
  assert(matchesCalendar(cw,{query:'ward BISCAY',month:'undated'}));
  assert(!matchesCalendar(cw,{status:'active'}));
  assert(!matchesCalendar(cw,{month:'2026-09'}));
  assert(!matchesCalendar(cw,{brand:'rolex'}));
  assert(matchesCalendar({...cw,status:'announced'},{status:'announced'}));
});
test('Source parser ignores scripts and navigation, strips tracking, rejects external candidates', () => {
  const html = `<header>noise</header><main><p>${'Watch news '.repeat(40)}</p><a href='/news/new-watch?utm_source=mail'>New watch</a><a href='/preferences-cookies'>Cookies</a><a href='https://evil.test/product/x'>bad</a><script>secret</script></main>`;
  const result = extractSource(html,'https://brand.example/news');
  assert.equal(result.status,'readable'); assert.equal(result.links.length,1);
  assert.equal(result.links[0].url,'https://brand.example/news/new-watch');
  assert.equal(result.hash,extractSource(html.replace('noise','different navigation'),'https://brand.example/news').hash);
  assert.equal(extractSource('<main>Loading</main>','https://brand.example/news').status,'partial');
  assert.equal(normalUrl('javascript:alert(1)','https://brand.example/'),null);
  for (const value of [undefined, null, '', ' ']) assert.equal(normalUrl(value,'https://press.brand.example/'),null);
});
test('Pending candidates survive an unchanged or failed follow-up scan until reviewed', () => {
  const pending=[{url:'https://brand.example/news/1'}];
  assert.deepEqual(updateQueue(pending,[],new Set()),pending);
  assert.equal(updateQueue(pending,pending,new Set()).length,1);
  assert.equal(updateQueue(pending,[],new Set([pending[0].url])).length,0);
});
test('Reject fabricated dates and invalid calendar content', async () => {
  const json = async name => JSON.parse(await readFile(`src/data/${name}.json`,'utf8'));
  const dated=await json('releases'), news=await json('announcements'), brands=await json('brand-radar');
  validateCalendar(dated,news,brands);
  assert.throws(()=>validateCalendar(dated,[{...news[0],date:'2026-09-06'}],brands));
  assert.throws(()=>validateCalendar([{...dated[0],date:'2026-02-30'}],news,brands));
  assert.throws(()=>validateCalendar(dated,[{...news[0],sourceUrl:'https://evil.test/watch'}],brands));
  assert.throws(()=>validateCalendar(dated,[{...news[0],copy:{hu:news[0].copy.hu}}],brands));
});
