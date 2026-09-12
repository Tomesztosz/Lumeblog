import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Dependency-free: the scheduled workflow runs after checkout, without npm ci.
export function publicationDate(raw) {
  const header = raw.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
  if (!header) throw new Error('Missing frontmatter');
  const field = name => header.match(new RegExp('^' + name + ':\\s*([^\\r\\n]+)', 'm'))?.[1]?.trim();
  const draft = field('draft');
  if (draft && !/^(true|false)(\s+#.*)?$/.test(draft)) throw new Error('Unsupported draft value');
  if (draft?.startsWith('true')) return null;
  const value = field('date')?.replace(/\s+#.*$/, '').replace(/^(['"])(.*)\1$/, '$2');
  if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2}))?$/.test(value ?? '')) throw new Error('Use an ISO publication date with an explicit time zone');
  const date = new Date(value);
  if (!Number.isFinite(date.valueOf())) throw new Error('Invalid publication date');
  return date;
}

export function dueToday(raw, now = new Date()) {
  const date = publicationDate(raw);
  return date !== null && date <= now && date.toISOString().slice(0, 10) === now.toISOString().slice(0, 10);
}

async function main() {
  const now = new Date();
  let due = false;
  for (const lang of ['hu', 'en']) {
    const dir = new URL(`../src/content/posts/${lang}/`, import.meta.url);
    for (const name of await readdir(dir)) {
      if (!name.endsWith('.md')) continue;
      try {
        if (dueToday(await readFile(new URL(name, dir), 'utf8'), now)) {
          console.log(`Publication due: ${lang}/${name}`);
          due = true;
        }
      } catch (error) { throw new Error(`${lang}/${name}: ${error.message}`); }
    }
  }
  if (!due) console.log('No article publication due today.');
  process.exitCode = due ? 0 : 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 2; });
}
