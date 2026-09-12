import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { previewArticleHref } from "../src/lib/design-links.mjs";
import { MODEL_NAMES } from "../src/lib/design-models.mjs";
import {
  pageContract,
  buildContract,
  compareContracts,
  publicPath,
  previewPath,
  checkPreview,
} from "./lib/design-release.mjs";

const origin = "https://lumejournal.com";
const preview = "http://127.0.0.1:4332";
const paths = { hu: "/szerkezet/rotor/", en: "/en/movement/rotor/" };
const links = Object.fromEntries(
  Object.entries(paths).map(([lang, path]) => [path, previewPath(path, lang)]),
);
const base = preview + links[paths.hu];

test("Known published article links are rendered into the preview with query and anchor intact", () => {
  for (const path of Object.values(paths)) {
    for (const prefix of ["", origin, preview]) {
      const href = prefix + path + "?source=article#fejezet";
      assert.equal(
        previewArticleHref(href, links, base, origin),
        links[path] + "?source=article#fejezet",
      );
    }
  }
  assert.equal(
    previewArticleHref("../../../../szerkezet/rotor/", links, base, origin),
    links[paths.hu],
  );
});

test("External, unknown, unpublished and same-page destinations are not rewritten", () => {
  for (const href of [
    "#fejezet",
    "?source=reader",
    "",
    "/szerkezet/future-draft/",
    "/public/img/rotor.jpg",
    "/widgets/rotor.html",
    "/rss.xml",
    links[paths.hu],
    "https://external.test/szerkezet/rotor/",
    "//external.test/szerkezet/rotor/",
    "mailto:hello@lumejournal.com",
    "tel:+361234567",
    "javascript:void(0)",
    "data:text/plain,hello",
    "https://[invalid",
  ])
    assert.equal(previewArticleHref(href, links, base, origin), href);
  assert.equal(previewArticleHref(paths.hu, {}, base, origin), paths.hu);
  assert.equal(
    previewArticleHref(paths.hu, links, "invalid", origin),
    paths.hu,
  );
  assert.equal(
    previewArticleHref(
      paths.hu,
      { [paths.hu]: "https://external.test/" },
      base,
      origin,
    ),
    paths.hu,
  );
});

function html(lang = "hu", body = "<h1>Rotor</h1>", robots = "index,follow") {
  return `<!doctype html><html lang="${lang}"><head>
    <title>Rotor | Lume</title><meta name="description" content="A rotor története">
    <meta name="robots" content="${robots}"><meta property="og:image" content="${origin}/rotor.webp">
    <link rel="canonical" href="${origin}${paths[lang]}">
    <link rel="alternate" hreflang="hu" href="${origin}${paths.hu}">
    <link rel="alternate" hreflang="en" href="${origin}${paths.en}">
    <link rel="alternate" type="application/rss+xml" title="Lume" href="/rss.xml">
    <script type="application/ld+json">${JSON.stringify({ "@type": "BlogPosting", headline: "Rotor", datePublished: "2026-09-01", image: origin + "/rotor.webp" })}</script>
    </head><body>${body}</body></html>`;
}
function contract() {
  return {
    version: 1,
    routes: ["index.html", "rss.xml"],
    pages: { "index.html": pageContract(html()) },
    immutable: {
      "rss.xml": "feed-hash",
      "event.ics": "calendar-hash",
      "robots.txt": "crawl-hash",
      _headers: "security-hash",
    },
  };
}

test("The release baseline allows visual markup and CSS changes, preserving SEO", () => {
  const before = contract(),
    after = contract();
  after.pages["index.html"] = pageContract(
    html(
      "hu",
      '<main class="new"><h1>Rotor</h1><button>Új</button></main>',
    ).replace(
      "</head>",
      '<link rel="stylesheet" href="/_astro/new.css"></head>',
    ),
  );
  assert.deepEqual(compareContracts(before, after), []);
});

for (const field of [
  "lang",
  "titles",
  "canonical",
  "alternates",
  "meta",
  "schemas",
  "rss",
]) {
  test(`Release baseline detects changed ${field}`, () => {
    const before = contract(),
      after = structuredClone(before);
    after.pages["index.html"][field] = null;
    assert.deepEqual(compareContracts(before, after), [
      `index.html: ${field} changed`,
    ]);
  });
}

test("Schema publication dates, images and search/share descriptions are protected", () => {
  for (const mutate of [
    (p) => (p.schemas[0].datePublished = "2026-09-02"),
    (p) => (p.schemas[0].image = origin + "/changed.webp"),
    (p) => (p.meta.description = ["Changed"]),
    (p) => (p.meta["og:image"] = [origin + "/changed.webp"]),
    (p) => (p.meta.robots = ["noindex"]),
  ]) {
    const before = contract(),
      after = structuredClone(before);
    mutate(after.pages["index.html"]);
    assert.equal(compareContracts(before, after).length, 1);
  }
});

test("Routes, added/removed pages and protected files cannot silently change", () => {
  const before = contract(),
    after = structuredClone(before);
  after.routes.push("extra.html");
  after.pages["extra.html"] = after.pages["index.html"];
  delete after.pages["index.html"];
  for (const file of Object.keys(after.immutable))
    after.immutable[file] = "changed";
  const errors = compareContracts(before, after);
  assert(errors.some((e) => e.includes("route set")));
  assert(errors.some((e) => e.includes("missing: index.html")));
  assert(errors.some((e) => e.includes("missing: extra.html")));
  for (const file of Object.keys(after.immutable))
    assert(errors.some((e) => e.endsWith(`changed: ${file}`)));
  assert.throws(
    () => compareContracts({ ...before, version: 2 }, after),
    /Unsupported/,
  );
});

