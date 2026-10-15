const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const buildFixture = require('./build-fixture.cjs');
const verifierFile = path.join(root, 'scripts/semantic-review.cjs');
const validate = fs.existsSync(verifierFile) ? require(verifierFile).verifySemanticReview : () => ({ issues: ['Semantic review validator is missing'] });
const prior = require('../../reports/live-audit-2026-10-14/contract-verification.json').keywords;
const source = require('../src/content-pack/keyword-content-contract.json').keywordSources;
const baseline = require('./fixtures/local-audit-immutable-baseline.json');
const dataFile = path.join(root, 'src/content-pack/semantic-keyword-review.json');

test('319 reviewed intents and all 548 original rows have current rendered evidence', async t => {
  const { read, output } = buildFixture(t);
  const { chromium } = require('C:/Users/UFTR/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
  const { extractPage } = require('../scripts/verify-keyword-content.cjs');
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  t.after(() => browser.close());
  const tab = await browser.newPage();
  tab.setDefaultTimeout(120000);
  await tab.route('**/*', route => route.request().url().startsWith('file:') ? route.continue() : route.abort());
  const routes = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1]).pathname);
  const pages = [];
  for (const route of routes) {
    await tab.setContent(fs.readFileSync(path.join(output, route === '/' ? 'index.html' : route.slice(1) + 'index.html'), 'utf8'), { waitUntil: 'domcontentloaded' });
    pages.push(await extractPage(tab, null, route));
  }
  const rows = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, 'utf8')).rows : [];
  const input = { rows, sourceRows: source, priorRows: prior, pages, baseline };
  const result = validate(input);
  assert.deepEqual(result.issues, [], 'A reviewed intent must cite a real answer, preserve identity and retain all prior outcomes');
  assert.equal(result.reviewedCount, 319);
  assert.equal(result.rollup.length, 548);
  assert.equal(result.rollup.filter(r => r.reviewCohort === 'previously-observed').length, 135);
  assert.equal(result.rollup.filter(r => r.reviewCohort === 'previously-held').length, 94);
  assert.match(validate({ ...input, sourceRows: source.slice(1) }).issues.join(' '), /548.*accounting/i, 'Missing original source rows cannot disappear from the rollup');
  const changedPrior = structuredClone(prior);
  changedPrior.find(r => r.status === 'heldServiceClaim').status = 'mappedObserved';
  assert.match(validate({ ...input, priorRows: changedPrior }).issues.join(' '), /135.*94/i, 'An older held claim cannot be promoted by this review');
  const mutations = [
    ['missing ID', r => r.pop(), /missing|319/i],
    ['duplicate ID', r => r.push(structuredClone(r[0])), /duplicate/i],
    ['unsupported status', r => { r[0].finalDisposition = 'unverified'; }, /status|disposition/i],
    ['empty reason', r => { r[0].rationale = ''; }, /rationale/i],
    ['wrong heading', r => { r.find(x => x.evidence.length).evidence[0].headingOrQuestion = 'Unrelated heading'; }, /heading|answer/i],
    ['unrelated excerpt', r => { r.find(x => x.evidence.length).evidence[0].quote = 'An irrelevant quote cannot answer this intent.'; }, /excerpt|quote/i],
    ['missing pending fact', r => { r.find(x => x.finalDisposition === 'withheld-pending-business-confirmation').factsNeeded = []; }, /fact/i],
    ['changed source identity', r => { r[0].text = 'Unrelated source query'; }, /identity|source/i],
  ];
  for (const [name, mutate, pattern] of mutations) {
    const changed = structuredClone(rows); mutate(changed);
    assert.match(validate({ ...input, rows: changed }).issues.join(' '), pattern, name);
  }
  const altered = structuredClone(pages); altered[0].headings.find(h => h.level === 1).text = 'Changed core H1';
  assert.match(validate({ ...input, pages: altered }).issues.join(' '), /immutable H1/i);
});

test('editorial amendments explain anchoring and keep concise case labels with original case H1', t => {
  const { read } = buildFixture(t);
  const flat = read('services/flat-pack-assembly/index.html');
  assert.ok(/reduce the risk of furniture tipping over/i.test(flat), 'Anchoring explains the tip-over purpose');
  const gutter = read('services/gutter-cleaning/index.html');
  assert.equal([...gutter.matchAll(/<summary>Will gutter cleaning (?:stop all|resolve every) overflow\?<\/summary>/g)].length, 1);
  for (const file of ['index.html', 'about/index.html', 'contact/index.html']) assert.ok(!read(file).includes('Know who is coming and what is agreed.'), file);
  const interior = read('services/interior-repairs-assembly/index.html');
  assert.ok(!interior.includes('>Kitchen Cabinet Hinge Repair in Unley, Adelaide</a>'));
  assert.match(read('case-studies/unley-kitchen-cabinet-repair/index.html'), /<h1[^>]*>Kitchen Cabinet Hinge Repair in Unley, Adelaide<\/h1>/);
});
