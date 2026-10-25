/* ============================================================
   LUME · Kirakat hírlevél Worker
   Csak a /api/* kéréseket kapja meg (wrangler.toml → run_worker_first).
   Minden más kérés a statikus dist/ fájlokból megy ki, ugyanúgy, mint eddig.

   Végpontok:
     POST /api/kirakat/subscribe          feliratkozás (megerősítő levelet küld)
     GET  /api/kirakat/confirm?t=...      megerősítés a levélből
     GET  /api/kirakat/unsubscribe?t=...  leiratkozás a levélből
     POST /api/kirakat/unsubscribe?t=...  egykattintásos leiratkozás (RFC 8058)
     GET  /api/kirakat/admin/stats          létszám (ADMIN_TOKEN kell)
     POST /api/kirakat/admin/send           egy szám kiküldése (ADMIN_TOKEN kell)
     POST /api/kirakat/admin/confirmations  sorban álló megerősítő levelek kiküldése

   Beállítás nélkül is elindul: a táblákat első kéréskor maga hozza létre,
   és ha nincs még levélküldő, a feliratkozásokat sorba állítja. A megerősítő
   leveleket a küldő beállítása után az admin/confirmations végpont küldi ki.

   Titkok (wrangler secret put), mind elhagyható az induláshoz:
     ADMIN_TOKEN        a küldő parancs ezzel azonosítja magát (enélkül nincs admin)
     KIRAKAT_SECRET     a leiratkozó linkek aláírásához (enélkül generál egyet)
     RESEND_API_KEY     csak ha EMAIL_PROVIDER = "resend"
     KIRAKAT_REPLY_TO   erre a címre mennek az olvasók válaszai (elhagyható)
   ============================================================ */

import { confirmationMail } from './mail.js';

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
};

const HOUR = 3600;
const CONFIRM_TTL = 48 * HOUR;
const RESEND_COOLDOWN = 10 * 60;
const PENDING_TTL = 7 * 24 * HOUR;
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/kirakat/')) {
      return env.ASSETS ? env.ASSETS.fetch(request) : notFound();
    }
    if (!env.DB) return json({ ok: false, error: 'not_configured' }, 503);

    const route = url.pathname.slice('/api/kirakat/'.length).replace(/\/$/, '');
    try {
      await ensureSchema(env);
      if (route === 'subscribe' && request.method === 'POST') return await subscribe(request, env, url);
      if (route === 'confirm' && request.method === 'GET') return await confirm(env, url);
      if (route === 'unsubscribe' && (request.method === 'GET' || request.method === 'POST')) {
        return await unsubscribe(request, env, url);
      }
      if (route.startsWith('admin/')) {
        if (!(await isAdmin(request, env))) return json({ ok: false, error: 'unauthorized' }, 401);
        if (route === 'admin/stats' && request.method === 'GET') return await stats(env);
        if (route === 'admin/send' && request.method === 'POST') return await sendIssue(request, env, url);
        if (route === 'admin/confirmations' && request.method === 'POST') return await sendConfirmations(request, env, url);
      }
      return notFound();
    } catch (err) {
      console.error('kirakat', route, err && err.message);
      return json({ ok: false, error: 'server' }, 500);
    }
  },
};

/* ---------- feliratkozás ---------- */

