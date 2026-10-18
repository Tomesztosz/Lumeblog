import {test} from 'node:test';
import assert from 'node:assert/strict';
import {csvRows,importMeasurement,measurementWindow,summarise,compatibleComparison,metricChanges,opportunity,publisherBrand,hasPartialBaselineExposure} from './lib/seo-measurement.mjs';
// Synthetic values are unit-test fixtures, never Lume traffic or demand estimates.
const now=new Date('2026-10-18T10:00:00Z');
const manifest=(extra={})=>({version:1,source:'google-search-console',property:'https://lumejournal.com/',surface:'web',start:'2026-09-01',end:'2026-09-28',exportedAt:'2026-10-01T12:00:00Z',timezone:'America/Los_Angeles',coverage:'reported-rows',filters:{country:'all',device:'all'},grain:['url'],metrics:['clicks','impressions','position'],columns:{url:'Page',clicks:'Clicks',impressions:'Impressions',position:'Position'},...extra});
const csv='Page,Clicks,Impressions,Position\nhttps://lumejournal.com/szerkezet/co-axial/,10,200,5\nhttps://lumejournal.com/en/movement/co-axial/,20,100,20\n';
const load=(text=csv,m=manifest())=>importMeasurement(text,m,{now});
test('RFC CSV: BOM, escaped quotes, delimiter and quoted newline; malformed data rejected',()=>{
  assert.deepEqual(csvRows('\uFEFFa;b\r\n"x;z";"a""b\nc"\r\n',';').rows,[['x;z','a"b\nc']]);
  for(const text of ['a,a\nx,y','a,b\nx','a,b\n"x,y','a,b\n"x"q,y'])assert.throws(()=>csvRows(text));
});
test('CTR recomputed and position impression-weighted, never averaged across pages',()=>{
  const imported=load(),metrics=summarise(imported.records,imported.manifest.metrics);
  assert.equal(metrics.clicks,30);assert.equal(metrics.impressions,300);assert.equal(metrics.ctr,.1);assert.equal(metrics.position,10);
});
test('empty is unknown, true zero has undefined CTR and position',()=>{
  assert.equal(summarise([],['clicks','impressions']).clicks,null);
  assert.deepEqual(summarise([{clicks:0,impressions:0,position:null}],['clicks','impressions','position']),{rows:1,clicks:0,impressions:0,ctr:null,position:null,citations:null,positionImpressions:0});
});
test('duplicate grains, impossible dates/counts, missing and malformed metrics fail closed',()=>{
  assert.throws(()=>load(csv+csv.split('\n')[1]+'\n'));
  for(const text of [csv.replace('10,200','201,200'),csv.replace('10,200',',200'),csv.replace('10,200','-1,200'),csv.replace('10,200','10,2e2')])assert.throws(()=>load(text));
  assert.throws(()=>load(csv,manifest({end:'2026-09-31'})));
  assert.throws(()=>load(csv,manifest({exportedAt:'2026-12-01'})));
  assert.throws(()=>load(csv,manifest({end:'2026-10-18'})));
  assert.throws(()=>load(csv,manifest({exportedAt:'2026-09-28T10:00:00Z'})));
  assert.throws(()=>load(csv,manifest({grain:['url','url']})));
});
test('canonical own origin URLs only, no credentials or silent joins to foreign pages',()=>{
  for(const value of ['https://foreign.example/','https://lumejournal.com/a/?token=x','https://user:pass@lumejournal.com/a/'])assert.throws(()=>load(csv.replace('https://lumejournal.com/szerkezet/co-axial/',value)));
});
test('window coverage and row dates are explicit; no zero-filled missing dates',()=>{
  assert.equal(measurementWindow(load(),28).records.length,2);
  assert.throws(()=>measurementWindow(load(),90));
  assert.throws(()=>measurementWindow(load(csv,manifest({start:'2026-08-01'})),28));
  const m=manifest({grain:['date','url'],columns:{...manifest().columns,date:'Date'}}),text='Date,'+csv.split('\n')[0]+'\n2026-09-29,'+csv.split('\n')[1];
  assert.throws(()=>load(text,m));
});
test('calendar-month windows use real month boundaries',()=>{
  const d=load(csv,manifest({start:'2026-01-01',end:'2026-09-30'}));
  assert.throws(()=>measurementWindow(d,'3m')); // period-level data cannot be sliced
  d.manifest.grain=['date','url'];d.records=[];
  assert.equal(measurementWindow(d,'3m').period.start,'2026-07-01');
  assert.equal(measurementWindow(d,'6m').period.start,'2026-04-01');
});
test('comparisons reject mismatched source, surface, filters, grain, overlap',()=>{
  const current=measurementWindow(load(),28),baseline=measurementWindow(load(csv,manifest({start:'2026-08-04',end:'2026-08-31'})),28);
  assert.equal(compatibleComparison(current,baseline).gapDays,0);
  for(const change of [{surface:'image'},{source:'bing-webmaster-tools'},{filters:{device:'mobile'}},{grain:['date','url']}])assert.throws(()=>compatibleComparison(current,{...baseline,manifest:{...baseline.manifest,...change}}));
  assert.throws(()=>compatibleComparison(current,current));
  assert.equal(metricChanges({clicks:1},{clicks:0}).clicks.relative,null);
});
test('Google AI impressions and Bing citations remain distinct from traffic and rank',()=>{
  const ai=load('Page,Impressions\nhttps://lumejournal.com/,3',manifest({surface:'google-ai-search',metrics:['impressions'],columns:{url:'Page',impressions:'Impressions'}}));
  assert.equal(summarise(ai.records,ai.manifest.metrics).clicks,null);assert(ai.warnings.some(w=>w.includes('Never add')));
  assert.throws(()=>load(csv,manifest({surface:'google-ai-search'})));
  const bing=load('Page,Citations\nhttps://lumejournal.com/,2',manifest({source:'bing-webmaster-tools',surface:'bing-ai',metrics:['citations'],columns:{url:'Page',citations:'Citations'}}));
  assert.equal(summarise(bing.records,bing.manifest.metrics).citations,2);assert.equal(summarise(bing.records,bing.manifest.metrics).position,null);
});
test('opportunity scores require real sufficient known data, neutral defaults explicit',()=>{
  assert.equal(opportunity({impressions:99,ctr:.1},null,{known:true}).score,null);
  assert.equal(opportunity({impressions:1000,ctr:.1},null,{known:false}).score,null);
  assert(opportunity({impressions:1000,ctr:.1,clicks:100},null,{known:true}).score>0);
  assert.throws(()=>opportunity({impressions:1000,ctr:.1},null,{known:true,effort:0}));
  assert.equal(publisherBrand('Omega chronograph'),'not-publisher-branded');assert.equal(publisherBrand(null),'unavailable');assert.equal(publisherBrand('Lume Journal watches'),'publisher-branded');
  assert.equal(publisherBrand('watch lume paint'),'ambiguous-lume');
  assert.equal(hasPartialBaselineExposure('2026-09-01T01:00:00Z','2026-09-01','America/Los_Angeles'),false);
  assert.equal(hasPartialBaselineExposure('2026-09-01T01:00:00Z','2026-09-01','Europe/Budapest'),true);
  assert.equal(hasPartialBaselineExposure('2026-09-15T12:00:00Z','2026-09-01','America/Los_Angeles'),true);
});
