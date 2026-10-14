// Local-only rendered regression checks. Never sends enquiries or remote requests.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { chromium } = require(process.env.SEO_PLAYWRIGHT_MODULE || 'C:/Users/UFTR/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const output = process.env.LAYOUT_REPORT_DIR ? path.resolve(process.env.LAYOUT_REPORT_DIR) : path.resolve(root, '../reports/layout-repair-2026-10-13', process.env.LAYOUT_PHASE || 'candidate');
const evidence = { phase: process.env.LAYOUT_PHASE || 'candidate', pages: [], failures: [], errors: [], interactions: [] };
let server, browser, context, origin;

test.before(async () => {
  fs.mkdirSync(output, { recursive: true });
  server = spawn(process.execPath, ['serve.cjs'], { cwd: root, env: { ...process.env, PORT: '0' }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  origin = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Local preview startup timed out')), 15000);
    server.once('error', reject);
    server.stdout.on('data', bytes => {
      const match = bytes.toString().match(/http:\/\/127\.0\.0\.1:\d+/);
      if (match) { clearTimeout(timeout); resolve(match[0]); }
    });
  });
  browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  context = await browser.newContext({ reducedMotion: 'reduce' });
  await context.route('**/*', route => new URL(route.request().url()).origin === origin
    ? route.continue() : route.fulfill({ status: 200, contentType: 'text/plain', body: '' }));
});
test.after(async () => {
  fs.writeFileSync(path.join(output, 'layout-results.json'), JSON.stringify(evidence, null, 2));
  await browser?.close();
  server?.kill();
});

test('all sitemap pages avoid viewport overflow and tall empty title columns', async () => {
  const urls = [...fs.readFileSync(path.join(root, 'public/sitemap.xml'), 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname);
  const page = await context.newPage();
  page.on('pageerror', error => evidence.errors.push(error.message));
  for (const width of [1920, 960, 850, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of urls) {
      const response = await page.goto(origin + route, { waitUntil: 'load' });
      const result = await page.evaluate(() => {
        const box = el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom }; };
        const unbalanced = [...document.querySelectorAll('.faq-section, .split-section')].flatMap(section => {
          const children = [...section.children];
          if (children.length < 2) return [];
          const a = box(children[0]), b = box(children[1]);
          const sameRow = Math.abs(a.y - b.y) < 10 && b.x >= a.x + a.width;
          // Intrinsic content height, not the grid item's stretched background.
          const occupied = el => Math.max(0, ...[...el.children].map(child => box(child).bottom - box(el).y));
          const blankHeight = Math.abs(occupied(children[0]) - occupied(children[1]));
          return sameRow && blankHeight > 320 ? [{ heading: section.querySelector('h2')?.textContent, blankHeight }] : [];
        });
        const spacious = [...document.querySelectorAll('main .section, main .process-section')].flatMap(el => {
          const css = getComputedStyle(el); const value = Math.max(parseFloat(css.paddingTop), parseFloat(css.paddingBottom));
          return value > 56 ? [{ heading: el.querySelector('h2')?.textContent, padding: value }] : [];
        });
        return { overflow: document.documentElement.scrollWidth - innerWidth, unbalanced, spacious,
          title: document.title, h1: [...document.querySelectorAll('h1')].map(el => el.textContent),
          headings: [...document.querySelectorAll('main h2,main h3')].map(el => el.textContent),
          canonical: document.querySelector('link[rel="canonical"]')?.href,
          faqCount: document.querySelectorAll('.faq-list details').length };
      });
      const failures = [];
      if (response.status() !== 200) failures.push('HTTP ' + response.status());
      if (result.overflow > 1) failures.push('Horizontal overflow: ' + result.overflow);
      if (result.unbalanced.length) failures.push(...result.unbalanced.map(x => 'Empty title column: ' + JSON.stringify(x)));
      if (result.spacious.length) failures.push(...result.spacious.map(x => 'Excess section padding: ' + JSON.stringify(x)));
      evidence.pages.push({ route, width, ...result });
      evidence.failures.push(...failures.map(message => ({ route, width, message })));
      if (route === '/' && [1920, 390].includes(width)) {
        for (const [selector, name] of [['.faq-section', 'home-faq'], ['.process-section', 'home-process']]) {
          await page.locator(selector).screenshot({ path: path.join(output, `${width}-${name}.png`) });
        }
      }
    }
  }
  assert.equal(evidence.errors.length, 0, JSON.stringify(evidence.errors));
  assert.equal(evidence.failures.length, 0, JSON.stringify(evidence.failures.slice(0, 8)));
});

