import { calendarRevision } from '../lib/releases';
export const GET = () => new Response(JSON.stringify({revision:calendarRevision}), {headers:{'Content-Type':'application/json','Cache-Control':'no-cache'}});
