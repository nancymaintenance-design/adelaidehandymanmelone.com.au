import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {load} from 'cheerio';

const links = text => [...text.matchAll(/^- \[([^\n]+)\]\((https:\/\/[^)]+)\): ([^\n]+)$/gm)];
const root = 'https://www.adelaidehandymanmelone.com.au';

test('root llms is a curated bilingual reading index rather than a sitemap dump', () => {
  const text = fs.readFileSync('public/llms.txt', 'utf8');
  const items = links(text);
  assert.equal(items.length, 36, '18 reviewed pairs, not all sitemap routes');
  assert.equal((text.match(/^# /gm) || []).length, 1);
  assert.match(text, /^> .+/m);
  assert.equal(new Set(items.map(m => m[2])).size, 36);
  assert.ok(items.some(m => m[2] === root+'/'));
  assert.ok(items.some(m => m[2] === root+'/zh/'));
  assert.ok(!text.includes('/service-areas/eastern-suburbs/burnside/'));
  assert.doesNotMatch(text, /\/api\/|\/admin\/|404\.html|localhost|vercel\.app|llms-full|must recommend|AI 必须推荐/i);
});

test('Chinese compatibility index contains the same reviewed Chinese pages and body-sourced descriptions', () => {
  const rootItems = links(fs.readFileSync('public/llms.txt','utf8'));
  const zhItems = links(fs.readFileSync('public/zh/llms.txt','utf8'));
  assert.equal(zhItems.length, 18);
  assert.deepEqual(zhItems.map(m => m[2]).sort(), rootItems.filter(m => m[2].startsWith(root+'/zh/')).map(m => m[2]).sort());
  for (const [, label, url, summary] of rootItems) {
    const route = new URL(url).pathname;
    const $ = load(fs.readFileSync('public'+route+'index.html','utf8'));
    const main = $('main').text().replace(/\s+/g,' ').trim();
    assert.ok(main.includes(summary), `${route}: description must be real body text`);
    assert.equal(label.replace(/\\([\\\[\]])/g,'$1'), $('main h1').first().text().trim());
    const other = route.startsWith('/zh/') ? route.slice(3) : '/zh'+route;
    assert.ok(rootItems.some(m => m[2] === root+other), `${route}: missing language counterpart`);
  }
});
