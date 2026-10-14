const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('C:/Users/UFTR/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const buildFixture = require('./build-fixture.cjs');
const { verifyPage, classifyKeywordEvidence, recordEvidence, extractPage, findUnresolvedFeedTargets, verifyProtectedLayoutCss, reviewedIntentExceptions } = require('../scripts/verify-keyword-content.cjs');

const page = () => ({
  route: '/services/example/', title: 'Drawer Repair Adelaide | MEL ONE',
  canonical: 'https://www.adelaidehandymanmelone.com.au/services/example/', robots: 'index,follow',
  headings: [
    { level: 1, text: 'Drawer Repair Adelaide', body: '' },
    { level: 2, text: 'Runner and cabinet checks', body: 'A jammed drawer may have a worn runner, loose mounting screws or an out-of-square cabinet. We check the travel and compatible parts before agreeing the repair.' }
  ],
  faq: [{ question: 'Can a drawer runner be repaired?', answer: 'We inspect the runner and cabinet first, then explain whether adjustment or a compatible replacement part is appropriate.' }],
  schemaFaq: [{ question: 'Can a drawer runner be repaired?', answer: 'We inspect the runner and cabinet first, then explain whether adjustment or a compatible replacement part is appropriate.' }],
  links: [{ href: '/contact/', text: 'Request an assessment' }],
  images: [{ src: '/assets/images/drawer.png', alt: 'Drawer runner being checked' }]
});
const context = () => ({
  origin: 'https://www.adelaidehandymanmelone.com.au',
  routes: new Set(['/services/example/', '/contact/']),
  assets: new Set(['/assets/images/drawer.png']),
  anchors: new Map([['/contact/', new Set()], ['/services/example/', new Set()]]),
  expectation: { primaryTopic: 'Drawer Repair Adelaide', headingTopics: [{ heading: 'Runner and cabinet checks', bodyTerms: ['runner', 'cabinet'] }], questionTopics: [{ question: 'Can a drawer runner be repaired?' }] }
});

test('accepts a substantive heading and matching visible/schema FAQ', () => {
  assert.deepEqual(verifyPage(page(), context()), []);
});

test('rejects a token-matched heading with no useful answer', () => {
  const candidate = page();
  candidate.headings[1].body = 'We check the runner and cabinet. Contact us.';
  assert.match(verifyPage(candidate, context()).join(' '), /substantive/i);
});

test('finds mismatched FAQ answer, missing fragment, and weak link text', () => {
  const candidate = page();
  candidate.schemaFaq[0].answer = 'Yes.';
  candidate.links = [{ href: '/contact/#missing', text: 'Click here' }];
  const issues = verifyPage(candidate, context()).join(' ');
  assert.match(issues, /FAQ.*answer/i);
  assert.match(issues, /fragment/i);
  assert.match(issues, /anchor text/i);
});

test('counts only rendered evidence and does not equate proposed IDs with coverage', () => {
  const rows = [
    { id: 'ADH-0001', disposition: 'map_to_existing_content' },
    { id: 'ADH-0002', disposition: 'map_to_existing_content' },
    { id: 'ADH-0003', disposition: 'qualified_answer_only_no_unsupported_promise' },
    { id: 'ADH-0004', disposition: 'hold_service_claim_pending_verified_scope' }
  ];
  const evidence = new Map([['ADH-0001', [{ route: '/', surface: 'h1', quote: 'Drawer Repair Adelaide' }]], ['ADH-0003', [{ route: '/', surface: 'faq', quote: 'Only after assessment.' }]]]);
  const result = classifyKeywordEvidence(rows, evidence);
  assert.deepEqual(result.counts, { mappedObserved: 1, qualifiedObserved: 1, heldServiceClaim: 1, unverified: 1 });
  assert.equal(result.rows.find(r => r.id === 'ADH-0002').status, 'unverified');
});

test('does not credit an H2 source ID when its heading has no explanatory body', () => {
  const pages = [{ route: '/', title: 'Handyman Adelaide', headings: [{ level: 1, text: 'Handyman Adelaide', body: '' }, { level: 2, text: 'Small repairs', body: 'Around the home' }], faq: [], schemaFaq: [] }];
  const contract = { pages: [{ route: '/', primaryTopic: 'Handyman Adelaide', primarySourceKeywordIds: [], headingTopics: [{ heading: 'Small repairs', sourceKeywordIds: ['ADH-0009'] }], questionTopics: [] }] };
  assert.equal(recordEvidence(pages, contract).has('ADH-0009'), false);
});

test('rejects matching blank, placeholder and generic FAQ answers', () => {
  for (const answer of ['', 'TBD', 'This answer is coming soon. Contact us for more information about this question.']) {
    const candidate = page();
    candidate.faq[0].answer = answer;
    candidate.schemaFaq[0].answer = answer;
    assert.match(verifyPage(candidate, context()).join(' '), /FAQ.*(empty|placeholder|generic|substantive)/i, answer);
  }
});

test('accepts a contact-first answer that also explains the service process', () => {
  const candidate = page();
  const answer = 'Contact MEL ONE with your Adelaide suburb and job details. Our team arranges an on-site assessment, checks the affected fitting, confirms compatible parts and provides a written quote before work begins.';
  candidate.faq[0].answer = answer;
  candidate.schemaFaq[0].answer = answer;
  assert.deepEqual(verifyPage(candidate, context()), []);
});

test('does not credit itemised-invoice intent from a related handover note', () => {
  const rows = [{ id: 'ADH-0415', keyword: 'Can I get an itemised invoice for repairs at my rental property?', disposition: 'map_to_existing_content' }];
  const related = new Map([['ADH-0415', [{ route: '/news/field-notes-clear-maintenance-handover/', surface: 'visible+schema FAQ', quote: 'Keep requested completion records with the same job.' }]]]);
  const result = classifyKeywordEvidence(rows, related, new Map([['ADH-0415', 'The cited handover copy does not answer whether an itemised invoice can be issued.']]));
  assert.equal(result.rows[0].status, 'unverified');
  assert.deepEqual(result.rows[0].observed, []);
  assert.equal(result.rows[0].relatedEvidence.length, 1);
});

test('related anchoring prose does not answer why, and generic gutter access does not verify single-storey scope', () => {
  const rows = [
    { id: 'ADH-0168', keyword: 'Why do some flat-pack furniture instructions require wall anchoring?', disposition: 'map_to_existing_content' },
    { id: 'ADH-0357', keyword: 'single storey gutter cleaning Adelaide', disposition: 'map_to_existing_content' }
  ];
  const related = new Map([
    ['ADH-0168', [{ route: '/services/flat-pack-assembly/', surface: 'heading+body', quote: 'Manufacturer securing instructions should be considered against the actual wall.' }]],
    ['ADH-0357', [{ route: '/services/gutter-cleaning/', surface: 'heading+body', quote: 'Building height and access affect a gutter-cleaning plan.' }]]
  ]);
  const result = classifyKeywordEvidence(rows, related, reviewedIntentExceptions);
  assert.deepEqual(result.counts, { mappedObserved: 0, qualifiedObserved: 0, heldServiceClaim: 0, unverified: 2 });
  for (const row of result.rows) {
    assert.deepEqual(row.observed, []);
    assert.equal(row.relatedEvidence.length, 1);
    assert.match(row.reason, row.id === 'ADH-0168' ? /why|tip|stability/i : /single.storey/i);
  }
});

test('finds missing picture source even when its fallback img exists', () => {
  const candidate = page();
  candidate.pictureSources = ['/assets/images/drawer.avif'];
  assert.match(verifyPage(candidate, context()).join(' '), /Missing picture source.*drawer\.avif/);
});

test('finds unresolved region feed URL in addition to suburb and case targets', () => {
  const caseFeed = { items: [] };
  const areaFeed = { regions: [{ url: 'https://www.adelaidehandymanmelone.com.au/service-areas/missing/', suburbs: [{ url: 'https://www.adelaidehandymanmelone.com.au/contact/', relatedServiceUrls: [] }] }] };
  assert.deepEqual(findUnresolvedFeedTargets(caseFeed, areaFeed, new Set(['/contact/']), new Set(), 'https://www.adelaidehandymanmelone.com.au'), ['Feed target unresolved: https://www.adelaidehandymanmelone.com.au/service-areas/missing/']);
});

test('checks the protected CSS byte hash, not only images and business facts', async t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mel-one-css-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const css = path.join(dir, 'site.css');
  fs.writeFileSync(css, 'body { color: black; }');
  const layoutCssHash = crypto.createHash('sha256').update(fs.readFileSync(css)).digest('hex');
  assert.deepEqual(verifyProtectedLayoutCss({ layoutCssHash }, css), []);
  fs.writeFileSync(css, 'body { color: red; }');
  assert.match(verifyProtectedLayoutCss({ layoutCssHash }, css).join(' '), /Protected layout CSS changed/);
});

