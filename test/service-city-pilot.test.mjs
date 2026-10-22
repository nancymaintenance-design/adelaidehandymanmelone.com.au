import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { load } from 'cheerio';
import { applyLocalLabelsToHtml } from '../src/local-label-policy.mjs';

const approved = {
  'sliding-door-repair': ['Sliding Door Repairs', '阿德莱德推拉门维修'],
  'flyscreen-repair': ['Flyscreen & Screen Door Repairs', '阿德莱德纱窗与纱门维修'],
  'pressure-cleaning': ['Pressure Cleaning', '阿德莱德高压清洗'],
  'door-repair': ['Door Repairs', '阿德莱德门维修'],
  'cabinet-drawer-repair': ['Cabinet & Drawer Repairs', '阿德莱德橱柜和抽屉维修'],
};
for (const [slug, [en, zh]] of Object.entries(approved)) {
  test(`${slug}: approved English and Chinese city fields match`, () => {
    for (const chinese of [false, true]) {
      const $ = load(fs.readFileSync(new URL(`../public/${chinese ? 'zh/' : ''}services/${slug}/index.html`, import.meta.url), 'utf8'));
      assert.equal($('h1').length, 1);
      assert.equal($('h1').text(), chinese ? zh : `${en} in Adelaide`);
      assert.equal($('title').text(), `${chinese ? zh : `${en} Adelaide`} | MEL ONE`);
      assert.match($('.lede').text(), chinese ? /阿德莱德/ : /Adelaide/);
      assert.equal($('meta[name="description"]').attr('content'), $('.lede').text());
      assert.equal($('meta[property="og:title"]').attr('content'), $('title').text());
      if ($('meta[name="twitter:title"]').length) assert.equal($('meta[name="twitter:title"]').attr('content'), $('title').text());
      const graph = JSON.parse($('script[type="application/ld+json"]').first().text())['@graph'];
      const service = graph.find(item => item['@type'] === 'Service');
      const webpage = graph.find(item => item['@type'] === 'WebPage');
      assert.equal(service.name, chinese ? zh : `${en} Adelaide`);
      assert.equal(service.serviceType, $('h1').text());
      assert.equal(webpage.name, $('h1').text());
      assert.equal(service.description, $('.lede').text());
      assert.equal(webpage.description, $('.lede').text());
    }
  });
}
test('city pilot never exempts unrelated headings, link labels or other routes', () => {
  const input = '<title>Door Repairs Adelaide | MEL ONE</title><main><h1>Door Repairs Adelaide</h1><h2>Other Adelaide repairs</h2><a href="/services/door-repair/">Door Repairs Adelaide</a></main>';
  const output = applyLocalLabelsToHtml(input, '/services/wall-patching-repair/');
  assert.ok(!output.includes('Adelaide'));
});
test('case body compression keeps the full detailed FAQ answer', () => {
  for (const [slug, fragment] of [
    ['norwood-flyscreen-repair', 'This record shows remeshing a window screen.'],
    ['burnside-driveway-pressure-cleaning', 'The photographed surface is paved driveway material.'],
  ]) {
    const $ = load(fs.readFileSync(new URL(`../public/case-studies/${slug}/index.html`, import.meta.url), 'utf8'));
    assert.equal($('main').text().split(fragment).length - 1, 1, slug);
    assert.ok($('main a[href^="/services/"]').length > 0);
  }
});

test('Norwood compression preserves its original paired desktop sections in both languages', () => {
  for (const prefix of ['', 'zh/']) {
    const $ = load(fs.readFileSync(new URL(`../public/${prefix}case-studies/norwood-flyscreen-repair/index.html`, import.meta.url), 'utf8'));
    const headings = $('main h2');
    const details = headings.eq(2).parent(), comparison = headings.eq(3).parent();
    assert.equal(details.parent().attr('class'), 'desktop-topic-row');
    assert.equal(comparison.parent().get(0), details.parent().get(0));
    assert.equal(details.find('.desktop-topic-body').length, 0);
    assert.equal(comparison.find('.desktop-topic-body').length, 0);
  }
});
