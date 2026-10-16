import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { parse } from 'parse5';
import { walk, attribute, normalise } from '../src/i18n/html.mjs';
import { createTranslator, languageUrl } from '../src/i18n/bilingual.mjs';
import { validateSecurityPolicy, securityPolicy } from '../src/security-policy.mjs';
const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, 'public');
const baseline = JSON.parse(fs.readFileSync(new URL('./fixtures/bilingual-english-baseline.json', import.meta.url), 'utf8'));
const origin = 'https://www.adelaidehandymanmelone.com.au';
const routes = baseline.map(item => item.route);
const indexable = routes.filter(route => route !== '/404.html');
const pathSet = new Set([...routes, '/case-studies/feed.json', '/service-areas/feed.json']);
const read = route => fs.readFileSync(path.join(output, route.endsWith('.html') ? route.slice(1) : `${route.slice(1)}index.html`), 'utf8');
const nodes = (doc, predicate) => { const found = []; walk(doc, node => { if (predicate(node)) found.push(node); }); return found; };
const text = node => (node.nodeName === '#text' ? node.value : (node.childNodes || []).map(text).join(''));
const tag = name => node => node.tagName === name;
const main = doc => nodes(doc, node => attribute(node, 'id') === 'main')[0];
const dig = value => createHash('sha256').update(value).digest('hex');

