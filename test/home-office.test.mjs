import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {load} from 'cheerio';

for (const prefix of ['', 'zh/']) test(`${prefix || 'en/'} homepage offers the confirmed office map without duplicating destination pages`, () => {
  const $ = load(fs.readFileSync(`public/${prefix}index.html`, 'utf8'));
  const card = $('.office-location');
  assert.equal(card.length, 1, 'homepage needs an office map card');
  assert.equal(card.find('a[href="https://maps.app.goo.gl/rtHK3cyEqyp7kiea8"]').length, 1);
  const embed = new URL(card.find('iframe').attr('src'));
  assert.equal(embed.origin, 'https://www.google.com');
  assert.equal(embed.searchParams.get('q'), '63 Pirie St, Adelaide SA 5000');
  assert.equal(card.find(`a[href="/${prefix}contact/"]`).length, 1);
  assert.equal(card.find(`a[href="/${prefix}service-areas/"]`).length, 1);
  assert.equal(card.find(`a[href="/${prefix}faq/"]`).length, 1);
  assert.equal($('main .region-overview, main .faq-section, main .contact-band').length, 0);
  const graph = JSON.parse($('script[type="application/ld+json"]').first().text())['@graph'];
  assert.ok(!graph.some(n => n['@type'] === 'FAQPage'), 'invisible homepage FAQ must not remain in schema');
  assert.equal($('footer nav a').filter((_, el) => /share.google|instagram.com|youtube.com|tiktok.com/.test($(el).attr('href'))).length, 4);
  for (const route of ['faq', 'service-areas']) assert.ok(fs.existsSync(`public/${prefix}${route}/index.html`));
});
