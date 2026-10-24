// Local-only browser geometry guard. Expectations are audit requirements, not renderer output.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync, spawn } = require('node:child_process');
const { chromium } = require(process.env.SEO_PLAYWRIGHT_MODULE || 'C:/Users/UFTR/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const reportRoot = path.resolve(root, '../reports/local-audit-remediation-2026-10-15/task-1');
const baselineFile = path.join(root, 'tests/fixtures/local-audit-immutable-baseline.json');
const mediaRoutes = ['home-electrical-repairs', 'interior-repairs-assembly', 'doors-windows-screens', 'garden-landscape-care', 'outdoor-structures-fences-pools', 'home-repairs-renovation-support', 'cleaning-removals-specialist-care'].map(slug => `/services/${slug}/`);
const cardCounts = new Map([
  ['/services/interior-repairs-assembly/', 4], ['/services/doors-windows-screens/', 7],
  ['/services/outdoor-structures-fences-pools/', 4], ['/service-areas/eastern-suburbs/', 4],
  ['/case-studies/', 20], ['/service-areas/', 8]
]);
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
// Exact approved UI icons and adviser portraits are additions; no original
// photo or logo is re-baselined. Other additions or changed bytes still fail.
const approvedAdditionalImages = {
  'src/assets/icons/arrow-right.svg': 'edcfe1180dcc2afb750f1cb4b45524a5cdf6622a862b2e75320b4e4f057fc28c',
  'src/assets/icons/slash.svg': '3c8a15d148c06af5356a20d5d301cc38fc5711737411d01d34e49b24d4e047c0',
  // User approved these three exact reference portraits on 24 October 2026.
  'src/assets/images/advisors/ella.webp': '3b00d1381e799bedde5e5df8dd6412bd45190b84f362382cfb3e004d756779fb',
  'src/assets/images/advisors/felix.webp': '673f67016757fbc614573c2db1190999aa4f7c15ea369ed9e7b4ec2c5ca675f4',
  'src/assets/images/advisors/riley.webp': '830e489b45f4e766a8fc43ab3bb5dfccc01f436f35760455537e5ecff6225783'
};
function immutableImagesMatch(images, originals) {
  const expected = { ...originals, ...approvedAdditionalImages };
  return Object.keys(images).length === Object.keys(expected).length &&
    Object.entries(expected).every(([file, hash]) => images[file] === hash);
}
function imageHashes() {
  const hashes = {};
  function visit(dir) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, item.name);
      if (item.isDirectory()) visit(file);
      else if (/\.(?:png|jpe?g|webp|avif|svg|gif|ico)$/i.test(item.name)) hashes[path.relative(root, file).replaceAll('\\', '/')] = digest(fs.readFileSync(file));
    }
  }
  visit(path.join(root, 'src/assets'));
  return hashes;
}
function mediaFailure(frame) {
  if (!frame.loaded) return 'image did not decode';
  if (frame.blankRatio > .25) return `blank area ${(100 * frame.blankRatio).toFixed(2)}% exceeds 25%`;
  if (Math.abs(frame.width / frame.height - frame.naturalWidth / frame.naturalHeight) > .01) return 'original aspect ratio changed';
  if (frame.width > frame.naturalWidth + 1 || frame.height > frame.naturalHeight + 1) return 'original image upscaled';
  if (frame.fit !== 'contain') return 'diagnostic image may be cropped';
  return null;
}
function gridFailure(grid) {
  const lastY = Math.max(...grid.cards.map(card => card.y));
  const last = grid.cards.filter(card => Math.abs(card.y - lastY) < 2).sort((a, b) => a.x - b.x);
  const used = last.reduce((sum, card) => sum + card.width, 0) + Math.max(0, last.length - 1) * grid.gap;
  if (grid.width - used > 10 && Math.max(...last.map(card => card.height)) > 320) return `last row leaves ${(grid.width - used).toFixed(1)}px unused beside ${Math.max(...last.map(card => card.height)).toFixed(1)}px cards`;
  return null;
}
async function run({ captureBaseline = false, phase = process.env.AUDIT_LAYOUT_PHASE || 'green' } = {}) {
  fs.mkdirSync(reportRoot, { recursive: true });
  if (captureBaseline && fs.existsSync(baselineFile)) throw new Error('Refusing to replace immutable pre-remediation baseline');
  const fixture = fs.mkdtempSync(path.join(reportRoot, 'fixture-'));
  require('../tests/english-builder-fixture.cjs')(root, fixture);
  for (const file of ['serve.cjs', 'vercel.json']) fs.copyFileSync(path.join(root, file), path.join(fixture, file));
  fs.cpSync(path.join(root, 'src'), path.join(fixture, 'src'), { recursive: true });
  execFileSync(process.execPath, ['build.mjs'], { cwd: fixture, stdio: 'pipe', env: { ...process.env, SITE_ORIGIN: '' } });
  const server = spawn(process.execPath, ['serve.cjs'], { cwd: fixture, env: { ...process.env, PORT: '0' }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let browser;
  try {
    const origin = await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.once('exit', code => reject(new Error(`Preview exited ${code}`)));
      server.stdout.on('data', bytes => { const match = bytes.toString().match(/http:\/\/127\.0\.0\.1:\d+/); if (match) resolve(match[0]); });
    });
    browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    await context.route('**/*', route => new URL(route.request().url()).origin === origin && route.request().method() === 'GET' && !route.request().url().includes('/api/') ? route.continue() : route.abort());
    const page = await context.newPage({ viewport: { width: 1440, height: 1000 } });
    const routes = [...fs.readFileSync(path.join(fixture, 'public/sitemap.xml'), 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(match => new URL(match[1]).pathname);
    const h1 = {};
    for (const route of routes) {
      const response = await page.goto(origin + route);
      if (response.status() !== 200) throw new Error(`${route}: HTTP ${response.status()}`);
      h1[route] = await page.locator('main h1').allTextContents();
    }
    const images = imageHashes();
    if (captureBaseline) {
      const baseline = { capturedBefore: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), routeCount: routes.length, h1, images };
      fs.mkdirSync(path.dirname(baselineFile), { recursive: true });
      fs.writeFileSync(baselineFile, JSON.stringify(baseline, null, 2) + '\n', { flag: 'wx' });
      fs.writeFileSync(path.join(reportRoot, 'immutable-baseline.json'), JSON.stringify(baseline, null, 2) + '\n');
      return { baselineFile, routes: routes.length, imageFiles: Object.keys(images).length, sha256: digest(fs.readFileSync(baselineFile)) };
    }
    const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
    const failures = { media: [], grids: [], responsive: [], immutable: [], overflow: [] };
    if (routes.length !== 102 || JSON.stringify(h1) !== JSON.stringify(baseline.h1)) failures.immutable.push('Approved 102 H1 snapshot changed');
    if (!immutableImagesMatch(images, baseline.images)) failures.immutable.push('Original image bytes or inventory changed');
    const metrics = [];
    const focusedRoutes = [...new Set([...mediaRoutes, ...cardCounts.keys(), '/services/roof-gutter-exterior-care/', '/services/home-electrical-repairs/', '/'])];
    for (const width of [1280, 1440, 1920, 850, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const route of focusedRoutes) {
        await page.goto(origin + route);
        await page.evaluate(async () => { for (const image of document.images) image.loading = 'eager'; await Promise.all([...document.images].map(image => image.decode().catch(() => {}))); });
        const data = await page.evaluate(() => {
          const rect = el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
          return {
            overflow: document.documentElement.scrollWidth - innerWidth,
            intro: document.querySelector('.desktop-service-intro') ? { ...rect(document.querySelector('.desktop-service-intro')), copy: rect(document.querySelector('.desktop-service-intro .page-intro')), gallery: rect(document.querySelector('.desktop-service-intro .service-visual-gallery')) } : null,
            media: [...document.querySelectorAll('.service-visual-gallery:not(.case-photo-grid) .service-visual')].map(frame => {
              const image = frame.querySelector('img'), r = rect(image), f = rect(frame), fit = getComputedStyle(image).objectFit;
              const scale = Math.min(r.width / image.naturalWidth, r.height / image.naturalHeight);
              const painted = image.naturalWidth * image.naturalHeight * scale * scale;
              return { ...r, frame: f, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, fit, loaded: image.complete && image.naturalWidth > 0, blankRatio: 1 - painted / (f.width * f.height) };
            }),
            grids: [...document.querySelectorAll('.card-grid')].map(grid => ({ ...rect(grid), gap: parseFloat(getComputedStyle(grid).columnGap) || 0, cards: [...grid.children].map(card => ({ ...rect(card), workImage: !!card.querySelector('.work-image-link img'), imageLayout: card.querySelector('.work-image-link img')?.dataset.imageLayout })) }))
          };
        });
        metrics.push({ route, width, ...data });
        if (data.overflow > 0) failures.overflow.push(`${route} @${width}: ${data.overflow}px horizontal overflow`);
        if (mediaRoutes.includes(route)) {
          if (data.media.length !== 1) failures.media.push(`${route} @${width}: expected original service photograph`);
          for (const frame of data.media) { const failure = mediaFailure(frame); if (failure) failures.media.push(`${route} @${width}: ${failure}`); }
          if (width > 850 && (!data.intro || data.intro.gallery.x < data.intro.copy.x + data.intro.copy.width - 1 || data.intro.height > Math.max(data.intro.copy.height, data.intro.gallery.height) + 100)) failures.media.push(`${route} @${width}: media retains a separate empty band instead of sharing the existing introduction`);
        }
        for (const grid of data.grids) {
          const failure = gridFailure(grid); if (failure) failures.grids.push(`${route} @${width} (${grid.cards.length} cards): ${failure}`);
          for (const card of grid.cards) if (card.workImage && !card.imageLayout) failures.responsive.push(`${route} @${width}: shared card lost its responsive-image slot hint`);
        }
        if (cardCounts.has(route) && !data.grids.some(grid => grid.cards.length === cardCounts.get(route))) failures.grids.push(`${route}: audited card inventory changed`);
        if ([1440, 390].includes(width) && ['/services/interior-repairs-assembly/', '/services/doors-windows-screens/', '/service-areas/', '/case-studies/'].includes(route)) {
          fs.mkdirSync(path.join(reportRoot, phase), { recursive: true });
          for (const selector of ['.desktop-service-intro', '.service-visual-gallery:not(.case-photo-grid)', '.card-grid']) {
            const element = page.locator(selector).first();
            if (await element.count()) await element.screenshot({ path: path.join(reportRoot, phase, `${width}-${route.replaceAll('/', '_')}-${selector.startsWith('.card') ? 'cards' : selector.startsWith('.desktop') ? 'intro' : 'media'}.png`) });
          }
        }
      }
    }
    const counts = [...new Set(metrics.flatMap(row => row.grids.map(grid => grid.cards.length)))].sort((a, b) => a - b);
    for (const count of [1, 2, 4, 7, 8, 20]) if (!counts.includes(count)) failures.grids.push(`No rendered coverage of required ${count}-card count`);
    const result = { phase, routes: routes.length, imageFiles: Object.keys(images).length, widths: [1280, 1440, 1920, 850, 768, 390, 320], cardCounts: counts, failures, metrics };
    fs.writeFileSync(path.join(reportRoot, `${phase}-geometry.json`), JSON.stringify(result, null, 2) + '\n');
    return result;
  } finally {
    if (browser) await browser.close();
    server.kill();
    await new Promise(resolve => server.exitCode !== null ? resolve() : server.once('exit', resolve));
    fs.rmSync(fixture, { recursive: true, force: true });
  }
}
module.exports = { run, mediaFailure, gridFailure, immutableImagesMatch };
if (require.main === module) run({ captureBaseline: process.argv.includes('--capture-baseline') }).then(result => {
  console.log(JSON.stringify({ ...result, metrics: undefined }, null, 2));
  if (result.failures && Object.values(result.failures).some(rows => rows.length)) process.exitCode = 1;
}).catch(error => { console.error(error); process.exitCode = 1; });