async function subscribe(request, env, url) {
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== url.host) return json({ ok: false, error: 'origin' }, 403);

  const body = await readJson(request, 2048);
  if (!body) return json({ ok: false, error: 'bad_request' }, 400);

  // Csapda a robotoknak: ezt a mezőt ember nem látja és nem tölti ki.
  if (typeof body.website === 'string' && body.website.trim() !== '') return json({ ok: true });

  const email = String(body.email || '').trim().toLowerCase();
  const lang = body.lang === 'en' ? 'en' : 'hu';
  if (email.length > 254 || !EMAIL_RE.test(email)) return json({ ok: false, error: 'email' }, 422);

  const now = nowSec();
  await env.DB.prepare(
    `DELETE FROM subscribers WHERE status = 'pending' AND last_mail_at IS NOT NULL AND last_mail_at < ?`,
  ).bind(now - PENDING_TTL).run();

  const existing = await env.DB.prepare(`SELECT * FROM subscribers WHERE email = ?`).bind(email).first();

  // Aki már fent van, annak nem küldünk újra levelet, és a válasz sem árulja el,
  // hogy a cím már szerepel a listán.
  if (existing && existing.status === 'confirmed') return json({ ok: true });
  if (existing && existing.last_mail_at && now - existing.last_mail_at < RESEND_COOLDOWN) return json({ ok: true });

  const consent = `kirakat-v1 ${lang} ${new Date(now * 1000).toISOString()}`;

  // Még nincs levélküldő: elmentjük a címet, a megerősítő levél később megy ki.
  if (!mailReady(env)) {
    if (existing) {
      await env.DB.prepare(`UPDATE subscribers SET lang = ?, status = 'pending', consent = ? WHERE id = ?`)
        .bind(lang, consent, existing.id).run();
    } else {
      await env.DB.prepare(
        `INSERT INTO subscribers (email, lang, status, consent, created_at) VALUES (?, ?, 'pending', ?, ?)`,
      ).bind(email, lang, consent, now).run();
    }
    return json({ ok: true, queued: true });
  }

  const token = randomToken();
  const hash = await sha256(token);

  if (existing) {
    await env.DB.prepare(
      `UPDATE subscribers SET lang = ?, status = 'pending', confirm_hash = ?, confirm_expires = ?,
       last_mail_at = ?, consent = ? WHERE id = ?`,
    ).bind(lang, hash, now + CONFIRM_TTL, now, consent, existing.id).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO subscribers (email, lang, status, confirm_hash, confirm_expires, last_mail_at, consent, created_at)
       VALUES (?, ?, 'pending', ?, ?, ?, ?, ?)`,
    ).bind(email, lang, hash, now + CONFIRM_TTL, now, consent, now).run();
  }

  const link = `${site(env, url)}/api/kirakat/confirm?t=${token}`;
  const mail = confirmationMail(lang, link);
  try {
    await provider(env).send([{ to: email, from: env.KIRAKAT_FROM, subject: mail.subject, html: mail.html, text: mail.text }]);
  } catch (err) {
    // A levélküldés elbukott (rossz feladó, lejárt kulcs, napi keret). A feliratkozás
    // nem vész el: sorba áll, és az admin/confirmations később kiküldi a levelet.
    console.error('kirakat confirm-mail', err && err.message);
    await env.DB.prepare(
      `UPDATE subscribers SET confirm_hash = NULL, confirm_expires = NULL, last_mail_at = NULL WHERE email = ?`,
    ).bind(email).run();
    return json({ ok: true, queued: true });
  }
  return json({ ok: true });
}

async function confirm(env, url) {
  const token = url.searchParams.get('t') || '';
  if (!/^[a-f0-9]{64}$/.test(token)) return back(env, url, 'hu', 'kirakat-hiba');
  const hash = await sha256(token);
  const row = await env.DB.prepare(`SELECT * FROM subscribers WHERE confirm_hash = ?`).bind(hash).first();
  if (!row) return back(env, url, 'hu', 'kirakat-hiba');
  // Második kattintás ugyanarra a linkre: már fent van, ezt mondjuk neki.
  if (row.status === 'confirmed') return back(env, url, row.lang, 'kirakat-fent');
  if (row.confirm_expires < nowSec()) return back(env, url, row.lang, 'kirakat-lejart');
  await env.DB.prepare(
    `UPDATE subscribers SET status = 'confirmed', confirmed_at = ? WHERE id = ?`,
  ).bind(nowSec(), row.id).run();
  return back(env, url, row.lang, 'kirakat-fent');
}

async function unsubscribe(request, env, url) {
  const id = await verifyUnsubscribe(env, url.searchParams.get('t') || '');
  if (!id) {
    return request.method === 'POST' ? json({ ok: false }, 400) : back(env, url, 'hu', 'kirakat-hiba');
  }
  const row = await env.DB.prepare(`SELECT lang FROM subscribers WHERE id = ?`).bind(id).first();
  await env.DB.prepare(
    `UPDATE subscribers SET status = 'unsubscribed', unsubscribed_at = ?, confirm_hash = NULL WHERE id = ?`,
  ).bind(nowSec(), id).run();
  if (request.method === 'POST') return json({ ok: true });
  return back(env, url, row ? row.lang : 'hu', 'kirakat-le');
}

/* ---------- admin ---------- */

async function stats(env) {
  const { results } = await env.DB.prepare(
    `SELECT status, lang, COUNT(*) AS n FROM subscribers GROUP BY status, lang`,
  ).all();
  const queued = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM subscribers WHERE status = 'pending' AND last_mail_at IS NULL`,
  ).first();
  return json({
    ok: true, provider: providerName(env), mailReady: mailReady(env), dailyLimit: dailyLimit(env),
    queued: queued ? queued.n : 0, counts: results,
  });
}

