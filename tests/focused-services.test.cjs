const test = require('node:test');
const assert = require('node:assert/strict');
const fixture = require('./build-fixture.cjs')(test, { SITE_ORIGIN: 'https://example.test' });
const cases = require('../src/content-pack/mel-one-site-content.json').caseStudies;
const mappings = {
  'flyscreen-repair': ['doors-windows-screens', 'norwood-flyscreen-repair', 'henley-beach-sliding-screen-door-repair'],
  'door-repair': ['doors-windows-screens', 'north-adelaide-door-repair', 'marion-wardrobe-sliding-door-repair'],
  'gutter-cleaning': ['roof-gutter-exterior-care', 'prospect-gutter-cleaning'],
  'fence-gate-repair': ['outdoor-structures-fences-pools', 'mile-end-fence-repair', 'north-adelaide-timber-gate-repair', 'modbury-timber-fence-repair-assessment'],
  'flat-pack-assembly': ['interior-repairs-assembly', 'kensington-furniture-assembly', 'stirling-flat-pack-wardrobe-assembly'],
};
test('five focused service routes preserve case evidence and reciprocal discovery', () => {
  for (const [slug, [parent, ...slugs]] of Object.entries(mappings)) {
    const route = `/services/${slug}/`;
    const html = fixture.read(`${route.slice(1)}index.html`);
    assert.ok(html.includes(`rel="canonical" href="https://example.test${route}"`));
    assert.match(html, /name="robots" content="index,follow"/);
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([^]*?)<\/script>/)[1])['@graph'];
    const service = graph.find(item => item['@type'] === 'Service');
    assert.equal(service.url, `https://example.test${route}`);
    assert.equal(service.provider['@id'], 'https://example.test/#business');
    const faqs = graph.find(item => item['@type'] === 'FAQPage').mainEntity;
    assert.ok(faqs.length >= 3 && faqs.length <= 4);
    const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
    for (const faq of faqs) {
      assert.ok(html.includes(`<summary>${escape(faq.name)}</summary>`));
      assert.ok(html.includes(`<p>${escape(faq.acceptedAnswer.text)}</p>`));
    }
    assert.ok(graph.some(item => item['@type'] === 'BreadcrumbList'));
    for (const caseSlug of slugs) {
      assert.ok(html.includes(`/case-studies/${caseSlug}/`));
      assert.ok(cases.find(item => item.slug === caseSlug).images.some(image => html.includes(image.src)));
      assert.ok(fixture.read(`case-studies/${caseSlug}/index.html`).includes(`href="${route}"`));
    }
    for (const entry of ['services/index.html', `services/${parent}/index.html`]) assert.ok(fixture.read(entry).includes(`href="${route}"`));
    assert.ok(html.includes(`href="/services/${parent}/"`));
    assert.ok(html.includes('href="/contact/"'));
    for (const file of ['sitemap.xml', 'llms.txt']) assert.equal(fixture.read(file).split(`https://example.test${route}`).length - 1, 1);
  }
  assert.equal((fixture.read('sitemap.xml').match(/<loc>/g) || []).length, 96);
  assert.match(fixture.read('services/fence-gate-repair/index.html'), /assessment.only|assessment record/i);
});
