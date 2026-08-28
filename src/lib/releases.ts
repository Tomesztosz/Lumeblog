import releaseData from '../data/releases.json';
import brandRadarData from '../data/brand-radar.json';
import calendarMetaData from '../data/calendar-meta.json';
import type { Lang } from '../i18n/ui';

export type ReleasePrecision = 'day' | 'month';
export type ReleasePhase = 'upcoming' | 'current' | 'archived';

export interface WatchRelease {
  id: string;
  brand: string;
  brandKey: string;
  family: string;
  model: string;
  reference: string;
  date: string;
  dateEnd: string;
  precision: ReleasePrecision;
  confirmed: boolean;
  limitedPieces?: number;
  price?: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  imageCredit: string;
  sourceUrl: string;
  sourceChecked: string;
  copy: Record<Lang, {
    dateLabel: string;
    summary: string;
    selection: string;
    availability: string;
  }>;
}

export interface BrandRadarItem {
  group: 'major' | 'independent';
  name: string;
  key: string;
  sourceUrl: string;
}

export const releases = (releaseData as WatchRelease[]).sort(
  (a, b) => Date.parse(a.date) - Date.parse(b.date)
);

export const brandRadar = brandRadarData as BrandRadarItem[];
export const calendarMeta = calendarMetaData as { lastReviewed: string };

export const CALENDAR_UI = {
  hu: {
    nav: 'Naptár',
    seoTitle: 'Óramegjelenési naptár: a Lume válogatása',
    seoDescription:
      'Válogatott, hivatalos forrásból ellenőrzött közelgő óramegjelenések, automatikus státusszal és letölthető naptárbejegyzéssel.',
    eyebrow: 'Lume Naptár · válogatott megjelenések',
    title: 'Nem minden újdonság. Csak amiért érdemes visszanézni.',
    lede:
      'Megerősített óramegjelenések hivatalos forrásból. Ha a gyártó csak hónapot mond, mi sem találunk ki hozzá napot.',
    curated: 'Válogatott, nem teljes lista',
    verified: 'Forrás ellenőrizve',
    upcomingCount: (n: number) => `${n} közelgő megjelenés`,
    next: 'A következő',
    selection: 'Miért van itt',
    releaseDate: 'Megjelenés',
    availability: 'Elérhetőség',
    edition: 'Kiadás',
    price: 'Irányár',
    confirmed: 'Megerősített',
    monthPrecision: 'Hónap pontosságú dátum',
    officialSource: 'Hivatalos forrás',
    addCalendar: 'Naptárhoz adom',
    imageCredit: 'Kép',
    filters: 'Szűrés',
    allMonths: 'Minden hónap',
    allBrands: 'Minden márka',
    allStatuses: 'Minden állapot',
    activeStatuses: 'Közelgő és aktuális',
    archivedStatuses: 'Már megjelent',
    noResults: 'Nincs a szűrésnek megfelelő megjelenés.',
    results: (n: number) => `${n} találat`,
    statusUpcoming: 'Közeleg',
    statusCurrent: 'Ebben a hónapban',
    statusArchived: 'Már megjelent',
    daysOne: '1 nap múlva',
    daysMany: (n: number) => `${n} nap múlva`,
    limited: (n: number) => `${new Intl.NumberFormat('hu-HU').format(n)} darab`,
    continuous: 'Állandó kollekció',
    homeEyebrow: 'Lume Naptár',
    homeTitle: 'A következő órák a láthatáron.',
    homeText: 'Nem teljes hírzaj, hanem néhány előre kiválasztott megjelenés, ellenőrzött dátummal.',
    homeOpen: 'Teljes naptár',
    radarEyebrow: 'Figyelt források',
    radarTitle: 'Márkaradar',
    radarText:
      'Ezeket a gyártókat követjük. A név önmagában még nem jelent naptárbejegyzést: teljes kártyát csak a Lume-válogatásba bekerülő, hivatalos jövőbeli dátummal rendelkező óra kap.',
    radarMajor: 'Nagy gyártók',
    radarIndependent: 'Microbrandek és függetlenek',
    radarActive: 'Van aktív bejegyzés',
    radarWatched: 'Figyeljük',
    radarOfficial: 'Hivatalos oldal',
    radarLastChecked: (date: string) => `A teljes radar utolsó ellenőrzése: ${date}`,
  },
  en: {
    nav: 'Calendar',
    seoTitle: 'Watch Release Calendar: The Lume Selection',
    seoDescription:
      'A curated list of upcoming watch releases verified against official sources, with automatic status updates and downloadable calendar entries.',
    eyebrow: 'Lume Calendar · selected releases',
    title: 'Not every novelty. Only the ones worth returning for.',
    lede:
      'Confirmed watch releases from official sources. If a maker gives only a month, we do not invent a day.',
    curated: 'Curated, not exhaustive',
    verified: 'Source checked',
    upcomingCount: (n: number) => `${n} upcoming ${n === 1 ? 'release' : 'releases'}`,
    next: 'Next up',
    selection: 'Why it is here',
    releaseDate: 'Release',
    availability: 'Availability',
    edition: 'Edition',
    price: 'Indicative price',
    confirmed: 'Confirmed',
    monthPrecision: 'Month-level date',
    officialSource: 'Official source',
    addCalendar: 'Add to calendar',
    imageCredit: 'Image',
    filters: 'Filters',
    allMonths: 'All months',
    allBrands: 'All brands',
    allStatuses: 'All statuses',
    activeStatuses: 'Upcoming and current',
    archivedStatuses: 'Already released',
    noResults: 'No releases match these filters.',
    results: (n: number) => `${n} ${n === 1 ? 'result' : 'results'}`,
    statusUpcoming: 'Upcoming',
    statusCurrent: 'Due this month',
    statusArchived: 'Already released',
    daysOne: 'in 1 day',
    daysMany: (n: number) => `in ${n} days`,
    limited: (n: number) => `${new Intl.NumberFormat('en-GB').format(n)} pieces`,
    continuous: 'Permanent collection',
    homeEyebrow: 'Lume Calendar',
    homeTitle: 'The next watches on the horizon.',
    homeText: 'Not the whole news cycle, but a few releases selected in advance and checked against official dates.',
    homeOpen: 'Full calendar',
    radarEyebrow: 'Monitored sources',
    radarTitle: 'Brand radar',
    radarText:
      'These are the makers we monitor. A name alone does not guarantee a calendar card: a watch must pass the Lume selection and have an official future date.',
    radarMajor: 'Major makers',
    radarIndependent: 'Microbrands and independents',
    radarActive: 'Active entry',
    radarWatched: 'Watching',
    radarOfficial: 'Official site',
    radarLastChecked: (date: string) => `Full radar last checked: ${date}`,
  },
} as const;

