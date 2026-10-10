// Local-only integration evidence. Remote requests are intercepted, never sent.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.SEO_PLAYWRIGHT_MODULE || 'C:/Users/UFTR/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const origin = process.env.SEO_PREVIEW_ORIGIN || 'http://127.0.0.1:5173';
assert(['127.0.0.1', 'localhost'].includes(new URL(origin).hostname), 'Local preview only');
const output = path.resolve(__dirname, '../.seo-cache/', process.env.SEO_BROWSER_EVIDENCE || 'browser-final');
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.SEO_CHROME_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const results = { analyzed_at: new Date().toISOString(), origin, remote_requests_intercepted: [], pages: [], interactions: {}, violations: [], errors: [] };
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    await context.route('**/*', async route => {
      const request = route.request();
      if (new URL(request.url()).origin === origin) return route.continue();
      results.remote_requests_intercepted.push(request.url());
      return route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
    });
    await context.addInitScript(() => {
      window.__cspViolations = [];
      window.__performanceEvidence = { lcp_ms: null, cls: 0 };
      new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__performanceEvidence.lcp_ms = entry.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__performanceEvidence.cls += entry.value; }).observe({ type: 'layout-shift', buffered: true });
      document.addEventListener('securitypolicyviolation', event => window.__cspViolations.push({ directive: event.effectiveDirective, blocked: event.blockedURI }));
    });
    const page = await context.newPage();
    page.on('pageerror', error => results.errors.push(error.message));
    const routes = ['/', '/services/', '/services/flyscreen-repair/', '/services/door-repair/', '/services/gutter-cleaning/', '/services/fence-gate-repair/', '/services/flat-pack-assembly/', '/service-standards/', '/guides/field-notes-doors-windows-screens-enquiry/', '/service-areas/eastern-suburbs/norwood/', '/service-areas/north-north-east/modbury/', '/case-studies/modbury-timber-fence-repair-assessment/', '/about/', '/contact/'];
    if (process.env.SEO_CONTENT_ALL === '1') {
      const inventory = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../.seo-cache/content-candidate.json'), 'utf8'));
      routes.splice(0, routes.length, ...inventory.pages.map(item => item.route));
    }
    const inspect = async (route, viewport) => {
      const response = await page.goto(origin + route, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200, route);
      assert(response.headers()['content-security-policy'], 'CSP header missing');
      assert.equal(await page.locator('h1').count(), 1, route + ' H1');
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://www.adelaidehandymanmelone.com.au' + route);
      const contentChecks = await page.evaluate(() => {
        const main = document.querySelector('main');
        const headings = [...main.querySelectorAll('h1,h2,h3,h4,h5,h6')];
        let previous = 0;
        const skips = headings.filter(el => { const level = Number(el.tagName[1]); const skip = level > previous + 1; previous = level; return skip; }).map(el => el.textContent);
        const missingAnchors = [...main.querySelectorAll('a[href^="#"]')].filter(el => !document.getElementById(decodeURIComponent(el.hash.slice(1)))).map(el => el.hash);
        return { skips, missingAnchors, faqCount: main.querySelectorAll('details summary').length };
      });
      assert.deepEqual(contentChecks.skips, [], route + ' heading hierarchy');
      assert.deepEqual(contentChecks.missingAnchors, [], route + ' in-page links');
      if (route.startsWith('/guides/') && route !== '/guides/') {
        assert(contentChecks.faqCount >= 2, route + ' useful FAQs');
        await page.locator('a[href="#guide-section-1"]').click();
        assert.equal(new URL(page.url()).hash, '#guide-section-1');
        const faq = page.locator('main details').first();
        await faq.locator('summary').focus();
        await page.keyboard.press('Enter');
        assert(await faq.evaluate(el => el.open), route + ' keyboard FAQ');
        await page.keyboard.press('Enter');
      }
      const fold = await page.evaluate(() => ({ h1: document.querySelector('h1').getBoundingClientRect().top < innerHeight, cta: [...document.querySelectorAll('a.button')].some(el => { const r = el.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }) }));
      const localNavigationOnly = await page.evaluate(() => ({ ...window.__performanceEvidence, note: 'Unthrottled localhost short navigation; not production CWV, no INP measurement' }));
      assert(localNavigationOnly.cls < 0.1, route + ' initial local layout-shift regression: ' + localNavigationOnly.cls);
      for (const img of await page.locator('img').all()) {
        // Lazy images inside a closed disclosure cannot load until it is opened.
        await img.evaluate(el => { for (let parent = el.parentElement; parent; parent = parent.parentElement) if (parent.tagName === 'DETAILS') parent.open = true; });
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(el => Promise.race([el.decode(), new Promise((_, reject) => setTimeout(() => reject(new Error('Image decode timeout: ' + el.currentSrc)), 15000))]));
      }
      const width = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, viewport: innerWidth }));
      assert(width.scroll <= width.viewport + 1, route + ' horizontal overflow');
      const violations = await page.evaluate(() => window.__cspViolations);
      results.violations.push(...violations.map(item => ({ route, viewport, ...item })));
      results.pages.push({ route, viewport, status: response.status(), images: await page.locator('img').count(), width, content_checks: contentChecks, above_fold: fold, local_navigation_only: localNavigationOnly });
      console.log(JSON.stringify({checked:results.pages.length,route,viewport}));
      await page.evaluate(() => scrollTo(0, 0));
      if (['/', '/services/flyscreen-repair/', '/service-standards/', '/contact/'].includes(route)) {
        await page.screenshot({ path: path.join(output, viewport + (route === '/' ? '-home' : route.replaceAll('/', '-')) + '.png'), fullPage: true });
      }
    };
    for (const route of routes) await inspect(route, 'mobile');
    await page.goto(origin, { waitUntil: 'networkidle' });
    await page.locator('.menu-toggle').click();
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
    await page.locator('#primary-nav a').first().focus();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
    assert(await page.locator('.menu-toggle').evaluate(el => el === document.activeElement));
    results.interactions.mobile_menu_escape = 'pass';
    await page.locator('a[href^="tel:"]').first().evaluate(el => { el.addEventListener('click', event => event.preventDefault(), { once: true }); el.click(); });
    assert(await page.evaluate(() => window.dataLayer.some(item => item[0] === 'event' && item[1] === 'click_to_call')));
    results.interactions.click_to_call_queue = 'pass';
    await page.goto(origin + '/contact/', { waitUntil: 'networkidle' });
    await page.locator('[data-enquiry-submit]').click();
    assert.match(await page.locator('[data-enquiry-status]').innerText(), /Check the highlighted/);
    await page.locator('#message').fill('Local automated QA only; do not send.');
    await page.locator('#message').dispatchEvent('input');
    await page.locator('#suburb').fill('Norwood');
    await page.locator('#phone').fill('0416 000 000');
    await page.locator('[data-enquiry-submit]').click();
    await page.waitForFunction(() => document.querySelector('[data-enquiry-status]').textContent.includes('Local preview'));
    assert.equal(await page.locator('#suburb').inputValue(), 'Norwood');
    assert(await page.evaluate(() => !window.dataLayer.some(item => item[0] === 'event' && item[1] === 'generate_lead')));
    results.interactions.invalid_and_local503_preserve_input = 'pass';
    await page.route('**/api/contact', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
    await page.locator('[data-enquiry-submit]').click();
    await page.waitForFunction(() => document.querySelector('[data-enquiry-status]').textContent.includes('Thank you'));
    assert.equal(await page.locator('#suburb').inputValue(), '');
    assert(await page.evaluate(() => window.dataLayer.some(item => item[0] === 'event' && item[1] === 'generate_lead')));
    results.interactions.mock_success_lead_queue = 'pass (mock only; no delivery)';
    results.violations.push(...await page.evaluate(() => window.__cspViolations));
    await page.setViewportSize({ width: 1440, height: 1000 });
    for (const route of ['/', '/services/flyscreen-repair/', '/service-standards/', '/contact/']) await inspect(route, 'desktop');
    assert.equal(results.violations.length, 0, JSON.stringify(results.violations));
    assert.equal(results.errors.length, 0, JSON.stringify(results.errors));
    results.status = 'pass';
  } catch (error) {
    results.status = 'fail';
    results.failure = error.stack;
    throw error;
  } finally {
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
    await browser.close();
    console.log(JSON.stringify({ status: results.status, pages: results.pages.length, interactions: results.interactions, violations: results.violations, errors: results.errors, output }));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
