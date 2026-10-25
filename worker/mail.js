/* ============================================================
   LUME · Kirakat levélsablon
   Közös modul: a Worker (megerősítő levél) és a scripts/kirakat.mjs
   (hírlevélszámok) is innen dolgozik. Függőség nélküli, sima ES modul.

   A levelezőprogramok nem ismerik a CSS-változókat, ezért itt kivételesen
   konkrét színek állnak. Ezek a src/styles/lume-palette.css értékei;
   ha ott változik a paletta, itt is át kell írni.
   ============================================================ */

export const MAIL_PALETTE = {
  paper: '#f2f0e8',
  surface: '#e8e7df',
  ink: '#242722',
  muted: '#61655b',
  line: '#c7c9bc',
  brass: '#75613b',
  accent: '#d7eb96',
  night: '#232921',
  nightInk: '#f0f0e3',
};

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = "'SFMono-Regular', Menlo, Consolas, monospace";

const COPY = {
  hu: {
    label: 'KIRAKAT',
    tagline: 'Amit a Lume cikkeiben elvből nem írok meg.',
    footer: 'Ezt a levelet azért kaptad, mert feliratkoztál a Lume Kirakatára.',
    unsubscribe: 'Leiratkozás',
    site: 'lumejournal.com',
    confirmSubject: 'Még egy kattintás, és benn vagy a Kirakatban',
    confirmTitle: 'Majdnem kész.',
    confirmBody: [
      'Valaki (remélhetőleg te) feliratkozott ezzel a címmel a Lume hírlevelére.',
      'Ha te voltál, az alábbi gombbal erősítsd meg. Ha nem, nyugodtan töröld ezt a levelet, és többet nem jelentkezünk.',
    ],
    confirmButton: 'Igen, kérem a Kirakatot',
    confirmNote: 'A link 48 óráig érvényes.',
  },
  en: {
    label: 'THE WINDOW',
    tagline: 'What I deliberately leave out of Lume’s articles.',
    footer: 'You are receiving this because you signed up for Lume’s Window.',
    unsubscribe: 'Unsubscribe',
    site: 'lumejournal.com',
    confirmSubject: 'One more click and you’re in the Window',
    confirmTitle: 'Almost there.',
    confirmBody: [
      'Someone (hopefully you) signed this address up for Lume’s newsletter.',
      'If it was you, confirm with the button below. If not, just delete this email and you won’t hear from us again.',
    ],
    confirmButton: 'Yes, put me on the list',
    confirmNote: 'The link is valid for 48 hours.',
  },
};

export function mailCopy(lang) {
  return COPY[lang === 'en' ? 'en' : 'hu'];
}

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* A teljes levélváz. `content` kész HTML (a számok tartalma vagy a
   megerősítő szöveg). `unsubscribe` lehet a {{UNSUBSCRIBE}} helyőrző is. */
