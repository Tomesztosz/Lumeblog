import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseFrontmatter } from '@astrojs/markdown-remark';
import sharp from 'sharp';
import { publicationDate, dueToday } from './post-needs-build.mjs';
import { homeFeed, orderedPublishedPosts } from '../src/lib/published-feed.mjs';

test('Habring HU/EN: approved assets and Budapest Monday 01:00 publication boundary', async () => {
  const due = new Date('2026-10-18T23:00:00Z');
  for (const lang of ['hu', 'en']) {
    const raw = await readFile(new URL(`../src/content/posts/${lang}/habring2.md`, import.meta.url), 'utf8');
    const { frontmatter: f, content } = parseFrontmatter(raw);
    assert.equal(f.draft, false);
    assert.equal(f.lang, lang);
    assert.equal(f.translationKey, 'habring2');
    assert.equal(publicationDate(raw).toISOString(), due.toISOString());
    assert.equal(dueToday(raw, new Date(due.getTime() - 1)), false);
    for (const instant of ['2026-10-18T23:00:00Z', '2026-10-19T00:20:00Z', '2026-10-19T03:00:00Z']) {
      assert.equal(dueToday(raw, new Date(instant)), true);
    }
    assert.equal(dueToday(raw, new Date('2026-10-19T22:00:00Z')), false);
    const post = { id: `habring2-${lang}`, data: { ...f, date: publicationDate(raw) } };
    assert.equal(orderedPublishedPosts([post], new Date(due.getTime() - 1)).length, 0);
    assert.equal(homeFeed([post], due).featured, post);
    assert(!f.reviewCover);
    assert.equal(f.cover.src, '../_images/habring-hero-v1.webp');
    assert.equal(f.cover.cardSrc, '../_images/habring-card-v1.webp');
    assert(f.cover.license && f.cover.credit);
    assert(!raw.includes(String.fromCharCode(0x2014)));
    assert(!raw.includes('lume-review-image') && !raw.includes('output/article-review'));
    assert.equal(f.sources.length, 26);
    const images = [...content.matchAll(/!\[[^\]]*\]\(\.\.\/_images\/([^\s)]+)\)/g)].map(m => m[1]);
    assert.equal(images.length, 10);
    const cutouts = images.filter(name => name.endsWith('-cutout.png'));
    assert.equal(cutouts.length, 9);
    for (const name of cutouts) {
      const image = sharp(await readFile(new URL(`../src/content/posts/_images/${name}`, import.meta.url)));
      assert((await image.metadata()).hasAlpha);
      assert(!(await image.stats()).isOpaque);
    }
  }
});
