// Read-only online validation of the locally generated index. Emits JSON only.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {load} from 'cheerio';

const root=path.resolve(import.meta.dirname,'..');
const siteDir=path.join(root,'public');
const origin=load(fs.readFileSync(path.join(siteDir,'index.html'),'utf8'))('link[rel="canonical"]').attr('href').replace(/\/$/,'');
if(origin!=='https://www.adelaidehandymanmelone.com.au')throw new Error('Verify the intended production site before running online checks.');
const text=fs.readFileSync(path.join(siteDir,'llms.txt'),'utf8');
const entries=[...text.matchAll(/^- \[([^\n]+)\]\((https:\/\/[^)]+)\): ([^\n]+)$/gm)].map(([,title,url,summary])=>({title,url,summary}));
const hash=value=>createHash('sha256').update(value.replace(/\r\n/g,'\n')).digest('hex');
const unescape=value=>value.replace(/\\([\\\[\]])/g,'$1').replaceAll('&lt;','<').replaceAll('&gt;','>');
async function get(url,headers={}){
  for(let attempt=1;attempt<=2;attempt++)try{
    const r=await fetch(url,{headers,signal:AbortSignal.timeout(15000)});
    return {status:r.status,finalUrl:r.url,contentType:r.headers.get('content-type'),xRobots:r.headers.get('x-robots-tag'),body:await r.text(),attempt};
  }catch(error){if(attempt===2)return {networkError:error.message,code:error.cause?.code,attempt};}
}
const records=[],queue=[...entries];
async function worker(){while(queue.length){
  const entry=queue.shift(),url=new URL(entry.url);
  if(url.origin!==origin)throw new Error(`Outside approved site: ${entry.url}`);
  const response=await get(entry.url),issues=[];
  if(response.networkError)issues.push('network-unverified');
  else if(response.status!==200)issues.push(`HTTP ${response.status}`);
  const $=load(response.body||'');
  const language=url.pathname.startsWith('/zh/')?'zh-Hans':'en-AU';
  const other=origin+(language==='zh-Hans'?url.pathname.slice(3):'/zh'+url.pathname);
  const body=$('main').text().replace(/\s+/g,' ').trim();
  const title=$('main h1').first().text().replace(/\s+/g,' ').trim();
  const canonical=$('link[rel="canonical"]').attr('href');
  const alternates=$('link[rel="alternate"][hreflang]').toArray().map(e=>({language:$(e).attr('hreflang'),url:$(e).attr('href')}));
  if(!response.networkError){
    if(response.finalUrl!==entry.url)issues.push('unexpected redirect');
    if(!/text\/html/i.test(response.contentType||'')||body.length<100)issues.push('initial HTML unreadable');
    if(title!==unescape(entry.title)||!body.includes(unescape(entry.summary)))issues.push('title/summary differs from visible body');
    if($('html').attr('lang')!==language)issues.push('language mismatch');
    if(canonical!==entry.url)issues.push('canonical mismatch');
    if(!alternates.some(a=>a.url===entry.url&&a.language===language)||!alternates.some(a=>a.url===other))issues.push('language pairing mismatch');
    if(/\b(?:noindex|none)\b/i.test(($('meta[name="robots"]').attr('content')||'')+' '+(response.xRobots||'')))issues.push('noindex');
  }
  const local=fs.readFileSync(path.join(siteDir,url.pathname,'index.html'),'utf8');
  records.push({...entry,counterpart:other,...response,body:undefined,language:$('html').attr('lang'),canonical,alternates,initialBodyCharacters:body.length,htmlMatchesLocal:response.body?hash(response.body)===hash(local):null,issues});
}}
await Promise.all([worker(),worker()]);
const resources=[];
for(const route of ['/robots.txt','/sitemap.xml','/llms.txt','/zh/llms.txt']){
  const r=await get(origin+route);
  resources.push({route,...r,body:route==='/robots.txt'?r.body:undefined,characters:r.body?.length,matchesLocal:r.body?hash(r.body)===hash(fs.readFileSync(path.join(siteDir,route),'utf8')):null});
}
const agents=[];
for(const ua of ['Googlebot','OAI-SearchBot','Claude-SearchBot','PerplexityBot'])for(const route of ['/','/zh/']){
  const r=await get(origin+route,{'User-Agent':ua});
  agents.push({ua,route,status:r.status,finalUrl:r.finalUrl,networkError:r.networkError,htmlMatchesLocal:r.body?hash(r.body)===hash(fs.readFileSync(path.join(siteDir,route,'index.html'),'utf8')):null});
}
console.log(JSON.stringify({checkedAt:new Date().toISOString(),origin,selectedLinks:entries.length,records:records.sort((a,b)=>a.url.localeCompare(b.url)),resources,simulatedAgents:agents,newIndexDeploymentStatus:'LOCAL ONLY: production llms is expected to differ until separately approved release',limitations:['Simulated UA requests do not verify real crawler identity, visits, indexing, or citations.','A successful request from this environment does not establish reachability from all IPs/regions.'] }));
if(records.some(r=>r.issues.length))process.exitCode=1;
