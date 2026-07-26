import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { UI } from '../i18n/ui';
import { getPosts, urlOf } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = await getPosts('hu');
  return rss({
    title: UI.hu.siteTitle,
    description: UI.hu.siteDescription,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: urlOf(post),
    })),
    customData: '<language>hu-HU</language>',
  });
}
