const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const buildFixture = require('./build-fixture.cjs');

test('photographed local case studies publish connected pages, images and a machine-readable feed', t => {
  const fixture = buildFixture(t, { SITE_ORIGIN: 'https://example.test' });
  const slugs = [
    'norwood-flyscreen-repair', 'north-adelaide-door-repair', 'burnside-window-repair',
    'kensington-furniture-assembly', 'unley-kitchen-cabinet-repair', 'goodwood-wall-repair',
    'mile-end-fence-repair', 'prospect-gutter-cleaning', 'adelaide-cbd-wall-repair',
    'modbury-timber-fence-repair-assessment', 'marion-shower-screen-repair', 'henley-beach-sliding-screen-door-repair',
  ];
  for (const slug of slugs) {
    const html = fixture.read(`case-studies/${slug}/index.html`);
    assert.match(html, /application\/ld\+json/);
    assert.match(html, /case stud/i);
    assert.match(html, /<figure/);
  }
  const feed = JSON.parse(fixture.read('case-studies/feed.json'));
  assert.equal(feed.items.length, 12);
  assert.ok(feed.items.every(item => item.images.length >= 3 && item.url.startsWith('https://example.test/case-studies/')));
  for (const slug of ['modbury-timber-fence-repair-assessment', 'marion-shower-screen-repair', 'henley-beach-sliding-screen-door-repair']) {
    assert.equal(feed.items.find(item => item.id.endsWith(`/${slug}/`)).images.length, 4);
  }
  assert.match(fixture.read('services/doors-windows-screens/index.html'), /norwood-flyscreen-repair/);
  assert.match(fixture.read('services/outdoor-structures-fences-pools/index.html'), /mile-end-fence-repair/);
  assert.match(fixture.read('services/roof-gutter-exterior-care/index.html'), /prospect-gutter-cleaning/);
  assert.match(fixture.read('services/home-repairs-renovation-support/index.html'), /adelaide-cbd-wall-repair/);
  assert.match(fixture.read('services/outdoor-structures-fences-pools/index.html'), /modbury-timber-fence-repair-assessment/);
  assert.match(fixture.read('services/doors-windows-screens/index.html'), /marion-shower-screen-repair/);
  assert.match(fixture.read('services/doors-windows-screens/index.html'), /henley-beach-sliding-screen-door-repair/);
  assert.ok(fs.existsSync(path.join(fixture.output, 'assets/images/cases/norwood-flyscreen-repair-01.png')));
  assert.ok(fs.existsSync(path.join(fixture.output, 'assets/images/cases/kensington-furniture-assembly-01.png')));
  assert.ok(fs.existsSync(path.join(fixture.output, 'assets/images/cases/mile-end-fence-repair-01.png')));
  assert.ok(fs.existsSync(path.join(fixture.output, 'assets/images/cases/marion-shower-screen-repair-01.png')));
});
