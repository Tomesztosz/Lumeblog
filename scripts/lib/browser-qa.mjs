import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve, sep, extname } from 'node:path';
import { createServer } from 'node:http';
import assert from 'node:assert/strict';

export const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
export async function localSite(directory = 'dist') {
  const root = resolve(directory);
  const server = createServer(async (request, response) => {
    try {
      let path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (path.endsWith('/')) path += 'index.html';
      const file = resolve(root, '.' + path);
      assert(file.startsWith(root + sep));
      const bytes = await readFile(file);
      const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml' };
      response.setHeader('Content-Type', mime[extname(file)] ?? 'application/octet-stream');
      response.end(bytes);
    } catch { response.writeHead(404); response.end('Not found'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return { origin: `http://127.0.0.1:${server.address().port}`, close: () => server.close() };
}
export async function openBrowser(output) {
  await mkdir(output, { recursive: true });
  const profile = await mkdtemp(join(resolve(output), 'browser-'));
  const browser = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-background-networking', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let port;
  for (let n = 0; n < 100; n++) {
    try { port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; }
    catch { await pause(100); }
  }
  if (!port) { browser.kill(); throw new Error('Chrome did not start'); }
  const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const ws = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
  await new Promise((ok, fail) => { ws.onopen = ok; ws.onerror = fail; });
  const pending = new Map(), events = [];
  let id = 0;
  ws.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (!message.id) { events.push(message); return; }
    const item = pending.get(message.id);
    if (!item) return;
    clearTimeout(item.timer); pending.delete(message.id);
    if (message.error) item.fail(new Error(JSON.stringify(message.error))); else item.ok(message.result);
  };
  const send = (method, params = {}) => new Promise((ok, fail) => {
    const key = ++id;
    const timer = setTimeout(() => { pending.delete(key); fail(new Error(`Timeout: ${method}`)); }, 15000);
    pending.set(key, { ok, fail, timer }); ws.send(JSON.stringify({ id: key, method, params }));
  });
  const evaluate = async expression => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    assert(!r.exceptionDetails, JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };
  await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');
  return { send, evaluate, events,
    navigate: async (url, width = 1440) => {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
      await send('Page.navigate', { url });
      for (let n = 0; n < 100; n++) {
        await pause(100);
        try { if (await evaluate(`location.href === ${JSON.stringify(url)} && document.readyState === 'complete'`)) { await pause(150); return; } } catch { /* Navigation replaces the execution context. */ }
      }
      throw new Error(`Navigation did not complete: ${url}`);
    },
    screenshot: async name => { const r = await send('Page.captureScreenshot', { format: 'png' }); await writeFile(join(output, name), Buffer.from(r.data, 'base64')); },
    close: async () => { try { await send('Browser.close'); } finally { ws.close(); if (browser.exitCode === null) browser.kill(); } },
  };
}
