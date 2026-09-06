import releaseData from '../data/releases.json';
import brandRadarData from '../data/brand-radar.json';
import calendarMetaData from '../data/calendar-meta.json';
import announcementData from '../data/announcements.json';
import { phaseFor, daysAway } from './calendar-state.mjs';
import { foldIcsLine } from './ical-lines.mjs';
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
  additionalSources?: string[];
}

export interface WatchAnnouncement extends Omit<WatchRelease, 'date' | 'dateEnd' | 'precision' | 'confirmed'> {
  status: 'introduced' | 'announced';
  firstSeen: string;
  date?: never;
  dateEnd?: never;
  precision?: never;
}
export type CalendarEntry = WatchRelease | WatchAnnouncement;
export const announcements = announcementData as WatchAnnouncement[];

export const releases = (releaseData as WatchRelease[]).sort(
  (a, b) => Date.parse(a.date) - Date.parse(b.date)
);

export const brandRadar = brandRadarData as BrandRadarItem[];
export const calendarMeta = calendarMetaData as { lastReviewed: string };
export const calendarEntries: CalendarEntry[] = [...announcements, ...releases];

export { CALENDAR_UI } from '../i18n/ui';

function utcDay(value: string): Date {
  return new Date(`${value}T00:00:00Z`);
}

export function releasePhase(release: WatchRelease, now = new Date()): ReleasePhase {
  return phaseFor(release, now) as ReleasePhase;
}

export function releaseDaysAway(release: WatchRelease, now = new Date()): number {
  return daysAway(release, now);
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
  ].map(foldIcsLine).join('\r\n');
}
