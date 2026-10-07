import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { resolve, join, extname, sep } from 'node:path';
import { createServer } from 'node:http';
import { secureHtml } from './lib/security-policy.mjs';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const out=resolve('output/article-review/rattrapante');
const profile=await mkdtemp(join(out,'browser-profile-'));
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-extensions','--disable-background-networking','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
const pause=ms=>new Promise(r=>setTimeout(r,ms));let ws,server;
try{
  let port;for(let i=0;i<100;i++){try{port=(await readFile(join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];break;}catch{await pause(100);}}
  assert(port,'Browser debugging port');
  const targets=await(await fetch(`http://127.0.0.1:${port}/json`)).json();
  ws=new WebSocket(targets.find(x=>x.type==='page').webSocketDebuggerUrl);
  await new Promise((ok,fail)=>{ws.onopen=ok;ws.onerror=fail;});
  let id=0;const pending=new Map(),exceptions=[];
  ws.onmessage=({data})=>{const m=JSON.parse(data);if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params);if(!pending.has(m.id))return;const{ok,fail,timer}=pending.get(m.id);pending.delete(m.id);clearTimeout(timer);m.error?fail(Error(JSON.stringify(m.error))):ok(m.result);};
  const send=(method,params={})=>new Promise((ok,fail)=>{const key=++id,timer=setTimeout(()=>{pending.delete(key);fail(Error(method+' timeout'));},15000);pending.set(key,{ok,fail,timer});ws.send(JSON.stringify({id:key,method,params}));});
  const run=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});assert(!r.exceptionDetails,JSON.stringify(r.exceptionDetails));return r.result.value;};
  await send('Page.enable');await send('Runtime.enable');
  const results=[];
  for(const [lang,file]of[['hu','megnezes.html'],['en','english.html']])for(const width of[1440,390,320]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    await send('Page.navigate',{url:pathToFileURL(join(out,file)).href});await pause(250);
    await run(`(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode()}));return true})()`);
    const check=await run(`(()=>{const m=document.querySelector('[data-rattrapante-model]');return{lang:document.documentElement.lang,overflow:document.documentElement.scrollWidth>innerWidth,images:[...document.images].every(i=>i.naturalWidth),links:document.querySelectorAll('.article-body a').length,model:m?.dataset.initialised,autoplay:m?.dataset.running,sources:document.querySelectorAll('.reader-sources a').length}})()`);
    if(check.overflow)console.log({width,overflow:await run(`([...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+1||r.left< -1}).slice(0,12).map(e=>({tag:e.tagName,cl:e.className,w:e.getBoundingClientRect().width,text:e.textContent.slice(0,65)})))`)});
    assert.deepEqual(check,{lang,overflow:false,images:true,links:0,model:'true',autoplay:'false',sources:9});
    const snap=async name=>{const s=await send('Page.captureScreenshot',{format:'png'});await writeFile(join(out,name),Buffer.from(s.data,'base64'));};
    if(width===1440)await snap(`qa-${lang}-hero.png`);
    await run(`document.documentElement.style.scrollBehavior='auto';document.querySelector('[data-rattrapante-model]').scrollIntoView({behavior:'instant',block:'start'})`);await pause(80);
    const example=await run(`(()=>{const m=document.querySelector('[data-rattrapante-model]');m.querySelector('[data-action=example]').click();return [...m.querySelectorAll('output')].map(x=>x.textContent)})()`);
    assert.deepEqual(example,lang==='hu'?['18,0 s','12,0 s','6,0 s']:['18.0 s','12.0 s','6.0 s']);
    await snap(`qa-${lang}-${width}-light-model.png`);
    await run(`document.querySelector('[data-review-theme]').click();document.querySelector('[data-review-size]').click()`);
    assert.equal(await run('document.documentElement.scrollWidth>innerWidth'),false);
    await snap(`qa-${lang}-${width}-dark-model.png`);
    const follow=await run(`(()=>{const m=document.querySelector('[data-rattrapante-model]'),q=s=>m.querySelector(s);q('[data-action=split]').click();const catchUp=q('[data-main-hand]').getAttribute('transform')===q('[data-split-hand]').getAttribute('transform');q('[data-action=reset]').click();for(let n=0;n<12;n++)q('[data-action=step]').click();q('[data-action=split]').click();for(let n=0;n<6;n++)q('[data-action=step]').click();return {catchUp,held:m.dataset.held,elapsed:m.dataset.elapsed,values:[...m.querySelectorAll('output')].map(x=>x.textContent)}})()`);
    assert.equal(follow.catchUp,true);assert.equal(follow.held,'true');assert.equal(follow.elapsed,'18.000');assert.deepEqual(follow.values,example);
    await run(`document.querySelector('[data-action=reset]').click();document.querySelector('[data-action=toggle]').click()`);await pause(180);
    assert(await run(`Number(document.querySelector('[data-rattrapante-model]').dataset.elapsed)>0`));
    await run(`document.querySelector('[data-action=split]').click()`);
    const captured=await run(`document.querySelector('output[data-held]').textContent`);await pause(200);
    assert.equal(await run(`document.querySelector('output[data-held]').textContent`),captured);
    await run(`document.querySelector('[data-action=toggle]').click()`);
    const stopped=await run(`document.querySelector('[data-rattrapante-model]').dataset.elapsed`);await pause(120);
    assert.equal(await run(`document.querySelector('[data-rattrapante-model]').dataset.elapsed`),stopped);
    await run(`document.querySelector('[data-action=toggle]').click();window.scrollTo({top:0,behavior:'instant'})`);await pause(120);
    assert.equal(await run(`document.querySelector('[data-rattrapante-model]').dataset.running`),'false');
    // Controls remain keyboard-focusable; no automatic restart after returning.
    await run(`document.querySelector('[data-rattrapante-model]').scrollIntoView({behavior:'instant'});document.querySelector('[data-action=toggle]').focus()`);await pause(150);
    assert.equal(await run(`document.activeElement.dataset.action`),'toggle');
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',windowsVirtualKeyCode:13});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await pause(80);
    assert.equal(await run(`document.querySelector('[data-rattrapante-model]').dataset.running`),'true');
    await run(`document.querySelector('[data-action=toggle]').click()`);
    results.push({lang,width,...check,splitAndCatch:true,manual:true,keyboard:true,offscreenPause:true});
  }
  const integration=[];
  if(process.argv.includes('--integration')){
    const base=join(out,'integration-build');
    server=createServer(async(req,res)=>{try{let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname.endsWith('/'))pathname+='index.html';const path=resolve(base,'.'+pathname);assert(path.startsWith(base+sep));let bytes=await readFile(path);const ext=extname(path);if(ext==='.html')bytes=secureHtml(bytes.toString('utf8'));res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[ext]??'application/octet-stream');res.end(bytes);}catch{res.writeHead(404);res.end();}});
    await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
    for(const lang of ['hu','en']){
      await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
      await send('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/model-integration-test/${lang}/`});await pause(300);
      const result=await run(`(()=>{const models=[...document.querySelectorAll('[data-rattrapante-model]')];models[0].querySelector('[data-action=example]').click();return{count:models.length,ready:models.every(m=>m.dataset.initialised==='true'),first:models[0].dataset.elapsed,second:models[1].dataset.elapsed,article:document.querySelector('.article-body [data-rattrapante-model]')!==null,standalone:document.querySelector('.shared-model-stage [data-rattrapante-model]')!==null,csp:document.querySelector('meta[http-equiv="Content-Security-Policy"]')!==null,share:[...document.querySelectorAll('[data-model-url]')].map(n=>n.dataset.modelUrl)}})()`);
      assert.equal(result.count,2);assert(result.ready&&result.article&&result.standalone&&result.csp);assert.equal(result.first,'18.000');assert.equal(result.second,'0.000');assert(result.share.every(url=>url===`https://lumejournal.com/${lang==='hu'?'muhely':'en/workshop'}/rattrapante/`));integration.push({lang,...result});
    }
  }
  assert.equal(exceptions.length,0,JSON.stringify(exceptions));
  await writeFile(join(out,'browser-checks.json'),JSON.stringify({results,integration,errors:0},null,2));
  console.log(JSON.stringify({viewports:results.length,integrationPages:integration.length,errors:0}));await send('Browser.close');
}finally{ws?.close();if(browser.exitCode===null)browser.kill();server?.close();}
