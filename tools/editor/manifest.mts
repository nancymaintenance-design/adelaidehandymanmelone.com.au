import {readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';

export const sourceRoot=resolve(fileURLToPath(new URL('../../',import.meta.url)));
export const publicRoot=join(sourceRoot,'public');
const sitemap=readFileSync(join(publicRoot,'sitemap.xml'),'utf8');
const routes=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>new URL(match[1]!).pathname).filter(route=>!route.startsWith('/zh/'));
export const pages=[...new Set([...routes,'/404.html'])].map(route=>{
 const file=route==='/404.html'?'404.html':route==='/'?'index.html':route.slice(1)+'index.html';
 return {route,file,pageId:file==='index.html'||file==='404.html'?file:file.replace(/\/index\.html$/,'').replaceAll('/','~')+'.html'};
});
export const pageIds=pages.map(page=>page.pageId);
