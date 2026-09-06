// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import rehypeArticleImages from './src/lib/rehype-article-images.mjs';
import { sitemapMetadata } from './scripts/lib/sitemap-metadata.mjs';

const outDir = new URL('./dist/', import.meta.url);

export default defineConfig({
  site: 'https://lumejournal.com',
  outDir: './dist',
  i18n: {
    locales: ['hu', 'en'],
    defaultLocale: 'hu',
    routing: {
      prefixDefaultLocale: false, // HU a gyökéren, EN a /en/ alatt
    },
  },
  integrations: [
    sitemap({
      serialize: (item) => sitemapMetadata(item, outDir),
    }),
  ],
  image: {
    // A Markdown-képekből is több méret készül, így a böngésző a kijelzőhöz
    // illő fájlt tölti le az eredeti, gyakran jóval nagyobb kép helyett.
    layout: 'constrained',
    responsiveStyles: true,
  },
  markdown: {
    rehypePlugins: [rehypeArticleImages],
  },
  build: {
    format: 'directory',
    inlineStylesheets: 'always',
  },
});
