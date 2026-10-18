import type { Lang } from '../i18n/ui';
import type { CalendarEntry } from './releases';
import { collectionSchema } from './seo.ts';
import { sortCalendar, matchesCalendar } from './calendar-state.mjs';

/** The calendar is an editorial list, not a shop or a Google Event listing. */
export function calendarSchema({site,lang,path,title,description,entries,now=new Date()}: {
  site:URL;lang:Lang;path:string;title:string;description:string;entries:CalendarEntry[];now?:Date;
}) {
  const canonical=new URL(path,site).href;
  return collectionSchema({site,lang,canonical,title,description,
    items:sortCalendar(entries,now).filter(entry=>matchesCalendar(entry,{},now)).map(entry=>({
      name:`${entry.brand} ${entry.family} ${entry.model}`,
      description:entry.copy[lang].summary,image:new URL(entry.image,site).href,
      // Permanent, public card anchor. An ordering date is NOT a releaseDate.
      url:`${canonical}#${entry.id}`,
    })),
  });
}
