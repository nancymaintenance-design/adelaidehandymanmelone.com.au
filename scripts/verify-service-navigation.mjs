import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {load} from 'cheerio';
import {snapshot,readPage,reportDir,origin} from './check-service-navigation.mjs';
import {caseParents,guideParents,priorityServices,validateNavigationMap,breadcrumbFor} from '../src/service-navigation.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/UFTR/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const before=JSON.parse(fs.readFileSync(path.join(reportDir,'before.json'),'utf8'));
const after=snapshot(),failures=[],http=[],mappings=[],browserChecks=[],interactions=[];
for(const [route,record] of Object.entries(after.pages)){
  for(const field of ['h1','title','canonical','robots','alternates','footer','office','images'])if(JSON.stringify(record[field])!==JSON.stringify(before.pages[route][field]))failures.push({route,field});
  const $=load(readPage(route));
  const data=$('script[type="application/ld+json"]').map((i,e)=>JSON.parse($(e).text())['@graph']||[]).get();
  const schema=data.find(x=>x['@type']==='BreadcrumbList');
  const en=route.replace(/^\/zh(?=\/)/,''),zh=route.startsWith('/zh/'),prefix=zh?'/zh':'';
  let type='information',owner=null,rationale='Existing public navigation destination';
  if(/^\/services\/[^/]+\/$/.test(en)){type='service';owner=route;rationale='Established service URL retained; no migration or competing city page';}
  else if(en==='/'){type='home';owner=route;rationale='Existing city-business destination retained';}
  else if(en.startsWith('/case-studies/')&&en!='/case-studies/'){type='case';owner=prefix+'/services/'+caseParents[en.split('/')[2]]+'/';rationale='Task-specific recorded evidence matches the named service';}
  else if(en.startsWith('/guides/')&&en!='/guides/'){type='guide';const slug=guideParents[en.split('/')[2]];owner=slug?prefix+'/services/'+slug+'/':null;rationale=slug?'Guide sections principally address this service':'Mixed-service or general preparation guide retains its collection';}
  else if(en.startsWith('/service-areas/')&&en!='/service-areas/'){type=en.split('/').length===5?'suburb':'region';rationale='Approved regional membership; no fabricated commercial owner';}
  const parent=schema?.itemListElement.at(-2)?.item||null;
  mappings.push({page_id:route,url:origin+route,locale:zh?'zh-Hans':'en-AU',type,service_group:owner?after.pages[owner].h1:null,owner_id:owner,commercial_owner_url:owner?origin+owner:null,primary_parent_url:parent,breadcrumb_label:schema?.itemListElement.at(-1)?.name||record.h1,counterpart:origin+(zh?en:'/zh'+route),rationale,path:schema?.itemListElement||[]});
  const bad=$('a[href="tel:+611300838722"]').length||!$('a[href="tel:+61416614281"]').length||!$('a[href="mailto:admin@melonemaintenance.com.au"]').length;
  if(bad)failures.push({route,field:'contact'});
  // Check all same-site main links (including fragment targets), not only the new map.
  for(const a of $('main a').toArray()){
    const href=$(a).attr('href');if(!href)continue;
    let u;try{u=new URL(href,origin+route);}catch{failures.push({route,href,reason:'invalid URL'});continue;}
    if(u.origin!==origin||!['http:','https:'].includes(u.protocol)||u.pathname.startsWith('/api/'))continue;
    if(!after.pages[u.pathname]){if(!fs.existsSync(path.join('public',u.pathname.slice(1))))failures.push({route,href,reason:'missing public target'});continue;}
    if(u.hash){const target=load(readPage(u.pathname)),id=decodeURIComponent(u.hash.slice(1));if(!target('[id]').toArray().some(e=>target(e).attr('id')===id))failures.push({route,href,reason:'missing fragment'});}
  }
}
for(const field of ['robots','sitemap'])if(before[field]!==after[field])failures.push({field,reason:'policy or route list drift'});
// Validate cycle/missing-parent rejection and safe JSON/HTML using real helpers.
assert.throws(()=>validateNavigationMap(new Map([['/',{route:'/',label:'Home',rationale:'test',parent:'/'}]])),/cycle/);
assert.throws(()=>validateNavigationMap(new Map([['/',{route:'/',label:'Home',rationale:'test',parent:'/missing/'}]])),/Missing/);
const special=new Map([['/',{route:'/',label:'Home',parent:null}],['/test/',{route:'/test/',label:'中文 "A&B" </script>',parent:'/'}]]);
const result=breadcrumbFor(special.get('/test/'),special,origin),specialHtml=load(result.html);
assert.equal(specialHtml('[aria-current=page]').text(),result.schema.itemListElement.at(-1).name);
assert.equal(specialHtml('script').length,0);

