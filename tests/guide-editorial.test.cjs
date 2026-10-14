const test=require('node:test'),assert=require('node:assert/strict');
const buildFixture=require('./build-fixture.cjs');
const text=h=>h.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
test('guides consolidate topics, introductions, links and meaningful legacy anchors',t=>{
 const {content,read}=buildFixture(t);const hub=read('guides/index.html');
 assert.match(hub,/guide-topic-nav/);assert.match(hub,/guide-directory/);
 const summaries=[];
 for(const guide of content.guides.filter(g=>g.status==='approved')){
 const html=read(`guides/${guide.slug}/index.html`),article=html.match(/<article class="guide-article">([^]*?)<\/article>/)?.[1];assert.ok(article,guide.slug);
 const paragraphs=[...article.matchAll(/<p[^>]*>([^]*?)<\/p>/g)].map(m=>text(m[1]));assert.equal(new Set(paragraphs).size,paragraphs.length,'no repeated intro '+guide.slug);
 assert.match(article, /<img data-guide-photo[^>]*width="\d+" height="\d+"/);
 assert.equal((article.match(/<section id="guide-topic-/g)||[]).length,4,'one coherent four-section article');
 assert.doesNotMatch(article,/Related maintenance enquiries|<h2>Key notes|Practical MEL ONE guidance/);
 assert.match(hub,new RegExp(`href="/guides/${guide.slug}/"`));
 const links=[...article.matchAll(/href="(\/(?:services|case-studies|guides)\/[^"#]+)"/g)].map(m=>m[1]);assert.equal(new Set(links).size,links.length,'contextual links not repeated '+guide.slug);
 assert.ok([...article.matchAll(/id="guide-section-/g)].length>=6,'legacy anchors retained');
 assert.doesNotMatch(html,/class="guide-article"[^]*class="article-layout"/);
 const description=html.match(/name="description" content="([^"]*)"/)[1];summaries.push(description);assert.ok(!description.startsWith(guide.title));
 }
 assert.equal(new Set(summaries).size,10);
 const pressure=read('guides/field-notes-cleaning-removals-preparation/index.html').match(/<article class="guide-article">([^]*?)<\/article>/)[1];assert.doesNotMatch(text(pressure),/furniture|clear-out|donate|collection arrangements|pests|mould/i);assert.match(pressure,/Surface Condition/);assert.match(pressure,/Preparation Checklist/);
 const wall=read('guides/field-notes-wall-interior-repairs-job-list/index.html');assert.doesNotMatch(wall,/guide-case-photo[^]*?unley-kitchen-cabinet-repair-01/);assert.match(wall,/goodwood-wall-repair/);
});
test('guide CSS is separately protected without weakening either historical block',()=>{
 const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
 const {verifyProtectedLayoutCss}=require('../scripts/verify-keyword-content.cjs');
 const root=path.resolve(__dirname,'..');const css=path.join(root,'src/assets/css/site.css');
 const base=JSON.parse(fs.readFileSync(path.resolve(root,'../reports/keyword-led-content-2026-10-13/protected-baseline.json')));
 const decision=require('../src/content-pack/decision-qa-acceptance.json'),guide=require('../src/content-pack/guide-editorial-acceptance.json');
 assert.deepEqual(verifyProtectedLayoutCss(base,css,decision,guide,require('../src/content-pack/desktop-layout-acceptance.json')),[]);
 assert.match(verifyProtectedLayoutCss(base,css,decision,{scopedCssHash:'wrong'}).join(' '),/Scoped guide CSS changed/);
 assert.match(verifyProtectedLayoutCss(base,css,{scopedCssHash:'wrong'},guide).join(' '),/Scoped answer-hub CSS changed/);
 assert.match(verifyProtectedLayoutCss({...base,layoutCssHash:'wrong'},css,decision,guide).join(' '),/Protected layout CSS changed/);
 const block=fs.readFileSync(css,'utf8').split('/* guide-editorial-repair:start')[1];
 assert.ok(block.includes('object-fit: contain')&&block.includes('max-height: 280px'));
});
