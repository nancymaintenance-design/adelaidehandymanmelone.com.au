import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'parse5';
import { walk, attribute, normalise } from '../src/i18n/html.mjs';

const root = path.resolve(import.meta.dirname, '..');
const read = route => fs.readFileSync(path.join(root, 'public', `${route.slice(1)}index.html`), 'utf8');
const nodes = (doc, predicate) => { const found = []; walk(doc, node => { if (predicate(node)) found.push(node); }); return found; };
const text = node => (node.nodeName === '#text' ? node.value : (node.childNodes || []).map(text).join(''));
const classes = node => (attribute(node, 'class') || '').split(/\s+/);
const unnecessaryCity = value => value.replace(/North Adelaide|Adelaide CBD|Adelaide Hills|Greater Adelaide|北阿德莱德|阿德莱德中央商务区|阿德莱德山(?:区|丘)?|大阿德莱德/g, '').match(/\bAdelaide\b|阿德莱德/);

test('English and Chinese service cards name their destination with the exact visible card title', () => {
  for (const route of ['/services/', '/zh/services/', '/', '/zh/']) {
    const cards = nodes(parse(read(route)), n => classes(n).includes('task-card'));
    assert.equal(cards.length, 9, route);
    for (const card of cards) {
      const heading = nodes(card, n => n.tagName === 'h3')[0];
      const titleLink = nodes(heading, n => n.tagName === 'a')[0];
      const cta = nodes(card, n => n.tagName === 'a' && classes(n).includes('text-link'))[0];
      const visible = node => normalise(nodes(node, n => n.nodeName === '#text' && attribute(n.parentNode, 'aria-hidden') !== 'true').map(n => n.value).join(''));
      assert.equal(attribute(cta, 'href'), attribute(titleLink, 'href'));
      assert.equal(visible(cta), normalise(text(titleLink)), route);
      assert.equal(attribute(cta, 'aria-label'), normalise(text(titleLink)), route);
      assert.ok(!unnecessaryCity(text(cta)), route);
    }
  }
});

test('non-home headings and internal-link names do not repeat a generic city modifier', () => {
  const sitemap = fs.readFileSync(path.join(root, 'public/sitemap.xml'), 'utf8');
  const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1]).pathname);
  for (const route of routes) {
    const doc = parse(read(route));
    if (!['/', '/zh/'].includes(route)) {
      const heading = nodes(doc, n => n.tagName === 'h1')[0];
      assert.ok(!unnecessaryCity(text(heading)), `${route}: ${text(heading)}`);
    }
    const internal = nodes(doc, n => n.tagName === 'a' && attribute(n, 'href')?.startsWith('/') && !attribute(n, 'href').includes('feed.json'));
    for (const link of internal) {
      for (const label of [text(link), attribute(link, 'aria-label') || '', attribute(link, 'title') || '']) {
        assert.ok(!unnecessaryCity(label), `${route}: ${label}`);
      }
    }
  }
});

test('necessary locality, business address, telephone and external social destinations remain factual', () => {
  for (const route of ['/services/', '/zh/services/']) {
    const html = read(route);
    assert.ok(html.includes('63 Pirie St Adelaide SA 5000'));
    assert.ok(html.includes('tel:+61416614281'));
    assert.ok(html.includes('admin@melonemaintenance.com.au'));
    for (const url of ['https://share.google/bnkU7OE83VYCSh44T', 'https://www.instagram.com/melone.maintenance1/', 'https://www.youtube.com/@MelOneMaintenance', 'https://www.tiktok.com/@melonemaintenance5']) assert.ok(html.includes(url));
  }
  assert.match(read('/service-areas/cbd-north-adelaide/north-adelaide/'), /North Adelaide/);
  assert.match(read('/service-areas/adelaide-hills-foothills/'), /Adelaide Hills/);
});
