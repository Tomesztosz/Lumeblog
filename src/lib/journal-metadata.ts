import { getImage } from "astro:assets";
import {
  COLUMNS,
  COLUMN_KEYS,
  UI,
  JOURNAL_META,
  archiveUrl,
  columnUrl,
  workshopUrl,
  aboutUrl,
  otherLang,
  type Lang,
  type ColumnKey,
} from "../i18n/ui";
import { urlOf, type Post } from "./posts";
import type { DesignView } from "./design";
import { CALENDAR_UI, calendarEntries, calendarUrl } from "./releases";

// The existing public metadata, independent of the approved visual components.
// Compare the built output with the pre-migration baseline after every change.
export async function journalMetadata({
  lang,
  view,
  column,
  post,
  posts,
  twin,
  site,
}: {
  lang: Lang;
  view: DesignView;
  column?: ColumnKey;
  post?: Post;
  posts: Post[];
  twin?: Post;
  site: URL;
}) {
  const t = UI[lang],
    other = otherLang(lang);
  const absolute = (path: string) => new URL(path, site).href;
  if (view === "article" && post) {
    const c = COLUMNS[post.data.column][lang];
    const canonical = absolute(urlOf(post));
    const organizationId = absolute("/#organization"),
      websiteId = absolute("/#website");
    const cover = post.data.cover;
    const coverImage = cover
      ? await getImage({
          src: cover.src,
          width: Math.min(1200, cover.src.width),
          format: "webp",
        })
      : undefined;
    const socialImage =
      coverImage && cover
        ? {
            src: coverImage.src,
            width: Number(coverImage.attributes.width),
            height: Number(coverImage.attributes.height),
            alt: cover.alt,
          }
        : undefined;
    const updated = post.data.updated;
    if (updated && (updated < post.data.date || updated > new Date()))
      throw new Error(`Invalid article update date: ${post.id}`);
    return {
      title: post.data.seoTitle ?? post.data.title,
      description: post.data.seoDescription ?? post.data.description,
      altUrl: twin ? urlOf(twin) : columnUrl(other, post.data.column),
      hasTranslation: Boolean(twin),
      ogType: "article" as const,
      socialImage,
      published: post.data.date.toISOString(),
      modified: updated?.toISOString(),
      section: c.name,
      structuredData: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BlogPosting",
            "@id": `${canonical}#article`,
            headline: post.data.title,
            description: post.data.seoDescription ?? post.data.description,
            datePublished: post.data.date.toISOString(),
            ...(updated ? { dateModified: updated.toISOString() } : {}),
            author: {
              "@type": "Organization",
              "@id": organizationId,
              name: "Lume",
              url: absolute("/"),
            },
            isAccessibleForFree: true,
            inLanguage: lang === "hu" ? "hu-HU" : "en-GB",
            articleSection: c.name,
            mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
            isPartOf: { "@id": websiteId },
            publisher: { "@id": organizationId },
            ...(socialImage
              ? {
                  image: {
                    "@type": "ImageObject",
                    url: absolute(socialImage.src),
                    width: socialImage.width,
                    height: socialImage.height,
                    caption: socialImage.alt,
                  },
                }
              : {}),
          },
          {
            "@type": "BreadcrumbList",
            "@id": `${canonical}#breadcrumb`,
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Lume",
                item: absolute(lang === "hu" ? "/" : "/en/"),
              },
              {
                "@type": "ListItem",
                position: 2,
                name: c.name,
                item: absolute(columnUrl(lang, post.data.column)),
              },
              {
                "@type": "ListItem",
                position: 3,
                name: post.data.title,
                item: canonical,
              },
            ],
          },
        ],
      },
    };
  }
  if (view === "column" && column)
    return {
      title: COLUMNS[column][lang].seoTitle,
      description: COLUMNS[column][lang].seoDescription,
      altUrl: columnUrl(other, column),
    };
  if (view === "about")
    return {
      title: JOURNAL_META[lang].aboutTitle,
      description: JOURNAL_META[lang].aboutDescription,
      altUrl: aboutUrl(other),
    };
  if (view === "404")
    return {
      title: "404",
      description: JOURNAL_META[lang].notFoundDescription,
      altUrl: "/en/",
      noindex: true,
      hasTranslation: false,
    };
  if (view === "archive") {
    const canonical = absolute(archiveUrl(lang));
    return {
      title: t.archiveSeoTitle,
      description: t.archiveDescription,
      altUrl: archiveUrl(other),
      structuredData: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": canonical,
        name: t.archiveSeoTitle,
        description: t.archiveDescription,
        inLanguage: lang,
        url: canonical,
        mainEntity: {
          "@type": "ItemList",
          itemListElement: COLUMN_KEYS.flatMap((key) =>
            posts.filter((p) => p.data.column === key),
          ).map((p, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: p.data.seoTitle ?? p.data.title,
            url: absolute(urlOf(p)),
          })),
        },
      },
    };
  }
  if (view === "workshop") {
    const models = posts.filter(
      (p) => p.data.column === "movement" && p.data.model,
    );
    const canonical = absolute(workshopUrl(lang));
    return {
      title: t.workshopSeoTitle,
      description: t.workshopSeoDescription,
      altUrl: workshopUrl(other),
      structuredData: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${canonical}#collection`,
        name: t.workshopSeoTitle,
        description: t.workshopSeoDescription,
        url: canonical,
        inLanguage: lang === "hu" ? "hu-HU" : "en-GB",
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: models.length,
          itemListElement: models.map((p, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: p.data.model!.title,
            url: absolute(urlOf(p)),
          })),
        },
      },
    };
  }
  if (view === "calendar") {
    const c = CALENDAR_UI[lang];
    return {
      title: c.seoTitle,
      description: c.seoDescription,
      altUrl: calendarUrl(other),
      structuredData: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: c.seoTitle,
        description: c.seoDescription,
        url: absolute(calendarUrl(lang)),
        mainEntity: {
          "@type": "ItemList",
          itemListElement: calendarEntries.map((release, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Product",
              name: `${release.brand} ${release.family} ${release.model}`,
              description: release.copy[lang].summary,
              image: absolute(release.image),
              brand: { "@type": "Brand", name: release.brand },
              ...(release.precision === "day"
                ? { releaseDate: release.date }
                : {}),
              url: release.sourceUrl,
            },
          })),
        },
      },
    };
  }
  return { altUrl: lang === "hu" ? "/en/" : "/" };
}
export type JournalMetadata = Awaited<ReturnType<typeof journalMetadata>>;
