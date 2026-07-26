// @ts-check
import { defineConfig } from 'astro/config';

// A site URL-t a valódi domainre kell cserélni publikálás előtt (sitemap / canonical).
export default defineConfig({
  site: 'https://lume.example',
  i18n: {
    locales: ['hu', 'en'],
    defaultLocale: 'hu',
    routing: {
      prefixDefaultLocale: false, // HU a gyökéren, EN a /en/ alatt
    },
  },
  build: {
    format: 'directory',
  },
});
