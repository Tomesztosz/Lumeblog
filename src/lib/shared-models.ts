import { MODEL_NAMES } from './design-models.mjs';
import { SHARED_MODEL_UI, modelPageUrl } from '../i18n/ui';
import { orderedPublishedPosts } from './published-feed.mjs';
import { getPosts, type Post } from './posts';

export function sharedModel(post: Post) {
  if (post.data.column !== 'movement') return undefined;
  if (post.data.model) {
    const key = MODEL_NAMES.find((name) => post.data.model!.src === `/widgets/${name}.html`);
    if (!key) throw new Error(`Unapproved model path: ${post.id}`);
    return { ...post.data.model, key, kind: 'frame' as const, url: modelPageUrl(post.data.lang, key) };
  }
  if (post.data.translationKey === 'ugro-masodperc' && post.body?.includes('<!-- lume-model ugro-masodperc -->')) {
    const t = SHARED_MODEL_UI[post.data.lang];
    return { key: 'ugro-masodperc', kind: 'inline' as const, title: t.jumpingTitle, description: t.jumpingDescription, level: 'intermediate' as const, url: modelPageUrl(post.data.lang, 'ugro-masodperc') };
  }
  return undefined;
}
export function publicModelPosts(posts: Post[], now = new Date()): Post[] {
  return orderedPublishedPosts(posts, now).filter((post: Post) => sharedModel(post));
}
export async function sharedModelPaths(lang: 'hu' | 'en') {
  return publicModelPosts(await getPosts(lang)).map((post) => ({ params: { model: sharedModel(post)!.key }, props: { post } }));
}
