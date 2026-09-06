import { readFile } from 'node:fs/promises';
import { phaseFor, matchesCalendar } from '../src/lib/calendar-state.mjs';
const entries = [...JSON.parse(await readFile('src/data/releases.json','utf8')), ...JSON.parse(await readFile('src/data/announcements.json','utf8'))];
const now = new Date(), yesterday = new Date(now.valueOf()-86400000);
const changed = entries.some(entry => phaseFor(entry,now) !== phaseFor(entry,yesterday)
  || matchesCalendar(entry,{},now) !== matchesCalendar(entry,{},yesterday));
console.log(changed ? 'Calendar visibility or phase changed.' : 'No calendar boundary today.');
process.exit(changed ? 0 : 1);
