// Homepage and public model pages share the same strict publication boundary,
// including in development. A draft/future item must not become a share target.
/**
 * @template {{ id: string, data: { draft?: boolean, date: Date | string } }} T
 * @param {T[]} posts
 * @param {Date} now
 * @returns {T[]}
 */
export function orderedPublishedPosts(posts, now = new Date()) {
  return posts.filter(({ data }) => !data.draft && Number.isFinite(new Date(data.date).valueOf()) && new Date(data.date) <= now)
    .toSorted((a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf() || a.id.localeCompare(b.id));
}
/**
 * @template {{ id: string, data: { draft?: boolean, date: Date | string } }} T
 * @param {T[]} posts
 * @param {Date} now
 */
export function homeFeed(posts, now = new Date()) {
  const ordered = orderedPublishedPosts(posts, now);
  return { featured: ordered[0], stories: ordered.slice(1, 3) };
}
