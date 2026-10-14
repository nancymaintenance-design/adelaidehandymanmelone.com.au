const test = require('node:test');
const assert = require('node:assert/strict');
const fixture = require('./build-fixture.cjs')(test);
const main = route => fixture.read(`${route}index.html`).match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];

test('task-specific guides offer focused services within explanatory paragraphs', () => {
  for (const [slug, services] of Object.entries({
    'field-notes-doors-windows-screens-enquiry': ['sliding-door-repair'],
    'field-notes-wall-interior-repairs-job-list': ['cabinet-drawer-repair', 'wall-patching-repair'],
    'field-notes-cleaning-removals-preparation': ['pressure-cleaning'],
    'field-notes-pre-sale-home-maintenance-list': ['pressure-cleaning'],
  })) {
    const html = main(`guides/${slug}/`);
    const paragraphs = html.match(/<p\b[^>]*>[^]*?<\/p>/g) || [];
    for (const service of services) assert.ok(paragraphs.some(p => p.includes(`<a href="/services/${service}/">`)), `${slug}: ${service}`);
    const graph = JSON.parse(fixture.read(`guides/${slug}/index.html`).match(/<script type="application\/ld\+json">([^]*?)<\/script>/)[1])['@graph'];
    assert.equal(graph.find(n => n['@type'] === 'Article').dateModified, '2026-10-14');
    for (const q of graph.find(n => n['@type'] === 'FAQPage').mainEntity) {
      const escape = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
      assert.ok(html.includes(`<summary>${escape(q.name)}</summary>`));
      assert.ok(html.includes(`<p>${escape(q.acceptedAnswer.text)}</p>`));
    }
  }
});

test('existing local task guidance discovers focused repairs while keeping nearby case attribution', () => {
  for (const [path, service] of [
    ['cbd-north-adelaide/bowden', 'cabinet-drawer-repair'],
    ['inner-south/parkside', 'cabinet-drawer-repair'],
    ['inner-south/goodwood', 'wall-patching-repair'],
    ['eastern-suburbs/burnside', 'pressure-cleaning'],
    ['western-suburbs/glenelg', 'sliding-door-repair'],
    ['southern-suburbs/marion', 'sliding-door-repair'],
  ]) assert.ok(main(`service-areas/${path}/`).includes(`href="/services/${service}/"`), path);
  const parkside = main('service-areas/inner-south/parkside/');
  assert.match(parkside, /This photographed case took place in Unley, not Parkside/);
  assert.equal((fixture.read('sitemap.xml').match(/<loc>/g) || []).length, 102);
});