/* A kiküldő parancs (scripts/kirakat.mjs) ide küldi a kész levelet.
   A levélben a {{UNSUBSCRIBE}} helyére kerül a címzett saját leiratkozó linkje.
   Egy hívás legfeljebb `limit` címzettnek küld. Aki már megkapta, kimarad,
   így a parancs másnap újrafuttatva ott folytatja, ahol abbahagyta. */
async function sendIssue(request, env, url) {
  const body = await readJson(request, 512 * 1024);
  if (!body || !body.issue || !body.subject || !body.html || !body.text) {
    return json({ ok: false, error: 'bad_request' }, 400);
  }
  const issue = String(body.issue).slice(0, 80);
  const lang = body.lang === 'en' ? 'en' : 'hu';
  const base = site(env, url);
  const mailer = provider(env);

  if (body.test) {
    const to = String(body.test).trim().toLowerCase();
    if (!EMAIL_RE.test(to)) return json({ ok: false, error: 'email' }, 422);
    const unsub = `${base}/api/kirakat/unsubscribe?t=teszt`;
    await mailer.send([personalize(env, body, to, unsub)]);
    return json({ ok: true, test: to });
  }

  const limit = Math.max(1, Math.min(Number(body.limit) || dailyLimit(env), 100));
  const { results } = await env.DB.prepare(
    `SELECT s.id, s.email FROM subscribers s
     WHERE s.status = 'confirmed' AND s.lang = ?
       AND NOT EXISTS (SELECT 1 FROM deliveries d WHERE d.issue = ? AND d.subscriber_id = s.id)
     ORDER BY s.id LIMIT ?`,
  ).bind(lang, issue, limit).all();

  if (results.length === 0) return json({ ok: true, sent: 0, remaining: 0 });

  const messages = [];
  for (const r of results) {
    const unsub = `${base}/api/kirakat/unsubscribe?t=${await signUnsubscribe(env, r.id)}`;
    messages.push(personalize(env, body, r.email, unsub));
  }
  const ids = await mailer.send(messages);

  const now = nowSec();
  await env.DB.batch(results.map((r, i) =>
    env.DB.prepare(`INSERT OR IGNORE INTO deliveries (issue, subscriber_id, sent_at, provider_id) VALUES (?, ?, ?, ?)`)
      .bind(issue, r.id, now, ids[i] || null)));

  const left = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM subscribers s WHERE s.status = 'confirmed' AND s.lang = ?
       AND NOT EXISTS (SELECT 1 FROM deliveries d WHERE d.issue = ? AND d.subscriber_id = s.id)`,
  ).bind(lang, issue).first();
  return json({ ok: true, sent: results.length, remaining: left ? left.n : 0 });
}

/* A levélküldő beállítása előtt sorba állított feliratkozóknak most megy ki
   a megerősítő levél. Egy hívás legfeljebb a napi keretnyi levelet küld. */
async function sendConfirmations(request, env, url) {
  if (!mailReady(env)) return json({ ok: false, error: 'mail_not_ready' }, 409);
  const body = (await readJson(request, 1024)) || {};
  const limit = Math.max(1, Math.min(Number(body.limit) || dailyLimit(env), 100));
  const { results } = await env.DB.prepare(
    `SELECT id, email, lang FROM subscribers WHERE status = 'pending' AND last_mail_at IS NULL ORDER BY id LIMIT ?`,
  ).bind(limit).all();
  const now = nowSec();
  const base = site(env, url);
  let sent = 0;
  for (const r of results) {
    const token = randomToken();
    await env.DB.prepare(
      `UPDATE subscribers SET confirm_hash = ?, confirm_expires = ?, last_mail_at = ? WHERE id = ?`,
    ).bind(await sha256(token), now + CONFIRM_TTL, now, r.id).run();
    const mail = confirmationMail(r.lang, `${base}/api/kirakat/confirm?t=${token}`);
    await provider(env).send([{ to: r.email, from: env.KIRAKAT_FROM, subject: mail.subject, html: mail.html, text: mail.text }]);
    sent++;
  }
  const left = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM subscribers WHERE status = 'pending' AND last_mail_at IS NULL`,
  ).first();
  return json({ ok: true, sent, remaining: left ? left.n : 0 });
}

