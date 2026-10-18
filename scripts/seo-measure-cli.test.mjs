import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {resolve,join} from 'node:path';
test('real CLI: native page CSV mapping, private output, no invented baseline zeros',async()=>{
  await mkdir('output/seo-p2-p3',{recursive:true});
  const dir=await mkdtemp(resolve('output/seo-p2-p3/measurement-fixture-'));
  const m={version:1,synthetic:true,source:'google-search-console',property:'https://lumejournal.com/',surface:'web',start:'2026-09-01',end:'2026-09-28',exportedAt:'2026-10-01T12:00:00Z',timezone:'America/Los_Angeles',coverage:'reported-rows',filters:{country:'all'},grain:['url'],metrics:['clicks','impressions','position'],columns:{url:'Top pages',clicks:'Clicks',impressions:'Impressions',position:'Position'},file:'Pages.csv'};
  await writeFile(join(dir,'manifest.json'),JSON.stringify(m));await writeFile(join(dir,'Pages.csv'),'Top pages,Clicks,Impressions,CTR,Position\nhttps://lumejournal.com/szerkezet/co-axial/,10,200,5%,5\n');
  const result=spawnSync(process.execPath,['scripts/seo-measure.mjs','--manifest',join(dir,'manifest.json')],{encoding:'utf8',windowsHide:true});
  assert.equal(result.status,0,result.stderr);
  const path=result.stdout.match(/Private measurement snapshot: (.+\.json)\./)?.[1];assert(path&&resolve(path).startsWith(resolve('.seo-private/reports')));
  const report=JSON.parse(await readFile(path,'utf8'));assert.equal(report.status,'Synthetic test fixture, NOT Lume traffic');assert.equal(report.metrics.clicks,10);assert.equal(report.metrics.ctr,.05);assert.equal(report.baseline,null);assert.equal(report.pages[0].content.type,'article');assert.equal(report.pages[0].changes,null);
  await writeFile(join(dir,'Pages.csv'),'Top pages,Clicks,Impressions,Position\nhttps://lumejournal.com/,1,20,2\nhttps://lumejournal.com/,1,20,2\n');
  const before=await readdir('.seo-private/reports');
  const invalid=spawnSync(process.execPath,['scripts/seo-measure.mjs','--manifest',join(dir,'manifest.json')],{encoding:'utf8',windowsHide:true});
  assert.notEqual(invalid.status,0);assert.match(invalid.stderr,/Duplicate grain/);assert.deepEqual(await readdir('.seo-private/reports'),before);
});
