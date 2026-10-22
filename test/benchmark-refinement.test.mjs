import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { load } from 'cheerio';

// A link only in a generic gallery is not a contextual evidence link.
// Removing the editorial stage or localising to the wrong route must fail.
const owners = {
  'sliding-door-repair': 'sliding-patio-door-roller-track-repair',
  'door-repair': 'north-adelaide-door-repair',
  'fence-gate-repair': 'modbury-timber-fence-repair-assessment',
  'wall-patching-repair': 'goodwood-wall-repair',
  'cabinet-drawer-repair': 'kitchen-drawer-runner-repair',
  'flyscreen-repair': 'norwood-flyscreen-repair',
  'flat-pack-assembly': 'kensington-furniture-assembly',
  'pressure-cleaning': 'burnside-driveway-pressure-cleaning',
  'gutter-cleaning': 'prospect-gutter-cleaning',
};
for (const prefix of ['', 'zh/']) {
  test(`${prefix || 'en/'} service prose links recorded evidence and cases return to their owner`, () => {
    for (const [owner, study] of Object.entries(owners)) {
      const $ = load(fs.readFileSync(`public/${prefix}services/${owner}/index.html`, 'utf8'));
      assert.ok($('main section').slice(0, 2).find(`p a[href="/${prefix}case-studies/${study}/"]`).length, `missing in-prose evidence: ${owner}`);
      const c = load(fs.readFileSync(`public/${prefix}case-studies/${study}/index.html`, 'utf8'));
      assert.ok(c(`main section p a[href="/${prefix}services/${owner}/"]`).length, `missing contextual owner: ${study}`);
    }
  });
  test(`${prefix || 'en/'} Modbury distinguishes the assessment from completed work`, () => {
    const $ = load(fs.readFileSync(`public/${prefix}services/fence-gate-repair/index.html`, 'utf8'));
    const p = $(`p:has(a[href="/${prefix}case-studies/modbury-timber-fence-repair-assessment/"])`).first();
    assert.match(p.text(), prefix ? /仅.*评估|评估记录|并非.*完工/ : /assessment.only|not a completed repair/i);
    const region = load(fs.readFileSync(`public/${prefix}service-areas/north-north-east/modbury/index.html`, 'utf8'));
    assert.ok(region(`a[href="/${prefix}services/fence-gate-repair/"]`).length);
    assert.ok(region(`a[href="/${prefix}case-studies/modbury-timber-fence-repair-assessment/"]`).length);
  });
}

test('edited case dates agree in visible content, Article, sitemap and both language feeds', () => {
  const sitemap = fs.readFileSync('public/sitemap.xml', 'utf8');
  for (const prefix of ['', 'zh/']) {
    const route = `/${prefix}case-studies/goodwood-wall-repair/`;
    const $ = load(fs.readFileSync(`public/${prefix}case-studies/goodwood-wall-repair/index.html`, 'utf8'));
    assert.ok($('main time[datetime="2026-10-22"]').length);
    const graphs = $('script[type="application/ld+json"]').map((_, e) => JSON.parse($(e).text())['@graph']).get();
    const article = graphs.find(n => n['@type'] === 'Article');
    assert.equal(article.dateModified, '2026-10-22');
    assert.match(sitemap, new RegExp(`${route}</loc>\\s*<lastmod>2026-10-22</lastmod>`));
    const feed = JSON.parse(fs.readFileSync(`public/${prefix}case-studies/feed.json`, 'utf8'));
    assert.equal(feed.items.find(n => new URL(n.url).pathname === route).dateModified, '2026-10-22');
  }
});
