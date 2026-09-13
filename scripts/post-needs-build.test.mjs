import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { publicationDate, dueToday } from './post-needs-build.mjs';

const post = (date, draft = false) => `---\ndate: ${date}\ndraft: ${draft}\n---\nText`;
test('Approved Friday HU/EN manuscripts are due at 05:00 Budapest, not earlier', async () => {
  for (const lang of ['hu', 'en']) {
    const raw = await readFile(new URL(`../src/content/posts/${lang}/ugro-masodperc.md`, import.meta.url), 'utf8');
    assert.equal(publicationDate(raw).toISOString(), '2026-09-18T03:00:00.000Z');
    assert.equal(dueToday(raw, new Date('2026-09-18T02:59:59Z')), false);
    assert.equal(dueToday(raw, new Date('2026-09-18T03:00:00Z')), true);
    assert.equal(dueToday(raw, new Date('2026-09-18T07:00:00Z')), true);
    assert.equal(dueToday(raw, new Date('2026-09-17T03:00:00Z')), false);
  }
});
test('Budapest Monday 05:00 is September 14 03:00 UTC, never earlier', () => {
  const raw = post('2026-09-14T05:00:00+02:00');
  assert.equal(publicationDate(raw).toISOString(), '2026-09-14T03:00:00.000Z');
  assert.equal(dueToday(raw, new Date('2026-09-14T02:59:59Z')), false);
  assert.equal(dueToday(raw, new Date('2026-09-14T03:00:00Z')), true);
  assert.equal(dueToday(raw, new Date('2026-09-14T03:20:00Z')), true);
  assert.equal(dueToday(raw, new Date('2026-09-15T03:00:00Z')), false);
});
test('Existing date-only posts, CRLF, quotes, comments and absent draft work', () => {
  assert.equal(dueToday(post('2026-09-14').replaceAll('\n','\r\n'), new Date('2026-09-14T03:00Z')), true);
  assert.equal(publicationDate('---\ndate: "2026-09-14T05:00:00+02:00" # local\n---\n').toISOString(), '2026-09-14T03:00:00.000Z');
});
test('Piszkozat, body-only dates and malformed times cannot trigger publication', () => {
  assert.equal(publicationDate(post('2026-09-14', true)), null);
  assert.throws(() => publicationDate('---\ntitle: Test\n---\ndate: 2026-09-14'));
  assert.throws(() => publicationDate(post('2026-09-14T05:00:00')));
  assert.throws(() => publicationDate(post('tomorrow')));
});
test('Compare the UTC day, even with an offset crossing midnight', () => {
  assert.equal(dueToday(post('2026-09-15T00:30:00+02:00'), new Date('2026-09-14T23:00:00Z')), true);
});
