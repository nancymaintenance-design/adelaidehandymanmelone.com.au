// Local generated pages only. Authored layout thresholds are independent of output.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { chromium } = require(process.env.SEO_PLAYWRIGHT_MODULE || 'C:/Users/UFTR/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const report = path.resolve(root, '../reports/desktop-layout-repair-2026-10-14');
const phase = process.env.DESKTOP_PHASE || 'after';
const acceptance = require('../src/content-pack/desktop-layout-acceptance.json');
const focused = process.argv.includes('--focused');
const routes = [...fs.readFileSync(path.join(root, 'public/sitemap.xml'), 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname);
const family = route => route === '/' ? 'home' : route === '/how-it-works/' ? 'decision-hub' : route.startsWith('/service-areas/') ? (route.split('/').filter(Boolean).length === 3 ? 'suburb' : route === '/service-areas/' ? 'area-hub' : 'region') : route.split('/').filter(Boolean).length > 1 ? route.split('/')[1] + '-detail' : route.slice(1,-1) + '-hub';
const representatives = ['/', '/services/interior-repairs-assembly/', '/services/cabinet-drawer-repair/', routes.find(r=>r.startsWith('/guides/')&&r!='/guides/'), routes.find(r=>r.startsWith('/news/')&&r!='/news/'), routes.find(r=>family(r)==='suburb'), routes.find(r=>family(r)==='case-studies-detail'), '/faq/'].filter(Boolean);
function desktopPairFailure(row) {
  if(row.children.length!==2) return 'expected two column items';
  const [left,right]=row.children;
  if(Math.abs(left.y-right.y)>5) return 'columns are not top aligned (stacked or displaced)';
  if(left.width<100||right.width<100) return 'column item too narrow';
  if(right.x<left.x+left.width-1) return 'columns overlap or reverse source order';
  if(left.x<row.x-1||right.x+right.width>row.x+row.width+1) return 'columns escape their container';
  return null;
}
async function run() {
  const output = path.join(report, phase); fs.mkdirSync(output, {recursive:true});
  const server = spawn(process.execPath,['serve.cjs'],{cwd:root,env:{...process.env,PORT:'0'},windowsHide:true,stdio:['ignore','pipe','pipe']});
  const origin = await new Promise((resolve,reject)=>{server.once('error',reject);server.stdout.on('data',b=>{const m=b.toString().match(/http:\/\/127\.0\.0\.1:\d+/);if(m)resolve(m[0]);});});
  const browser = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
  const context = await browser.newContext({ reducedMotion:'reduce', hasTouch:true });
  await context.route('**/*', r => new URL(r.request().url()).origin===origin ? r.continue() : r.fulfill({status:200,body:''}));
  const page = await context.newPage();
  const metrics=[], semantics=[], failures=[], interactions=[];
  try {
    for (const width of focused ? [1440,390] : [1280,1440,1920,850,768,390,320]) {
      await page.setViewportSize({width,height:1000});
      for (const route of focused ? representatives : routes) {
        assert(acceptance.allowedTemplates.includes(family(route)), 'Template outside approved desktop scope: '+route);
        await page.goto(origin+route);
        const data = await page.evaluate(() => {
          const rect = el => {const r=el.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom};};
          const all = sel => [...document.querySelectorAll(sel)];
          const normalized = s => s.replace(/\s+/g,' ').trim();
          const reading = all('main .reading').map(el=>({class:el.className,...rect(el),sections:[...el.children].filter(c=>c.tagName==='SECTION').map(c=>({heading:c.querySelector('h2')?.textContent,chars:c.textContent.length,...rect(c)}))}));
          const rows = all('.desktop-topic-row, .desktop-topic-body').map(el=>({ ...rect(el), children:[...el.children].map(c=>({...rect(c),heading:c.querySelector('h2,h3')?.textContent})) }));
          // Only authored two-column collections with at least two items. Other prose and one-item lists are intentional exceptions.
          const collectionNodes = new Set(all('.desktop-layout .desktop-reading > .plain-list, .desktop-layout .desktop-reading .faq-list, .faq-section .faq-list, .guide-directory .guide-directory-list'));
          const collections = [...collectionNodes].filter(el=>el.children.length>=2).map(el=>({
            kind:el.matches('.faq-list')?'faq':el.matches('.guide-directory-list')?'guide-directory':'plain-list',
            ...rect(el), children:[...el.children].map(rect)
          }));
          const article = document.querySelector('.article-layout'); const form = article?.querySelector('.contact-aside');
          return {overflow:document.documentElement.scrollWidth-innerWidth, reading, rows, collections,
            form:form?rect(form):null, articleReading:article?.querySelector('.reading')?rect(article.querySelector('.reading')):null,
            paragraphs:all('.desktop-reading p').filter(p=>p.getClientRects().length).map(p=>({width:rect(p).width,chars:p.textContent.length})),
            semantic:{title:document.title, meta:all('meta').map(el=>el.outerHTML), canonical:document.querySelector('link[rel=canonical]')?.getAttribute('href'), schema:all('script[type="application/ld+json"]').map(el=>JSON.parse(el.textContent)),
              text:normalized(document.querySelector('main').textContent), headings:all('main h1,main h2,main h3').map(el=>[el.tagName,normalized(el.textContent)]), links:all('a').map(el=>[el.getAttribute('href'),normalized(el.textContent)]), ids:all('[id]').map(el=>el.id), images:all('img,source').map(el=>[...el.attributes].map(a=>[a.name,a.value]).filter(a=>a[0]!=='style')), controls:all('input,textarea,select,button').map(el=>el.outerHTML)} };
        });
        const {semantic,...layout}=data; metrics.push({route,family:family(route),width,...layout});
        if(width===(focused?1440:1280)) semantics.push({route,...semantic});
        const fail = message => failures.push({route,width,message});
        if(data.overflow>1) fail('horizontal overflow '+data.overflow);
        if(width>=1280) {
          const expected = Math.min(1280,width-111);
          for(const r of data.reading) if(r.width<expected-2) fail('whole-content width '+r.width+' < '+expected);
          if(data.articleReading && data.articleReading.width<expected-2) fail('article reading still narrow: '+data.articleReading.width);
          if(data.form && data.form.y<data.articleReading.bottom-1) fail('enquiry form competes beside content');
          if(['services-detail','guides-detail','news-detail','suburb','case-studies-detail','service-standards-hub'].includes(family(route)) && !data.rows.some(row=>row.children.length===2)) fail('no desktop topic pairs');
          for(const row of data.rows) {
            const geometryFailure=desktopPairFailure(row);
            if(geometryFailure) fail('desktop topic '+geometryFailure);
            if(row.children.length===2 && Math.abs(row.children[0].height-row.children[1].height)>320) fail('unequal topic row leaves >320px unused');
          }
          for(const collection of data.collections) for(let index=0;index+1<collection.children.length;index+=2) {
            const geometryFailure=desktopPairFailure({...collection,children:collection.children.slice(index,index+2)});
            if(geometryFailure) fail('desktop '+collection.kind+' '+geometryFailure+' at items '+(index+1)+'-'+(index+2));
          }
          if(data.paragraphs.some(p=>p.chars>180&&p.width>800)) fail('paragraph line exceeds 800px');
        }
        if(width<=850) for(const row of data.rows) if(row.children.length===2&&Math.abs(row.children[0].y-row.children[1].y)<5) fail('phone/tablet topics must stack');
        if(!focused&&representatives.includes(route)&&[1440,1920,390,320].includes(width)) {
          await page.evaluate(async()=>{for(const img of document.images)img.loading='eager';await Promise.all([...document.images].map(img=>img.decode().catch(()=>{})));});
          await page.screenshot({path:path.join(output,`${width}-${route.replace(/\//g,'_')||'home'}.png`),fullPage:true});
          await page.screenshot({path:path.join(output,`${width}-${route.replace(/\//g,'_')||'home'}-top.png`)});
          const topic=page.locator('.desktop-topic-row, .desktop-topic-body').first();
          if(await topic.count()){await topic.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,`${width}-${route.replace(/\//g,'_')||'home'}-topics-view.png`)});}
          if(width===1440&&route.includes('interior-repairs')) for(const [sel,name] of [['.article-layout .reading','topics'],['.contact-aside','form']]) await page.locator(sel).screenshot({path:path.join(output,`${width}-${name}.png`)});
        }
      }
    }
    if(phase!=='before') for(const width of [1440,390,320]) {
      await page.setViewportSize({width,height:900});
      await page.goto(origin+'/guides/field-notes-doors-windows-screens-enquiry/');
      const toc=page.locator('.guide-contents a').first(); const href=await toc.getAttribute('href');
      await toc.focus();await page.keyboard.press('Enter');
      assert.equal(new URL(page.url()).hash,href);
      assert(await page.locator(href).evaluate(el=>el.getBoundingClientRect().top>=0));
      const summary=page.locator('.faq-list summary').first();await summary.focus();await page.keyboard.press('Enter');
      assert(await summary.evaluate(el=>el.parentElement.open));
      await page.keyboard.press('Space');assert.equal(await summary.evaluate(el=>el.parentElement.open),false);
      await page.evaluate(()=>{const h=document.querySelector('.desktop-topic-row h2');h.textContent=h.textContent.repeat(3);h.style.fontSize='36px';});
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'long heading wraps');
      await page.goto(origin+'/services/cabinet-drawer-repair/');
      const submit=page.locator('[data-enquiry-submit]'); await submit.click();
      assert(await page.locator('[aria-invalid="true"]').count()>0,'validation still exposes error');
      await page.locator('#email').fill('layout-test@example.invalid');await page.locator('#suburb').fill('Adelaide');await page.locator('#message').fill('Local layout verification only. No enquiry is sent.');
      const before=await submit.boundingBox();await submit.click();
      await page.waitForFunction(()=>document.querySelector('[data-enquiry-status]').textContent.includes('Local preview'));
      const after=await submit.boundingBox();assert(Math.abs(before.width-after.width)<=1,'submit dimensions stable');
      assert.equal(await page.locator('#message').inputValue(),'Local layout verification only. No enquiry is sent.');
      await submit.focus();await submit.scrollIntoViewIfNeeded();
      const target=await submit.boundingBox();const bar=page.locator('.mobile-actions');
      if(await bar.isVisible()){const rect=await bar.boundingBox();assert(target.y+target.height<=rect.y,'mobile bar does not cover focused submit');}
      if(width<=390){const menu=page.locator('.menu-toggle');await menu.focus();await page.keyboard.press('Enter');assert.equal(await menu.getAttribute('aria-expanded'),'true');}
      await page.locator('.contact-aside').screenshot({path:path.join(output,`${width}-local-form-refusal.png`)});
      interactions.push({width,status:'pass',checks:'native TOC/FAQ Enter+Space; enlarged long heading; label validation; local refusal; preserved input; stable submit; unobscured focus; mobile keyboard menu'});
    }
    fs.writeFileSync(path.join(output,'metrics.json'),JSON.stringify({metrics,failures,interactions},null,2));
    fs.writeFileSync(path.join(output,'semantics.json'),JSON.stringify(semantics,null,2));
    fs.writeFileSync(path.join(output,'route-inventory.json'),JSON.stringify(routes.map(route=>({route,family:family(route)})),null,2));
    if(phase!=='before'&&!focused) assert.deepEqual(semantics,JSON.parse(fs.readFileSync(path.join(report,'before/semantics.json'))),'All 102 route semantics must match before');
    console.log(JSON.stringify({phase,routes:semantics.length,checks:metrics.length,failures:failures.length,examples:failures.slice(0,12)},null,2));
    assert.equal(failures.length,0,'desktop utilization/layout contract');
  } finally { await browser.close(); server.kill(); }
}
if(require.main===module) run().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={desktopPairFailure};
