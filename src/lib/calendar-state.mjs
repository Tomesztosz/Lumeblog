// Shared by SSR, the browser, the scheduler and regression tests.
export const RECENT_DAYS = 60;
const DAY = 86400000;
export function calendarDay(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Budapest', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
export function phaseFor(entry, now = new Date()) {
  if (!entry.date) return entry.status === 'announced' ? 'announced' : 'introduced';
  const today = calendarDay(now);
  if (today < entry.date) return 'upcoming';
  if (today <= entry.dateEnd) return 'current';
  return 'archived';
}
export function daysAway(entry, now = new Date()) {
  return entry.date ? Math.max(0, Math.round((Date.parse(entry.date) - Date.parse(calendarDay(now))) / DAY)) : 0;
}
export function isRecent(entry, now = new Date()) {
  if (!entry.dateEnd) return false;
  const age = (Date.parse(calendarDay(now)) - Date.parse(entry.dateEnd)) / DAY;
  return age > 0 && age <= RECENT_DAYS;
}
export function matchesCalendar(entry, filters = {}, now = new Date()) {
  const phase = phaseFor(entry, now);
  const status = filters.status ?? 'overview';
  const statusMatch = status === 'all'
    || (status === 'overview' && (phase !== 'archived' || isRecent(entry, now)))
    || (status === 'active' && ['upcoming', 'current'].includes(phase))
    || (status === 'introduced' && (phase === 'introduced' || isRecent(entry, now)))
    || (status === 'announced' && phase === 'announced')
    || (status === 'archived' && phase === 'archived');
  const month = filters.month ?? 'all';
  const query = (filters.query ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
  const searchable = `${entry.brand} ${entry.family} ${entry.model} ${entry.reference}`.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  return statusMatch && (month === 'all' || (month === 'undated' ? !entry.date : entry.date?.slice(0, 7) === month))
    && (!filters.brand || filters.brand === 'all' || filters.brand === entry.brandKey)
    && query.split(/\s+/).every(word => searchable.includes(word));
}
