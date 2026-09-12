import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { attribute, inspectHtml, textOf } from "./seo-html.mjs";
import { MODEL_NAMES } from "../../src/lib/design-models.mjs";

export const seoFields = [
  "description",
  "robots",
  "og:type",
  "og:site_name",
  "og:title",
  "og:description",
  "og:url",
  "og:locale",
  "og:locale:alternate",
  "og:image",
  "og:image:width",
  "og:image:height",
  "og:image:alt",
  "twitter:card",
  "twitter:title",
  "twitter:description",
  "twitter:image",
  "twitter:image:alt",
  "article:published_time",
  "article:modified_time",
  "article:section",
];
export function pageContract(html) {
  const p = inspectHtml(html);
  return {
    lang: p.lang,
    titles: p.titles,
    canonical: p.canonical,
    alternates: p.alternates.toSorted((a, b) => a.lang.localeCompare(b.lang)),
    meta: Object.fromEntries(seoFields.map((key) => [key, p.meta(key)])),
    schemas: p.schemas.toSorted((a, b) =>
      String(a["@id"] ?? a["@type"]).localeCompare(
        String(b["@id"] ?? b["@type"]),
      ),
    ),
    rss: p.head
      .filter(
        (n) =>
          n.tagName === "link" &&
          attribute(n, "type") === "application/rss+xml",
      )
      .map((n) => ({
        href: attribute(n, "href"),
        title: attribute(n, "title"),
      })),
  };
}
export async function buildContract(directory) {
  const pages = {},
    immutable = {},
    routes = [];
  async function walk(dir) {
    for (const entry of (await readdir(dir, { withFileTypes: true })).toSorted(
      (a, b) => a.name.localeCompare(b.name),
    )) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(path);
        continue;
      }
      const name = relative(directory, path).replaceAll("\\", "/");
      if (name.startsWith("design/"))
        throw new Error(`Preview leaked into release build: ${name}`);
      if (/\.(html|xml|ics)$/.test(name)) routes.push(name);
      if (name.endsWith(".html") && !name.startsWith("widgets/"))
        pages[name] = pageContract(await readFile(path, "utf8"));
      // A visual release does not change feeds, event dates, crawl rules or
      // public security headers. Model HTML may gain the approved visual CSS.
      if (
        /\.(xml|ics)$/.test(name) ||
        ["robots.txt", "_headers"].includes(name)
      ) {
        immutable[name] = createHash("sha256")
          .update(await readFile(path))
          .digest("hex");
      }
    }
  }
  await walk(directory);
  if (!Object.keys(pages).length) throw new Error("No built pages found");
  return { version: 1, routes: routes.sort(), pages, immutable };
}
export function compareContracts(before, after) {
  if (before.version !== 1 || after.version !== 1)
    throw new Error("Unsupported baseline format");
  const errors = [];
  if (!isDeepStrictEqual(before.routes, after.routes))
    errors.push("Public HTML/XML/ICS route set changed");
  for (const file of new Set([
    ...Object.keys(before.pages),
    ...Object.keys(after.pages),
  ])) {
    if (!before.pages[file] || !after.pages[file]) {
      errors.push(`Page added or missing: ${file}`);
      continue;
    }
    for (const key of Object.keys(before.pages[file])) {
      if (!isDeepStrictEqual(before.pages[file][key], after.pages[file][key]))
        errors.push(`${file}: ${key} changed`);
    }
  }
  for (const file of new Set([
    ...Object.keys(before.immutable),
    ...Object.keys(after.immutable),
  ])) {
    if (before.immutable[file] !== after.immutable[file])
      errors.push(`Feed/calendar/crawl/security file changed: ${file}`);
  }
  return errors;
}
export function publicPath(file) {
  return "/" + file.replace(/(^|\/)index\.html$/, "$1");
}
export function previewPath(path, lang) {
  return (
    `/design/${lang === "hu" ? "magyar" : "english"}/` +
    path.replace(/^\/en(?=\/)/, "").replace(/^\//, "")
  );
}

export async function checkPreview(contract, baseUrl) {
  const base = new URL(baseUrl);
  if (
    base.protocol !== "http:" ||
    !["localhost", "127.0.0.1", "[::1]"].includes(base.hostname)
  ) {
    throw new Error("Preview checks require a local HTTP server");
  }
  const checks = new Map(),
    errors = [],
    cache = new Map();
  const articlePaths = new Set();
  const productionOrigins = new Set();
  for (const [file, p] of Object.entries(contract.pages)) {
    if (file === "404.html") continue;
    const route = previewPath(publicPath(file), p.lang);
    checks.set(route, { p, status: 200 });
    if (p.schemas.some((s) => s["@type"] === "BlogPosting"))
      articlePaths.add(publicPath(file));
    for (const canonical of p.canonical)
      productionOrigins.add(new URL(canonical).origin);
  }
  for (const lang of ["hu", "en"]) {
    const prefix = `/design/${lang === "hu" ? "magyar" : "english"}/`;
    checks.set(prefix + "read/", { p: { lang }, status: 200 });
    checks.set(prefix + "404/", { p: { lang }, status: 404 });
  }
  async function fetchPage(path) {
    const url = new URL(path, base);
    url.hash = "";
    if (!cache.has(url.href))
      cache.set(
        url.href,
        (async () => {
          const response = await fetch(url, {
            signal: AbortSignal.timeout(30000),
            redirect: "manual",
          });
          const html = await response.text();
          return { response, html, info: inspectHtml(html) };
        })(),
      );
    return cache.get(url.href);
  }
  const references = [],
    modelUrls = new Set();
  let articleCount = 0;
  for (const [route, { p, status }] of checks) {
    const { response, info } = await fetchPage(route);
    if (response.status !== status)
      errors.push(`${route}: HTTP ${response.status}, expected ${status}`);
    if (info.lang !== p.lang || !info.noindex)
      errors.push(`${route}: incorrect language or missing noindex`);
    const headings = info.elements.filter((n) => n.tagName === "h1");
    if (headings.length !== 1) errors.push(`${route}: expected one H1`);
    const article = p.schemas?.find((s) => s["@type"] === "BlogPosting");
    if (article) {
      articleCount++;
      if (textOf(headings[0]).trim() !== article.headline)
        errors.push(`${route}: article headline changed`);
    }
    const ids = info.elements.map((n) => attribute(n, "id")).filter(Boolean);
    if (ids.length !== new Set(ids).size)
      errors.push(`${route}: duplicate IDs`);
    const other = p.lang === "hu" ? "en" : "hu";
    const alternate = p.alternates?.find((a) => a.lang === other);
    if (alternate) {
      const expected = previewPath(new URL(alternate.url).pathname, other);
      const switcher = info.elements.find(
        (n) => n.tagName === "a" && attribute(n, "lang") === other,
      );
      if (attribute(switcher, "href") !== expected)
        errors.push(`${route}: incorrect translation link`);
    }
    if (info.elements.some((n) => n.tagName === "iframe"))
      errors.push(`${route}: model is loaded before interaction`);
    for (const node of info.elements) {
      const model = attribute(node, "data-src");
      if (model?.startsWith("/design/models/")) modelUrls.add(model);
      if (node.tagName !== "a") continue;
      const href = attribute(node, "href");
      if (!href) continue;
      const target = new URL(href, new URL(route, base));
      if (
        target.origin === base.origin &&
        target.pathname.startsWith("/design/")
      )
        references.push({ route, target });
      let inBody = false;
      for (
        let ancestor = node.parentNode;
        ancestor;
        ancestor = ancestor.parentNode
      ) {
        if (attribute(ancestor, "class")?.split(/\s+/).includes("article-body"))
          inBody = true;
      }
      if (
        inBody &&
        (target.origin === base.origin ||
          productionOrigins.has(target.origin)) &&
        articlePaths.has(target.pathname)
      ) {
        errors.push(
          `${route}: article link leaves preview without JavaScript: ${target.pathname}`,
        );
      }
    }
  }
  for (const { route, target } of references) {
    const { response, info } = await fetchPage(target.href);
    const expected = target.pathname.endsWith("/404/") ? 404 : 200;
    if (response.status !== expected)
      errors.push(`${route}: broken link ${target.pathname}`);
    if (
      target.hash &&
      !info.elements.some(
        (n) => attribute(n, "id") === decodeURIComponent(target.hash.slice(1)),
      )
    ) {
      errors.push(`${route}: missing anchor ${target.pathname}${target.hash}`);
    }
  }
  for (const name of MODEL_NAMES) {
    for (const query of ["", "?lang=en"]) {
      const expected = `/design/models/${name}.html${query}`;
      if (!modelUrls.has(expected))
        errors.push(`${expected}: missing model launch control`);
    }
  }
  for (const model of modelUrls) {
    const { response, info } = await fetchPage(model);
    if (response.status !== 200 || !info.noindex)
      errors.push(`${model}: unavailable or indexable model`);
    if (
      !info.elements.some(
        (n) => n.tagName === "body" && attribute(n, "data-design-model"),
      )
    )
      errors.push(`${model}: missing preview styling`);
  }
  return {
    pages: checks.size,
    articles: articleCount,
    models: modelUrls.size,
    links: references.length,
    errors: [...new Set(errors)],
  };
}