test('all 102 indexable pages have complete reciprocal English/Chinese language metadata and self canonicals', () => {
  const sitemap = fs.readFileSync(path.join(output, 'sitemap.xml'), 'utf8');
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]).sort();
  assert.deepEqual(locations, indexable.flatMap(route => [origin + route, origin + '/zh' + route]).sort());
  for (const route of indexable) for (const language of ['en-AU', 'zh-Hans']) {
    const current = language === 'en-AU' ? route : '/zh' + route;
    const doc = parse(read(current));
    assert.equal(attribute(nodes(doc, tag('html'))[0], 'lang'), language, current);
    assert.equal(attribute(nodes(doc, n => attribute(n, 'rel') === 'canonical')[0], 'href'), origin + current);
    const alternates = nodes(doc, n => attribute(n, 'hreflang') && n.tagName === 'link').map(n => [attribute(n, 'hreflang'), attribute(n, 'href')]);
    assert.deepEqual(alternates, [['en-AU', origin + route], ['zh-Hans', origin + '/zh' + route], ['x-default', origin + route]], current);
    if (language === 'zh-Hans') {
      assert.match(text(nodes(doc, tag('title'))[0]), /[\u3400-\u9fff]/, current + ' title');
      assert.match(attribute(nodes(doc, n => attribute(n, 'name') === 'description')[0], 'content'), /[\u3400-\u9fff]/, current + ' description');
    }
  }
});
test('approved English H1 and entire main content are unchanged from the restored 27d59f0 baseline', () => {
  for (const expected of baseline) {
    const html = read(expected.route);
    assert.equal(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1], expected.h1, expected.route);
    assert.equal(dig(html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] || ''), expected.mainHash, expected.route);
  }
});
test('Chinese pages preserve every section, FAQ, image, contact link and internal link destination', () => {
  for (const route of routes) {
    const en = parse(read(route)), zh = parse(read('/zh' + route));
    const shape = doc => nodes(main(doc), n => /^(h[1-6]|details|img|form)$/.test(n.tagName)).map(n => n.tagName);
    assert.deepEqual(shape(zh), shape(en), route + ' structure');
    const images = doc => nodes(main(doc), tag('img')).map(n => ['src', 'srcset', 'width', 'height', 'loading'].map(key => attribute(n, key)));
    assert.deepEqual(images(zh), images(en), route + ' images');
    const links = doc => nodes(main(doc), tag('a')).map(n => attribute(n, 'href'));
    assert.deepEqual(links(zh), links(en).map(url => languageUrl(url, origin, pathSet)), route + ' links');
    assert.ok(!read('/zh' + route).includes('tel:+611300838722'), route);
    for (const doc of [en, zh]) {
      const phone = nodes(doc, n => attribute(n, 'href')?.startsWith('tel:'));
      assert.ok(phone.length > 0);
      assert.ok(phone.every(n => attribute(n, 'href') === 'tel:+61416614281' && text(n).includes('0416 614 281')), route);
      assert.ok(nodes(doc, n => attribute(n, 'href') === 'mailto:admin@melonemaintenance.com.au').length > 0, route);
    }
  }
});
test('language switch follows Contact and compact social links remain inside the original brand column on every page', () => {
  const socialUrls = ['https://share.google/bnkU7OE83VYCSh44T', 'https://www.instagram.com/melone.maintenance1/', 'https://www.youtube.com/@MelOneMaintenance', 'https://www.tiktok.com/@melonemaintenance5'];
  for (const route of routes) for (const zh of [false, true]) {
    const doc = parse(read((zh ? '/zh' : '') + route));
    const nav = nodes(doc, n => attribute(n, 'id') === 'primary-nav')[0];
    const links = nav.childNodes.filter(tag('a'));
    assert.equal(attribute(links.at(-1), 'href'), zh ? route : '/zh' + route);
    assert.equal(text(links.at(-1)), zh ? 'English' : '中文服务');
    assert.equal(attribute(links.at(-2), 'href'), (zh ? '/zh' : '') + '/contact/');
    const social = nodes(doc, n => attribute(n, 'class') === 'footer-social')[0];
    assert.ok(social);
    const brand = social.parentNode;
    assert.equal(attribute(brand.parentNode, 'class'), 'wrap footer-grid');
    assert.equal(brand.childNodes.filter(n => n.tagName).at(-2).tagName, 'p');
    assert.deepEqual(nodes(social, tag('a')).map(n => attribute(n, 'href')), socialUrls);
  }
});
test('Chinese structured data and translated markup retain the existing security policy', () => {
  for (const route of routes) {
    const html = read('/zh' + route);
    validateSecurityPolicy(html, securityPolicy);
    const doc = parse(html);
    const graph = JSON.parse(text(nodes(doc, n => attribute(n, 'type') === 'application/ld+json')[0]))['@graph'];
    const web = graph.find(item => item['@type'] === 'WebPage');
    assert.equal(web.url, origin + '/zh' + route);
    assert.equal(web.inLanguage, 'zh-Hans');
    const enGraph = JSON.parse(text(nodes(parse(read(route)), n => attribute(n, 'type') === 'application/ld+json')[0]))['@graph'];
    assert.deepEqual(graph.map(item => item['@type']), enGraph.map(item => item['@type']));
    assert.equal(graph.find(item => item.telephone)?.telephone, enGraph.find(item => item.telephone)?.telephone);
  }
  assert.match(read('/zh/404.html'), /noindex,follow/);
  const fallback = parse(read('/404.html'));
  const help = nodes(fallback, n => attribute(n, 'class') === 'wrap bilingual-error-help')[0];
  assert.equal(attribute(help, 'lang'), 'zh-Hans');
  assert.deepEqual(nodes(help, tag('a')).map(n => attribute(n, 'href')), ['/zh/', '/zh/contact/']);
  assert.match(text(help), /此页面暂不可用/);
});
test('all rendered English strings resolve to reviewed Chinese catalogue entries and interface messages are paired', () => {
  const translator = createTranslator();
  for (const en of Object.values(JSON.parse(fs.readFileSync(path.join(root, 'src/i18n/en.json'), 'utf8')))) translator.translate(en);
  translator.assertComplete();
  const messages = JSON.parse(fs.readFileSync(path.join(root, 'src/i18n/interface.json'), 'utf8'));
  for (const [key, pair] of Object.entries(messages)) { assert.ok(pair.en); assert.match(pair.zh, /[\u3400-\u9fff]/, key); }
});
