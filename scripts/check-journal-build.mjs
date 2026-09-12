import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { serializeOuter } from "parse5";
import { buildContract, publicPath } from "./lib/design-release.mjs";
import { attribute, inspectHtml } from "./lib/seo-html.mjs";
import { MODEL_NAMES, isJournalModelPath } from "../src/lib/design-models.mjs";

// Integration checks on the real build. Optional HTTP verification never
// executes browser code or follows a redirect off the local server.
const directory = resolve("dist");
const base = process.argv[2] ? new URL(process.argv[2]) : undefined;
if (base)
  assert(
    base.protocol === "http:" &&
      ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname),
    "Use a local HTTP preview",
  );
const contract = await buildContract(directory);
const models = new Set(),
  assets = new Set();
let launches = 0,
  httpPages = 0;
const hasClass = (node, name) =>
  attribute(node, "class")?.split(/\s+/).includes(name);
async function get(path, status = 200) {
  const response = await fetch(new URL(path, base), {
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(response.status, status, `${path}: wrong HTTP status`);
  return response;
}
for (const [file, p] of Object.entries(contract.pages)) {
  const html = await readFile(join(directory, file), "utf8");
  const info = inspectHtml(html);
  for (const [rel, path, sizes] of [
    ["icon", "/favicon.svg", "any"],
    ["icon", "/favicon-32.png", "32x32"],
    ["apple-touch-icon", "/apple-touch-icon.png", "180x180"],
  ]) {
    const icons = info.head.filter((n) => n.tagName === "link" &&
      attribute(n, "rel") === rel && attribute(n, "sizes") === sizes);
    assert.equal(icons.length, 1, `${file}: missing/duplicate ${path}`);
    const url = new URL(attribute(icons[0], "href"), "https://lumejournal.com");
    assert.equal(url.origin, "https://lumejournal.com");
    assert.equal(url.pathname, path);
    assert.equal(url.searchParams.get("v"), "journal-monogram-1", `${file}: stale icon`);
  }
  assert.equal(
    attribute(
      info.elements.find((n) => n.tagName === "html"),
      "data-preview",
    ),
    "false",
    `${file}: wrong mode`,
  );
  assert(
    info.elements.some((n) => n.tagName === "body" && hasClass(n, "lume-next")),
    `${file}: old layout`,
  );
  assert(
    !info.elements.some((n) => hasClass(n, "study-bar")),
    `${file}: preview banner leaked`,
  );
  assert(
    !info.elements.some((n) => n.tagName === "iframe"),
    `${file}: model loaded before interaction`,
  );
  assert.equal(
    info.elements.filter((n) => n.tagName === "h1").length,
    1,
    `${file}: wrong H1 count`,
  );
  const ids = info.elements.map((n) => attribute(n, "id")).filter(Boolean);
  assert.equal(ids.length, new Set(ids).size, `${file}: duplicate IDs`);
  assert(
    !info.elements.some((n) => attribute(n, "data-viewer-image") !== undefined),
    `${file}: eager empty gallery image`,
  );
  const other = p.lang === "hu" ? "en" : "hu";
  const switcher = info.elements.find(
    (n) => n.tagName === "a" && attribute(n, "lang") === other,
  );
  const alternate = p.alternates.find((a) => a.lang === other);
  if (alternate)
    assert.equal(
      attribute(switcher, "href"),
      new URL(alternate.url).pathname,
      `${file}: wrong language switch`,
    );
  if (file === "404.html") {
    assert(info.noindex, "404 must stay noindex");
    assert(
      info.elements.some(
        (n) => n.tagName === "p" && attribute(n, "lang") === "en",
      ),
      "Shared 404 needs English help",
    );
  }
  for (const n of info.elements) {
    for (const key of ["href", "src", "data-src"]) {
      const value = attribute(n, key);
      if (!value) continue;
      const url = new URL(value, "https://lumejournal.com" + publicPath(file));
      assert(
        !url.pathname.startsWith("/design/"),
        `${file}: preview URL ${value}`,
      );
      if (key === "data-src") {
        assert(
          isJournalModelPath(url.pathname),
          `${file}: unknown model ${value}`,
        );
        assert.equal(
          url.searchParams.get("lang"),
          p.lang === "en" ? "en" : null,
          `${file}: wrong model language`,
        );
        models.add(value);
        launches++;
      }
      if (
        (n.tagName === "script" || n.tagName === "link") &&
        url.origin === "https://lumejournal.com" &&
        /\.(?:css|js)$/.test(url.pathname)
      )
        assets.add(url.pathname);
    }
  }
  if (base) {
    // Direct access to the static 404.html file is 200 in Astro preview.
    // The unknown-URL fallback is the one required to return HTTP 404 below.
    const response = await get(publicPath(file));
    assert.equal(
      await response.text(),
      html,
      `${file}: server is not serving this build`,
    );
    httpPages++;
  }
}
for (const name of MODEL_NAMES) {
  for (const query of ["", "?lang=en"])
    assert(
      models.has(`/widgets/${name}.html${query}`),
      `${name}: missing language launch`,
    );
  const source = inspectHtml(
    await readFile(`public/widgets/${name}.html`, "utf8"),
  );
  const built = inspectHtml(
    await readFile(join(directory, `widgets/${name}.html`), "utf8"),
  );
  for (const tag of ["script", "svg", "button"])
    assert.deepEqual(
      built.elements.filter((n) => n.tagName === tag).map(serializeOuter),
      source.elements.filter((n) => n.tagName === tag).map(serializeOuter),
      `${name}: changed ${tag}`,
    );
  assert.equal(
    attribute(
      built.elements.find((n) => n.tagName === "body"),
      "data-design-model",
    ),
    name,
  );
  assert.equal(
    built.head.filter(
      (n) =>
        n.tagName === "link" && attribute(n, "href") === "/widgets/journal.css",
    ).length,
    1,
  );
  assert.equal(
    built.head.filter(
      (n) =>
        attribute(n, "http-equiv")?.toLowerCase() === "content-security-policy",
    ).length,
    1,
  );
}
// Cloudflare's existing rule supplies model noindex; Astro preview does not
// emulate these response headers, so validate the deployed header artifact.
assert.match(
  await readFile(join(directory, "_headers"), "utf8"),
  /\/widgets\/\*\s+X-Robots-Tag: noindex/,
);
assets.add("/widgets/journal.css");
assets.add("/widgets/fonts.css");
assets.add("/widgets/frame-bridge.js");
for (const path of assets) await readFile(join(directory, path.slice(1)));
const css = await readFile(join(directory, "widgets/journal.css"), "utf8");
for (const icon of ["favicon.svg", "favicon-32.png", "apple-touch-icon.png"]) {
  assert.deepEqual(
    await readFile(join(directory, icon)),
    await readFile(join("public", icon)),
    `${icon}: stale icon in build`,
  );
}
assert(
  !css.includes("@import"),
  "Model CSS must have its local palette bundled",
);
assert(
  css.includes("--paper") && css.includes("data-design-model"),
  "Missing model visual layer",
);
if (base) {
  for (const path of [...models, ...assets]) {
    const response = await get(path);
    const type = path.endsWith(".css")
      ? "text/css"
      : path.endsWith(".js")
        ? "javascript"
        : "text/html";
    assert(
      response.headers.get("content-type")?.includes(type),
      `${path}: wrong MIME`,
    );
    await response.arrayBuffer();
  }
  for (const path of [
    "/ellenorzes-ismeretlen-oldal/",
    "/en/check-missing-page/",
  ]) {
    const response = await get(path, 404);
    const info = inspectHtml(await response.text());
    assert(
      info.noindex && info.elements.some((n) => hasClass(n, "journal-404")),
      `${path}: not the journal 404`,
    );
  }
}
console.log(
  JSON.stringify(
    {
      pages: Object.keys(contract.pages).length,
      modelLanguages: models.size,
      launchControls: launches,
      localAssets: assets.size,
      httpPages,
      unknownRoutes: base ? 2 : 0,
      errors: 0,
    },
    null,
    2,
  ),
);
