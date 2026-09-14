import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { resolve, join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from '@astrojs/markdown-remark';
import { parse } from 'parse5';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const key = process.argv[2];
assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key ?? ''), 'Pass a translation key');
const out = join(root, 'output/article-review', key);
const attr = (n, k) => n.attrs?.find(a => a.name === k)?.value;
const flatten = node => [node, ...(node.childNodes ?? []).flatMap(flatten)];
const text = node => node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(text).join('');
const copies = [];
let images = 0, resources = 0;
for (const [lang, name, twin] of [['hu','megnezes.html','english.html'],['en','english.html','megnezes.html']]) {
  const raw = await readFile(join(root, 'src/content/posts', lang, key + '.md'), 'utf8');
  const { frontmatter: f, content } = parseFrontmatter(raw);
  if (f.reviewCover) {
    assert.equal(f.draft, true, 'Private cover cannot be published implicitly');
    assert(!f.cover, 'Do not mix a private and public cover');
    f.cover = f.reviewCover;
  }
  assert(f.draft === true || (f.draft === false && new Date(f.date) > new Date()), 'Review must be an unpublished article');
  assert.equal(f.lang, lang);
  assert.equal(f.translationKey, key);
  assert(!raw.includes(String.fromCharCode(0x2014)));
  const html = await readFile(join(out, name), 'utf8');
  const nodes = flatten(parse(html));
  const all = tag => nodes.filter(n => n.tagName === tag);
  assert.equal(attr(all('html')[0], 'lang'), lang);
  assert.deepEqual(all('h1').map(text), [f.title]);
  assert.equal(all('h2').length, (content.match(/^## /gm) ?? []).length + 1);
  assert.equal(attr(all('meta').find(n => attr(n, 'name') === 'robots'), 'content'), 'noindex,nofollow');
  assert(!all('link').some(n => attr(n, 'rel') === 'canonical'));
  assert(!all('a').some(n => attr(n, 'href') === 'undefined'), 'Optional credits must not become broken links');
  assert(!all('script').some(n => attr(n, 'src') || attr(n, 'type') === 'application/ld+json'));
  assert(all('a').some(n => attr(n, 'href') === twin));
  assert(nodes.some(n => attr(n, 'class') === 'editorial-review'));
  const ids = nodes.map(n => attr(n, 'id')).filter(Boolean);
  assert.equal(new Set(ids).size, ids.length, 'Duplicate anchor');
  for (const node of [...all('a'), ...all('img'), ...all('link')]) {
    const value = attr(node, node.tagName === 'img' ? 'src' : 'href');
    if (!value || /^https?:/.test(value)) continue;
    if (value.startsWith('#')) { assert(ids.includes(value.slice(1)), value); continue; }
    const path = resolve(out, decodeURIComponent(value));
    assert(!relative(out, path).startsWith('..'), 'Resource outside preview');
    await access(path); resources++;
    if (node.tagName === 'img') {
      const meta = await sharp(path).metadata();
      assert.equal(Number(attr(node,'width')), meta.width);
      assert.equal(Number(attr(node,'height')), meta.height);
      assert(attr(node, 'alt')?.length > 15); images++;
      if (/cutout-v\d+/.test(value)) {
        assert(meta.hasAlpha, `Cutout must have real transparency: ${value}`);
        const stats = await sharp(path).stats();
        assert.equal(stats.channels.at(-1).min, 0, 'Background must be transparent');
        assert.equal(stats.channels.at(-1).max, 255, 'Watch must be opaque');
      }
      if (/legacy-burgundy-ai-cutout-v2/.test(value)) {
        const source = join(root, 'src/content/posts/_images/seagull-legacy-burgundy-ai-illustration-v1.webp');
        const reference = await sharp(source).removeAlpha().raw().toBuffer();
        const actual = await sharp(path).ensureAlpha().raw().toBuffer();
        assert.equal(reference.length / 3, actual.length / 4, 'Do not resize the Legacy during extraction');
        let changes = 0;
        for (let p = 0; p < actual.length / 4; p++) if (actual[p * 4 + 3] === 255) {
          for (let c = 0; c < 3; c++) changes += actual[p * 4 + c] !== reference[p * 3 + c];
        }
        assert.equal(changes, 0, 'Legacy dial and texture pixels must remain unchanged');
      }
    }
  }
  assert.equal(all('img').length, (content.match(/!\[/g) ?? []).length + (content.match(/<!-- lume-review-image /g) ?? []).length + 1);
  if (key === 'seagull-1963') {
    assert.equal(all('img').filter(n => /cutout-v2/.test(attr(n,'src'))).length, 4);
    assert(all('img').some(n => /legacy-burgundy-ai-cutout-v2/.test(attr(n,'src'))));
    assert(f.cover.src.endsWith('seagull-1963-hero-aviation-v3.webp'), 'Use the approved story-led hero, not a standalone product image');
    assert(f.cover.credit.includes(lang === 'hu' ? 'AI-illusztráció' : 'AI illustration'), 'Disclose the illustrative hero');
    assert(f.cover.alt.includes(lang === 'hu' ? 'vadászgép' : 'fighter'), 'Describe the historical motif');
    assert(!all('img').some(n => /legacy-burgundy-ai-illustration-v1/.test(attr(n,'src'))), 'Legacy studio background must not remain');
    assert(!all('img').some(n => /(?:overview|closeup|movement)-v1/.test(attr(n,'src'))), 'Old backgrounds must not remain in preview');
    assert(content.includes('ST1908'), 'Legacy must use its own specification');
    assert(content.includes(lang === 'hu' ? 'AI-illusztráció: Lume' : 'AI illustration: Lume'), 'Disclose the generated illustration');
    assert(content.includes(lang === 'hu' ? 'Nem valódi termékfotó' : 'Not an actual product photograph'), 'Do not imply documentary photography');
    assert(!content.includes('legacy-burgundy-wrist-preview'), 'Remove the uncleared retailer photograph');
  }
  if (key === 'todd-beamer-rolex') {
    assert.equal(f.draft, false, 'Owner explicitly approved Wednesday scheduling on 2026-09-14');
    assert(!f.reviewCover && Object.hasOwn(parseFrontmatter(raw).frontmatter, 'cover'));
    assert.equal(new Date(f.date).toISOString(), '2026-09-16T03:00:00.000Z');
    assert(!content.includes('lume-review-'), 'Promote approved body images explicitly');
    assert(f.cover.src.endsWith('todd-beamer-hero-v1.webp'), 'Use the selected actual-watch montage');
    assert(f.cover.credit.includes('AI'), 'Disclose the illustrative background');
    assert(f.cover.alt.includes(lang === 'hu' ? 'saját, sérült' : 'own damaged'), 'Identify the real watch in the hero');
    const pendingNotice = lang === 'hu' ? 'Az engedélykérés folyamatban van, válasz még nem érkezett.' : 'Permission has been requested; no response has been received yet.';
    assert(f.cover.credit.includes(pendingNotice));
    assert(all('figcaption').some(n => text(n).includes(pendingNotice)), 'Pending notice must be visible under the hero');
    assert.equal(f.cover.creditUrl, 'https://www.hodinkee.com/articles/remembering-911-through-the-rolex-that-is-frozen-in-time');
    assert(!f.cover.license && !f.cover.licenseUrl, 'Do not transfer the comparison photo CC licence to the actual-watch photograph');
    for (const name of ['todd-beamer-hero-v1.webp', 'todd-beamer-card-v1.webp', 'beamer-memorial-soergel-v2.webp', 'beamer-comparison-turnograph-cutout-v2.webp']) {
      assert.deepEqual(await readFile(join(root, 'src/content/posts/_images', name)), await readFile(join(out, 'sources', name)), 'Existing selected images must not be redrawn or silently replaced');
    }
    assert.equal(all('img').length, 3, 'Hero, documentary memorial photo and isolated comparison watch');
    assert(all('img').some(n => /beamer-comparison-turnograph-cutout-v2/.test(attr(n,'src'))));
    assert(all('img').some(n => /beamer-memorial-soergel-v2/.test(attr(n,'src'))));
    for (const forbidden of ['beamer-watch-cutout-v1', 'beamer-portrait-nps']) {
      assert(!html.includes(forbidden) && !raw.includes(forbidden), 'Removed photo still referenced');
      assert(!(await readdir(join(out, 'assets'))).some(n => n.includes(forbidden)), 'Removed photo still in active preview assets');
    }
    assert(content.includes(lang === 'hu' ? 'nyolcas dátum' : 'eight in the date window'), 'Explain the original comparison date without rewriting it');
    assert(content.includes('Norbert Pietsch') && content.includes('Brian Soergel'), 'Attribute both new photographers');
    const check = JSON.parse(await readFile(join(out, 'image-checks-v2.json'), 'utf8'));
    const original = await sharp(join(out, 'sources', check.watch.source)).removeAlpha().raw().toBuffer();
    const cutout = await sharp(join(out, 'sources', check.watch.output)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { crop, padding, sourceWidth } = check.watch;
    assert.equal(cutout.info.width, crop.width + 2 * padding);
    assert.equal(cutout.info.height, crop.height + 2 * padding);
    let changes = 0, opaqueChecked = 0;
    for (let y = 0; y < cutout.info.height; y++) for (let x = 0; x < cutout.info.width; x++) {
      const p = (y * cutout.info.width + x) * 4;
      if (x < padding || y < padding || x >= cutout.info.width - padding || y >= cutout.info.height - padding) {
        assert.equal(cutout.data[p + 3], 0, 'Cutout outer border must be transparent');
      }
      if (cutout.data[p + 3] !== 255) continue;
      const q = ((y - padding + crop.top) * sourceWidth + x - padding + crop.left) * 3;
      for (let c = 0; c < 3; c++) changes += cutout.data[p + c] !== original[q + c];
      opaqueChecked++;
    }
    assert(opaqueChecked > 1000000);
    assert.equal(changes, 0, 'Do not redraw the comparison dial or change its date to eleven');
    const card = await sharp(resolve(root, 'src/content/posts', lang, f.cover.cardSrc)).metadata();
    assert.equal(card.width, 1200); assert.equal(card.height, 900);
  }
  if (key === 'ugro-masodperc') {
    assert.equal(f.draft, false, 'Friday was approved for scheduling');
    assert(!f.reviewCover && Object.hasOwn(parseFrontmatter(raw).frontmatter, 'cover'));
    assert.equal(new Date(f.date).toISOString(), '2026-09-18T03:00:00.000Z');
    assert(!content.includes('lume-review-'), 'Private markers must be promoted explicitly');
    assert.equal(f.column, 'movement');
    assert.equal(f.sources.length, 11);
    assert(f.cover.credit.includes(lang === 'hu' ? 'AI-illusztráció' : 'AI illustration'));
    assert(f.cover.src.endsWith('seconde-morte-hero-v1.webp'));
    const articleBody = nodes.find(n => attr(n, 'class') === 'article-body');
    assert(articleBody);
    const bodyNodes = flatten(articleBody);
    assert.equal(bodyNodes.filter(n => n.tagName === 'a').length, 0, 'Owner requested no hyperlinks in the article body or captions');
    assert.equal(bodyNodes.filter(n => n.tagName === 'iframe').length, 0, 'No remote embeds in the reading copy');
    assert(!/https?:\/\//.test(text(articleBody)), 'No bare source URLs in prose');
    const diagram = bodyNodes.find(n => attr(n, 'data-jumping-seconds-diagram') === 'rhythm');
    assert(diagram, 'Include the original readable timing illustration');
    const pulses = flatten(diagram).filter(n => attr(n, 'data-pulses'));
    assert.deepEqual(pulses.map(n => Number(attr(n, 'data-pulses'))), [6, 1]);
    assert.deepEqual(pulses.map(n => (attr(n, 'd').match(/V12/g) ?? []).length), [6, 1], 'Six ordinary hand steps versus one jumping step');
    assert.equal(all('img').length, 4, 'Conceptual hero plus three original manufacturer movement macros');
    assert.equal(bodyNodes.filter(n => attr(n, 'data-jumping-model') !== undefined).length, 1);
    for (const id of ['b09', 'b11']) assert(all('img').some(n => attr(n,'src')?.endsWith(`lange-jumping-${id}-photo-v1.webp`)));
    assert(all('img').some(n => attr(n,'src')?.endsWith('lange-jumping-b10-cutout-v2.png')));
    assert(!all('img').some(n => attr(n,'src')?.includes('b10-photo-v1')));
    const source = await sharp(join(out, 'sources/lange-jumping-b10-photo-v1.webp')).removeAlpha().raw().toBuffer();
    const cutout = await sharp(join(out, 'assets/lange-jumping-b10-cutout-v2.png')).ensureAlpha().raw().toBuffer();
    assert.equal(source.length / 3, cutout.length / 4);
    for (let p = 0; p < source.length / 3; p++) for (let c = 0; c < 3; c++) assert.equal(cutout[p * 4 + c], source[p * 3 + c]);
    assert.equal((content.match(/Fotó: Lange Uhren GmbH|Photograph: Lange Uhren GmbH/g) ?? []).length, 3);
    const card = await sharp(resolve(root, 'src/content/posts', lang, f.cover.cardSrc)).metadata();
    assert.equal(card.width, 1200); assert.equal(card.height, 900);
  }
  for (const s of f.sources) assert(all('a').some(n => attr(n,'href') === s.url), `Missing source: ${s.url}`);
  const requiredLicenses = key === 'seagull-1963'
    ? ['https://creativecommons.org/licenses/by/2.0/', 'https://creativecommons.org/licenses/by-sa/4.0/']
    : key === 'todd-beamer-rolex'
      ? ['https://creativecommons.org/licenses/by-sa/3.0/', 'https://creativecommons.org/licenses/by-sa/4.0/']
      : [f.cover.licenseUrl].filter(Boolean);
  for (const license of requiredLicenses) {
    assert(all('a').some(n => attr(n,'href') === license), 'Missing image licence');
  }
  copies.push(f);
}
assert.equal(copies[0].date.valueOf(), copies[1].date.valueOf());
assert.deepEqual(copies[0].sources.map(s=>s.url), copies[1].sources.map(s=>s.url));
const css = await readFile(join(out, 'journal.css'), 'utf8');
assert(css.includes('--accent: #d7eb96;') && css.includes('--paper: #f2f0e8;'));
assert(!css.includes('@import'));
for (const match of css.matchAll(/url\(["']?([^)'"\s]+)["']?\)/g)) {
  assert(!/^https?:/.test(match[1]));
  await access(resolve(out, match[1])); resources++;
}
let publicFiles = 0;
async function checkBuild(dir) {
  for (const e of await readdir(dir, { withFileTypes:true })) {
    const path = join(dir,e.name);
    if (key === 'todd-beamer-rolex') assert(!/beamer-.*(?:original|mask|portrait)|beamer-watch-cutout-v1|todd-beamer-(?:hero|card)-v2/i.test(e.name), `Unselected source asset leaked into build: ${path}`);
    if (key === 'ugro-masodperc') assert(!/b10-photo-v1|imagegen-mask|lange-jumping-.*original/i.test(e.name), `Private source image leaked into build: ${path}`);
    assert(!/legacy-burgundy-(?:wrist-preview|banner|product|wrist[.])/i.test(e.name), `Uncleared reference image leaked into build: ${path}`);
    if (e.isDirectory()) await checkBuild(path);
    else if (/\.(html|xml)$/.test(e.name)) {
      const body = await readFile(path,'utf8');
      // An external source may legitimately contain /review/ in its URL.
      assert(!/href=["']\/review\//.test(body) && !body.includes('class="editorial-review'), `Review leaked: ${path}`);
      for (const f of copies) assert(!body.includes(f.title) && !body.includes(`/${key}/`), `Draft leaked: ${path}`);
      publicFiles++;
    }
  }
}
await checkBuild(join(root,'dist'));
console.log(JSON.stringify({ drafts:copies.filter(f => f.draft).length, scheduled:copies.filter(f => !f.draft).length, previewImages:images, localResourceChecks:resources, publicFilesChecked:publicFiles, errors:0 }));
