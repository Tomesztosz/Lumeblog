import { test } from 'node:test';
import assert from 'node:assert/strict';
import { homeFeed, orderedPublishedPosts } from '../src/lib/published-feed.mjs';

const post = (id, date, draft = false) => ({ id, data: { date: new Date(date), draft } });
test('Newest first, older stories shift down without mutating the input', () => {
  const posts = [post('old', '2026-09-09'), post('friday', '2026-09-18T05:00:00+02:00'), post('monday', '2026-09-14T05:00:00+02:00'), post('brew', '2026-09-11')];
  const before = [...posts];
  const monday = homeFeed(posts, new Date('2026-09-14T03:00:00Z'));
  assert.equal(monday.featured.id, 'monday');
  assert.deepEqual(monday.stories.map(p => p.id), ['brew', 'old']);
  const friday = homeFeed(posts, new Date('2026-09-18T03:00:00Z'));
  assert.equal(friday.featured.id, 'friday');
  assert.deepEqual(friday.stories.map(p => p.id), ['monday', 'brew']);
  assert.deepEqual(posts, before);
});
test('Exact publish time is inclusive, drafts and invalid dates stay hidden', () => {
  const posts = [post('scheduled', '2026-09-18T05:00:00+02:00'), post('draft', '2020-01-01', true), post('invalid', 'invalid')];
  assert.equal(orderedPublishedPosts(posts, new Date('2026-09-18T02:59:59.999Z')).length, 0);
  assert.deepEqual(orderedPublishedPosts(posts, new Date('2026-09-18T03:00:00Z')).map(p => p.id), ['scheduled']);
});
test('Empty, single and tied feeds are deterministic', () => {
  assert.deepEqual(homeFeed([]), { featured: undefined, stories: [] });
  const one = post('a', '2020-01-01');
  assert.deepEqual(homeFeed([one]), { featured: one, stories: [] });
  assert.deepEqual(orderedPublishedPosts([post('b', '2020-01-01'), one]).map(p => p.id), ['a', 'b']);
});
