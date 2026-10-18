import {readFile} from 'node:fs/promises';
import {readDirectory,findDirectoryEntries} from './lib/llms-reader.mjs';
const query=process.argv.slice(2).join(' ').trim();
if(!query){console.log('Usage: npm run llms:find -- "Co-Axial". Local compatibility demonstration, not evidence of external AI adoption.');process.exit(0);}
const main=await readDirectory(await readFile('dist/llms.txt','utf8'));
const full=main.entries.find(e=>new URL(e.url).pathname==='/llms-full.txt');
const entries=full?(await readDirectory(await readFile('dist/llms-full.txt','utf8'))).entries:main.entries;
console.log(JSON.stringify({source:full?'/llms-full.txt':'/llms.txt',query,results:findDirectoryEntries(entries,query),limitation:'A local deterministic client test is not proof that any external AI service reads or cites this directory.'},null,2));
