const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
test('local candidate redirects known variants once, preserves query and safely serves HTML', async () => {
  const child = spawn(process.execPath, ['serve.cjs'], { env: {...process.env, PORT:'0'}, stdio:['ignore','pipe','pipe'] });
  try {
    const [output] = await once(child.stdout, 'data');
    const base = String(output).match(/http:\/\/127\.0\.0\.1:\d+/)[0];
    for (const suffix of ['/contact', '/contact/index.html']) {
      const response = await fetch(base + suffix + '?service=door&utm_source=test', {redirect:'manual'});
      assert.equal(response.status, 308);
      assert.equal(response.headers.get('location'), '/contact/?service=door&utm_source=test');
      assert.equal((await fetch(base + response.headers.get('location'), {redirect:'manual'})).status, 200);
    }
    const rules=JSON.parse(fs.readFileSync('vercel.json','utf8')).redirects.filter(rule=>!rule.has);
    for (const rule of rules) {
      const response=await fetch(base+rule.source+'?utm_source=route-test', {redirect:'manual'});
      assert.equal(response.status,308,rule.source);
      assert.equal(response.headers.get('location'),new URL(rule.destination).pathname+'?utm_source=route-test');
    }
    for (const url of ['/unknown', '/unknown/index.html', '/assets/missing.png']) assert.equal((await fetch(base+url, {redirect:'manual'})).status,404);
    assert.equal((await fetch(base+'/api/contact', {method:'POST'})).status,503);
    const html = await (await fetch(base+'/contact/')).text();
    assert.doesNotMatch(html, /<script[^>]+src="https:\/\/www\.googletagmanager\.com/);
    assert.match(html, /window\.dataLayer/);
    assert.match(fs.readFileSync('public/contact/index.html','utf8'), /<script[^>]+src="https:\/\/www\.googletagmanager\.com/);
  } finally { child.kill(); }
});
test('verified dates and llms locality are truthful', async () => {
  const { validateEditorialDate } = await import('../src/page-revisions.mjs');
  assert.throws(()=>validateEditorialDate('2026-02-30'), /date/i);
  assert.throws(()=>validateEditorialDate('2099-01-01'), /future/i);
  assert.throws(()=>validateEditorialDate('2026-10-12','2026-10-13'), /publication/i);
  const xml=fs.readFileSync('public/sitemap.xml','utf8');
  assert.equal((xml.match(/<loc>/g)||[]).length,102);
  for (const route of ['/services/cabinet-drawer-repair/','/service-areas/inner-south/unley/']) assert.ok(xml.includes(route+'</loc><lastmod>2026-10-13</lastmod>'));
  assert.ok(xml.includes('/case-studies/kitchen-drawer-runner-repair/</loc><lastmod>2026-10-12</lastmod>'));
  assert.ok(xml.includes('/contact/</loc></url>'));
  assert.match(fs.readFileSync('public/llms.txt','utf8'), /suburb only when supplied/);
});
test('Vercel exact-route candidate covers sitemap variants without broad file/API redirects', () => {
  const config = JSON.parse(fs.readFileSync('vercel.json','utf8'));
  const routes = [...fs.readFileSync('public/sitemap.xml','utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
  const rules = config.redirects.filter(rule=>!rule.has);
  assert.equal(rules.length,203);
  assert.equal(new Set(rules.map(rule=>rule.source)).size,203);
  for (const route of routes) for (const variant of route==='/'?['/index.html']:[route.slice(0,-1),route+'index.html']) {
    const rule=rules.find(rule=>rule.source===variant);
    assert.equal(rule?.destination,'https://www.adelaidehandymanmelone.com.au'+route);
    assert.equal(rule.permanent,true);
    assert.equal(rule.destination.includes('?'),false);
  }
  assert.equal(config.redirects.at(-1).has[0].type,'host');
  assert.ok(rules.every(rule=>!rule.source.includes(':')&&!rule.source.startsWith('/api/')&&!rule.source.startsWith('/assets/')));
});
