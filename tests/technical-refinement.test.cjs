const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const http = require('node:http');
test('local candidate redirects known variants once, preserves query and safely serves HTML', async () => {
  const child = spawn(process.execPath, ['serve.cjs'], { env: {...process.env, PORT:'0'}, stdio:['ignore','pipe','pipe'] });
  try {
    const [output] = await once(child.stdout, 'data');
    const base = String(output).match(/http:\/\/127\.0\.0\.1:\d+/)[0];
    // Raw HTTP paths bypass fetch's URL slash/backslash normalization. Never follow these.
    for (const rawPath of ['/%2fcontact','//contact','/%5ccontact','/\\contact','/%2F%2fcontact','/%5C%5ccontact','/%2f%5ccontact','/contact%5cindex.html']) {
      const response = await new Promise((resolve,reject) => {
        http.get(base, {path:rawPath+'?utm_source=test'}, res=>{res.resume();resolve(res);}).on('error',reject);
      });
      assert.equal(response.statusCode,400,rawPath);
      assert.equal(response.headers.location,undefined,rawPath);
    }
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
      assert.equal(new URL(response.headers.get('location'),base).origin,base);
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
  const changedRoutes = [
    ...['cabinet-drawer-repair','sliding-door-repair','wall-patching-repair','pressure-cleaning'].map(s=>`/services/${s}/`),
    ...['cbd-north-adelaide/adelaide-cbd','cbd-north-adelaide/bowden','eastern-suburbs/burnside','inner-south/unley','inner-south/goodwood','inner-south/parkside','inner-west/brompton','western-suburbs/glenelg','southern-suburbs/marion'].map(s=>`/service-areas/${s}/`),
    ...['field-notes-doors-windows-screens-enquiry','field-notes-wall-interior-repairs-job-list','field-notes-cleaning-removals-preparation','field-notes-pre-sale-home-maintenance-list'].map(s=>`/guides/${s}/`)
  ];
  for (const route of changedRoutes) {
    assert.ok(xml.includes(route+'</loc><lastmod>2026-10-13</lastmod>'),route);
    if (route.startsWith('/guides/')) {
      const html=fs.readFileSync('public'+route+'index.html','utf8');
      assert.match(html,/Updated <time datetime="2026-10-13">2026-10-13<\/time>/);
      assert.match(html,/"dateModified":"2026-10-13"/);
    }
  }
  for (const slug of ['kitchen-drawer-runner-repair','sliding-patio-door-roller-track-repair']) {
    const route=`/case-studies/${slug}/`;
    assert.ok(xml.includes(route+'</loc><lastmod>2026-10-12</lastmod>'),route);
    const html=fs.readFileSync('public'+route+'index.html','utf8');
    assert.match(html,/Published <time datetime="2026-10-12">2026-10-12<\/time>/);
    assert.match(html,/"datePublished":"2026-10-12"/);
  }
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
