import { getCollection, type CollectionEntry } from 'astro:content';
import { type ColumnKey, type Lang, postUrl, readingTime } from '../i18n/ui';
import articleRelations from '../data/article-relations.json';

export type Post = CollectionEntry<'posts'>;
export type ModelPost = Post & {
  data: Post['data'] & { model: NonNullable<Post['data']['model']> };
};

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
 * Megjelent-e már? A jövőre datált cikk éles buildben nem kerül ki. Így lehet
 * hétvégén feltölteni azt, ami hétfőn jelenik meg.
 *
 * Fejlesztés közben (`npm run dev`) viszont MINDEN látszik, hogy a készülő
 * írásokat meg tudd nézni a saját gépeden, mielőtt élesbe kerülnek.
 *
 * A nap pontosságú dátum UTC-éjfélt jelent. Pontos időzítéshez teljes ISO
 * időbélyeg és időzóna kell, például 2026-09-14T05:00:00+02:00.
 * Az oldal statikus, ezért újraépítés is szükséges; ezt a .github/workflows/ alatti
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

/** A megjelent, interaktív modellel rendelkező Szerkezet-cikkek. */
export async function getModelPosts(lang: Lang): Promise<ModelPost[]> {
  const posts = await getPosts(lang, 'movement');
  return posts.filter((post): post is ModelPost => Boolean(post.data.model));
}

/**
 * Először a szerkesztőileg összekapcsolt témák, aztán a rovat és a frissesség.
 * Mindkét nyelv ugyanazt a translationKey-alapú kapcsolatrendszert használja.
 * Az új cikk kapcsolatok nélkül is bekerülhet, de csak megjelenés után.
 */
export async function getRelatedPosts(post: Post, limit = 3): Promise<Post[]> {
  const candidates = (await getPosts(post.data.lang)).filter((candidate) => candidate.id !== post.id);
  const groups = articleRelations.filter((group) => group.includes(post.data.translationKey ?? ''));
  const score = (candidate: Post) =>
    groups.filter((group) => group.includes(candidate.data.translationKey ?? '')).length * 10 +
    (candidate.data.column === post.data.column ? 1 : 0);
  return candidates.sort((a, b) => score(b) - score(a) || b.data.date.valueOf() - a.data.date.valueOf()).slice(0, limit);
}

/** A modellek ugyanazt a HTML-t használják; az angol felület queryből vált. */
export function modelSrc(post: ModelPost): string {
  const separator = post.data.model.src.includes('?') ? '&' : '?';
  return post.data.lang === 'en'
    ? `${post.data.model.src}${separator}lang=en`
    : post.data.model.src;
}

/** Ugyanez a cikk a másik nyelven, translationKey alapján. */
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
