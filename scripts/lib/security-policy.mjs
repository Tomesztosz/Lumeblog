import { createHash } from 'node:crypto';
import { parse } from 'parse5';
import { attribute, elementsOf, textOf } from './seo-html.mjs';

export const hash = (text) => `'sha256-${createHash('sha256').update(text).digest('base64')}'`;

// Git may check out the same Cloudflare configuration with LF or CRLF.
// Only the global block counts; route-specific headers must not satisfy it.
export function globalHeaderRule(headers) {
  return headers.replaceAll('\r\n', '\n')
    .match(/(?:^|\n)\/\*\n([\s\S]*?)(?:\n\s*\n|$)/)?.[1] ?? '';
}

// Only trusted build output is hashed, never request data or user submissions.
// Attribute styles remain necessary for responsive images and the animated models.
export function policyFor(elements) {
  const hashesFor = (tag) => [...new Set(elements.filter((node) => node.tagName === tag && !attribute(node, 'src'))
    .map((node) => hash(textOf(node))))];
  return [
    "default-src 'none'",
    `script-src 'self' ${hashesFor('script').join(' ')}`.trim(),
    "script-src-attr 'none'",
    `style-src 'self' ${hashesFor('style').join(' ')}`.trim(),
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data:",
    // Vite may embed small font subsets as data URLs; no third-party fonts.
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-src 'self'",
    "media-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join('; ');
}

export function assertSafeMarkup(elements) {
  for (const node of elements) {
    if (node.tagName === 'base') throw new Error('A base element would change local URL targets.');
    for (const { name, value } of node.attrs ?? []) {
      if (/^on/i.test(name)) throw new Error(`Inline event handler: ${node.tagName}[${name}]`);
      if (name === 'srcdoc') throw new Error('Inline iframe documents are not allowed.');
      if (['href', 'src', 'action', 'formaction', 'xlink:href'].includes(name) &&
          /^(?:javascript|vbscript):/i.test(value.replace(/[\s\u0000-\u001f]/g, ''))) {
        throw new Error(`Executable URL: ${node.tagName}[${name}]`);
      }
    }
    if (['script', 'iframe'].includes(node.tagName) && attribute(node, 'src')) {
      const src = attribute(node, 'src');
      if (!src.startsWith('/') || src.startsWith('//') || src.includes('\\')) {
        throw new Error(`Non-local ${node.tagName} source.`);
      }
      if (node.tagName === 'iframe' && !/^\/widgets\/[a-z0-9-]+\.html(?:\?[^#]*)?$/.test(src)) {
        throw new Error('Only local model frames are permitted.');
      }
    }
  }
}

export function secureHtml(html) {
  const elements = elementsOf(parse(html, { sourceCodeLocationInfo: true }));
  assertSafeMarkup(elements);
  if (elements.some((node) => attribute(node, 'http-equiv')?.toLowerCase() === 'content-security-policy')) {
    throw new Error('CSP already present. Always run this step against a fresh Astro build.');
  }
  const head = elements.find((node) => node.tagName === 'head');
  const charset = elements.find((node) => node.tagName === 'meta' && attribute(node, 'charset'));
  const position = charset?.sourceCodeLocation?.endOffset ?? head?.sourceCodeLocation?.startTag?.endOffset;
  if (position === undefined) throw new Error('Missing explicit head: cannot insert an early CSP.');
  const firstResource = elements.find((node) => ['script', 'style', 'link'].includes(node.tagName));
  if (firstResource && firstResource.sourceCodeLocation.startOffset < position) {
    throw new Error('Scripts/styles must not precede the CSP.');
  }
  const meta = `<meta http-equiv="Content-Security-Policy" content="${policyFor(elements)}">`;
  return html.slice(0, position) + meta + html.slice(position);
}
