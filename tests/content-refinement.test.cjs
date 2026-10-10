const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const fixture = require('./build-fixture.cjs')(test);
const body = html => html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
const graph = html => JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const walk = dir => fs.readdirSync(dir,{withFileTypes:true}).flatMap(e => e.isDirectory()?walk(path.join(dir,e.name)):e.name.endsWith('.html')?[path.join(dir,e.name)]:[]);

// Catches missing parent headings in generated hubs, not an exact copy choice.
test('every generated main starts at H1 and never skips a heading level', () => {
  const issues=[];
  for(const file of walk(fixture.output)) {
    const html=body(fs.readFileSync(file,'utf8'));
    const levels=[...html.matchAll(/<h([1-6])\b/g)].map(m=>Number(m[1]));
    assert.equal(levels.filter(n=>n===1).length,1,file);
    let previous=0; for(const level of levels) {if(level>previous+1)issues.push(path.relative(fixture.output,file));previous=level;}
  }
  assert.deepEqual(issues,[]);
});

test('navigation hubs expose descriptive search topics rather than generic slogans',()=>{
  const pairs=[['guides',/home.*maintenance.*guides/i],['faq',/handyman.*questions/i],['services',/handyman.*services/i],['privacy',/privacy/i],['contact',/assessment.*quote/i]];
  for(const [route,topic] of pairs) {
    const html=fixture.read(`${route}/index.html`);
    assert.match(html.match(/<title>(.*?)<\/title>/)[1],topic,route);
    assert.match(body(html).match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1],topic,route);
  }
});

test('each approved guide has an answer summary, working contents links and visible matching FAQs',()=>{
  for(const guide of fixture.content.guides.filter(g=>g.status==='approved')) {
    const html=fixture.read(`guides/${guide.slug}/index.html`);
    assert.match(body(html),/class="answer-summary"/);
    const toc=body(html).match(/<nav[^>]*aria-label="On this guide"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
    assert.ok(toc,guide.slug);
    for(const match of toc.matchAll(/href="#([^"]+)"/g)) assert.ok(html.includes(`id="${match[1]}"`),guide.slug);
    const faqs=graph(html).find(g=>g['@type']==='FAQPage'); assert.ok(faqs?.mainEntity.length>=2,guide.slug);
    for(const q of faqs.mainEntity) assert.ok(body(html).includes(q.name.replaceAll('&','&amp;').replaceAll("'",'&#039;')),q.name);
    assert.match(body(html),/href="\/services\/[^"#]+\//);
  }
});

test('all service pages explain quote factors and connect to service standards inside main content',()=>{
  for(const slug of [...fixture.content.services.filter(s=>s.status==='approved').map(s=>s.slug),'flyscreen-repair','door-repair','gutter-cleaning','fence-gate-repair','flat-pack-assembly']) {
    const html=body(fixture.read(`services/${slug}/index.html`));
    assert.match(html,/<h2[^>]*>[^<]*(?:quote|cost|pricing)[^<]*<\/h2>/i,slug);
    assert.match(html,/href="\/service-standards\/#quote-details"/,slug);
  }
});

test('handyman decision FAQ covers charges and seven-day hours without publishing invented rates',()=>{
  const html=fixture.read('faq/index.html');
  const faqs=graph(html).find(g=>g['@type']==='FAQPage').mainEntity;
  assert.ok(faqs.some(q=>/charge|cost|fee/i.test(q.name)));
  assert.ok(faqs.some(q=>/weekend|hours/i.test(q.name)&&/09:00.*21:00/.test(q.acceptedAnswer.text)));
  assert.doesNotMatch(body(html),/\$\s*\d+|24\/7|guaranteed same.day/i);
  assert.match(body(html),/href="\/service-standards\/#quote-details"/);
});

test('case records disclose the publisher and point to assessment limits without changing recorded outcomes',()=>{
  const feed=JSON.parse(fixture.read('case-studies/feed.json'));
  for(const record of feed.items) {
    const html=body(fixture.read(`${new URL(record.url).pathname.slice(1)}index.html`));
    assert.match(html,/class="article-publisher"/,record.url);
    assert.match(html,/href="\/service-standards\/"/,record.url);
    assert.ok(html.includes(record.result),record.url);
  }
  assert.equal(feed.items.find(r=>r.url.includes('modbury-timber-fence-repair-assessment')).stage,'assessment');
});

test('region hubs connect task guidance and quote planning without expanding geography',()=>{
  const feed=JSON.parse(fixture.read('service-areas/feed.json'));
  assert.equal(feed.regions.length,8);assert.equal(feed.regions.flatMap(r=>r.suburbs).length,32);
  for(const region of feed.regions) {
    const html=body(fixture.read(`${new URL(region.url).pathname.slice(1)}index.html`));
    assert.match(html,/href="\/guides\//,region.name);
    assert.match(html,/href="\/service-standards\/#quote-details"/,region.name);
  }
  assert.equal((fixture.read('sitemap.xml').match(/<loc>/g)||[]).length,96);
});
