import releaseData from '../data/releases.json';
import brandRadarData from '../data/brand-radar.json';
import calendarMetaData from '../data/calendar-meta.json';
import announcementData from '../data/announcements.json';
import eventStore from '../data/calendar-events.json';
import { hydrateEvents, classifyCalendarEvent } from './calendar-events.mjs';
import { buildEventIcs, exportableEvent } from './calendar-ics.mjs';
import { phaseFor, daysAway, sortCalendar } from './calendar-state.mjs';
import { CALENDAR_UI, type Lang } from '../i18n/ui';
import { createHash } from 'node:crypto';

export type ReleasePrecision = 'day' | 'month';
export type ReleasePhase = 'upcoming' | 'current' | 'archived' | 'review' | 'announced' | 'private';

export interface WatchRelease {
  lifecycle?: any;
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
  eventType?: 'launch' | 'preorder' | 'delivery';
  completedOn?: string;
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

export interface WatchAnnouncement extends Omit<WatchRelease, 'date' | 'dateEnd' | 'precision' | 'confirmed' | 'eventType' | 'completedOn'> {
  status: 'introduced' | 'announced';
  firstSeen: string;
  date?: never;
  dateEnd?: never;
  precision?: never;
  eventType?: never;
  completedOn?: never;
}
export type CalendarEntry = WatchRelease | WatchAnnouncement;
export const announcements = hydrateEvents(announcementData, eventStore) as WatchAnnouncement[];

export const releases = (hydrateEvents(releaseData, eventStore) as WatchRelease[]).sort(
  (a, b) => Date.parse(a.date) - Date.parse(b.date)
);

export const brandRadar = brandRadarData as BrandRadarItem[];
export const calendarMeta = calendarMetaData as {
  lastReviewed: string;
  lastTargetedReview?: string;
  targetThrough?: string;
  targetedReviewStatus?: 'partial' | 'complete';
};
export const calendarEntries: CalendarEntry[] = [...announcements, ...releases];
export const exportableReleases = calendarEntries.filter(exportableEvent);
export const calendarRevision = createHash('sha256').update(JSON.stringify(calendarEntries)).digest('hex');

export { CALENDAR_UI } from '../i18n/ui';

export function releasePhase(release: WatchRelease, now = new Date()): ReleasePhase {
  return phaseFor(release, now) as ReleasePhase;
}

export function releaseDaysAway(release: WatchRelease, now = new Date()): number | null {
  return daysAway(release, now);
}

export function activeReleases(now = new Date()): WatchRelease[] {
  return sortCalendar(releases.filter((release) => classifyCalendarEvent(release, now).active), now);
}

export function calendarUrl(lang: Lang): string {
  return lang === 'hu' ? '/naptar/' : '/en/calendar/';
}

export function releaseIcsUrl(release: CalendarEntry, lang: Lang): string {
  return `${calendarUrl(lang)}${release.id}.ics`;
}

export function buildReleaseIcs(release: CalendarEntry, lang: Lang): string {
  return buildEventIcs(release, lang, CALENDAR_UI[lang]);
}
