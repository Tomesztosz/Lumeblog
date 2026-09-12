import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { parse, serializeOuter } from "parse5";
import {
  MODEL_NAMES,
  designModelSource,
  isDesignModelPath,
  isJournalModelPath,
  renderDesignModel,
} from "../src/lib/design-models.mjs";
import { bindDesignFrames } from "../src/lib/design-frames.ts";

function elements(node, tag, result = []) {
  if (node.tagName === tag) result.push(node);
  for (const child of node.childNodes ?? []) elements(child, tag, result);
  return result;
}
const attr = (node, name) => node.attrs?.find((a) => a.name === name)?.value;
const css = readFileSync(
  new URL("../src/styles/design-model.css", import.meta.url),
  "utf8",
);

test("Only the seven known first-party models can be routed into preview", () => {
  assert.equal(MODEL_NAMES.length, 7);
  for (const name of MODEL_NAMES) {
    for (const query of ["", "?lang=en"]) {
      const output = designModelSource(`/widgets/${name}.html${query}`);
      assert.equal(output, `/design/models/${name}.html${query}`);
      assert(isDesignModelPath(output.split("?")[0]));
    }
  }
  for (const path of [
    "/widgets/unknown.html",
    "/widgets/../rotor.html",
    "//other.test/widgets/rotor.html",
    "https://other.test/widgets/rotor.html",
    "/widgets/%2e%2e/rotor.html",
  ]) {
    assert.throws(() => designModelSource(path));
    assert(!isDesignModelPath(path));
  }
  assert.throws(() => renderDesignModel("", css, "../unknown"));
});

for (const name of MODEL_NAMES)
  test(`${name}: preserve original content, scripts and SVG geometry`, () => {
    const original = readFileSync(
      new URL(`../public/widgets/${name}.html`, import.meta.url),
      "utf8",
    );
    const rendered = renderDesignModel(original, css, name);
    const before = parse(original),
      after = parse(rendered);
    assert.deepEqual(
      elements(after, "script").map(serializeOuter),
      elements(before, "script").map(serializeOuter),
    );
    assert.deepEqual(
      elements(after, "svg").map(serializeOuter),
      elements(before, "svg").map(serializeOuter),
    );
    assert.deepEqual(
      elements(after, "button").map(serializeOuter),
      elements(before, "button").map(serializeOuter),
    );
    assert.equal(
      elements(after, "body")[0].childNodes.map(serializeOuter).join(""),
      elements(before, "body")[0].childNodes.map(serializeOuter).join(""),
    );
    assert.equal(attr(elements(after, "body")[0], "data-design-model"), name);
    assert(
      elements(after, "meta").some(
        (n) =>
          attr(n, "name") === "robots" &&
          attr(n, "content") === "noindex,nofollow",
      ),
    );
    assert.equal(
      elements(after, "style").length,
      elements(before, "style").length + 1,
    );
  });

test("Public and preview model allowlists cannot be mixed", () => {
  for (const name of MODEL_NAMES) {
    assert(isJournalModelPath(`/widgets/${name}.html`));
    assert(!isJournalModelPath(`/design/models/${name}.html`));
    assert(isJournalModelPath(`/design/models/${name}.html`, true));
    assert(!isJournalModelPath(`/widgets/${name}.html`, true));
  }
  for (const path of [
    "/widgets/unknown.html",
    "//external.test/widgets/rotor.html",
    "/widgets/../rotor.html",
    "/widgets/%2e%2e/rotor.html",
  ]) {
    assert(!isJournalModelPath(path));
  }
});

for (const preview of [true, false])
  test(`${preview ? "Preview" : "Public"} bridge rejects foreign origins, windows, paths and invalid heights`, (t) => {
    const origin = "http://localhost:4332";
    const messages = [],
      handlers = {};
    const child = { postMessage: (...args) => messages.push(args) };
    let src = preview
      ? "/design/models/rotor.html?lang=en"
      : "/widgets/rotor.html?lang=en";
    const frame = {
      getAttribute: () => src,
      contentWindow: child,
      style: { height: "760px" },
    };
    const globals = ["window", "location", "document"];
    const previous = globals.map((name) =>
      Object.getOwnPropertyDescriptor(globalThis, name),
    );
    t.after(() =>
      globals.forEach((name, i) =>
        previous[i]
          ? Object.defineProperty(globalThis, name, previous[i])
          : delete globalThis[name],
      ),
    );
    Object.defineProperties(globalThis, {
      window: {
        configurable: true,
        value: { addEventListener: (type, fn) => (handlers[type] = fn) },
      },
      location: {
        configurable: true,
        value: { origin, href: `${origin}/design/magyar/muhely/` },
      },
      document: {
        configurable: true,
        value: { querySelectorAll: () => [frame] },
      },
    });
    let dark = true;
    const bridge = bindDesignFrames(() => dark, preview);
    const send = (data, from = origin, source = child) =>
      handlers.message({ origin: from, source, data });
    send({ type: "lume:height", height: 900 }, "https://other.test");
    send({ type: "lume:height", height: 900 }, origin, {});
    for (const height of [null, "900", Infinity, NaN, -1, 0, 6001, {}])
      send({ type: "lume:height", height });
    send(null);
    send([]);
    send("invalid");
    assert.equal(frame.style.height, "760px");
    send({ type: "lume:height", height: 901.2 });
    assert.equal(frame.style.height, "902px");
    send({ type: "lume:ready" });
    dark = false;
    bridge.broadcast();
    assert.deepEqual(messages, [
      [{ type: "lume:lights", dark: true }, origin],
      [{ type: "lume:lights", dark: false }, origin],
    ]);
    for (src of [
      "https://other.test/design/models/rotor.html",
      preview ? "/widgets/rotor.html" : "/design/models/rotor.html",
      "/design/models/unknown.html",
    ]) {
      send({ type: "lume:height", height: 200 });
      bridge.broadcast();
    }
    assert.equal(frame.style.height, "902px");
    assert.equal(messages.length, 2);
  });
