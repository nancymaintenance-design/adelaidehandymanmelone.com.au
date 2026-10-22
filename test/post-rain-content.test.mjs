import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { load } from 'cheerio';
import { postRainRoutes } from '../src/post-rain-content.mjs';
const data = JSON.parse(fs.readFileSync('src/content-pack/post-rain-content.json', 'utf8'));
const baseline = JSON.parse(fs.readFileSync('test/fixtures/bilingual-english-baseline.json', 'utf8'));
const read = route => fs.readFileSync(`public${route}index.html`, 'utf8');
const origin = 'https://www.adelaidehandymanmelone.com.au';

test('all 18 service edits preserve core H1 and keep reviewed symptoms in final output', () => {
  for (const [slug, edit] of Object.entries(data.edits)) {
    const route = `/services/${slug}/`, en = load(read(route)), zh = load(read('/zh' + route));
    const old = baseline.find(item => item.route === route);
    assert.ok(old, route);
    // The existing local-label policy remains the sole H1 transformation.
    const original = load(`<h1>${old.h1}</h1>`)('h1').text().replace(/\s+Adelaide\b/g, '').replace(/\bin Adelaide\b/g, '').trim();
    const pilot = JSON.parse(fs.readFileSync('src/content-pack/service-city-pilot.json', 'utf8'))[route];
    if (pilot) assert.equal(original, pilot.beforeTitle, route);
    assert.equal(en('h1').text(), pilot ? pilot.h1 : original, route);
    for (const text of edit.introductions) assert.ok(en('main').text().includes(text), route);
    assert.equal(zh('main h2').length, en('main h2').length, route);
    assert.ok(zh('main').text().includes('维修'), route);
  }
});

test('rain articles are discoverable, dated consistently and paired without making a new service', () => {
  const sitemap = fs.readFileSync('public/sitemap.xml', 'utf8');
  for (const route of postRainRoutes) for (const prefix of ['', '/zh']) {
    const doc = load(read(prefix + route));
    assert.ok(sitemap.includes(origin + prefix + route));
    assert.equal(doc('link[rel=canonical]').attr('href'), origin + prefix + route);
    assert.equal(doc('html').attr('lang'), prefix ? 'zh-Hans' : 'en-AU');
    assert.ok(load(read(prefix + '/news/'))(`a[href="${prefix + route}"]`).length);
    assert.ok(doc('a[href="' + prefix + '/contact/"]').length);
    const graph = JSON.parse(doc('script[type="application/ld+json"]').first().text())['@graph'];
    const article = graph.find(item => item['@type'] === 'Article');
    assert.equal(article.datePublished, '2026-10-21');
    assert.equal(article.dateModified, '2026-10-21');
    assert.deepEqual(doc('main time').toArray().map(node => doc(node).attr('datetime')), ['2026-10-21']);
    assert.ok(!graph.some(item => item['@type'] === 'Service'));
  }
});

test('new customer questions and their linked service paths are visible in both languages', () => {
  const en = load(read('/faq/')), zh = load(read('/zh/faq/'));
  for (const item of data.faqs) assert.ok(en('details summary').toArray().some(node => en(node).text() === item.question));
  assert.equal(zh('details').length, en('details').length);
  for (const slug of ['gutter-cleaning', 'wall-patching-repair', 'doors-windows-screens', 'fence-gate-repair']) {
    const doc = load(read(`/services/${slug}/`));
    assert.ok(postRainRoutes.some(route => doc(`a[href="${route}"]`).length));
  }
});
