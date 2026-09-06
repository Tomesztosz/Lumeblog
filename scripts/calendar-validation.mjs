import assert from 'node:assert/strict';
export function validateCalendar(dated, announcements, brands) {
  const keys = new Set(brands.map(brand => brand.key));
  assert.equal(keys.size, brands.length, 'Duplicate radar brand');
  const ids = new Set();
  const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
  for (const entry of [...dated, ...announcements]) {
    assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id) && !ids.has(entry.id), 'Invalid / duplicate entry id');
    ids.add(entry.id);
    assert(keys.has(entry.brandKey), `${entry.id}: unknown brand`);
    for (const field of ['brand','family','model','reference','imageCredit']) assert(typeof entry[field] === 'string' && entry[field].trim(), `${entry.id}: missing ${field}`);
    assert(validDate(entry.sourceChecked), `${entry.id}: invalid sourceChecked`);
    assert(/^\/img\/calendar\/[a-z0-9-]+\.(webp|png|jpg)$/.test(entry.image), `${entry.id}: image must be local`);
    assert(Number.isInteger(entry.imageWidth) && entry.imageWidth > 0 && Number.isInteger(entry.imageHeight) && entry.imageHeight > 0, 'Invalid image dimensions');
    const source = new URL(entry.sourceUrl);
    assert(source.protocol === 'https:' && !source.username && !source.password, 'Invalid source URL');
    const brand = brands.find(brand => brand.key === entry.brandKey);
    const hosts = [brand.sourceUrl, ...(brand.additionalSources ?? [])].map(url => new URL(url).hostname);
    assert(hosts.includes(source.hostname), `${entry.id}: source host not in official radar`);
    for (const lang of ['hu', 'en']) for (const field of ['dateLabel','summary','selection','availability']) {
      assert(typeof entry.copy?.[lang]?.[field] === 'string' && entry.copy[lang][field].trim(), `${entry.id}: missing ${lang}.${field}`);
    }
  }
  for (const entry of dated) {
    assert(validDate(entry.date) && validDate(entry.dateEnd) && entry.date <= entry.dateEnd, `${entry.id}: invalid release window`);
    assert(['day', 'month'].includes(entry.precision) && entry.confirmed === true, 'Dated release must be confirmed');
    assert(!('status' in entry), 'Announcement status cannot masquerade as dated release');
    if (entry.precision === 'month') {
      assert(entry.date.endsWith('-01') && entry.date.slice(0,7) === entry.dateEnd.slice(0,7), 'Month precision must cover one complete month');
      const next = new Date(entry.dateEnd); next.setUTCDate(next.getUTCDate()+1);
      assert.equal(next.getUTCDate(), 1, 'Month must end on the last day');
    }
  }
  for (const entry of announcements) {
    assert(['introduced','announced'].includes(entry.status), 'Invalid announcement state');
    assert(validDate(entry.firstSeen) && entry.firstSeen <= entry.sourceChecked, 'Invalid discovery date');
    for (const field of ['date', 'dateEnd', 'precision', 'confirmed']) assert(!(field in entry), 'Undated announcement cannot have a calendar date');
  }
}
