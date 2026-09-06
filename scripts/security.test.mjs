import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { inspectHtml, attribute } from './lib/seo-html.mjs';
import { hash, secureHtml } from './lib/security-policy.mjs';

const page = (body) => `<!doctype html><html><head><meta charset="utf-8"><title>Test</title></head><body>${body}</body></html>`;
test('CSP precedes resources, hashes exact parsed script/style text and preserves markup', () => {
  const source = page('<style>p{color:red}</style><script>\r\nwindow.test = 1;\r\n</script>');
  const secured = secureHtml(source);
  const meta = inspectHtml(secured).head.find((node) => attribute(node, 'http-equiv') === 'Content-Security-Policy');
  const policy = attribute(meta, 'content');
  assert(policy.includes(hash('\nwindow.test = 1;\n')));
  assert(policy.includes(hash('p{color:red}')));
  assert(!policy.match(/script-src[^;]*unsafe/));
  assert(secured.indexOf('Content-Security-Policy') < secured.indexOf('<style>'));
  assert(secured.endsWith(source.slice(source.indexOf('<title>'))));
  assert.throws(() => secureHtml(secured), /already present/);
});
test('Unsafe inline handlers, executable URLs, foreign scripts and frames fail the build', () => {
  for (const markup of [
    '<img src="/image.png" onerror="alert(1)">', '<a href="java&#x09;script:alert(1)">link</a>',
    '<script src="https://foreign.example/code.js"></script>', '<script src="//foreign.example/code.js"></script>',
    '<iframe srcdoc="test"></iframe>', '<iframe src="/not-a-model/"></iframe>', '<base href="https://foreign.example/">',
  ]) assert.throws(() => secureHtml(page(markup)));
  assert.doesNotThrow(() => secureHtml(page('<iframe src="/widgets/rotor.html?lang=en"></iframe>')));
});

const bridge = readFileSync(new URL('../public/widgets/frame-bridge.js', import.meta.url), 'utf8');
function fixture(child = false) {
  const origin = 'https://lumejournal.com';
  const messages = [], changes = [], handlers = {};
  const parent = { postMessage: (...args) => messages.push(args) };
  const frame = { getAttribute: () => '/widgets/rotor.html?lang=hu', contentWindow: parent, style: { height: '760px' } };
  const document = {
    querySelectorAll: () => [frame],
    querySelector: () => ({ getBoundingClientRect: () => ({ height: 900 }) }),
    body: { classList: { add() {} } },
  };
  const window = {
    location: { origin, href: `${origin}/muhely/` },
    addEventListener: (type, fn) => { handlers[type] = fn; },
  };
  window.parent = child ? parent : window;
  runInNewContext(bridge, { window, document, URL, ResizeObserver: class { observe() {} } });
  if (child) window.LumeFrames.bindChild((value) => changes.push(value), 26, false);
  else window.LumeFrames.bindParent(() => true);
  return { origin, messages, changes, handlers, frame, parent };
}
test('Parent only accepts its own model, same origin and a finite, bounded numeric height', () => {
  const f = fixture();
  const send = (data, origin = f.origin, source = f.parent) => f.handlers.message({ origin, source, data });
  send({ type: 'lume:height', height: 1000 }, 'https://foreign.example');
  send({ type: 'lume:height', height: 1000 }, f.origin, {});
  for (const height of ['999', Infinity, NaN, -2, 0, 999999, {}, null]) send({ type: 'lume:height', height });
  assert.equal(f.frame.style.height, '760px');
  send({ type: 'lume:height', height: 1000.5 });
  assert.equal(f.frame.style.height, '1001px');
  send({ type: 'lume:ready' });
  assert.equal(f.messages[0][1], f.origin);
  assert.equal(f.messages[0][0].dark, true);
  f.frame.getAttribute = () => 'https://foreign.example/widgets/rotor.html';
  send({ type: 'lume:height', height: 800 });
  assert.equal(f.frame.style.height, '1001px');
});
test('Child rejects cross-origin, sibling, malformed and non-boolean theme messages', () => {
  const f = fixture(true);
  const send = (data, origin = f.origin, source = f.parent) => f.handlers.message({ origin, source, data });
  send({ type: 'lume:lights', dark: true }, 'https://foreign.example');
  send({ type: 'lume:lights', dark: true }, f.origin, {});
  for (const dark of [1, 'false', {}, null]) send({ type: 'lume:lights', dark });
  send(null); send([]);
  assert.equal(f.changes.length, 0);
  send({ type: 'lume:lights', dark: true });
  send({ type: 'lume:lights', dark: false });
  assert.deepEqual(f.changes, [true, false]);
  assert(f.messages.every(([, targetOrigin]) => targetOrigin === f.origin));
});
