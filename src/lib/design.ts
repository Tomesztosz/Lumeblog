// Preview URL helpers remain available to the dev-only route generator.
import {
  columnUrl,
  archiveUrl,
  aboutUrl,
  workshopUrl,
  type Lang,
  type ColumnKey,
} from "../i18n/ui";
import { urlOf, type Post } from "./posts";
export const designHome = (lang: Lang) =>
  `/design/${lang === "hu" ? "magyar" : "english"}/`;
export function designLink(path: string, lang: Lang) {
  return designHome(lang) + path.replace(/^\/en(?=\/)/, "").replace(/^\//, "");
}
export const designPost = (post: Post) =>
  designLink(urlOf(post), post.data.lang);
export const designColumn = (lang: Lang, key: ColumnKey) =>
  designLink(columnUrl(lang, key), lang);
export const designArchive = (lang: Lang) => designLink(archiveUrl(lang), lang);
export const designAbout = (lang: Lang) => designLink(aboutUrl(lang), lang);
export const designWorkshop = (lang: Lang) =>
  designLink(workshopUrl(lang), lang);
export const designCalendar = (lang: Lang) =>
  designHome(lang) + (lang === "hu" ? "naptar/" : "calendar/");

// A request-scoped choice: never mutate shared module state during a build.
export function journalLinks(preview: boolean) {
  const link = (path: string, lang: Lang) =>
    preview ? designLink(path, lang) : path;
  return {
    designHome: (lang: Lang) =>
      preview ? designHome(lang) : lang === "hu" ? "/" : "/en/",
    designPost: (post: Post) => link(urlOf(post), post.data.lang),
    designColumn: (lang: Lang, key: ColumnKey) =>
      link(columnUrl(lang, key), lang),
    designArchive: (lang: Lang) => link(archiveUrl(lang), lang),
    designAbout: (lang: Lang) => link(aboutUrl(lang), lang),
    designWorkshop: (lang: Lang) => link(workshopUrl(lang), lang),
    designCalendar: (lang: Lang) =>
      link(lang === "hu" ? "/naptar/" : "/en/calendar/", lang),
  };
}
export type DesignView =
  | "home"
  | "article"
  | "column"
  | "archive"
  | "calendar"
  | "workshop"
  | "about"
  | "404";
