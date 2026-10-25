#!/usr/bin/env node
/* ============================================================
   LUME · Kirakat: hírlevélszámok előnézete és kiküldése

   npm run kirakat -- preview kirakat/hu/001-szam.md
   npm run kirakat -- test    kirakat/hu/001-szam.md te@pelda.hu
   npm run kirakat -- send    kirakat/hu/001-szam.md            (csak kiírja, kinek menne)
   npm run kirakat -- send    kirakat/hu/001-szam.md --yes      (élesben kiküldi)
   npm run kirakat -- stats

   Beállítás: a projekt gyökerében egy `.env.kirakat` fájl (a git nem követi):
     KIRAKAT_ADMIN_TOKEN=...   ugyanaz, mint a Cloudflare ADMIN_TOKEN titka
     KIRAKAT_URL=https://lumejournal.com   (elhagyható)

   Egy `send` legfeljebb a napi keretnyi címzettnek küld (KIRAKAT_DAILY_LIMIT).
   Ha maradt még címzett, másnap ugyanazzal a paranccsal folytatható: aki már
   megkapta a számot, az kimarad.
   ============================================================ */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { createMarkdownProcessor, parseFrontmatter } from '@astrojs/markdown-remark';
import { mailLayout, styleIssueHtml, mailCopy } from '../worker/mail.js';

const PREVIEW_DIR = '.kirakat-preview';

async function loadEnv() {
  const env = { ...process.env };
  if (existsSync('.env.kirakat')) {
    for (const line of (await readFile('.env.kirakat', 'utf8')).split(/\r?\n/)) {
      const m = /^\s*([A-Z_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  }
  return env;
}

function fail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

/* Egy szám = egy Markdown-fájl, frontmatterrel:
   ---
   issue: "001"            a szám azonosítója (ettől tudja, kinek ment már ki)
   lang: hu                hu vagy en
   subject: "..."          a levél tárgya
   preheader: "..."        a tárgy alatt látszó rövid előnézet (elhagyható)
   ---                                                                      */
async function buildIssue(file) {
  if (!file || !existsSync(file)) fail(`Nem találom a számot: ${file || '(nincs megadva)'}`);
  const source = await readFile(file, 'utf8');
  const parsed = parseFrontmatter(source);
  const fm = parsed.frontmatter;
  // A szerkesztői megjegyzések (HTML-komment) nem kerülnek bele a levélbe.
  const content = parsed.content.replace(/<!--[\s\S]*?-->/g, '').trim();
  for (const key of ['issue', 'lang', 'subject']) {
    if (!fm[key]) fail(`A frontmatterből hiányzik: ${key}`);
  }
  const lang = fm.lang === 'en' ? 'en' : 'hu';
  const issue = String(fm.issue);
  const processor = await createMarkdownProcessor({ syntaxHighlight: false });
  const { code } = await processor.render(content);

  const html = mailLayout({
    lang,
    title: fm.subject,
    preheader: fm.preheader || '',
    issueLabel: `Nº ${issue}`,
    content: styleIssueHtml(code),
    unsubscribe: '{{UNSUBSCRIBE}}',
  });
  const c = mailCopy(lang);
  const text = [
    `LUME · ${c.label} · Nº ${issue}`,
    '',
    markdownToText(content),
    '',
    '---',
    c.footer,
    `${c.unsubscribe}: {{UNSUBSCRIBE}}`,
  ].join('\n');

  return { issue: `${lang}-${issue}`, lang, subject: String(fm.subject), html, text };
}

function markdownToText(md) {
  return md
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|\W)\*([^*]+)\*(?=\W|$)/g, '$1$2')
    .replace(/^>\s?/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function api(env, path, { method = 'GET', body } = {}) {
  const token = env.KIRAKAT_ADMIN_TOKEN;
  if (!token) fail('Hiányzik a KIRAKAT_ADMIN_TOKEN (lásd a .env.kirakat leírását a fájl elején).');
  const base = (env.KIRAKAT_URL || 'https://lumejournal.com').replace(/\/$/, '');
  const res = await fetch(`${base}/api/kirakat/${path}`, {
    method,
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) fail(`A szerver hibát adott (${res.status}): ${data.error || 'ismeretlen'}`);
  return data;
}

function countFor(stats, lang, status) {
  return stats.counts
    .filter((r) => r.lang === lang && r.status === status)
    .reduce((n, r) => n + r.n, 0);
}

const [command, file, ...rest] = process.argv.slice(2);
const env = await loadEnv();

if (command === 'preview') {
  const mail = await buildIssue(file);
  await mkdir(PREVIEW_DIR, { recursive: true });
  const name = basename(file).replace(/\.md$/, '');
  const htmlPath = resolve(PREVIEW_DIR, `${name}.html`);
  await writeFile(htmlPath, mail.html.split('{{UNSUBSCRIBE}}').join('#leiratkozas'));
  await writeFile(resolve(PREVIEW_DIR, `${name}.txt`), mail.text.split('{{UNSUBSCRIBE}}').join('#leiratkozas'));
  console.log(`\n✓ Előnézet: ${htmlPath}\n  Tárgy: ${mail.subject}\n  Nyisd meg böngészőben.\n`);
} else if (command === 'test') {
  const to = rest[0];
  if (!to) fail('Add meg, melyik címre menjen a próba: npm run kirakat -- test <fájl> te@pelda.hu');
  const mail = await buildIssue(file);
  await api(env, 'admin/send', { method: 'POST', body: { ...mail, subject: `[PRÓBA] ${mail.subject}`, test: to } });
  console.log(`\n✓ Próbalevél elküldve ide: ${to}\n`);
} else if (command === 'send') {
  const mail = await buildIssue(file);
  const stats = await api(env, 'admin/stats');
  const confirmed = countFor(stats, mail.lang, 'confirmed');
  if (!rest.includes('--yes')) {
    console.log(`\nSzám: ${mail.issue} · ${mail.subject}`);
    console.log(`Megerősített ${mail.lang} feliratkozó: ${confirmed}`);
    console.log(`Egy futás legfeljebb ${stats.dailyLimit} címzettnek küld (küldő: ${stats.provider}).`);
    console.log(`\nÉles kiküldéshez futtasd újra a végére írt --yes kapcsolóval.\n`);
    process.exit(0);
  }
  const result = await api(env, 'admin/send', { method: 'POST', body: mail });
  console.log(`\n✓ Kiküldve: ${result.sent} levél.`);
  if (result.remaining > 0) {
    console.log(`  Még ${result.remaining} címzett vár. Holnap futtasd újra ugyanezt a parancsot, ott folytatja.`);
  } else {
    console.log('  Mindenki megkapta ezt a számot.');
  }
  console.log('');
} else if (command === 'stats') {
  const stats = await api(env, 'admin/stats');
  console.log(`\nKüldő: ${stats.provider} · napi keret: ${stats.dailyLimit}`);
  for (const lang of ['hu', 'en']) {
    console.log(`  ${lang}: ${countFor(stats, lang, 'confirmed')} megerősített, ${countFor(stats, lang, 'pending')} függőben, ${countFor(stats, lang, 'unsubscribed')} leiratkozott`);
  }
  console.log('');
} else {
  console.log(`
Kirakat hírlevél

  npm run kirakat -- preview <szám.md>             előnézet a .kirakat-preview/ mappába
  npm run kirakat -- test    <szám.md> <e-mail>    próbalevél egy címre
  npm run kirakat -- send    <szám.md> [--yes]     kiküldés a feliratkozóknak
  npm run kirakat -- stats                         létszám
`);
}

