const test=require('node:test');
const assert=require('node:assert/strict');
const fixture=require('./build-fixture.cjs')(test);
const main=route=>fixture.read(`${route}index.html`).match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];

// A missing render hook or discarded section ID must break real deep links.
test('parent pages retain keyword-intent sections alongside focused service routes',()=>{
 for(const [slug,id]of[['door-repair','sliding-door-types'],['interior-repairs-assembly','cabinet-door-drawer-repairs'],['home-repairs-renovation-support','wall-patching'],['cleaning-removals-specialist-care','pressure-cleaning'],['flyscreen-repair','ordinary-screen-repairs']]) {
  assert.match(main(`services/${slug}/`),new RegExp(`<section id="${id}">`),slug);
 }
 const sitemap=fixture.read('sitemap.xml');assert.equal((sitemap.match(/<loc>/g)||[]).length,102);
 for(const slug of ['sliding-door-repair','cabinet-drawer-repair','wall-patching-repair','pressure-cleaning'])assert.ok(sitemap.includes(`/services/${slug}/`),slug);
});

// Routing readers to the wrong service is a functional navigation regression.
test('documented work connects readers to the precise existing service and enquiry anchor',()=>{
 for(const [caseSlug,target]of[
  ['marion-wardrobe-sliding-door-repair','/services/door-repair/#sliding-door-types'],
  ['unley-kitchen-cabinet-repair','/services/interior-repairs-assembly/#cabinet-door-drawer-repairs'],
  ['goodwood-wall-repair','/services/home-repairs-renovation-support/#wall-patching'],
  ['burnside-driveway-pressure-cleaning','/services/cleaning-removals-specialist-care/#pressure-cleaning']
 ])assert.ok(main(`case-studies/${caseSlug}/`).includes(`href="${target}"`),caseSlug);
 assert.ok(main('guides/field-notes-pre-sale-home-maintenance-list/').includes('href="/services/door-repair/"'));
 const topic=main('services/door-repair/').match(/<section id="sliding-door-types">([\s\S]*?)<\/section>/)?.[1];
 assert.ok(topic?.includes('href="/contact/"'),'task guidance must offer a direct enquiry route, not only a sidebar');
});

// Visible answer and FAQ schema must stay in sync when decision copy is revised.
test('screen and assembly FAQs answer replacement and affiliation boundaries visibly and in schema',()=>{
 for(const [slug,question,answer]of[
  ['flyscreen-repair',/security screen/i,/not.*security|does not.*security|separate specialist/i],
  ['flat-pack-assembly',/IKEA/i,/not.*official|no.*affiliation|not affiliated/i]
 ]){
  const html=fixture.read(`services/${slug}/index.html`);
  const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  const q=graph.find(n=>n['@type']==='FAQPage').mainEntity.find(q=>question.test(q.name));
  assert.ok(q,slug);assert.match(q.acceptedAnswer.text,answer);
  assert.ok(main(`services/${slug}/`).includes(q.name.replaceAll('&','&amp;').replaceAll("'",'&#039;')),slug);
 }
});
