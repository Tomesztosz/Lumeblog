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
      if (/cutout-v2/.test(value)) {
        assert(meta.hasAlpha, `Cutout must have real transparency: ${value}`);
        const stats = await sharp(path).stats();
        assert.equal(stats.channels.at(-1).min, 0, 'Background must be transparent');
        assert.equal(stats.channels.at(-1).max, 255, 'Watch must be opaque');
      }
    }
  }
  assert.equal(all('img').length, (content.match(/!\[/g) ?? []).length + (content.match(/<!-- lume-review-image /g) ?? []).length + 1);
  if (key === 'seagull-1963') {
    assert.equal(all('img').filter(n => /cutout-v2/.test(attr(n,'src'))).length, 3);
    assert(all('img').some(n => /legacy-burgundy/.test(attr(n,'src'))));
    assert(!all('img').some(n => /(?:overview|closeup|movement)-v1/.test(attr(n,'src'))), 'Old backgrounds must not remain in preview');
    assert(content.includes('ST1908'), 'Legacy must use its own specification');
    assert(content.includes(lang === 'hu' ? 'AI-illusztráció: Lume' : 'AI illustration: Lume'), 'Disclose the generated illustration');
    assert(content.includes(lang === 'hu' ? 'Nem valódi termékfotó' : 'Not an actual product photograph'), 'Do not imply documentary photography');
    assert(!content.includes('legacy-burgundy-wrist-preview'), 'Remove the uncleared retailer photograph');
  }
  for (const s of f.sources) assert(all('a').some(n => attr(n,'href') === s.url), `Missing source: ${s.url}`);
  for (const license of ['https://creativecommons.org/licenses/by/2.0/', 'https://creativecommons.org/licenses/by-sa/4.0/']) {
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
