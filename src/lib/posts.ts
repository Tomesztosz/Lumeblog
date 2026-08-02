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

/**
 * Megjelent-e már? A jövőre datált cikk éles buildben nem kerül ki — így lehet
 * hétvégén feltölteni azt, ami hétfőn jelenik meg.
 *
 * Fejlesztés közben (`npm run dev`) viszont MINDEN látszik, hogy a készülő
 * írásokat meg tudd nézni a saját gépeden, mielőtt élesbe kerülnek.
 *
 * A dátum a frontmatterben nap pontosságú, tehát UTC szerint éjfélkor válik
 * megjelentté. Magától viszont semmi nem történik: az oldal statikus, tehát
 * kell egy újraépítés is azon a napon — ezt a .github/workflows/ alatti
 * ütemezett munkafolyamat intézi.
 */
function megjelent(date: Date, most: Date): boolean {
  return import.meta.env.DEV || date <= most;
}

/** Publikált posztok egy nyelven, legújabb elöl. Piszkozat sosem kerül bele. */
export async function getPosts(lang: Lang, column?: ColumnKey): Promise<Post[]> {
  const most = new Date();
  const all = await getCollection('posts', ({ data }) => {
    if (data.draft) return false;
    if (data.lang !== lang) return false;
    if (column && data.column !== column) return false;
    if (!megjelent(data.date, most)) return false;
    return true;
  });
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Ugyanez a cikk a másik nyelven — translationKey alapján. */
export async function getTranslation(post: Post, target: Lang): Promise<Post | undefined> {
  const key = post.data.translationKey;
  if (!key) return undefined;
  const most = new Date();
  const all = await getCollection(
    'posts',
    ({ data }) => !data.draft && data.lang === target && megjelent(data.date, most)
  );
  return all.find((p) => p.data.translationKey === key);
}
