import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { parse } from 'yaml';
import { homeFeed, orderedPublishedPosts } from '../src/lib/published-feed.mjs';
import { MODEL_NAMES } from '../src/lib/design-models.mjs';
import { inspectHtml, attribute, textOf } from './lib/seo-html.mjs';

const origin = 'https://lumejournal.com';
const exists = path => access(path).then(() => true, () => false);
const readPage = async path => inspectHtml(await readFile(`dist${path}index.html`, 'utf8'));
let pages = 0, controls = 0;
for (const lang of ['hu', 'en']) {
  const posts = [];
  for (const file of await readdir(`src/content/posts/${lang}`)) {
    if (!file.endsWith('.md')) continue;
    const source = await readFile(`src/content/posts/${lang}/${file}`, 'utf8');
    posts.push({ id: `${lang}/${file.replace(/\.md$/, '')}`, data: parse(source.split(/^---\s*$/m)[1]), body: source });
  }
  const now = new Date();
  const { featured, stories } = homeFeed(posts, now);
  const home = await readPage(lang === 'hu' ? '/' : '/en/');
  assert.equal(attribute(home.elements.find(n => attribute(n, 'data-home-feature') !== undefined), 'data-home-feature'), featured.data.translationKey);
  assert.deepEqual(home.elements.filter(n => attribute(n, 'data-home-story') !== undefined).map(n => attribute(n, 'data-home-story')), stories.map(p => p.data.translationKey));
  assert.equal(textOf(home.elements.find(n => n.tagName === 'h1')), featured.data.title);
  const publicIds = new Set(orderedPublishedPosts(posts, now).map(p => p.id));
  for (const post of posts) {
    const key = post.data.model?.src?.match(/^\/widgets\/([a-z0-9-]+)\.html$/)?.[1] ?? (post.data.translationKey === 'ugro-masodperc' && post.body.includes('<!-- lume-model ugro-masodperc -->') ? 'ugro-masodperc' : undefined);
    if (!key || post.data.column !== 'movement') continue;
    assert(key === 'ugro-masodperc' || MODEL_NAMES.includes(key));
    const path = lang === 'hu' ? `/muhely/${key}/` : `/en/workshop/${key}/`;
    if (!publicIds.has(post.id)) {
      assert.equal(await exists(`dist${path}index.html`), false, `Private model exposed: ${path}`);
      continue;
    }
    const info = await readPage(path);
    assert.equal(info.noindex, false);
    assert.deepEqual(info.canonical, [origin + path]);
    assert.equal(info.meta('og:url')[0], origin + path);
    assert.equal(info.meta('og:type')[0], 'website');
    const other = lang === 'hu' ? 'en' : 'hu';
    const alternate = other === 'hu' ? `/muhely/${key}/` : `/en/workshop/${key}/`;
    assert(info.alternates.some(a => a.lang === other && a.url === origin + alternate));
    assert(await exists('dist' + new URL(info.meta('og:image')[0]).pathname), `${path}: missing sharing image`);
    assert.equal(info.elements.filter(n => n.tagName === 'h1').length, 1);
    assert.equal(info.elements.filter(n => n.tagName === 'iframe').length, 0);
    assert(info.schemas.some(s => s['@type'] === 'WebPage' && s.url === origin + path));
    const share = info.elements.filter(n => attribute(n, 'data-model-share') !== undefined);
    assert.equal(share.length, 1);
    assert.equal(attribute(share[0], 'data-model-url'), origin + path);
    assert.match(attribute(share[0], 'data-share-title'), /\| Lume$/);
    const articleSlug = post.data.slug ?? post.id.split('/').pop();
    const article = lang === 'hu' ? `/szerkezet/${articleSlug}/` : `/en/movement/${articleSlug}/`;
    assert(info.elements.some(n => n.tagName === 'a' && attribute(n, 'href') === article));
    controls += share.length; pages++;
  }
}
console.log(JSON.stringify({ sharedModelPages: pages, sharingControls: controls, chronologicalHomepages: 2, errors: 0 }));
