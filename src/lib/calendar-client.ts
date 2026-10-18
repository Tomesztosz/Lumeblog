import { phaseFor, matchesCalendar, sortCalendar, calendarCounts, focusGroup, statusLabel, needsSourceReview, nextTransition, eventDateLabel } from './calendar-state.mjs';
import { downloadableEvent } from './calendar-ics.mjs';
import type { CalendarEntry } from './releases';
const data = document.querySelector<HTMLElement>('#calendarData');
if (data) {
  const entries: CalendarEntry[] = JSON.parse(data.dataset.entries!);
  const copy = JSON.parse(data.dataset.copy!);
  const lang = data.dataset.lang === 'en' ? 'en' : 'hu';
  // Revalidate accepted data separately from the clock. A failed fetch never
  // prevents the cached entries from expiring locally.
  let revisionCheckAt = 0;
  const revalidate = async () => {
    if (Date.now() - revisionCheckAt < 60000) return;
    revisionCheckAt = Date.now();
    try {
      const response = await fetch('/calendar-revision.json', {cache:'no-store'});
      if (!response.ok) return;
      const latest = await response.json();
      if (/^[a-f0-9]{64}$/.test(latest.revision) && latest.revision !== data.dataset.revision) location.reload();
    } catch { /* Offline: retain accepted data and keep classifying with the clock. */ }
  };
  const cards = [...document.querySelectorAll<HTMLElement>('[data-release-card]')];
  const cardById = new Map(cards.map(card => [card.id, card]));
  const grid = document.querySelector('#calendarGrid')!;
  let order = cards.map(card => card.id).join('|');
  const views = [...document.querySelectorAll<HTMLButtonElement>('[data-calendar-view]')];
  const status = document.querySelector<HTMLSelectElement>('#releaseStatusFilter')!;
  const month = document.querySelector<HTMLSelectElement>('#releaseMonthFilter')!;
  const brand = document.querySelector<HTMLSelectElement>('#releaseBrandFilter')!;
  const query = document.querySelector<HTMLInputElement>('#releaseQuery')!;
  const count = document.querySelector('#calendarResultCount')!;
  const empty = document.querySelector<HTMLElement>('#calendarEmpty')!;
  const syncUrl = () => {
    const url = new URL(location.href);
    for (const [key, value, fallback] of [['status', status.value, 'active'], ['month', month.value, 'all'], ['brand', brand.value, 'all'], ['q', query.value, '']]) {
      if (value === fallback) url.searchParams.delete(key); else url.searchParams.set(key, value);
    }
    url.hash = '';
    history.replaceState(null, '', url);
  };
  let boundaryTimer: ReturnType<typeof setTimeout>;
  const update = () => {
    let visible = 0;
    const now = new Date();
    const sorted = sortCalendar(entries, now) as CalendarEntry[];
    const nextOrder = sorted.map(entry => entry.id).join('|');
    if (nextOrder !== order) {
      sorted.forEach(entry => { const card = cardById.get(entry.id); if (card) grid.append(card); });
      order = nextOrder;
    }
    sorted.forEach(entry => {
      const card = cardById.get(entry.id);
      if (!card) return;
      const phase = phaseFor(entry, now);
      card.dataset.phase = phase;
      const badge = card.querySelector<HTMLElement>('[data-release-status]')!;
      badge.dataset.phase = phase;
      const label = statusLabel(entry, copy, now);
      badge.replaceChildren(document.createElement('i'), document.createTextNode(label));
      badge.firstElementChild!.setAttribute('aria-hidden', 'true');
      card.hidden = !matchesCalendar(entry, { status: status.value, month: month.value, brand: brand.value, query: query.value }, now);
      const aging = card.querySelector<HTMLElement>('[data-source-aging]');
      if (aging) aging.hidden = !needsSourceReview(entry, now);
      const download = card.querySelector<HTMLElement>('[data-calendar-download]');
      if (download) download.hidden = !downloadableEvent(entry, now);
      if (!card.hidden) visible++;
    });
    count.textContent = visible === 1 ? copy.resultsOne : copy.resultsMany.replace('{n}', visible);
    empty.hidden = visible !== 0;
    const emptyHelp = document.querySelector<HTMLElement>('[data-calendar-empty-help]');
    if (emptyHelp) emptyHelp.hidden = visible !== 0;
    empty.textContent = brand.value === 'all' ? copy.noResults : copy.noBrandResults;
    const counts = calendarCounts(entries, now, { month: month.value, brand: brand.value, query: query.value });
    views.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.calendarView === status.value));
      button.querySelector('[data-calendar-count]')!.textContent = String(counts[button.dataset.calendarView!]);
    });
    const archiveHelp = document.querySelector<HTMLElement>('[data-calendar-archive-help]');
    if (archiveHelp) archiveHelp.hidden = status.value !== 'archived';
    const highlighted = focusGroup(entries, now, {status:status.value,month:month.value,brand:brand.value,query:query.value});
    const focus = highlighted[0];
    const title = document.querySelector('[data-calendar-focus-title]');
    const date = document.querySelector('[data-calendar-focus-date]');
    const link = document.querySelector<HTMLAnchorElement>('[data-calendar-focus-link]');
    if (title) title.textContent = highlighted.length > 1 ? copy.focusGroup.replace('{n}', highlighted.length) : focus ? `${focus.brand} ${focus.family}` : copy.focusEmpty;
    if (date) date.textContent = highlighted.length > 1 ? copy.focusGroupDates : focus ? eventDateLabel(focus, lang, copy) : '';
    const group = document.querySelector('[data-calendar-focus-group]');
    if (group) group.replaceChildren(...(highlighted.length > 1 ? highlighted.map(e => {const li=document.createElement('li'), a=document.createElement('a');a.href=`#${e.id}`;a.textContent=`${e.brand} ${e.family}`;li.append(a);return li;}) : []));
    if (link) { link.hidden = !focus; link.setAttribute('href', focus ? `#${focus.id}` : '#calendar-list-title'); }
    document.querySelectorAll<HTMLElement>('[data-radar-brand]').forEach(element => {
      const total = entries.filter(entry => entry.brandKey === element.dataset.radarBrand && matchesCalendar(entry, {}, now)).length;
      element.classList.toggle('active', total > 0);
      element.querySelector('[data-radar-count]')!.textContent = total ? (total === 1 ? copy.clientRadarOne : copy.clientRadarMany.replace('{n}',total)) : copy.radarWatched;
    });
    clearTimeout(boundaryTimer);
    const boundary = nextTransition(entries, now);
    boundaryTimer = setTimeout(update, Math.max(20, Math.min(60000, boundary == null ? 60000 : boundary - +now + 5)));
  };
  const change = () => { update(); syncUrl(); };
  [status, month, brand].forEach(el => el.addEventListener('change', change));
  query.addEventListener('input', change);
  views.forEach(button => button.addEventListener('click', () => { status.value = button.dataset.calendarView!; change(); }));
  document.querySelector('#releaseReset')!.addEventListener('click', () => {
    status.value = 'active'; month.value = brand.value = 'all'; query.value = ''; change(); query.focus();
  });
  const readUrl = () => {
    const params = new URL(location.href).searchParams;
    for (const [key, select, fallback] of [['status', status, 'active'], ['month', month, 'all'], ['brand', brand, 'all']] as const) {
      let value = params.get(key) ?? fallback;
      if (key === 'status') value = value === 'overview' ? 'active' : ['introduced','recent'].includes(value) ? 'archived' : value;
      select.value = [...select.options].some(option => option.value === value) ? value : fallback;
    }
    query.value = (params.get('q') ?? '').slice(0, 180);
    update();
  };
  const revealHash = () => {
    const card = cards.find(card => '#' + card.id === location.hash);
    if (card) { status.value = 'all'; month.value = brand.value = 'all'; query.value = ''; update(); card.scrollIntoView(); }
  };
  window.addEventListener('hashchange', revealHash);
  window.addEventListener('popstate', () => { readUrl(); revealHash(); });
  window.addEventListener('pageshow', () => { readUrl(); revealHash(); void revalidate(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) {update(); void revalidate();} });
  setInterval(() => {if (!document.hidden) void revalidate();}, 300000);
  readUrl(); revealHash();
  void revalidate();
}