const local=process.env.NAVIGATION_PREVIEW || 'http://127.0.0.1:5185';
const jobs=Object.keys(after.pages);
for(let i=0;i<jobs.length;i+=6)await Promise.all(jobs.slice(i,i+6).map(async route=>{
  const r=await fetch(local+route);const html=await r.text();const $=load(html);
  http.push({route,status:r.status,h1:$('h1').text(),lang:$('html').attr('lang')});
  if(r.status!==200||$('h1').text()!==after.pages[route].h1)failures.push({route,reason:'HTTP or soft404'});
}));
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
  const context=await browser.newContext({reducedMotion:'reduce'});
  await context.route('**/*',r=>{const request=r.request(),url=new URL(request.url());return url.origin===local&&request.method()==='GET'&&!url.pathname.startsWith('/api/')?r.continue():r.abort();});
  const page=await context.newPage();
  const representative=['/','/services/door-repair/','/services/interior-repairs-assembly/','/case-studies/north-adelaide-door-repair/','/guides/field-notes-wall-interior-repairs-job-list/','/guides/field-notes-grouping-multiple-household-jobs/','/service-areas/north-north-east/modbury/','/contact/'];
  for(const width of [360,390,768,1440])for(const prefix of ['','/zh'])for(const route of representative){
    await page.setViewportSize({width,height:1000});await page.goto(local+prefix+route,{waitUntil:'load'});
    await page.evaluate(()=>document.fonts.ready);
    const row=await page.evaluate(()=>{
      const nav=document.querySelector('.breadcrumbs'),footer=document.querySelector('footer'),main=document.querySelector('main'),rect=el=>el?.getBoundingClientRect();
      return {overflow:document.documentElement.scrollWidth>innerWidth+1,mainWidth:rect(main)?.width,footerHeight:rect(footer)?.height,navHeight:rect(nav)?.height||0,navTop:rect(nav)?.top||0,h1Top:rect(document.querySelector('h1'))?.top,targets:[...document.querySelectorAll('.breadcrumbs a')].map(a=>rect(a).height),office:!!document.querySelector('.office-location iframe'),shortcuts:document.querySelectorAll('.service-shortcuts a').length};
    });
    row.route=prefix+route;row.width=width;browserChecks.push(row);
    if(row.overflow||row.targets.some(h=>h<43.5)||(width===1440&&(row.footerHeight>420||row.mainWidth<1100)))failures.push({reason:'browser geometry',...row});
    if(route==='/'&&(!row.office||row.shortcuts!==9))failures.push({reason:'map/home entry regression',...row});
    await page.evaluate(async()=>{const images=[...document.images];images.forEach(img=>img.loading='eager');await Promise.all(images.map(img=>img.decode().catch(()=>{})));});
    if(width===390&&['/','/case-studies/north-adelaide-door-repair/'].includes(route))await page.screenshot({path:path.join(reportDir,`preview-${prefix? 'zh':'en'}-${route==='/'?'home':'case'}-390.png`),fullPage:true});
    if(width===1440&&prefix==='/zh'&&route==='/')await page.screenshot({path:path.join(reportDir,'preview-zh-home-1440.png'),fullPage:true});
  }
  for(const prefix of ['','/zh']){
    await page.goto(local+prefix+'/case-studies/north-adelaide-door-repair/');
    const events=[];
    const capture=msg=>{const text=msg.text();if(text.startsWith('__BREADCRUMB_PROOF__'))events.push(JSON.parse(text.slice('__BREADCRUMB_PROOF__'.length)));};
    page.on('console',capture);
    await page.evaluate(()=>{window.gtag=(...args)=>console.debug('__BREADCRUMB_PROOF__'+JSON.stringify(args));});
    const link=page.locator('.breadcrumbs a').nth(1);await link.focus();
    assert.ok(await link.evaluate(el=>document.activeElement===el));
    assert.notEqual(await link.evaluate(el=>getComputedStyle(el).outlineStyle),'none');
    await Promise.all([page.waitForURL(local+prefix+'/services/door-repair/'),link.press('Enter')]);
    assert.equal(events.filter(e=>e[1]==='breadcrumb_click').length,1);
    assert.equal(events.filter(e=>e[1]==='generate_lead').length,0);
    assert.ok((await page.locator('h1').textContent()).length>0);
    const enquiry=page.locator(`main a[href="${prefix}/contact/"]`).first();
    assert.equal(await enquiry.count(),1,'Service enquiry entry must exist');
    await Promise.all([page.waitForURL(local+prefix+'/contact/'),enquiry.click()]);
    assert.equal(await page.locator('[data-enquiry-form]').count(),1);
    page.off('console',capture);
    interactions.push({locale:prefix?'zh-Hans':'en-AU',flow:'case → service → contact form',keyboardFocus:true,eventCount:1,realSubmission:false});
  }
  await context.close();
}finally{await browser.close();}
const metricChanges=Object.fromEntries(Object.keys(after.metrics).map(route=>[route,{before:before.metrics[route],after:after.metrics[route]}]));
fs.writeFileSync(path.join(reportDir,'after.json'),JSON.stringify(after,null,2));
fs.writeFileSync(path.join(reportDir,'navigation-mapping.json'),JSON.stringify(mappings,null,2));
fs.writeFileSync(path.join(reportDir,'link-metrics.json'),JSON.stringify(metricChanges,null,2));
fs.writeFileSync(path.join(reportDir,'local-verification.json'),JSON.stringify({checkedAt:new Date().toISOString(),failures,http,browserChecks,interactions,scope:'Local only; external analytics, Maps and API requests blocked. No enquiries sent.',priorityServices},null,2));
console.log(JSON.stringify({pages:http.length,mappings:mappings.length,browserChecks:browserChecks.length,interactions:interactions.length,failures:failures.slice(0,12),failureCount:failures.length}));
if(failures.length)process.exitCode=1;
