import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {load} from 'cheerio';
import {spawn} from 'node:child_process';
import {validateNavigationMap,breadcrumbFor} from '../src/service-navigation.mjs';

test('navigation map rejects missing parents, missing owners, cycles and empty labels',()=>{
  const home={route:'/',label:'Home',parent:null,rationale:'Existing homepage'};
  const child={route:'/test/',label:'Test',parent:'/',rationale:'Reviewed'};
  for(const [patch,message] of [[{parent:'/missing/'},/Missing navigation parent/],[{owner:'/missing/'},/Missing service owner/],[{parent:'/test/'},/cycle/],[{label:''},/Incomplete/]]){
    assert.throws(()=>validateNavigationMap(new Map([['/',home],['/test/',{...child,...patch}]])),message);
  }
  assert.throws(()=>validateNavigationMap(new Map([['/',home],['/test/',{...child,parent:'/other/'}],['/other/',{...child,route:'/other/',parent:'/test/'}]])),/cycle/);
});

test('breadcrumb renderer safely preserves Chinese, quotes, ampersands and script-like labels',()=>{
  const label='中文 "A&B" </script><script>alert(1)</script>';
  const home={route:'/',label:'Home',parent:null},child={route:'/test/',label,parent:'/'};
  const result=breadcrumbFor(child,new Map([['/',home],['/test/',child]]),'https://www.adelaidehandymanmelone.com.au');
  const $=load(result.html);assert.equal($('script').length,0);assert.equal($('[aria-current=page]').text(),label);assert.equal(result.schema.itemListElement.at(-1).name,label);
  assert.equal(breadcrumbFor(home,new Map([['/',home]]),'https://www.adelaidehandymanmelone.com.au'),null);
});

test('all public non-home pages have one semantic, schema-matched breadcrumb and reciprocal parent',()=>{
  const origin='https://www.adelaidehandymanmelone.com.au';
  const routes=[...fs.readFileSync('public/sitemap.xml','utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
  for(const route of routes){
    const $=load(fs.readFileSync('public'+route+'index.html','utf8'));
    const graphs=$('script[type="application/ld+json"]').map((i,s)=>JSON.parse($(s).text())['@graph']||[]).get();
    const schemas=graphs.filter(x=>x['@type']==='BreadcrumbList');
    if(['/','/zh/'].includes(route)){assert.equal(schemas.length,0);continue;}
    assert.equal($('.breadcrumbs').length,1,route);
    const items=$('.breadcrumbs > ol > li');
    assert.ok(items.length>=2,'Missing ordered breadcrumb: '+route);
    assert.equal(schemas.length,1,route);
    assert.equal(items.length,schemas[0].itemListElement.length,route);
    items.each((i,li)=>{
      const last=i===items.length-1,e=schemas[0].itemListElement[i];
      assert.equal(e.position,i+1,route);assert.equal(e.name,$(li).find('a,[aria-current=page]').text(),route);
      if(last){assert.equal($(li).find('a').length,0,route);assert.equal($(li).find('[aria-current=page]').length,1);assert.equal(e.item,origin+route);}
      else {assert.equal($(li).find('a').attr('href'),e.item,route);assert.equal(new URL(e.item).origin,origin);assert.ok(routes.includes(new URL(e.item).pathname));assert.equal(e.item.includes('/zh/'),route.startsWith('/zh/'));}
    });
    const webpage=graphs.find(x=>x['@type']==='WebPage');
    assert.equal(webpage.breadcrumb['@id'],schemas[0]['@id'],route);
    const parent=new URL(schemas[0].itemListElement.at(-2).item).pathname;
    const p=load(fs.readFileSync('public'+parent+'index.html','utf8'));
    assert.ok(p('a').toArray().some(a=>new URL(p(a).attr('href'),origin).pathname===route),'Parent does not expose child: '+route);
    assert.ok($('a[href="tel:+61416614281"]').length,route);
    assert.ok($('a').toArray().some(a=>new URL($(a).attr('href'),origin).pathname===(route.startsWith('/zh/')?'/zh/contact/':'/contact/')),route);
  }
});

test('priority repair pages are reachable in one crawlable homepage click in both languages',()=>{
  const slugs=['cabinet-drawer-repair','sliding-door-repair','wall-patching-repair','pressure-cleaning','flyscreen-repair','door-repair','gutter-cleaning','fence-gate-repair','flat-pack-assembly'];
  for(const prefix of ['/','/zh/']){
    const $=load(fs.readFileSync('public'+prefix+'index.html','utf8'));
    const hrefs=$('main a').map((i,a)=>new URL($(a).attr('href'),'https://www.adelaidehandymanmelone.com.au').pathname).get();
    for(const slug of slugs)assert.ok(hrefs.includes(prefix+'services/'+slug+'/'),prefix+slug);
  }
});

test('existing contextual service links are not followed by a mechanically repeated enquiry paragraph',()=>{
  for(const prefix of ['/','/zh/']){
    const $=load(fs.readFileSync('public'+prefix+'case-studies/north-adelaide-door-repair/index.html','utf8'));
    assert.equal($('.repair-next-step').length,0);
    assert.ok($('main p a').toArray().some(a=>$(a).attr('href')===prefix+'services/door-repair/'));
  }
});

test('local preview keeps customer navigation local while production breadcrumb URLs stay canonical',async t=>{
  const server=spawn(process.execPath,['serve.cjs'],{env:{...process.env,PORT:'0'},windowsHide:true});
  t.after(()=>server.kill());
  const local=await new Promise((resolve,reject)=>{server.once('error',reject);server.stdout.on('data',data=>{const match=data.toString().match(/http:\/\/127\.0\.0\.1:\d+/);if(match)resolve(match[0]);});});
  const r=await fetch(local+'/zh/services/door-repair/'),$=load(await r.text());
  assert.equal(r.status,200);
  assert.equal($('.breadcrumbs a').first().attr('href'),'/zh/');
  assert.equal($('link[rel=canonical]').attr('href'),'https://www.adelaidehandymanmelone.com.au/zh/services/door-repair/');
});
