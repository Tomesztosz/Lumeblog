import {readFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {parse} from 'yaml';
export async function readPosts(root='.') {
  const posts=[];
  for(const lang of ['hu','en']) for(const filename of await readdir(join(root,'src/content/posts',lang))) {
    if(!filename.endsWith('.md'))continue;
    const file=`src/content/posts/${lang}/${filename}`,text=await readFile(join(root,file),'utf8');
    const match=text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if(!match)throw new Error(`Invalid frontmatter: ${file}`);
    const data=parse(match[1]);
    posts.push({id:`${lang}/${filename.slice(0,-3)}`,file,data,body:match[2],source:text});
  }
  return posts;
}
export function sourceUrlOf(post) {
  const sections={hu:{'in-hand':'kezben',origins:'eredet',movement:'szerkezet'},en:{'in-hand':'in-hand',origins:'origins',movement:'movement'}};
  return `${post.data.lang==='en'?'/en':''}/${sections[post.data.lang][post.data.column]}/${post.data.slug??post.id.split('/').pop()}/`;
}