export function mailLayout({ lang, title, preheader = '', issueLabel = '', content, unsubscribe }) {
  const c = mailCopy(lang);
  const P = MAIL_PALETTE;
  const foot = unsubscribe
    ? `<a href="${unsubscribe}" style="color:${P.muted};text-decoration:underline">${c.unsubscribe}</a> · `
    : '';
  return `<!doctype html>
<html lang="${lang === 'en' ? 'en' : 'hu'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${P.paper};color:${P.ink}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${P.paper}">
<tr><td align="center" style="padding:28px 14px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
  <tr><td style="background:${P.night};padding:22px 28px;border-radius:2px 2px 0 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-family:${SERIF};font-size:22px;letter-spacing:4px;color:${P.nightInk}">LUME<span style="color:${P.accent}">&#9679;</span></td>
      <td align="right" style="font-family:${MONO};font-size:11px;letter-spacing:2px;color:${P.accent}">${c.label}${issueLabel ? ' · ' + escapeHtml(issueLabel) : ''}</td>
    </tr></table>
  </td></tr>
  <tr><td style="background:${P.accent};height:3px;line-height:3px;font-size:0">&nbsp;</td></tr>
  <tr><td style="background:#fbfaf5;padding:32px 28px 8px;font-family:${SANS};font-size:16px;line-height:1.6;color:${P.ink}">
    ${content}
  </td></tr>
  <tr><td style="background:#fbfaf5;padding:8px 28px 28px">
    <p style="margin:0;font-family:${MONO};font-size:11px;letter-spacing:1px;color:${P.brass}">${escapeHtml(c.tagline)}</p>
  </td></tr>
  <tr><td style="padding:20px 28px;font-family:${SANS};font-size:12px;line-height:1.5;color:${P.muted}">
    ${escapeHtml(c.footer)}<br>${foot}<a href="https://lumejournal.com${lang === 'en' ? '/en/' : '/'}" style="color:${P.muted}">${c.site}</a>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

/* A számok Markdownból készült HTML-jét levélbarát, beágyazott stílusú
   HTML-lé alakítja. Csak az egyszerű elemeket kezeli, amiket egy szám használ. */
export function styleIssueHtml(html) {
  const P = MAIL_PALETTE;
  const rules = {
    h1: `font-family:${SERIF};font-weight:600;font-size:30px;line-height:1.15;margin:0 0 16px;color:${P.ink}`,
    h2: `font-family:${SERIF};font-weight:600;font-size:22px;line-height:1.25;margin:30px 0 8px;color:${P.ink}`,
    h3: `font-family:${MONO};font-weight:500;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:26px 0 6px;color:${P.brass}`,
    p: `margin:0 0 16px`,
    ul: `margin:0 0 16px;padding-left:20px`,
    ol: `margin:0 0 16px;padding-left:22px`,
    li: `margin:0 0 6px`,
    blockquote: `margin:20px 0;padding:14px 18px;background:${P.surface};border-left:3px solid ${P.brass};font-family:${SERIF};font-size:18px;line-height:1.45`,
    a: `color:${P.brass};text-decoration:underline`,
    hr: `border:0;border-top:1px solid ${P.line};margin:28px 0`,
    img: `max-width:100%;height:auto;display:block;margin:8px 0 6px;border-radius:2px`,
    strong: `font-weight:600`,
    em: `font-style:italic`,
    code: `font-family:${MONO};font-size:14px`,
  };
  return html.replace(/<(h1|h2|h3|p|ul|ol|li|blockquote|a|hr|img|strong|em|code)(\s[^>]*)?(\/?)>/g,
    (m, tag, attrs = '', slash) => `<${tag}${attrs || ''} style="${rules[tag]}"${slash}>`);
}

/* Megerősítő levél, a Worker hívja a feliratkozáskor. */
export function confirmationMail(lang, link) {
  const c = mailCopy(lang);
  const P = MAIL_PALETTE;
  const content = `
    <h1 style="font-family:${SERIF};font-weight:600;font-size:30px;line-height:1.15;margin:0 0 16px">${c.confirmTitle}</h1>
    ${c.confirmBody.map((p) => `<p style="margin:0 0 16px">${escapeHtml(p)}</p>`).join('')}
    <p style="margin:24px 0 10px">
      <a href="${link}" style="display:inline-block;background:${P.night};color:${P.accent};font-family:${MONO};font-size:14px;letter-spacing:1px;text-decoration:none;padding:13px 22px;border-radius:2px">${c.confirmButton} &rarr;</a>
    </p>
    <p style="margin:0 0 20px;font-size:13px;color:${P.muted}">${c.confirmNote}</p>`;
  return {
    subject: c.confirmSubject,
    html: mailLayout({ lang, title: c.confirmSubject, preheader: c.confirmBody[0], content }),
    text: `${c.confirmTitle}\n\n${c.confirmBody.join('\n\n')}\n\n${c.confirmButton}: ${link}\n\n${c.confirmNote}\n`,
  };
}
