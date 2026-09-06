import { phaseFor, daysAway, matchesCalendar } from './calendar-state.mjs';
const data = document.querySelector<HTMLElement>('#calendarData');
if (data) {
  const entries = JSON.parse(data.dataset.entries!);
  const copy = JSON.parse(data.dataset.copy!);
  const cards = [...document.querySelectorAll<HTMLElement>('[data-release-card]')];
  const status = document.querySelector<HTMLSelectElement>('#releaseStatusFilter')!;
  const month = document.querySelector<HTMLSelectElement>('#releaseMonthFilter')!;
  const brand = document.querySelector<HTMLSelectElement>('#releaseBrandFilter')!;
  const query = document.querySelector<HTMLInputElement>('#releaseQuery')!;
  const count = document.querySelector('#calendarResultCount')!;
  const empty = document.querySelector<HTMLElement>('#calendarEmpty')!;
  const update = () => {
    let visible = 0;
    const now = new Date();
    cards.forEach((card, index) => {
      const entry = entries[index];
      const phase = phaseFor(entry, now);
      card.dataset.phase = phase;
      const badge = card.querySelector<HTMLElement>('[data-release-status]')!;
      badge.dataset.phase = phase;
      const days = daysAway(entry, now);
      const label = phase === 'introduced' ? copy.statusIntroduced : phase === 'announced' ? copy.announced
        : phase === 'archived' ? copy.statusArchived : phase === 'current' ? (entry.precision === 'day' ? copy.statusToday : copy.statusCurrent)
        : entry.precision === 'month' ? copy.statusUpcoming : days === 1 ? copy.daysOne : copy.daysMany.replace('{n}', days);
      badge.replaceChildren(document.createElement('i'), document.createTextNode(label));
      badge.firstElementChild!.setAttribute('aria-hidden', 'true');
      card.hidden = !matchesCalendar(entry, { status: status.value, month: month.value, brand: brand.value, query: query.value }, now);
      if (!card.hidden) visible++;
    });
    count.textContent = visible === 1 ? copy.resultsOne : copy.resultsMany.replace('{n}', visible);
    empty.hidden = visible !== 0;
    empty.textContent = brand.value === 'all' ? copy.noResults : copy.noBrandResults;
  };
  [status, month, brand].forEach(el => el.addEventListener('change', update));
  query.addEventListener('input', update);
  document.querySelector('#releaseReset')!.addEventListener('click', () => {
    status.value = 'overview'; month.value = brand.value = 'all'; query.value = ''; update(); query.focus();
  });
  const revealHash = () => {
    const card = cards.find(card => '#' + card.id === location.hash);
    if (card) { status.value = 'all'; month.value = brand.value = 'all'; query.value = ''; update(); card.scrollIntoView(); }
  };
  window.addEventListener('hashchange', revealHash);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
  setInterval(update, 60000);
  update(); revealHash();
}
