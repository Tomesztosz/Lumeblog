const safe = value => String(value ?? '').replace(/[<>\[\]`|\r\n]/g, ' ').replace(/@/g, '(at)');
const html = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export function dailyCandidates(pending, limit = 20) {
  const counts = new Map();
  return pending.filter(item => {
    if (item.bucket !== 'review' || (counts.get(item.brand) ?? 0) >= 3) return false;
    counts.set(item.brand, (counts.get(item.brand) ?? 0) + 1);
    return true;
  }).slice(0, limit);
}

export function radarMarkdown(report) {
  const candidates = dailyCandidates(report.pending);
  const background = report.pending.filter(item => item.bucket !== 'review').length;
  const lines = ['<!-- lume-calendar-radar -->', '# Lume naptár: mai szerkesztői lista', '',
    `Gépi ellenőrzés: ${report.checkedAt}. Frissesség alapján kiemelt jelölt: ${report.pending.length - background}. Kártyafelülvizsgálat: ${report.reviews.length}. Háttérlista: ${background}.`, '',
    'A gépi találat nem igazolt újdonság. A közlemény dátuma nem megjelenési dátum. A nyilvános kártyákhoz ellenőrzött hivatalos forrás, HU/EN szöveg és jogtisztán használható helyi kép kell. A teljes sor és a megnyitható szerkesztői nézet a calendar-radar artifactban található.', '',
    '## Már felvett órák: változás vagy elavuló ellenőrzés', ''];
  if (!report.reviews.length) lines.push('Nincs új gépi felülvizsgálati jelzés. Ez nem teljes szerkesztői áttekintés.');
  for (const item of report.reviews) lines.push(`- [ ] [${safe(item.title)}](${item.url}): ${safe(item.reason)} Utolsó ellenőrzés: ${item.sourceChecked}.`);
  lines.push('', '## Új jelöltek: legfeljebb 20, márkánként legfeljebb 3', '');
  if (!candidates.length) lines.push('Nincs kiemelhető friss találat. A hibás források és a háttérlista ettől még átnézendők.');
  for (const item of candidates) lines.push(`- [ ] [${safe(item.title || item.url)}](${item.url}) (${safe(item.brand)}). ${safe(item.reason)} ${item.publishedAt ? `Közlemény: ${item.publishedAt}.` : `Első észlelés: ${item.firstSeen}.`}`);
  lines.push('', '## Források állapota', '', '| Márka | Forrás | Változás | Új link |', '| --- | --- | --- | --- |');
  for (const row of report.sources) lines.push(`| ${safe(row.name)} | [${safe(row.status)}](${row.url}) ${safe(row.error)} | ${safe(row.change)} | ${row.newLinks} |`);
  lines.push('', 'A hibás vagy részleges forrást böngészőben kell ellenőrizni. A háttérlista nem automatikus elutasítás, a rekordok a következő futásra is megmaradnak.', '',
    'Feldolgozás: docs/calendar.md. A jelöltek jóváhagyása szerkesztői művelet, nem az issue jelölőnégyzetének kipipálása. A változásjelzés a calendar-source-reviews.json fájlban, a konkrét forráshash ellenőrzésével zárható le.');
  return lines.join('\n') + '\n';
}

export function radarHtml(report) {
  const itemHtml = item => `<li><a href="${html(item.url)}" target="_blank" rel="noreferrer">${html(item.title || item.url)}</a><p>${html(item.reason)}</p><small>${html(item.brand)} · ${html(item.publishedAt ? `Közlemény: ${item.publishedAt}` : item.sourceChecked ? `Ellenőrizve: ${item.sourceChecked}` : `Első észlelés: ${item.firstSeen}`)}</small>${item.hash ? `<details><summary>Forrásváltozat</summary><code>${html(item.hash)}</code></details>` : ''}</li>`;
  const failures = report.sources.filter(source => source.status !== 'readable');
  return `<!doctype html><html lang="hu"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Lume: naptár szerkesztői nézet</title>
<style>body{font:16px/1.6 system-ui,sans-serif;background:#f2f0e8;color:#1c251d;margin:0}main{max-width:950px;margin:auto;padding:40px 24px}h1{font:48px/1.1 Georgia,serif}h2{margin-top:44px}a{color:inherit;text-underline-offset:4px;overflow-wrap:anywhere}li{padding:20px 0;border-bottom:1px solid #c9cfc4}small{color:#4a574c}code{overflow-wrap:anywhere}p{max-width:75ch}.notice{padding:18px;background:#e0e6d8}summary{cursor:pointer}details{margin:14px 0}ul{padding-left:22px}</style>
<main><p>LUME / SZERKESZTŐI NÉZET</p><h1>Amire ma érdemes ránézni.</h1><p>Gépi ellenőrzés: ${html(report.checkedAt)}</p>
<p class="notice">Ez helyi munkalista, nem nyilvános naptár és nem automatikus publikálás. A közlemény dátuma nem megjelenési dátum. A kártyák adatainak és képeinek ellenőrzése továbbra is szükséges.</p>
<h2>Meglévő kártyák (${report.reviews.length})</h2><ul>${report.reviews.map(itemHtml).join('') || '<li>Nincs új gépi jelzés.</li>'}</ul>
<h2>Kiemelt új jelöltek</h2><p>Legfeljebb 20 találat, márkánként legfeljebb 3. A teljes sor alább elérhető.</p><ul>${dailyCandidates(report.pending).map(itemHtml).join('') || '<li>Most nincs kiemelhető friss találat.</li>'}</ul>
<h2>Böngészős ellenőrzést igényel (${failures.length})</h2><ul>${failures.map(row => `<li><a href="${html(row.url)}" target="_blank" rel="noreferrer">${html(row.name)}</a>: ${html(row.status)} ${html(row.error)}</li>`).join('') || '<li>Nincs gépi hiba. Ez nem bizonyít teljes lefedettséget.</li>'}</ul>
${['review', 'background', 'historical', 'navigation'].map((bucket, index) => { const items = report.pending.filter(item => item.bucket === bucket); return `<details><summary>${['Összes kiemelt jelölt', 'Frissességre váró háttérlista', 'Korábbi közlemények', 'Navigáció és csomagok'][index]} (${items.length})</summary><ul>${items.map(itemHtml).join('')}</ul></details>`; }).join('')}
<h2>Hogyan kerül ki egy új óra?</h2><ol><li>Hivatalos forrás és dátum ellenőrzése.</li><li>Magyar és angol kártyaszöveg, helyi kép és képkredit elkészítése.</li><li>Szerkesztői jóváhagyás, adatfelvétel, teljes build, majd élesítés.</li></ol><p>A részletes menet a docs/calendar.md fájlban van. Sem az oldal megnyitása, sem egy linkre kattintás nem hagy jóvá vagy publikál tartalmat.</p></main></html>`;
}
