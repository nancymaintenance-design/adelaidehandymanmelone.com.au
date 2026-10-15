const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { digest, historicalPhoneLinks } = require('../scripts/local-audit-semantic-deltas.cjs');
const { socialLinks, brandLink, caseDataLink, verifyFooterLinkRelocation } = require('./footer-link-relocation.cjs');
const root = path.resolve(__dirname, '..');
const previousSemanticsDigest = 'a26831db5ecd66251d993663c65033bc5b9c2eb81ab01b705884144327b4188d';
const previousLinkDigestsDigest = '085a75c5dcef58b27bbd11ad6f9f34fc48f3191fa11b40cdb49e32bc146a14fc';

test('footer acceptance permits only the exact four unchanged links to move after the brand', () => {
  const start = [['/services/', 'Main navigation services'], brandLink];
  const middle = [['/services/', 'Services'], ['/news/', 'News'], ['mailto:admin@melonemaintenance.com.au', 'Email']];
  const end = [caseDataLink, ['/service-areas/feed.json', 'Area data (JSON)']];
  const before = [...start, ...middle, ...socialLinks, ...end];
  const current = [...start, ...socialLinks, ...middle, ...end];
  assert.deepEqual(verifyFooterLinkRelocation(current, digest(historicalPhoneLinks(before))), before);
  assert.throws(() => verifyFooterLinkRelocation(before, digest(historicalPhoneLinks(before))), /ordered block/);
  for (const [name, mutate] of [
    ['changed social URL', links => { links[2][0] += '/changed'; }],
    ['changed social label', links => { links[3][1] = 'New label'; }],
    ['duplicated social link', links => { links.push([...socialLinks[0]]); }],
    ['duplicated social URL with a different label', links => { links.push([socialLinks[0][0], 'Other label']); }],
    ['reordered social block', links => { [links[2], links[3]] = [links[3], links[2]]; }],
    ['unrelated URL change', links => { links[6][0] = '/invented/'; }],
    ['unrelated label change', links => { links[6][1] = 'Changed'; }],
    ['unrelated link ordering', links => { [links[6], links[7]] = [links[7], links[6]]; }],
    ['unrelated link deletion', links => { links.splice(6, 1); }],
    ['unrelated link addition', links => { links.push(['/new/', 'New']); }],
  ]) {
    const changed = structuredClone(current);
    mutate(changed);
    assert.throws(() => verifyFooterLinkRelocation(changed, digest(historicalPhoneLinks(before))), undefined, name);
  }
});

test('phone routing comparison rejects stale targets and preserves labels and mail links', () => {
  const current = [['tel:+611300838722', 'Call 0416 614 281'], ['mailto:admin@melonemaintenance.com.au', 'admin@melonemaintenance.com.au'], ['tel:000', 'Emergency']];
  assert.deepEqual(historicalPhoneLinks(current), [['tel:+61416614281', 'Call 0416 614 281'], ['mailto:admin@melonemaintenance.com.au', 'admin@melonemaintenance.com.au'], ['tel:000', 'Emergency']]);
  assert.throws(() => historicalPhoneLinks([['tel:+61416614281', 'Contact']]), /approved routing target/);
  assert.deepEqual(historicalPhoneLinks([['tel:+611300838723', 'Other']]), [['tel:+611300838723', 'Other']], 'An arbitrary destination cannot be hidden by normalization');
});

test('all 102 generated pages preserve their former link sequence after reversing the footer relocation', async t => {
  const manifest = require('./fixtures/local-audit-approved-deltas.json');
  assert.equal(manifest.historicalDigest, 'b643554cfbe1cd07c1e2d7cae2f46843cb1b5d03e27ce30b8436dfccb5cff69e', 'Historical baseline is unchanged');
  assert.equal(manifest.footerLinkRelocation?.previousSemanticsDigest, previousSemanticsDigest, 'The exact footer relocation must be documented in the manifest');
  const previous = Object.entries(manifest.footerLinkRelocation.previousLinkDigests);
  assert.equal(digest(manifest.footerLinkRelocation.previousLinkDigests), previousLinkDigestsDigest, 'The 102 former approved link digests must remain unchanged');
  assert.equal(previous.length, 102);

  const reportRoot = path.resolve(root, '../reports/footer-compact-2026-10-15');
  fs.mkdirSync(reportRoot, { recursive: true });
  const fixture = fs.mkdtempSync(path.join(reportRoot, 'links-test-'));
  assert.equal(path.dirname(fixture), reportRoot);
  t.after(() => fs.rmSync(fixture, { recursive: true, force: true }));
  fs.copyFileSync(path.join(root, 'build.mjs'), path.join(fixture, 'build.mjs'));
  fs.cpSync(path.join(root, 'src'), path.join(fixture, 'src'), { recursive: true });
  execFileSync(process.execPath, ['build.mjs'], { cwd: fixture, env: { ...process.env, SITE_ORIGIN: '' }, stdio: 'pipe', windowsHide: true });

  const { chromium } = require(process.env.SEO_PLAYWRIGHT_MODULE || 'C:/Users/UFTR/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
  const browser = await chromium.launch({ executablePath: process.env.FOOTER_BROWSER || 'C:/Users/UFTR/AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe', headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.route('**/*', request => request.abort());
  for (const [route, previousHash] of previous) {
    const relativeFile = route === '/' ? 'index.html' : route.slice(1) + 'index.html';
    await page.setContent(fs.readFileSync(path.join(fixture, 'public', relativeFile), 'utf8'), { waitUntil: 'domcontentloaded' });
    const current = await page.locator('a').evaluateAll(anchors => anchors.map(anchor => [anchor.getAttribute('href'), anchor.textContent.replace(/\s+/g, ' ').trim()]));
    verifyFooterLinkRelocation(current, previousHash);
    const delta = manifest.deltas[route + ':links'];
    assert.ok(delta, route + ': exact link amendment is present');
    assert.equal(delta.approved, digest(historicalPhoneLinks(current)), route + ': current link order matches approved relocation');
  }
});
