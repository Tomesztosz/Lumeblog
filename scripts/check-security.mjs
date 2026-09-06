import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { inspectHtml, attribute } from './lib/seo-html.mjs';
import { assertSafeMarkup, policyFor } from './lib/security-policy.mjs';

const root = new URL('../', import.meta.url);
const out = new URL('dist/', root);
async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const url = new URL(encodeURIComponent(entry.name) + (entry.isDirectory() ? '/' : ''), directory);
    if (entry.isDirectory()) files.push(...await walk(url));
    else files.push(url);
  }
  return files;
}
const files = await walk(out);
let pages = 0;
for (const file of files) {
  const path = decodeURIComponent(file.href.slice(out.href.length));
  assert(!/(?:^|\/)(?:\.env(?:\.|$)|\.git\/)|\.(?:pem|key|p12|pfx|map|sql|sqlite|bak)$/i.test(path), `Private/debug file in build: ${path}`);
  if (!path.endsWith('.html')) continue;
  const html = await readFile(file, 'utf8');
  const inspected = inspectHtml(html);
  assertSafeMarkup(inspected.elements);
  const metas = inspected.head.filter((node) => attribute(node, 'http-equiv')?.toLowerCase() === 'content-security-policy');
  assert.equal(metas.length, 1, `${path}: missing/duplicate CSP`);
  assert.equal(attribute(metas[0], 'content'), policyFor(inspected.elements), `${path}: stale or weakened CSP hashes`);
  const firstResource = html.search(/<(?:script|style|link)\b/i);
  assert(firstResource < 0 || html.indexOf('Content-Security-Policy') < firstResource, `${path}: late CSP`);
  pages++;
}

const headers = await readFile(new URL('_headers', out), 'utf8');
const globalRule = headers.split('\n/*\n')[1]?.split(/\n\n/)[0] ?? '';
for (const expected of [
  'X-Content-Type-Options: nosniff', 'X-Frame-Options: SAMEORIGIN',
  'Referrer-Policy: strict-origin-when-cross-origin', "frame-ancestors 'self'", "object-src 'none'",
  "base-uri 'none'", "form-action 'none'", "script-src-attr 'none'", 'camera=()', 'microphone=()', 'geolocation=()',
]) assert(globalRule.includes(expected), `Global security header missing: ${expected}`);
assert(/https:\/\/lumejournal\.com\/\*\s+Strict-Transport-Security: max-age=31536000/.test(headers), 'HSTS missing');
assert(headers.split('\n').every((line) => line.length < 2000), 'Cloudflare header line too long');
assert(headers.split('\n').filter((line) => /^(?:\/|https:)/.test(line)).length <= 100, 'Too many Cloudflare header rules');

// Do not print a matched credential. These are recognizable token/key formats,
// not a claim that every possible secret can be detected by a pattern scan.
const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}\b/, /\bgithub_pat_[A-Za-z0-9_]{50,}\b/,
  /\bAKIA[A-Z0-9]{16}\b/, /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/,
];
const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: fileURLToPath(root), encoding: 'utf8' }).split('\0').filter(Boolean);
let scanned = 0;
for (const name of tracked) {
  assert(!/(?:^|\/)\.env(?:$|\.(?!example$|sample$))|\.(?:pem|p12|pfx)$/i.test(name), `Private file tracked: ${name}`);
  if (!/\.(?:astro|[cm]?js|ts|json|ya?ml|toml|md|html|css|txt|svg)$/.test(name)) continue;
  const text = await readFile(new URL(name, root), 'utf8');
  assert(!patterns.some((pattern) => pattern.test(text)), `Possible credential in tracked file: ${name} (value withheld)`);
  scanned++;
}
console.log(`Security checks passed: ${pages} protected HTML documents, security headers, ${scanned} tracked text files scanned.`);
