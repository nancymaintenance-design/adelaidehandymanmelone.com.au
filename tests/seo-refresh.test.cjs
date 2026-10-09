const test = require('node:test');
const assert = require('node:assert/strict');
const fixture = require('./build-fixture.cjs')(test);
const main = html => html.match(/<main\b[^>]*>([^]*?)<\/main>/)[1];

test('shared footer exposes four user-supplied social destinations with decorative icons', () => {
  for (const route of ['index.html', 'services/doors-windows-screens/index.html', 'case-studies/marion-wardrobe-sliding-door-repair/index.html']) {
    const footer = fixture.read(route).match(/<footer\b[^>]*>([^]*?)<\/footer>/)[1];
    for (const url of ['https://share.google/bnkU7OE83VYCSh44T', 'https://www.instagram.com/melone.maintenance1/', 'https://www.youtube.com/@MelOneMaintenance', 'https://www.tiktok.com/@melonemaintenance5']) {
      const link = footer.match(new RegExp(`<a[^>]*href="${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>([^]*?)</a>`));
      assert.ok(link, `${route}: ${url}`);
      assert.match(link[1], /<svg[^>]*aria-hidden="true"/);
      assert.match(link[1], /<span>[^<]+<\/span>/);
    }
  }
});

test('service pages explain Adelaide repair choices and link to relevant reading', () => {
  for (const service of fixture.content.services.filter(s => s.status === 'approved')) {
    const html = fixture.read(`services/${service.slug}/index.html`);
    assert.match(html.match(/<title>(.*?)<\/title>/)[1], /Adelaide/);
    assert.match(html.match(/<h1>(.*?)<\/h1>/)[1], /Adelaide/);
    assert.ok((main(html).match(/<h2>/g) || []).length >= 7, service.slug);
    assert.ok((main(html).match(/<summary>/g) || []).length >= 3, service.slug);
    assert.match(main(html), /href="\/guides\//, service.slug);
  }
});

test('local service links reflect different repair subjects rather than a shared default', () => {
  const cases = [
    ['eastern-suburbs/burnside', 'cleaning-removals-specialist-care'],
    ['adelaide-hills-foothills/stirling', 'outdoor-structures-fences-pools'],
    ['adelaide-hills-foothills/stirling', 'interior-repairs-assembly'],
    ['north-north-east/modbury', 'garden-landscape-care'],
    ['cbd-north-adelaide/bowden', 'interior-repairs-assembly'],
  ];
  for (const [local, service] of cases) {
    assert.ok(main(fixture.read(`service-areas/${local}/index.html`)).includes(`href="/services/${service}/"`), `${local}: ${service}`);
  }
});

test('case pages have one next-step block and retain documented results in HTML and feed', () => {
  const feed = JSON.parse(fixture.read('case-studies/feed.json'));
  for (const item of feed.items) {
    const route = new URL(item.url).pathname;
    const html = main(fixture.read(`${route.slice(1)}index.html`));
    assert.equal((html.match(/>Your next step</g) || []).length, 1, route);
    assert.doesNotMatch(html, /without claiming to diagnose|photos do not establish|not a promise|not a guarantee/i);
    assert.match(html, /href="\/guides\//, route);
    assert.ok(item.problem && item.result, route);
    assert.ok(html.includes(item.result), route);
  }
  const assessment = feed.items.find(item => item.url.includes('modbury-timber-fence-repair-assessment'));
  assert.equal(assessment.result, 'Damage documented for assessment');
});

test('all guides connect their advice to real projects without adding new routes', () => {
  for (const guide of fixture.content.guides.filter(g => g.status === 'approved')) {
    assert.match(main(fixture.read(`guides/${guide.slug}/index.html`)), /href="\/case-studies\/[^"/]+\//, guide.slug);
  }
  assert.equal((fixture.read('sitemap.xml').match(/<loc>/g) || []).length, 90);
});

test('area feed exposes the same topic-specific services as the local HTML', () => {
  const feed = JSON.parse(fixture.read('service-areas/feed.json'));
  for (const region of feed.regions) for (const suburb of region.suburbs) {
    assert.ok(suburb.relatedServiceUrls?.length, suburb.name);
    const route = new URL(suburb.url).pathname;
    const html = main(fixture.read(`${route.slice(1)}index.html`));
    for (const url of suburb.relatedServiceUrls) {
      assert.ok(html.includes(`href="${new URL(url).pathname}"`), suburb.name);
    }
  }
});

test('unpublished service drafts do not require public SEO copy or block the build', t => {
  const draft = require('./build-fixture.cjs')(t, {}, content => {
    content.services.push({ status: 'draft', noindex: true, slug: 'unpublished-repair-draft', title: 'Private service draft', description: 'Not ready for publication.', scope: [], exclusions: [] });
  });
  assert.doesNotMatch(draft.read('sitemap.xml'), /unpublished-repair-draft/);
  assert.doesNotMatch(draft.read('services/index.html'), /unpublished-repair-draft/);
});
