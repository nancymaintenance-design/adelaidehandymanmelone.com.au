const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.SEO_PLAYWRIGHT_MODULE || 'C:/Users/UFTR/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const report = path.resolve(process.env.BROWSER_REPORT_DIR || path.resolve(root, '../reports/2026-10-16-bilingual'));
const origin = process.env.PREVIEW_ORIGIN || 'http://127.0.0.1:5180';
const rows = [], errors = [], interactions = [];
const representatives = ['/', '/services/interior-repairs-assembly/', '/guides/field-notes-cleaning-removals-preparation/', '/how-it-works/', '/contact/', '/service-areas/'];
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.FOOTER_BROWSER || 'C:/Users/UFTR/AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe', headless: true });
  try {
    const page = await browser.newPage();
    let apiCalls = 0;
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => {
      const request = route.request();
      if (request.url().includes('/api/')) { apiCalls++; return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({error:'Local preview: enquiries are not sent. Your details remain in the form.'}) }); }
      return request.method() === 'GET' && request.url().startsWith(origin + '/') ? route.continue() : route.abort();
    });
    const sitemap = fs.readFileSync(path.join(root, 'public/sitemap.xml'), 'utf8');
    const all = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1]).pathname);
    for (const width of [1920, 1440, 1024, 851, 850, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      const routes = [1440, 390].includes(width) ? all : representatives.flatMap(route => [route, '/zh' + route]);
      for (const route of routes) {
        const response = await page.goto(origin + route, { waitUntil: 'load' });
        assert.equal(response.status(), 200, route);
        const geometry = await page.evaluate(() => {
          const box = el => { const r = el.getBoundingClientRect(); return { x:r.x, y:r.y, width:r.width, height:r.height, bottom:r.bottom, right:r.right }; };
          const footer = document.querySelector('.site-footer'), social = footer.querySelector('.footer-social'), brand = social.parentElement;
          const nav = document.querySelector('#primary-nav');
          return {
            overflow: document.documentElement.scrollWidth - innerWidth,
            mainWidth: Math.max(...[...document.querySelectorAll('main .wrap')].map(el => el.getBoundingClientRect().width)),
            footer: box(footer), socialInBrand: brand.parentElement.classList.contains('footer-grid'),
            socialGap: social.getBoundingClientRect().top - brand.querySelector('p').getBoundingClientRect().bottom,
            socialTargets: [...social.querySelectorAll('a')].map(box),
            navOverflow: getComputedStyle(nav).display !== 'none' && nav.getBoundingClientRect().right > innerWidth,
            brokenImages: [...document.images].filter(img => !img.loading && img.complete && img.naturalWidth === 0).map(img => img.src),
            hiddenHeading: [...document.querySelectorAll('h1,h2,h3')].filter(el => !el.closest('details:not([open])') && (getComputedStyle(el).display === 'none' || el.getBoundingClientRect().width === 0)).length
          };
        });
        const label = `${width} ${route}`;
        if (geometry.overflow > 1 || geometry.navOverflow) errors.push(`${label}: horizontal overflow ${geometry.overflow}`);
        if (width >= 1280 && geometry.mainWidth < 1000) errors.push(`${label}: narrow main ${geometry.mainWidth}`);
        if (width >= 1280 && geometry.footer.height > 420) errors.push(`${label}: footer height ${geometry.footer.height}`);
        if (!geometry.socialInBrand || geometry.socialGap > 20 || geometry.socialGap < 0) errors.push(`${label}: social position`);
        if (geometry.socialTargets.some(r => r.height < 44 || r.width < 44)) errors.push(`${label}: social touch target`);
        if (geometry.brokenImages.length || geometry.hiddenHeading) errors.push(`${label}: content visibility`);
        rows.push({ width, route, ...geometry });
      }
      console.log(`Layout checked at ${width}px (${routes.length} pages).`);
    }
    console.log(`Geometry findings: ${errors.length}.`);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(origin + '/contact/?region=eastern-suburbs&suburb=burnside#main');
    await page.locator('[data-language-switch]').click();
    await page.waitForLoadState('load');
    assert.equal(new URL(page.url()).pathname, '/zh/contact/');
    assert.equal(new URL(page.url()).searchParams.get('suburb'), 'burnside');
    assert.equal(new URL(page.url()).hash, '#main');
    assert.equal(await page.locator('#suburb').inputValue(), 'Burnside');
    await page.locator('[data-enquiry-submit]').click();
    assert.match(await page.locator('#message-error').innerText(), /维修|维护/);
    assert.match(await page.locator('[data-enquiry-status]').innerText(), /检查/);
    assert.equal(apiCalls, 0, 'invalid form must not send a request');
    await page.locator('#message').fill('本地中文表单测试，不实际发送。');
    await page.locator('input[name=contactPreference][value=email]').check();
    await page.locator('#email').fill('preview@example.test');
    await page.locator('[data-enquiry-submit]').click();
    await page.waitForFunction(() => document.querySelector('[data-enquiry-status]').textContent.includes('本地预览'));
    assert.equal(await page.locator('#message').inputValue(), '本地中文表单测试，不实际发送。');
    assert.equal(apiCalls, 1, 'API was intercepted, not sent');
    await page.locator('[data-language-switch]').click();
    await page.waitForLoadState('load');
    assert.equal(new URL(page.url()).pathname, '/contact/');
    await page.locator('[data-enquiry-submit]').click();
    assert.match(await page.locator('[data-enquiry-status]').innerText(), /Check the highlighted/);
    interactions.push('Round-trip counterpart switch preserves query/hash and suburb prefill; Chinese/English validation; local-preview failure keeps entered text; all API intercepted.');
    await page.goto(origin + '/zh/service-areas/');
    await page.locator('#area-search').fill('Glenelg');
    assert.match(await page.locator('[data-area-search-status]').innerText(), /1 个/);
    await page.locator('#area-search').fill('zzzzz-no-such-suburb');
    assert.match(await page.locator('[data-area-search-status]').innerText(), /未找到/);
    await page.locator('[data-area-search-clear]').click();
    assert.equal(await page.locator('#area-search').inputValue(), '');
    interactions.push('Chinese area search, no-results message, and clear button work.');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(origin + '/zh/');
    await page.locator('.menu-toggle').click();
    assert.ok(await page.locator('[data-language-switch]').isVisible());
    await page.locator('[data-language-switch]').press('Escape');
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
    interactions.push('Mobile menu exposes language switch and closes with Escape.');
    const missing = await page.goto(origin + '/zh/page-that-does-not-exist/');
    assert.equal(missing.status(), 404);
    assert.equal(await page.locator('html').getAttribute('lang'), 'zh-Hans');
    interactions.push('Unknown Chinese URL returns a real 404 with Chinese guidance.');
    fs.mkdirSync(report, { recursive: true });
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const [label, route] of [['home','/zh/'], ['service','/zh/services/interior-repairs-assembly/'], ['guide','/zh/guides/field-notes-cleaning-removals-preparation/']]) {
        await page.goto(origin + route);
        await page.screenshot({ path: path.join(report, `${label}-zh-${width}.png`), fullPage: true });
      }
    }
    fs.writeFileSync(path.join(report, 'browser-verification.json'), JSON.stringify({ checkedAt: new Date().toISOString(), base: origin, checks: rows.length, errors, interactions, rows }, null, 2));
    console.log(JSON.stringify({ checks: rows.length, errors, interactions }));
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
})().catch(error => {
  fs.mkdirSync(report, { recursive: true });
  fs.writeFileSync(path.join(report, 'browser-verification.json'), JSON.stringify({ checkedAt: new Date().toISOString(), base: origin, completed: false, checks: rows.length, errors: [...errors, error.message], interactions, rows }, null, 2));
  console.error(error);
  process.exitCode = 1;
});
