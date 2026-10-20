import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/UFTR/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const { desktopPairFailure } = require('./check-desktop-layout.cjs');
const origin = 'http://127.0.0.1:5183';
const output = path.resolve(import.meta.dirname, '../../reports/2026-10-20-benchmark-implementation');
fs.mkdirSync(output, { recursive: true });
const sitemap = await (await fetch(origin + '/sitemap.xml')).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1]).pathname);
assert.equal(urls.length, 204);
const failures = [];
for (const route of [...urls, '/robots.txt', '/llms.txt']) {
  const r = await fetch(origin + route);
  if (r.status !== 200) failures.push(`${route}: HTTP ${r.status}`);
  const body = await r.text();
  if (route.endsWith('/')) {
    if (!body.includes('tel:+61416614281') || body.includes('tel:+611300838722')) failures.push(`${route}: telephone drift`);
    if (!body.includes('admin@melonemaintenance.com.au')) failures.push(`${route}: email drift`);
  }
}
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const metrics = [];
try {
  const page = await browser.newPage();
  await page.route('**/*', route => {
    const r = route.request(), u = new URL(r.url());
    if (r.method() !== 'GET' || u.origin !== origin || /\/(?:api|analytics)\//.test(u.pathname)) return route.abort();
    return route.continue();
  });
  for (const width of [1920, 1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ['/', '/zh/', '/services/sliding-door-repair/', '/zh/services/sliding-door-repair/', '/services/fence-gate-repair/', '/zh/services/wall-patching-repair/', '/zh/case-studies/goodwood-wall-repair/', '/zh/service-areas/north-north-east/modbury/']) {
      await page.goto(origin + route, { waitUntil: 'networkidle' });
      const m = await page.evaluate(() => {
        const rect = e => { const r = e.getBoundingClientRect(); return { x:r.x, y:r.y, width:r.width, height:r.height }; };
        const social = [...document.querySelectorAll('footer nav a')].filter(a => /share.google|instagram.com|youtube.com|tiktok.com/.test(a.href));
        const wraps = [...document.querySelectorAll('main .wrap')].map(rect);
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          contentWidth: Math.max(...wraps.map(r => r.width)),
          footerHeight: document.querySelector('footer').getBoundingClientRect().height,
          social: social.map(a => ({ href:a.href, ...rect(a) })),
          rows: [...document.querySelectorAll('.desktop-topic-row')].map(e => ({ ...rect(e), children:[...e.children].map(rect) })),
          brokenImages: [...document.querySelectorAll('main img')].filter(i => i.complete && !i.naturalWidth).map(i => i.src),
        };
      });
      if (m.overflow) failures.push(`${width} ${route}: horizontal overflow`);
      if (m.social.length !== 4 || m.social.some(a => a.height < 44)) failures.push(`${width} ${route}: social target`);
      if (width >= 1440 && (m.contentWidth < 1000 || m.footerHeight > 420)) failures.push(`${width} ${route}: desktop width/footer`);
      if (width >= 1440) for (const row of m.rows) { const problem = desktopPairFailure(row); if (problem) failures.push(`${width} ${route}: ${problem}`); }
      if (m.brokenImages.length) failures.push(`${width} ${route}: broken image`);
      metrics.push({width, route, ...m});
      if (route === '/zh/services/sliding-door-repair/' && width !== 1920) {
        await page.locator('main section').first().scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(output, `sliding-door-zh-${width}.png`) });
      }
    }
  }
} finally { await browser.close(); }
fs.writeFileSync(path.join(output, 'local-preview-verification.json'), JSON.stringify({ checkedAt:new Date().toISOString(), origin, pageGetChecks:urls.length, viewportChecks:metrics.length, externalRequests:'blocked; office embed source separately protected by baseline, not a live Google Maps availability test', failures, metrics }, null, 2));
console.log(JSON.stringify({ pageGetChecks:urls.length, viewportChecks:metrics.length, footerHeights:metrics.filter(m=>m.width>=1440).map(m=>m.footerHeight), failures }));
assert.deepEqual(failures, []);
