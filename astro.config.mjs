// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://lumeblog.com',
  i18n: {
    locales: ['hu', 'en'],
    defaultLocale: 'hu',
    routing: {
      prefixDefaultLocale: false, // HU a gyökéren, EN a /en/ alatt
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'hu',
        locales: { hu: 'hu-HU', en: 'en-GB' },
      },
    }),
  ],
  build: {
    format: 'directory',
  },
});
