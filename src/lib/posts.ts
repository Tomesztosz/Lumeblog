import { getCollection, type CollectionEntry } from 'astro:content';
import { type ColumnKey, type Lang, postUrl, readingTime } from '../i18n/ui';

export type Post = CollectionEntry<'posts'>;

/** A fájlnév a `hu/lorier-neptune` id-ből, ha a frontmatter nem ad slugot. */
export function slugOf(post: Post): string {
  return post.data.slug ?? post.id.split('/').pop()!;
}

export function urlOf(post: Post): string {
  return postUrl(post.data.lang, post.data.column, slugOf(post));
}

export function minutesOf(post: Post): number {
  return post.data.minutes ?? readingTime(post.body);
}

/** Publikált posztok egy nyelven, legújabb elöl. Piszkozat sosem kerül bele. */
export async function getPosts(lang: Lang, column?: ColumnKey): Promise<Post[]> {
  const all = await getCollection('posts', ({ data }) => {
    if (data.draft) return false;
    if (data.lang !== lang) return false;
    if (column && data.column !== column) return false;
    return true;
  });
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Ugyanez a cikk a másik nyelven — translationKey alapján. */
export async function getTranslation(post: Post, target: Lang): Promise<Post | undefined> {
  const key = post.data.translationKey;
  if (!key) return undefined;
  const all = await getCollection('posts', ({ data }) => !data.draft && data.lang === target);
  return all.find((p) => p.data.translationKey === key);
}
