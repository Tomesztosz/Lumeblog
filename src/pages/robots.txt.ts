import type { APIContext } from 'astro';
import { LAUNCHED } from '../site';

/* Amíg a LAUNCHED false, mindent tiltunk: az oldal még nem kész, és a domain
   sincs meg — nem akarunk félkész állapotot indexelve látni. */
export function GET(context: APIContext) {
  const body = LAUNCHED
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap-index.xml', context.site)}\n`
    : `User-agent: *\nDisallow: /\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
