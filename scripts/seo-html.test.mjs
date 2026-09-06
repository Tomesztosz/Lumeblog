import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectHtml, textOf } from './lib/seo-html.mjs';

test('Parses entities, exact language pairs and graph data from HTML', () => {
  const result = inspectHtml(`<!doctype html><html lang="hu"><head>
    <title>Órák &amp; szerkezetek</title>
    <meta content="index, follow, max-image-preview:large" name="robots">
    <link href="https://lumejournal.com/szerkezet/gatlomu/" rel="canonical">
    <link href="https://lumejournal.com/en/movement/escapement/" hreflang="en" rel="alternate">
    <script type="application/ld+json">{"@graph":[{"@type":"BlogPosting","headline":"Gátlómű"}]}</script>
    </head><body><h1>Gátlómű</h1></body></html>`);
  assert.equal(result.lang, 'hu');
  assert.equal(result.titles[0], 'Órák & szerkezetek');
  assert.equal(result.noindex, false);
  assert.deepEqual(result.alternates, [{ lang: 'en', url: 'https://lumejournal.com/en/movement/escapement/' }]);
  assert.equal(result.schemas[0].headline, textOf(result.elements.find((item) => item.tagName === 'h1')));
});

test('Keeps duplicates visible to the validator instead of silently overwriting them', () => {
  const result = inspectHtml('<head><meta name="description" content="one"><meta name="description" content="two"><link rel="canonical" href="/a/"><link rel="canonical" href="/b/"></head>');
  assert.deepEqual(result.meta('description'), ['one', 'two']);
  assert.deepEqual(result.canonical, ['/a/', '/b/']);
});

test('Recognizes intentional noindex and fails malformed structured data', () => {
  assert.equal(inspectHtml('<head><meta name="robots" content="noindex, follow"></head>').noindex, true);
  assert.throws(() => inspectHtml('<script type="application/ld+json">{broken}</script>'));
});

test('Metadata in the body cannot masquerade as head metadata', () => {
  const page = inspectHtml('<head><title>Valid</title></head><body><meta property="og:image" content="wrong"></body>');
  assert.equal(page.meta('og:image').length, 0);
});