test('approved hub CSS permits only the hashed scoped addition and still detects shared CSS drift', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mel-one-css-profile-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const css = path.join(dir, 'site.css');
  const base = 'body { color: black; }\n';
  const addition = '/* decision-qa-redesign:start */\n.decision-hub h1 { font-size: 2rem; }\n/* decision-qa-redesign:end */\n';
  const digest = x => crypto.createHash('sha256').update(x).digest('hex');
  const baseline = { layoutCssHash: digest(base) };
  const profile = { scopedCssHash: digest(addition) };
  fs.writeFileSync(css, base + addition);
  assert.deepEqual(verifyProtectedLayoutCss(baseline, css, profile), []);
  fs.writeFileSync(css, base.replace('black', 'red') + addition);
  assert.match(verifyProtectedLayoutCss(baseline, css, profile).join(' '), /Protected layout CSS changed/);
  fs.writeFileSync(css, base + addition.replace('2rem', '8rem'));
  assert.match(verifyProtectedLayoutCss(baseline, css, profile).join(' '), /Scoped answer-hub CSS changed/);
  const unscoped = addition.replace('.decision-hub h1', 'body');
  fs.writeFileSync(css, base + unscoped);
  assert.match(verifyProtectedLayoutCss(baseline, css, {scopedCssHash:digest(unscoped)}).join(' '), /Unscoped/);
});

