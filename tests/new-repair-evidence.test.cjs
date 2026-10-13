const test=require('node:test');
const assert=require('node:assert/strict');
const fixture=require('./build-fixture.cjs')(test);
test('focused repair routes are discoverable from their parent and show real case evidence',()=>{
 const sitemap=fixture.read('sitemap.xml');
 for(const [slug,parent,caseSlug] of [
  ['cabinet-drawer-repair','interior-repairs-assembly','kitchen-drawer-runner-repair'],
  ['wall-patching-repair','home-repairs-renovation-support','goodwood-wall-repair'],
  ['pressure-cleaning','cleaning-removals-specialist-care','burnside-driveway-pressure-cleaning'],
  ['sliding-door-repair','doors-windows-screens','sliding-patio-door-roller-track-repair']]) {
  assert.ok(sitemap.includes(`/services/${slug}/`),`missing route ${slug}`);
  const html=fixture.read(`services/${slug}/index.html`);
  assert.ok(html.includes(`/case-studies/${caseSlug}/`));
  assert.ok(fixture.read(`services/${parent}/index.html`).includes(`/services/${slug}/`));
  assert.match(html,/"@type":"FAQPage"/);
  assert.doesNotMatch(html,/&lt;a href=/,'internal links must be clickable, not escaped markup');
 }
});
test('new case photos keep before, during and after order without inventing job suburb or date',()=>{
 const feed=JSON.parse(fixture.read('case-studies/feed.json'));
 for(const [slug,prefix,service] of [
  ['kitchen-drawer-runner-repair','drawer-runner-repair','cabinet-drawer-repair'],
  ['sliding-patio-door-roller-track-repair','sliding-patio-door-roller-repair','sliding-door-repair']]) {
  const item=feed.items.find(i=>i.url.endsWith(`/case-studies/${slug}/`));
  assert.ok(item,`missing case ${slug}`);
  assert.equal(item.suburb,null);
  assert.deepEqual(item.images.map(i=>i.split('/').pop()),['before','during','after'].map(s=>`${prefix}-${s}.png`));
  const html=fixture.read(`case-studies/${slug}/index.html`);
  const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  const article=graph.find(n=>n['@type']==='Article');
  assert.equal(article.contentLocation,undefined);
  assert.equal(article.datePublished,'2026-10-12');
  assert.ok(html.includes(`/services/${service}/`));
  assert.doesNotMatch(html,/null maintenance|null handyman|undefined|NaN/);
  assert.equal((html.match(/class="case-photo-frame"/g)||[]).length,3);
  assert.match(html,/srcset="[^"]+-480\.webp 480w/);
  assert.match(html,/<source type="image\/avif"/);
  assert.doesNotMatch(html,/-detail\.webp/);
  assert.match(html,slug==='kitchen-drawer-runner-repair'?/width="1448" height="1086"/:/width="1600" height="1200"/);
 }
});
