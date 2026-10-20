import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {load} from 'cheerio';

export const reportDir = path.resolve('../reports/2026-10-20-service-navigation');
export const origin = 'https://www.adelaidehandymanmelone.com.au';
export const readPage = route => fs.readFileSync(path.join('public', route.slice(1), 'index.html'), 'utf8');
const sha = value => createHash('sha256').update(value).digest('hex');
export function snapshot() {
  const routes = [...fs.readFileSync('public/sitemap.xml','utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
  const pages = Object.fromEntries(routes.map(route => {
    const $ = load(readPage(route));
    const links = selector => [...new Set($(selector).map((i,a)=>{
      try {const u=new URL($(a).attr('href'),origin);return u.origin===origin ? u.pathname : null;} catch{return null;}
    }).get().filter(x=>routes.includes(x)))];
    return [route,{h1:$('h1').text(), title:$('title').text(), canonical:$('link[rel=canonical]').attr('href'), robots:$('meta[name=robots]').attr('content'), alternates:$('link[hreflang]').map((i,e)=>[$(e).attr('hreflang')+':'+$(e).attr('href')]).get(), footer:sha($('footer').html()), office:sha($('.office-location').html()||''), images:$('main img').map((i,e)=>[$(e).attr('src')]).get(), nav:links('header a'), breadcrumbs:links('.breadcrumbs a'), body:links('main a:not(.breadcrumbs a)'), all:links('a')}];
  }));
  const metrics = {};
  for(const route of routes.filter(x=>/^\/(?:zh\/)?services\/[^/]+\/$/.test(x))) {
    const home=route.startsWith('/zh/')?'/zh/':'/';
    const distance=new Map([[home,0]]),queue=[home];
    for(const p of queue) for(const next of pages[p].all) if(!distance.has(next)){distance.set(next,distance.get(p)+1);queue.push(next);}
    const sources={};for(const kind of ['nav','breadcrumbs','body'])sources[kind]=routes.filter(p=>p!==route&&pages[p][kind].includes(route));
    metrics[route]={distance:distance.get(route)??null,...sources,totalSources:[...new Set(Object.values(sources).flat())].length};
  }
  return {checkedAt:new Date().toISOString(),pages,metrics,robots:sha(fs.readFileSync('public/robots.txt','utf8')),sitemap:sha(fs.readFileSync('public/sitemap.xml','utf8'))};
}
if(process.argv.includes('--baseline')) {
  fs.mkdirSync(reportDir,{recursive:true});
  const file=path.join(reportDir,'before.json');
  if(fs.existsSync(file))throw Error('Baseline exists; refusing to overwrite');
  fs.writeFileSync(file,JSON.stringify(snapshot(),null,2));
  console.log('Captured existing page/link baseline without changing website source.');
}