test('DOM heading extraction stops before a later subsection and preserves split-column prose', async t => {
  const html = '<!doctype html><html><head><title>Test</title></head><body><main><section><h1>Test</h1><h2>Runner and cabinet checks</h2><p>See the details below.</p><h3>Later unrelated discussion</h3><p>The runner and cabinet may need assessment for alignment, and compatible parts depend on the model. The site team checks wear, track travel and fixings before a written quote is agreed.</p></section><section class="split-section"><div><h2>Actual split column answer</h2></div><div class="reading"><p>Loose hinges, worn runners and damaged board require different checks. The door and cabinet are assessed together before agreeing compatible fittings and the work scope.</p></div></section></main></body></html>';
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  t.after(() => browser.close());
  const tab = await browser.newPage();
  await tab.setContent(html);
  const rendered = await extractPage(tab, null, '/services/example/');
  assert.equal(rendered.headings.find(h => h.text === 'Runner and cabinet checks').body, 'See the details below.');
  assert.match(rendered.headings.find(h => h.text === 'Actual split column answer').body, /Loose hinges, worn runners and damaged board/);
});

test('service directory explains small repairs immediately under its topic heading before cards', t => {
  const { read } = buildFixture(t);
  const html = read('services/index.html');
  const match = html.match(/<h2>Home Repair and Property Maintenance Services<\/h2>([\s\S]*?)<section class="task-wall"/);
  assert.ok(match, 'service directory heading and task wall');
  assert.match(match[1], /^<p[^>]*>[^]*<\/p>$/);
  assert.match(match[1], /door.*flyscreen.*cupboard/i);
  assert.match(match[1], /assess.*written quote/i);
});
