import type {APIContext,GetStaticPaths} from 'astro';
import {site} from 'astro:config/server';
import {collectDirectory} from '../lib/llms-catalogue';

export const getStaticPaths:GetStaticPaths=async()=>{
  if(!site)throw new Error('The directory requires the configured public site origin');
  const directory=await collectDirectory(new URL(site));
  return [
    {params:{directory:'llms'},props:{body:directory.main}},
    ...(directory.full?[{params:{directory:'llms-full'},props:{body:directory.full}}]:[]),
  ];
};
export function GET({props}:APIContext) {
  return new Response(props.body,{headers:{'Content-Type':'text/plain; charset=utf-8'}});
}
