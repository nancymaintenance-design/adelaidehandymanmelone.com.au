const { chromium } = require('C:/Users/UFTR/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const origin = process.env.SEO_PREVIEW_ORIGIN || 'http://127.0.0.1:5173';
const assert = require('node:assert/strict');
assert.equal(new URL(origin).hostname, '127.0.0.1');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    for (const mode of ['normal', 'delayed', 'blocked', 'disabled']) for (let trial = 1; trial <= 3; trial++) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: mode !== 'disabled' });
      await context.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.origin !== origin) return route.fulfill({ body: '' });
        if (url.pathname === '/assets/js/site.js') {
          if (mode === 'blocked') return route.abort();
          if (mode === 'delayed') await new Promise(resolve => setTimeout(resolve, 500));
        }
        return route.continue();
      });
      await context.addInitScript(() => {
        window.__shifts = [];
        window.__frames = [];
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__shifts.push({ time: entry.startTime, value: entry.value, sources: entry.sources.map(source => ({ node: source.node?.tagName + '.' + source.node?.className, previous: source.previousRect.toJSON(), current: source.currentRect.toJSON() })) });
        }).observe({ type: 'layout-shift', buffered: true });
        const record = () => {
          const header = document.querySelector('.header-inner');
          const nav = document.querySelector('.primary-nav');
          const menu = document.querySelector('.menu-toggle');
          if (header) {
            const frame = { header: header.getBoundingClientRect().height, nav: getComputedStyle(nav).display, menu: getComputedStyle(menu).display, hidden: nav.hidden };
            if (JSON.stringify(frame) !== JSON.stringify(window.__frames.at(-1)?.layout)) window.__frames.push({ time: performance.now(), layout: frame });
          }
          if (performance.now() < 1600) requestAnimationFrame(record);
        };
        requestAnimationFrame(record);
      });
      const page = await context.newPage();
      await page.goto(origin + '/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      const result = await page.evaluate(() => ({ shifts: window.__shifts || [], frames: window.__frames || [], cls: window.__shifts?.reduce((sum, entry) => sum + entry.value, 0) ?? null }));
      console.log(JSON.stringify({ mode, trial, ...result }));
      if (process.env.ASSERT_STABLE === '1' && ['normal', 'delayed'].includes(mode)) assert.equal(result.cls, 0, `${mode} trial${trial} navigation CLS`);
      if (['blocked', 'disabled'].includes(mode)) assert.equal(await page.locator('.primary-nav').isVisible(), true, 'Navigation remains available without site JavaScript');
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
