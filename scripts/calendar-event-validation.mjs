import assert from 'node:assert/strict';
import { dateWindow, eventIdentity, validInstant } from '../src/lib/calendar-events.mjs';
export function validateEventStore(store,entries,brands) {
  assert.equal(store.schemaVersion,1);assert(Number.isInteger(store.version)&&store.version>=0);
  const ids=new Set(entries.map(e=>e.id)),identities=new Set();
  for(const entry of entries)assert(store.events[entry.id],`${entry.id}: migration missing`);
  for(const [id,e]of Object.entries(store.events)) {
    assert(ids.has(id),`${id}: orphan lifecycle`);
    assert(['approved','review','excluded'].includes(e.editorial));
    assert(['planned','occurred','cancelled','postponed'].includes(e.sourceStatus));
    const key=eventIdentity(e.identity);assert(key,`${id}: incomplete identity`);
    assert(!identities.has(key),`${id}: duplicate identity, editorial review required`);identities.add(key);
    assert(Number.isInteger(e.revision)&&e.revision>=0&&Array.isArray(e.history)&&Array.isArray(e.evidence));
    assert(e.history.length===e.revision,`${id}: history/revision mismatch`);
    assert(e.schedule&&['confirmed','estimated',undefined].includes(e.schedule.certainty));
    if(!e.verification)dateWindow(e.schedule);
    const brand=brands.find(b=>b.key===e.identity.brand);
    assert(brand,`${id}: unregistered brand`);
    assert.equal(e.identity.brand,entries.find(entry=>entry.id===id).brandKey,`${id}: identity brand mismatch`);
    const hosts=new Set([brand.sourceUrl,...brand.additionalSources||[]].map(u=>new URL(u).hostname));
    for(const source of e.allowedSources||[]){const url=new URL(source);assert(url.protocol==='https:'&&hosts.has(url.hostname)&&!url.username&&!url.password,`${id}: invalid allowed source`);}
    for(const proof of e.evidence) {
      assert(proof.eventId===id&&proof.eventType===e.identity.type,`${id}: wrong event evidence`);
      assert(['planned','occurred','cancelled','postponed'].includes(proof.claim));
      if(!e.verification)assert.equal(proof.claim,e.sourceStatus,`${id}: source state/evidence mismatch`);
      assert(proof.quote?.trim()&&validInstant(proof.checkedAt)&&proof.accepted===true,`${id}: incomplete evidence`);
      const url=new URL(proof.url);assert(url.protocol==='https:'&&hosts.has(url.hostname));
      if(proof.publishedAt)assert(validInstant(proof.publishedAt));
    }
    if(['occurred','cancelled','postponed'].includes(e.sourceStatus)&&!e.verification)assert(e.evidence.some(p=>p.claim===e.sourceStatus),`${id}: missing status evidence`);
  }
}