test('FAQ can expand with keyboard without clipping or horizontal overflow', async () => {
  const page = await context.newPage();
  for (const width of [1920, 960, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(origin, { waitUntil: 'load' });
    const faq = page.locator('.faq-section details').first();
    const summary = faq.locator('summary');
    await summary.focus(); await page.keyboard.press('Enter');
    assert.equal(await faq.evaluate(el => el.open), true);
    assert.equal(await summary.evaluate(el => el === document.activeElement), true);
    assert(await faq.locator('p').isVisible());
    assert(await faq.locator('p').evaluate(el => el.scrollHeight <= el.clientHeight + 1));
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({ path: path.join(output, `${width}-faq-open.png`) });
    await page.keyboard.press('Enter');
    assert.equal(await faq.evaluate(el => el.open), false);
    evidence.interactions.push({ width, check: 'keyboard FAQ open/close, focus and answer visibility', status: 'pass' });
  }
});

test('answer hub shows a useful answer early, supports keyboard disclosure and opens linked answers', async () => {
  const page = await context.newPage();
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({width, height: 900});
    await page.goto(origin + '/how-it-works/', {waitUntil:'load'});
    const firstAnswer = page.locator('.answer-category details p').first();
    assert(await firstAnswer.isVisible());
    const top = await firstAnswer.evaluate(el => el.getBoundingClientRect().top);
    assert(top < 740, `First useful answer at ${top}px on ${width}px screen`);
    assert(await page.locator('h1').evaluate(el => el.getBoundingClientRect().height < 140));
    const disclosure = page.locator('#answer-ADH-0511');
    await disclosure.locator('summary').focus();
    await page.keyboard.press('Enter');
    assert(await disclosure.evaluate(el=>el.open));
    assert(await disclosure.locator('p').isVisible());
    await page.keyboard.press('Space');
    assert.equal(await disclosure.evaluate(el=>el.open), false);
    await page.goto(origin + '/how-it-works/#answer-ADH-0511', {waitUntil:'load'});
    assert(await disclosure.evaluate(el=>el.open), 'Linked answer must open');
    for (const id of ['prepare-request','group-jobs','initial-discussion','specialist-boundary','confirm-scope','prepare-visit','on-site-work','completion-next-steps']) {
      await page.goto(origin + '/how-it-works/#' + id);
      assert.equal(await page.locator('#'+id).count(), 1);
      assert(await page.locator('#'+id).evaluate(el=>el.getBoundingClientRect().top >= 0));
    }
    assert(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth + 1));
    evidence.interactions.push({width,check:'answer hub first answer, keyboard Enter/Space, direct answer link and eight legacy anchors',status:'pass'});
  }
});

test('long translated-size FAQ text wraps without truncation or losing answers', async () => {
  const page = await context.newPage();
  for (const width of [960, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(origin, { waitUntil: 'load' });
    // Stress geometry without altering published copy or relying on a translation service.
    await page.evaluate(() => {
      const summary = document.querySelector('.faq-section summary');
      summary.textContent = summary.textContent.repeat(3);
      document.querySelector('.faq-section').style.fontSize = '20px';
    });
    const faq = page.locator('.faq-section details').first();
    await faq.locator('summary').focus(); await page.keyboard.press('Enter');
    assert(await faq.locator('p').isVisible());
    assert(await faq.locator('summary').evaluate(el => el.scrollWidth <= el.clientWidth + 1));
    const overflow = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, scrollX,
      outside: [...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right + scrollX > innerWidth + 1).slice(0, 8).map(el => ({ tag: el.tagName, class: el.className, text: el.textContent.slice(0, 70) })) }));
    assert(overflow.scroll <= width + 1, JSON.stringify(overflow));
    evidence.interactions.push({ width, check: 'long FAQ and enlarged answer text wraps without overflow', status: 'pass' });
  }
});