function personalize(env, body, to, unsub) {
  const fill = (s) => String(s).split('{{UNSUBSCRIBE}}').join(unsub);
  return {
    to,
    from: env.KIRAKAT_FROM,
    subject: String(body.subject).slice(0, 200),
    html: fill(body.html),
    text: fill(body.text),
    headers: {
      'List-Unsubscribe': `<${unsub}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  };
}

/* ---------- küldő szolgáltatás: egy változó dönti el ---------- */

/* Van-e már működő levélküldő beállítva. */
function mailReady(env) {
  if (!env.KIRAKAT_FROM) return false;
  const name = providerName(env);
  if (name === 'resend') return Boolean(env.RESEND_API_KEY);
  if (name === 'cloudflare') return Boolean(env.EMAIL);
  return name === 'log';
}

function providerName(env) {
  return (env.EMAIL_PROVIDER || 'resend').toLowerCase();
}

function provider(env) {
  if (!env.KIRAKAT_FROM) throw new Error('KIRAKAT_FROM missing');
  const name = providerName(env);
  if (name === 'cloudflare') return cloudflareMailer(env);
  if (name === 'resend') return resendMailer(env);
  // Csak helyi teszteléshez: nem küld semmit, kiírja a konzolra, mit küldene.
  if (name === 'log') return logMailer();
  throw new Error('unknown EMAIL_PROVIDER');
}

function resendMailer(env) {
  return {
    async send(messages) {
      if (!env.RESEND_API_KEY) throw new Error('RESEND_API_KEY missing');
      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
        body: JSON.stringify(messages.map((m) => ({
          from: m.from, to: [m.to], subject: m.subject, html: m.html, text: m.text, headers: m.headers,
          ...(env.KIRAKAT_REPLY_TO ? { reply_to: env.KIRAKAT_REPLY_TO } : {}),
        }))),
      });
      if (!res.ok) throw new Error(`resend ${res.status}`);
      const data = await res.json().catch(() => ({}));
      return (data.data || []).map((d) => d.id);
    },
  };
}

function cloudflareMailer(env) {
  return {
    async send(messages) {
      if (!env.EMAIL) throw new Error('EMAIL binding missing');
      const ids = [];
      for (const m of messages) {
        const r = await env.EMAIL.send({
          to: m.to, from: m.from, subject: m.subject, html: m.html, text: m.text, headers: m.headers,
          ...(env.KIRAKAT_REPLY_TO ? { replyTo: env.KIRAKAT_REPLY_TO } : {}),
        });
        ids.push(r && r.messageId);
      }
      return ids;
    },
  };
}

function logMailer() {
  return {
    async send(messages) {
      for (const m of messages) {
        const link = /https?:\/\/\S+?\/api\/kirakat\/(?:confirm|unsubscribe)\?t=[a-z0-9.]+/.exec(m.text);
        console.log(`[kirakat:log] -> ${m.to} | ${m.subject} | ${link ? link[0] : ''}`);
      }
      return messages.map((_, i) => `log-${Date.now()}-${i}`);
    },
  };
}

function dailyLimit(env) {
  return Math.max(1, Math.min(Number(env.KIRAKAT_DAILY_LIMIT) || 80, 100));
}

/* ---------- segédek ---------- */

function site(env, url) {
  return (env.SITE_URL || `${url.protocol}//${url.host}`).replace(/\/$/, '');
}

function back(env, url, lang, state) {
  const home = lang === 'en' ? '/en/' : '/';
  return new Response(null, {
    status: 303,
    headers: { location: `${site(env, url)}${home}#${state}`, 'cache-control': 'no-store' },
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

function notFound() {
  return json({ ok: false, error: 'not_found' }, 404);
}

async function readJson(request, max) {
  const len = Number(request.headers.get('content-length') || 0);
  if (len > max) return null;
  const text = await request.text();
  if (text.length > max) return null;
  try {
    const data = JSON.parse(text);
    return data && typeof data === 'object' ? data : null;
  } catch {
    return null;
  }
}

function nowSec() {
  return Math.floor(Date.now() / 1000);
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256(text) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* A leiratkozó linkek aláíró kulcsa: a KIRAKAT_SECRET titok, vagy ha az
   nincs beállítva, egy egyszer generált és az adatbázisban tárolt érték. */
let cachedSecret = null;
async function signingSecret(env) {
  if (env.KIRAKAT_SECRET) return env.KIRAKAT_SECRET;
  if (cachedSecret) return cachedSecret;
  await env.DB.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('unsub_secret', ?)`)
    .bind(randomToken()).run();
  const row = await env.DB.prepare(`SELECT value FROM settings WHERE key = 'unsub_secret'`).first();
  cachedSecret = row.value;
  return cachedSecret;
}

/* Első kéréskor létrehozza a táblákat (ugyanaz, mint a migrations/0001). */
let schemaReady = false;
async function ensureSchema(env) {
  if (schemaReady) return;
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      lang TEXT NOT NULL CHECK (lang IN ('hu', 'en')),
      status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
      confirm_hash TEXT, confirm_expires INTEGER, last_mail_at INTEGER, consent TEXT,
      created_at INTEGER NOT NULL, confirmed_at INTEGER, unsubscribed_at INTEGER)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS subscribers_status_lang ON subscribers (status, lang)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS deliveries (
      issue TEXT NOT NULL, subscriber_id INTEGER NOT NULL, sent_at INTEGER NOT NULL, provider_id TEXT,
      PRIMARY KEY (issue, subscriber_id))`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`),
  ]);
  schemaReady = true;
}

async function hmac(env, text) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(await signingSecret(env)), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(text));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function signUnsubscribe(env, id) {
  return `${id}.${await hmac(env, `unsub:${id}`)}`;
}

async function verifyUnsubscribe(env, token) {
  const m = /^(\d{1,10})\.([a-f0-9]{64})$/.exec(token);
  if (!m) return null;
  const expected = await hmac(env, `unsub:${m[1]}`);
  return (await sameText(expected, m[2])) ? Number(m[1]) : null;
}

async function isAdmin(request, env) {
  if (!env.ADMIN_TOKEN) return false;
  const header = request.headers.get('authorization') || '';
  const given = header.startsWith('Bearer ') ? header.slice(7) : '';
  return given.length > 0 && (await sameText(given, env.ADMIN_TOKEN));
}

/* Időzítésfüggetlen összehasonlítás: mindkét oldal hash-ét vetjük össze. */
async function sameText(a, b) {
  const [x, y] = await Promise.all([sha256(a), sha256(b)]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}
