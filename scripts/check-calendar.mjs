import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import assert from 'node:assert/strict';
import { validateCalendar } from './calendar-validation.mjs';
const json = async name => JSON.parse(await readFile(`src/data/${name}.json`, 'utf8'));
const dated = await json('releases'), announcements = await json('announcements'), brands = await json('brand-radar');
validateCalendar(dated, announcements, brands);
for (const entry of [...dated, ...announcements]) {
  const metadata = await sharp(`public${entry.image}`).metadata();
  assert.equal(metadata.width, entry.imageWidth, `${entry.id}: image width`);
  assert.equal(metadata.height, entry.imageHeight, `${entry.id}: image height`);
}
for (const decision of await json('calendar-decisions')) {
  assert(['excluded','duplicate'].includes(decision.decision) && decision.reason?.trim() && /^\d{4}-\d{2}-\d{2}$/.test(decision.reviewedAt), 'Every dismissed candidate needs a review date and reason');
  assert(new URL(decision.url).protocol === 'https:');
}
console.log(`Calendar OK: ${dated.length} dated releases, ${announcements.length} undated announcements, ${brands.length} brands; bilingual copy, official hosts, images and dates validated.`);
