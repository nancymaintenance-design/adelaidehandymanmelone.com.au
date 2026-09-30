const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const buildFixture = require('./build-fixture.cjs');

test('three photographed local case studies publish connected pages, images and a machine-readable feed', t => {
  const fixture = buildFixture(t, { SITE_ORIGIN: 'https://example.test' });
  const slugs = [
    'norwood-flyscreen-repair', 'north-adelaide-door-repair', 'burnside-window-repair',
    'kensington-furniture-assembly', 'unley-kitchen-cabinet-repair', 'goodwood-wall-repair',
  ];
  for (const slug of slugs) {
    const html = fixture.read(`case-studies/${slug}/index.html`);
    assert.match(html, /application\/ld\+json/);
    assert.match(html, /case stud/i);
    assert.match(html, /<figure/);
  }
  const feed = JSON.parse(fixture.read('case-studies/feed.json'));
  assert.equal(feed.items.length, 6);
  assert.ok(feed.items.every(item => item.images.length === 4 && item.url.startsWith('https://example.test/case-studies/')));
  assert.match(fixture.read('services/doors-windows-screens/index.html'), /norwood-flyscreen-repair/);
  assert.ok(fs.existsSync(path.join(fixture.output, 'assets/images/cases/norwood-flyscreen-repair-01.png')));
  assert.ok(fs.existsSync(path.join(fixture.output, 'assets/images/cases/kensington-furniture-assembly-01.png')));
});