function utcDay(value: string): Date {
  return new Date(`${value}T00:00:00Z`);
}

export function releasePhase(release: WatchRelease, now = new Date()): ReleasePhase {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const start = utcDay(release.date).valueOf();
  const end = utcDay(release.dateEnd).valueOf();
  if (today < start) return 'upcoming';
  if (today <= end) return 'current';
  return 'archived';
}

export function releaseDaysAway(release: WatchRelease, now = new Date()): number {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.max(0, Math.ceil((utcDay(release.date).valueOf() - today) / 86_400_000));
}

export function activeReleases(now = new Date()): WatchRelease[] {
  return releases.filter((release) => releasePhase(release, now) !== 'archived');
}

export function calendarUrl(lang: Lang): string {
  return lang === 'hu' ? '/naptar/' : '/en/calendar/';
}

export function releaseIcsUrl(release: WatchRelease, lang: Lang): string {
  return `${calendarUrl(lang)}${release.id}.ics`;
}

function icsEscape(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function icsDate(value: string): string {
  return value.replaceAll('-', '');
}

function dayAfter(value: string): string {
  const date = utcDay(value);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function buildReleaseIcs(release: WatchRelease, lang: Lang): string {
  const copy = release.copy[lang];
  const summary =
    lang === 'hu'
      ? `Várható megjelenés: ${release.brand} ${release.model}`
      : `Expected release: ${release.brand} ${release.model}`;
  const description = `${copy.summary}\n${copy.availability}\n${release.sourceUrl}`;
  const stamp = `${release.sourceChecked.replaceAll('-', '')}T000000Z`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lume Journal//Release Calendar//HU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${release.id}@lumejournal.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${icsDate(release.date)}`,
    `DTEND;VALUE=DATE:${icsDate(dayAfter(release.dateEnd))}`,
    `SUMMARY:${icsEscape(summary)}`,
    `DESCRIPTION:${icsEscape(description)}`,
    `URL:${release.sourceUrl}`,
    'TRANSP:TRANSPARENT',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}
