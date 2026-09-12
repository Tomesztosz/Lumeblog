import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { resolve, join, dirname, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMarkdownProcessor, parseFrontmatter } from '@astrojs/markdown-remark';
import { parseFragment, serialize } from 'parse5';
import sharp from 'sharp';

// Offline editorial export. Reads trusted local drafts only; no server,
// credentials, network access, publication or change to the production build.
const root = fileURLToPath(new URL('../', import.meta.url));
const key = process.argv[2];
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key ?? '')) throw new Error('Pass a translation key, e.g. seagull-1963');
const out = join(root, 'output/article-review', key);
const assets = join(out, 'assets');
await mkdir(join(assets, 'fonts'), { recursive: true });
const esc = (value) => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const attr = (node, name) => node.attrs?.find(a => a.name === name)?.value;
const processor = await createMarkdownProcessor();

// Reuse the approved journal's actual CSS and self-hosted font faces.
let fonts = '';
for (const name of ['@fontsource-variable/fraunces/opsz.css', '@fontsource-variable/fraunces/opsz-italic.css', '@fontsource-variable/hanken-grotesk/wght.css', '@fontsource/ibm-plex-mono/400.css']) {
  const path = join(root, 'node_modules', name);
  let css = await readFile(path, 'utf8');
  for (const match of [...css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)]) {
    const font = resolve(dirname(path), match[1]);
    const destination = `assets/fonts/${basename(font)}`;
    await copyFile(font, join(out, destination));
    css = css.replace(match[0], `url("${destination}")`);
  }
  fonts += css;
}
const palette = await readFile(join(root, 'src/styles/lume-palette.css'), 'utf8');
const journal = (await readFile(join(root, 'src/styles/lume-next.css'), 'utf8')).replace(/^@import[^;]+;\s*/gm, '');
const pages = await readFile(join(root, 'src/styles/lume-pages.css'), 'utf8');
const extra = `
.editorial-review{padding:16px var(--gutter);background:var(--accent);color:var(--accent-ink);font-size:13px;display:flex;gap:8px 22px;flex-wrap:wrap}
.editorial-review strong{font-weight:700}.review-actions{display:flex;align-items:center;gap:20px}.review-actions a{text-decoration:underline;text-underline-offset:4px}
.review-end{padding:28px var(--gutter);border-top:1px solid var(--line);font-size:13px;color:var(--muted)}
.reader-sources summary{cursor:pointer}.article-body img{width:auto;max-width:100%}
.reader-sidebar .review-size{display:block;margin-top:20px;text-decoration:underline;font-size:12px}
@media(max-width:760px){.review-actions{gap:14px}.editorial-review{font-size:12px}}
`;
await writeFile(join(out, 'journal.css'), fonts + palette + journal + pages + extra);
const report = [];
for (const lang of ['hu', 'en']) {
  const hu = lang === 'hu';
  const input = join(root, 'src/content/posts', lang, `${key}.md`);
  const raw = await readFile(input, 'utf8');
  const { frontmatter: f, content } = parseFrontmatter(raw);
  const scheduled = f.draft === false && new Date(f.date) > new Date();
  if ((!f.draft && !scheduled) || f.lang !== lang || f.translationKey !== key) throw new Error(`Not the requested unpublished article: ${input}`);
  if (raw.includes(String.fromCharCode(0x2014))) throw new Error(`Forbidden punctuation: ${input}`);
  // Only this offline draft renderer resolves review-image markers. Keeping
  // them out of Markdown image syntax prevents Astro from emitting the files
  // during content compilation, even when the article itself is filtered out.
  const reviewContent = content.replace(/<!-- lume-review-image (\{[^\n]+\}) -->/g, (_, json) => {
    const image = JSON.parse(json);
    if (!/^[a-z0-9-]+\.(webp|png|jpg)$/.test(image.src) || typeof image.alt !== 'string') throw new Error('Invalid local review-image marker');
    const src = relative(dirname(input), join(out, 'sources', image.src)).replaceAll('\\', '/');
    const alt = image.alt.replace(/[\\\[\]]/g, '\\$&').replace(/\r?\n/g, ' ');
    return `![${alt}](${src})`;
  });
  const { code, metadata } = await processor.render(reviewContent);
  const tree = parseFragment(code);
  const imgRoot = join(root, 'src/content/posts/_images');
  async function imageData(src) {
    const file = resolve(dirname(input), src);
    // The local draft may include reference photos whose publication rights
    // are not cleared. Keep these outside production's eager image glob.
    if (![imgRoot, join(out, 'sources')].includes(dirname(file))) throw new Error(`Image outside article/review assets: ${src}`);
    const target = `assets/${basename(file)}`;
    await copyFile(file, join(out, target));
    return { src: target, ...await sharp(file).metadata() };
  }
  async function walk(node) {
    if (node.tagName === 'img') {
      const info = await imageData(attr(node, 'src'));
      node.attrs = node.attrs.filter(a => !['src', 'width', 'height', 'loading', 'decoding'].includes(a.name));
      node.attrs.push(...Object.entries({ src: info.src, width: info.width, height: info.height, loading:'lazy', decoding:'async' }).map(([name, value]) => ({name, value:String(value)})));
    }
    if (node.tagName === 'a' && attr(node, 'href')?.startsWith('/')) {
      node.attrs.find(a => a.name === 'href').value = new URL(attr(node, 'href'), 'https://lumejournal.com').href;
    }
    for (const child of node.childNodes ?? []) await walk(child);
  }
  await walk(tree);
  const cover = await imageData(f.cover.src);
  const coverClass = /transparent|cutout/.test(f.cover.src) ? ' design-media-cutout' : '';
  const coverCredit = f.cover.creditUrl ? `<a href="${esc(f.cover.creditUrl)}">${esc(f.cover.credit)}</a>` : esc(f.cover.credit);
  const coverLicense = f.cover.license ? (f.cover.licenseUrl ? `<a rel="license" href="${esc(f.cover.licenseUrl)}">${esc(f.cover.license)}</a>` : esc(f.cover.license)) : '';
  const headings = metadata.headings.filter(h => h.depth === 2);
  const minutes = Math.max(1, Math.round(content.trim().split(/\s+/).length / 200));
  const filename = hu ? 'megnezes.html' : 'english.html';
  const twin = hu ? 'english.html' : 'megnezes.html';
  const column = { 'in-hand': ['Kézben','In Hand'], origins:['Eredet','Origins'], movement:['Szerkezet','Movement'] }[f.column]?.[hu ? 0 : 1];
  if (!column) throw new Error('Unknown column');
  const date = new Intl.DateTimeFormat(hu ? 'hu-HU' : 'en-GB', { year:'numeric',month:'long',day:'numeric',timeZone:'Europe/Budapest' }).format(new Date(f.date));
  const body = `<!doctype html><html lang="${lang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${esc(f.title)} | Lume</title><link rel="stylesheet" href="journal.css"></head>
<body class="lume-next is-reader"><a class="skip-link" href="#content">${hu ? 'Ugrás a cikkhez' : 'Skip to article'}</a>
<header class="next-header"><div class="masthead"><a class="wordmark" href="#content">LUME<span class="lume-point" aria-hidden="true"></span></a><div class="masthead-note"><span>${hu ? 'Független óramagazin' : 'Independent watch journal'}</span><strong>${hu ? 'Tanulj meg órát olvasni.' : 'Learn to read a watch.'}</strong></div></div>
<div class="navigation"><span class="eyebrow">${hu ? 'Szerkesztői olvasópéldány' : 'Editorial reading copy'}</span><div class="review-actions"><a href="${twin}" lang="${hu ? 'en' : 'hu'}">${hu ? 'EN' : 'HU'}</a><button type="button" data-review-theme aria-pressed="false">${hu ? 'Sötét mód' : 'Dark mode'}</button></div></div></header>
<aside class="editorial-review"><strong>${scheduled ? (hu ? 'Időzítésre előkészített cikk' : 'Article prepared for scheduling') : (hu ? 'Átnézésre váró kézirat' : 'Draft for review')}</strong><span>${scheduled ? esc(new Intl.DateTimeFormat(hu ? 'hu-HU' : 'en-GB', {dateStyle:'full',timeStyle:'short',timeZone:'Europe/Budapest'}).format(new Date(f.date))) + ' (Europe/Budapest). ' + (hu ? 'Helyi olvasópéldány, nem az éles oldal állapotjelzése.' : 'Local reading copy, not a live deployment status.') : (hu ? 'A dátum terv, nem aktív időzítés. Ez a cikk nem nyilvános.' : 'The date is a proposal, not an active schedule. This article is not public.')}</span></aside>
<main id="content"><article class="next-article"><header class="reader-header"><div class="reader-heading"><div><p class="eyebrow">${column} · ${minutes} ${hu ? 'perc' : 'min'}</p><h1>${esc(f.title)}</h1></div><div class="reader-deck"><p>${esc(f.description)}</p><div class="eyebrow">Lume / ${esc(date)}</div></div></div></header>
<div class="article-lead-media"><figure class="design-media design-media-lead${coverClass}" style="--media-ratio:${cover.width/cover.height};--media-source-width:${cover.width}px"><a class="design-media-image" href="${cover.src}" target="_blank"><img src="${cover.src}" width="${cover.width}" height="${cover.height}" alt="${esc(f.cover.alt)}" fetchpriority="high"></a><figcaption>${coverCredit}${coverLicense ? ' · ' + coverLicense : ''}</figcaption></figure></div>
<div class="reader-layout"><aside class="reader-sidebar"><details open><summary>${hu ? 'A cikk fejezetei' : 'In this article'}</summary><nav><ol>${headings.map((h,i)=>`<li><a href="#${esc(h.slug)}"><span>${String(i+1).padStart(2,'0')}</span>${esc(h.text)}</a></li>`).join('')}</ol></nav></details><button type="button" class="review-size" data-review-size aria-pressed="false">${hu ? 'Nagyobb betűméret' : 'Larger text'}</button></aside>
<div class="reading-column"><div class="article-body">${serialize(tree)}</div><details class="reader-sources" open><summary><h2>${hu ? 'Források' : 'Sources'}</h2></summary><ol>${f.sources.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a></li>`).join('')}</ol></details></div></div></article></main>
<footer class="review-end">${hu ? 'Helyi szöveg- és képelőnézet, a Lume jelenlegi tipográfiájával. A visszajelzésed után javítjuk vagy időzítjük.' : 'Local text and image preview using the current Lume typography. Revisions or scheduling follow your feedback.'}</footer>
<script>document.querySelector('[data-review-theme]').addEventListener('click',function(){const on=this.getAttribute('aria-pressed')!=='true';this.setAttribute('aria-pressed',String(on));document.documentElement.dataset.theme=on?'dark':'light'});document.querySelector('[data-review-size]').addEventListener('click',function(){const on=this.getAttribute('aria-pressed')!=='true';this.setAttribute('aria-pressed',String(on));document.documentElement.dataset.textSize=on?'large':'standard'});</script></body></html>`;
  await writeFile(join(out, filename), body);
  report.push({ lang, path:join(out, filename), draft:f.draft, scheduled, words:content.trim().split(/\s+/).length, sections:headings.length, sources:f.sources.length });
}
console.log(JSON.stringify(report, null, 2));
