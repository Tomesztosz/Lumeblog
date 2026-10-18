import { normalUrl } from './radar-core.mjs';
export async function fetchOfficial(url,hosts,prior={},fetcher=fetch) {
  const headers={'User-Agent':'LumeCalendarMonitor/2.0 (+https://lumejournal.com)',Accept:'text/html, application/json'};
  if(prior.etag)headers['If-None-Match']=prior.etag;
  if(prior.lastModified)headers['If-Modified-Since']=prior.lastModified;
  const signal=AbortSignal.timeout(25000);
  for(let redirects=0;redirects<=4;redirects++) {
    if(!normalUrl(url)||!hosts.has(new URL(url).hostname))throw Error('Unregistered source or redirect');
    const r=await fetcher(url,{headers,redirect:'manual',signal});
    if([301,302,303,307,308].includes(r.status)) {const next=normalUrl(r.headers.get('location'),url);await r.body?.cancel();if(!next)throw Error('Invalid redirect');url=next;continue;}
    if(r.status===304)return {notModified:true,url};
    if(!r.ok){await r.body?.cancel();throw Error(`HTTP ${r.status}`);}
    const type=r.headers.get('content-type')||'';
    if(!/text\/html|application\/json/i.test(type)){await r.body?.cancel();throw Error('Unsupported content type');}
    const chunks=[];let size=0;
    for await(const chunk of r.body){size+=chunk.length;if(size>8*1024*1024)throw Error('Source exceeds 8 MB');chunks.push(chunk);}
    const html=Buffer.concat(chunks).toString('utf8');if(!html.trim())throw Error('Empty response');
    return {url,html,json:/application\/json/i.test(type),etag:r.headers.get('etag'),lastModified:r.headers.get('last-modified')};
  }
  throw Error('Too many redirects');
}