test("Reordering independent alternate links or JSON-LD nodes does not change their meaning", () => {
  const alternates = [
    '<link hreflang="hu" href="/hu/">',
    '<link hreflang="en" href="/en/">',
  ];
  const nodes = [
    { "@type": "WebSite", "@id": "#site" },
    { "@type": "Organization", "@id": "#org" },
  ];
  const make = (linksHtml, graph) =>
    pageContract(
      `<head>${linksHtml}<script type="application/ld+json">${JSON.stringify({ "@graph": graph })}</script></head>`,
    );
  assert.deepEqual(
    make(alternates.join(""), nodes),
    make(alternates.toReversed().join(""), nodes.toReversed()),
  );
});

test("Build inspection separates page SEO from widgets and protects feeds, dates and headers", async (t) => {
  // Only this freshly created, uniquely named test directory is cleaned up.
  const dir = await mkdtemp(join(tmpdir(), "lume-design-release-test-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  await mkdir(join(dir, "widgets"));
  await writeFile(join(dir, "index.html"), html());
  await writeFile(
    join(dir, "widgets/rotor.html"),
    "<html><body>model</body></html>",
  );
  await writeFile(join(dir, "rss.xml"), "<rss/>");
  await writeFile(join(dir, "event.ics"), "BEGIN:VCALENDAR");
  await writeFile(join(dir, "robots.txt"), "User-agent: *");
  await writeFile(join(dir, "_headers"), "X-Content-Type-Options: nosniff");
  const result = await buildContract(dir);
  assert.deepEqual(result.routes, [
    "event.ics",
    "index.html",
    "rss.xml",
    "widgets/rotor.html",
  ]);
  assert.deepEqual(Object.keys(result.pages), ["index.html"]);
  assert.equal(Object.keys(result.immutable).length, 4);
  assert.equal(result.immutable["rss.xml"].length, 64);
  await mkdir(join(dir, "design"));
  await writeFile(join(dir, "design/index.html"), html());
  await assert.rejects(buildContract(dir), /Preview leaked/);
});

test("Public and bilingual preview paths retain the existing slugs", () => {
  assert.equal(publicPath("index.html"), "/");
  assert.equal(publicPath("en/index.html"), "/en/");
  assert.equal(publicPath("szerkezet/rotor/index.html"), paths.hu);
  assert.equal(publicPath("404.html"), "/404.html");
  assert.equal(previewPath("/", "hu"), "/design/magyar/");
  assert.equal(previewPath("/en/", "en"), "/design/english/");
  assert.equal(previewPath(paths.en, "en"), "/design/english/movement/rotor/");
});

test("Preview audit checks links, translations, anchors, lazy models and HTTP errors without executing scripts", async (t) => {
  const pages = {},
    responses = new Map();
  for (const lang of ["hu", "en"]) {
    const other = lang === "hu" ? "en" : "hu";
    pages[paths[lang].slice(1) + "index.html"] = pageContract(html(lang));
    const prefix = previewPath(lang === "hu" ? "/" : "/en/", lang);
    for (const [path, status] of [
      ["read/", 200],
      ["404/", 404],
    ]) {
      responses.set(prefix + path, {
        status,
        body: html(lang, "<h1>Rotor</h1>", "noindex,nofollow"),
      });
    }
    const controls = MODEL_NAMES.map((name) => {
      const src = `/design/models/${name}.html${lang === "en" ? "?lang=en" : ""}`;
      responses.set(src, {
        status: 200,
        body: `<html><head><meta name="robots" content="noindex"></head><body data-design-model="${name}"></body></html>`,
      });
      return `<button data-src="${src}">Indítás</button>`;
    }).join("");
    responses.set(links[paths[lang]], {
      status: 200,
      body: html(
        lang,
        `<h1>Rotor</h1><a lang="${other}" href="${links[paths[other]]}">Nyelv</a>
      <div class="article-body"><a href="${links[paths[other]]}#fejezet">Cikk</a><h2 id="fejezet">Fejezet</h2>${controls}</div>`,
        "noindex,nofollow",
      ),
    });
  }
  t.mock.method(globalThis, "fetch", async (url, init) => {
    assert.equal(url.origin, preview);
    assert.equal(init.redirect, "manual");
    const { body, status } = responses.get(url.pathname + url.search) ?? {
      status: 404,
      body: "<h1>Missing</h1>",
    };
    return new Response(body, { status });
  });
  const audit = { pages };
  const success = await checkPreview(audit, preview);
  assert.deepEqual(success, {
    pages: 6,
    articles: 2,
    models: 14,
    links: 4,
    errors: [],
  });
  responses.set(links[paths.hu], {
    status: 200,
    body: html(
      "hu",
      `<h1>Changed</h1><a lang="en" href="/wrong/">EN</a><iframe></iframe>
    <div class="article-body"><a href="${paths.en}">Old link</a><a href="${links[paths.en]}#missing">Missing anchor</a>
    <a href="/design/missing/">Broken link</a><p id="dup"></p><p id="dup"></p></div>`,
      "index,follow",
    ),
  });
  responses.set("/design/models/rotor.html?lang=en", {
    status: 404,
    body: "<h1>Missing</h1>",
  });
  const failure = await checkPreview(audit, preview);
  for (const message of [
    "missing noindex",
    "headline changed",
    "duplicate IDs",
    "translation link",
    "before interaction",
    "leaves preview",
    "missing anchor",
    "broken link",
    "missing model launch control",
    "unavailable or indexable model",
    "missing preview styling",
  ]) {
    assert(
      failure.errors.some((e) => e.includes(message)),
      `Expected failure for: ${message}`,
    );
  }
  await assert.rejects(
    checkPreview(audit, "https://lumejournal.com"),
    /local HTTP/,
  );
});
