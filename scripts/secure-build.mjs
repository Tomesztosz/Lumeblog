import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { secureHtml } from './lib/security-policy.mjs';

async function protect(directory) {
  let count = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) count += await protect(file);
    else if (entry.name.endsWith('.html')) {
      try { await writeFile(file, secureHtml(await readFile(file, 'utf8'))); }
      catch (error) { throw new Error(`${file}: ${error.message}`, { cause: error }); }
      count++;
    }
  }
  return count;
}
console.log(`Security: hash-based CSP added to ${await protect(fileURLToPath(new URL('../dist/', import.meta.url)))} HTML documents.`);
