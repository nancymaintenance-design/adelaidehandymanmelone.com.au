// Local candidate verification. Browser requests outside local file:// pages are intercepted.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { verifySemanticReview, exportSemanticReview } = require('./semantic-review.cjs');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');
const site = 'https://www.adelaidehandymanmelone.com.au';
const baselineDir = path.resolve(root, '../reports/keyword-led-content-2026-10-13');
const reportArg = process.argv.indexOf('--report-dir');
const reportDir = path.resolve(reportArg >= 0 ? process.argv[reportArg + 1] : path.join(root, '../reports/decision-qa-redesign-2026-10-14'));
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const normal = value => String(value || '').replace(/\s+/g, ' ').trim();
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function verifyProtectedLayoutCss(baseline, file, profile, guideProfile, desktopProfile) {
  if (!fs.existsSync(file)) return [`Protected layout CSS changed: ${file}`];
  if (!profile) return hash(file) === baseline.layoutCssHash ? [] : [`Protected layout CSS changed: ${file}`];
  const css = fs.readFileSync(file, 'utf8');
  const marker = css.indexOf('/* decision-qa-redesign:start');
  if (marker < 0) return [`Missing scoped answer-hub CSS: ${file}`];
  const guideMarker = css.indexOf('/* guide-editorial-repair:start');
  const desktopMarker = css.indexOf('/* desktop-layout-repair:start');
  const prefix = css.slice(0, marker), addition = css.slice(marker, guideMarker < 0 ? undefined : guideMarker);
  const digest = value => crypto.createHash('sha256').update(value).digest('hex');
  const issues = [];
  if (digest(prefix) !== baseline.layoutCssHash) issues.push(`Protected layout CSS changed: ${file}`);
  if (digest(addition) !== profile.scopedCssHash) issues.push(`Scoped answer-hub CSS changed: ${file}`);
  if (guideMarker >= 0 || guideProfile) {
    const guideCss = guideMarker >= 0 ? css.slice(guideMarker, desktopMarker < 0 ? undefined : desktopMarker) : '';
    if (!guideProfile || digest(guideCss) !== guideProfile.scopedCssHash) issues.push(`Scoped guide CSS changed: ${file}`);
    for (const [, selector] of guideCss.replace(/\/\*[^]*?\*\//g, '').matchAll(/([^{}]+)\{/g)) {
      const value = selector.trim();
      if (value.startsWith('@media ')) continue;
      if (!value.split(',').every(part => /^\.guide-(?:page|directory)\s/.test(part.trim()))) issues.push(`Unscoped guide CSS selector: ${value}`);
    }
  }
  if (desktopMarker >= 0 || desktopProfile) {
    const desktopCss = desktopMarker >= 0 ? css.slice(desktopMarker) : '';
    if (!desktopProfile || digest(desktopCss) !== desktopProfile.scopedCssHash) issues.push(`Scoped desktop CSS changed: ${file}`);
    for (const [, selector] of desktopCss.replace(/\/\*[^]*?\*\//g, '').matchAll(/([^{}]+)\{/g)) {
      const value = selector.trim();
      if (value.startsWith('@media ')) continue;
      if (!value.split(',').every(part => part.trim().startsWith('.desktop-layout '))) issues.push(`Unscoped desktop CSS selector: ${value}`);
    }
  }
  const rules = addition.replace(/\/\*[^]*?\*\//g, '').matchAll(/([^{}]+)\{/g);
  for (const [, selector] of rules) {
    const value = selector.trim();
    if (value.startsWith('@media ')) continue;
    if (!value.split(',').every(part => part.trim().startsWith('.decision-hub '))) issues.push(`Unscoped CSS selector: ${value}`);
  }
  return issues;
}
function faqAnswerProblem(answer) {
  const value = normal(answer);
  if (!value) return 'empty';
  if (/\b(?:tbd|todo|placeholder|coming soon|answer to come|lorem ipsum)\b/i.test(value)) return 'placeholder';
  if (/^(?:yes|no|maybe)\.?$/i.test(value) || /^(?:please )?(?:contact|call|email|ask)\s+(?:us|mel one)\s+for\s+(?:more\s+)?(?:details|information)(?:\s+about\s+(?:this|your)\s+question)?[.!]?$/i.test(value)) return 'generic';
  const specificWords = value.toLowerCase().match(/[a-z]{4,}/g)?.filter(word => !['that', 'this', 'with', 'your', 'more', 'about', 'please', 'contact', 'information'].includes(word)) || [];
  if (specificWords.length < 7) return 'not substantive';
  return null;
}

function verifyPage(page, context) {
  const issues = [];
  for (const heading of context.amendment?.requiredHeadings || []) if (!page.headings.some(h => h.text === heading)) issues.push(`Missing independently authored amendment heading: ${heading}`);
  for (const heading of context.amendment?.removedHeadings || []) if (page.headings.some(h => h.text === heading)) issues.push(`Retired duplicate/editorial heading remains: ${heading}`);
  for (const question of context.amendment?.removedFaqs || []) if (page.faq.some(q => q.question === question)) issues.push(`Retired duplicate FAQ remains: ${question}`);
  const expectedCanonical = context.origin + page.route;
  if (!page.title || !normal(page.title)) issues.push('Missing title');
  if (page.canonical !== expectedCanonical) issues.push(`Self-canonical mismatch: ${page.canonical || '(missing)'}`);
  if (/\bnoindex\b/i.test(page.robots || '') || !/\bindex\b/i.test(page.robots || '')) issues.push(`Robots not indexable: ${page.robots || '(missing)'}`);
  const h1 = page.headings.filter(h => h.level === 1);
  if (h1.length !== 1) issues.push(`H1 count ${h1.length}`);
  let level = 0;
  for (const heading of page.headings) {
    if (heading.level > level + 1) issues.push(`Skipped heading level before ${heading.text}`);
    level = heading.level;
  }
  if (context.expectation?.primaryTopic && h1[0]?.text !== context.expectation.primaryTopic) issues.push(`H1 topic differs from reviewed expectation: ${h1[0]?.text || '(missing)'}`);
  if (context.expectation?.primaryTopic && !normal(page.title).includes(context.expectation.primaryTopic)) issues.push('Title omits reviewed primary topic');
  for (const topic of context.expectation?.headingTopics || []) {
    const heading = page.headings.find(h => h.text === topic.heading);
    if (!heading) { issues.push(`Missing reviewed heading: ${topic.heading}`); continue; }
    if (topic.functionalIntentException) continue;
    const body = normal(heading.body).toLowerCase();
    const missing = (topic.bodyTerms || []).filter(term => !body.includes(term.toLowerCase()));
    if (body.length < 100 || missing.length) issues.push(`No substantive answer under ${topic.heading}${missing.length ? `; missing ${missing.join(', ')}` : ''}`);
  }
  const visibleFaq = new Map(page.faq.map(item => [normal(item.question), normal(item.answer)]));
  const schemaFaq = new Map(page.schemaFaq.map(item => [normal(item.question), normal(item.answer)]));
  for (const [question, answer] of visibleFaq) {
    const problem = faqAnswerProblem(answer);
    if (problem) issues.push(`FAQ answer ${problem}: ${question}`);
    if (!schemaFaq.has(question) || schemaFaq.get(question) !== answer) issues.push(`FAQ schema answer mismatch: ${question}`);
  }
  for (const question of schemaFaq.keys()) if (!visibleFaq.has(question)) issues.push(`FAQ schema not visible: ${question}`);
  for (const topic of context.expectation?.questionTopics || []) if (!visibleFaq.has(topic.question)) issues.push(`Missing reviewed FAQ: ${topic.question}`);
  for (const link of page.links) {
    let url;
    try { url = new URL(link.href, context.origin + page.route); } catch { issues.push(`Invalid link: ${link.href}`); continue; }
    if (url.origin !== context.origin) continue;
    if (/^(click here|here|read more|learn more|more)$/i.test(normal(link.text))) issues.push(`Weak anchor text: ${link.text} -> ${link.href}`);
    if (!context.routes.has(url.pathname) && !context.assets.has(url.pathname)) issues.push(`Broken same-origin link: ${link.href}`);
    else if (url.hash && !context.anchors.get(url.pathname)?.has(decodeURIComponent(url.hash.slice(1)))) issues.push(`Missing fragment: ${link.href}`);
  }
  for (const image of page.images) {
    if (image.src && !context.assets.has(new URL(image.src, context.origin).pathname)) issues.push(`Missing image: ${image.src}`);
    for (const source of image.srcset || []) if (!context.assets.has(new URL(source, context.origin).pathname)) issues.push(`Missing responsive image: ${source}`);
  }
  for (const source of page.pictureSources || []) if (!context.assets.has(new URL(source, context.origin).pathname)) issues.push(`Missing picture source: ${source}`);
  return issues;
}

function classifyKeywordEvidence(rows, evidence, intentExceptions = new Map()) {
  const counts = { mappedObserved: 0, qualifiedObserved: 0, heldServiceClaim: 0, unverified: 0 };
  const classified = rows.map(row => {
    const observed = evidence.get(row.id) || [];
    const exception = intentExceptions.get(row.id);
    let status = 'unverified';
    if (row.disposition === 'hold_service_claim_pending_verified_scope') status = 'heldServiceClaim';
    else if (!exception && observed.length && row.disposition === 'qualified_answer_only_no_unsupported_promise') status = 'qualifiedObserved';
    else if (!exception && observed.length && row.disposition === 'map_to_existing_content') status = 'mappedObserved';
    counts[status]++;
    return { id: row.id, text: row.keyword || row.text, type: row.type, disposition: row.disposition, proposedOwnerRoute: row.proposedOwnerRoute, status, observed: exception ? [] : observed, relatedEvidence: exception ? observed : undefined, reason: status === 'heldServiceClaim' ? 'Service claim withheld pending verified scope; educational mentions do not authorize a service promise.' : exception || (status === 'unverified' ? 'Not individually source-linked and verified in this pass; natural synonyms or other page copy may still answer the intent.' : undefined) };
  });
  return { counts, rows: classified };
}

async function extractPage(page, file, route) {
  if (file) await page.goto(pathToFileURL(file).href, { waitUntil: 'domcontentloaded' });
  return page.evaluate(route => {
    const clean = value => (value || '').replace(/\s+/g, ' ').trim();
    const main = document.querySelector('main');
    const headingNodes = [...(main || document).querySelectorAll('h1,h2,h3,h4,h5,h6')];
    const headingSelector = 'h1,h2,h3,h4,h5,h6';
    const headings = headingNodes.map(el => {
      let body = '';
      for (let node = el; node && node !== main; node = node.parentElement) {
        const blocks = [];
        const collect = sibling => {
          if (sibling.matches(headingSelector) || sibling.tagName === 'SECTION') return false;
          if (sibling.matches('nav,aside,form')) return true;
          if (sibling.matches('p,li,dd,figcaption')) { blocks.push(clean(sibling.textContent)); return true; }
          // Layout wrappers are transparent, but the first nested heading is
          // still a hard ownership boundary. Never borrow its later answer.
          for (const child of sibling.children) if (!collect(child)) return false;
          return true;
        };
        for (let sibling = node.nextElementSibling; sibling; sibling = sibling.nextElementSibling) {
          if (!collect(sibling)) break;
        }
        if (blocks.length) { body = clean(blocks.join(' ')); break; }
        if (node.tagName === 'SECTION') break;
      }
      return { level: Number(el.tagName[1]), text: clean(el.textContent), body };
    });
    const faq = [...document.querySelectorAll('main .faq-list details')].map(el => ({ question: clean(el.querySelector('summary')?.textContent), answer: clean([...el.children].filter(child => el.closest('.decision-hub') ? child.tagName === 'P' : child.tagName !== 'SUMMARY').map(child => child.textContent).join(' ')) })).filter(x => x.question);
    const schemaFaq = [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap(el => {
      try { const data = JSON.parse(el.textContent); return (data['@graph'] || [data]).filter(x => x['@type'] === 'FAQPage').flatMap(x => x.mainEntity || []).map(x => ({ question: clean(x.name), answer: clean(x.acceptedAnswer?.text) })); } catch { return []; }
    });
    const links = [...document.querySelectorAll('a[href]')].map(el => ({ href: el.getAttribute('href'), text: clean(el.textContent || el.getAttribute('aria-label')) }));
    const sources = value => (value || '').split(',').map(x => x.trim().split(/\s+/)[0]).filter(Boolean);
    const images = [...document.querySelectorAll('img')].map(el => ({ src: el.getAttribute('src'), alt: el.getAttribute('alt'), srcset: sources(el.getAttribute('srcset')) }));
    const pictureSources = [...document.querySelectorAll('picture source[srcset]')].flatMap(el => sources(el.getAttribute('srcset')));
    return { route, title: clean(document.title), canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'), robots: document.querySelector('meta[name="robots"]')?.content, headings, faq, schemaFaq, links, images, pictureSources, ids: [...document.querySelectorAll('[id]')].map(el => el.id), mainText: clean(main?.textContent) };
  }, route);
}

function recordEvidence(pages, contract) {
  const evidence = new Map();
  const add = (ids, page, surface, quote) => { for (const id of ids || []) { if (!evidence.has(id)) evidence.set(id, []); evidence.get(id).push({ route: page.route, surface, quote }); } };
  for (const spec of contract.pages) {
    const page = pages.find(p => p.route === spec.route);
    if (!page) continue;
    if (page.headings.some(h => h.level === 1 && h.text === spec.primaryTopic) && page.title.includes(spec.primaryTopic)) add(spec.primarySourceKeywordIds, page, 'title+h1', spec.primaryTopic);
    for (const topic of spec.headingTopics || []) {
      const found = page.headings.find(h => h.text === topic.heading);
      if (found && !topic.functionalIntentException && normal(found.body).length >= 100 && (topic.bodyTerms || []).every(term => found.body.toLowerCase().includes(term.toLowerCase()))) add(topic.sourceKeywordIds, page, 'heading+body', `${topic.heading}: ${normal(found.body).slice(0, 210)}`);
    }
    for (const topic of spec.questionTopics || []) {
      const visible = page.faq.find(q => q.question === topic.question);
      const schema = page.schemaFaq.find(q => q.question === topic.question && q.answer === visible?.answer);
      if (visible && schema && visible.answer.length >= 80) add(topic.sourceKeywordIds, page, 'visible+schema FAQ', `${topic.question} ${visible.answer.slice(0, 180)}`);
    }
  }
  return evidence;
}

async function run() {
  const output = path.join(root, 'public');
  const baseline = readJson(path.join(baselineDir, 'protected-baseline.json'));
  const mapping = readJson(path.join(baselineDir, 'keyword-page-mapping.json'));
  const acceptance = readJson(path.join(root, 'src/content-pack/decision-qa-acceptance.json'));
  const guideAcceptance = readJson(path.join(root, 'src/content-pack/guide-editorial-acceptance.json'));
  const contract = readJson(path.join(root, 'src/content-pack/keyword-content-contract.json'));
  const reviewed = readJson(path.join(root, 'src/content-pack/keyword-content-expectations.json'));
  const semanticData = readJson(path.join(root, 'src/content-pack/semantic-keyword-review.json'));
  const sitemap = fs.readFileSync(path.join(output, 'sitemap.xml'), 'utf8');
  const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname);
  const globalIssues = [];
  if (routes.length !== 102 || new Set(routes).size !== 102 || JSON.stringify([...routes].sort()) !== JSON.stringify([...baseline.routes].sort())) globalIssues.push('Sitemap route set differs from protected 102-route baseline');
  if (JSON.stringify([...contract.pages.map(x => x.route)].sort()) !== JSON.stringify([...routes].sort())) globalIssues.push('Content contract route set differs from sitemap');
  if (Object.keys(reviewed.pages).length !== 84 || new Set([...Object.keys(reviewed.pages), ...contract.pages.map(p => p.route)]).size !== 102) globalIssues.push('Reviewed 84-page expectations or 102-page contract route coverage changed');
  const desktopAcceptance = readJson(path.join(root, 'src/content-pack/desktop-layout-acceptance.json'));
  globalIssues.push(...verifyProtectedLayoutCss(baseline, path.join(root, 'src/assets/css/site.css'), acceptance, guideAcceptance, desktopAcceptance));
  globalIssues.push(...verifyProtectedLayoutCss(baseline, path.join(output, 'assets/css/site.css'), acceptance, guideAcceptance, desktopAcceptance));
  const imageRoot = path.join(root, 'src/assets/images');
  let imageChecked = 0;
  let publishedImageChecked = 0;
  for (const [name, originalHash] of Object.entries(baseline.imageHashes)) {
    const file = path.join(imageRoot, name);
    const publishedFile = path.join(output, 'assets/images', name);
    if (!fs.existsSync(file) || hash(file) !== originalHash) globalIssues.push(`Protected source image changed: ${name}`);
    else imageChecked++;
    if (fs.existsSync(publishedFile)) {
      if (hash(publishedFile) !== originalHash) globalIssues.push(`Generated image bytes changed: ${name}`);
      else publishedImageChecked++;
    } else if (name !== 'responsive-manifest.json' && !name.startsWith('intake\\')) globalIssues.push(`Protected image missing from generated site: ${name}`);
  }
  const currentFacts = readJson(path.join(root, 'src/content-pack/business-facts.json'));
  if (JSON.stringify(currentFacts) !== JSON.stringify(baseline.businessFacts)) globalIssues.push('Protected business facts changed');
  const caseFeed = readJson(path.join(output, 'case-studies/feed.json'));
  const areaFeed = readJson(path.join(output, 'service-areas/feed.json'));
  const caseFacts = feed => feed.items.map(({ id, url, datePublished, suburb, serviceUrl, problem, result, stage, images }) => ({ id, url, datePublished, suburb, serviceUrl, problem, result, stage, images }));
  if (JSON.stringify(caseFacts(baseline.caseFeed)) !== JSON.stringify(caseFacts(caseFeed))) globalIssues.push('Protected case feed facts changed');
  const areaFacts = feed => feed.regions.map(region => ({ slug: region.slug, name: region.name, url: region.url, suburbs: region.suburbs.map(({ slug, name, primaryService, url, relatedServiceUrls, preparation }) => ({ slug, name, primaryService, url, relatedServiceUrls, preparation })) }));
  if (JSON.stringify(areaFacts(baseline.areaFeed)) !== JSON.stringify(areaFacts(areaFeed))) globalIssues.push('Protected area feed identity, coverage or preparation changed');
  const { chromium } = require(process.env.SEO_PLAYWRIGHT_MODULE || 'C:/Users/UFTR/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
  const browser = await chromium.launch({ executablePath: process.env.SEO_CHROME_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const context = await browser.newContext();
  const blocked = [];
  await context.route('**/*', route => { const url = route.request().url(); if (url.startsWith('file:')) return route.continue(); blocked.push(url); return route.fulfill({ status: 200, body: '' }); });
  const tab = await context.newPage();
  const pages = [];
  try {
    for (const route of routes) {
      const file = path.join(output, route.slice(1), 'index.html');
      if (!fs.existsSync(file)) { globalIssues.push(`Missing HTML: ${route}`); continue; }
      pages.push(await extractPage(tab, file, route));
    }
  } finally { await browser.close(); }
  const assets = new Set();
  const walk = dir => { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) { const file = path.join(dir, entry.name); if (entry.isDirectory()) walk(file); else assets.add('/' + path.relative(output, file).replaceAll('\\', '/')); } };
  walk(output);
  const anchors = new Map(pages.map(p => [p.route, new Set(p.ids)]));
  const titles = new Map();
  for (const page of pages) { if (!titles.has(page.title)) titles.set(page.title, []); titles.get(page.title).push(page.route); }
  for (const [title, owners] of titles) if (owners.length > 1) globalIssues.push(`Duplicate title ${title}: ${owners.join(', ')}`);
  globalIssues.push(...findUnresolvedFeedTargets(caseFeed, areaFeed, new Set(routes), assets, site));
  const rows = pages.map(page => {
    const original = mapping.pages.find(p => p.route === page.route);
    const spec = contract.pages.find(p => p.route === page.route);
    const expectation = reviewed.pages[page.route] || spec;
    const issues = verifyPage(page, { origin: site, routes: new Set(routes), assets, anchors, expectation, amendment: reviewed.auditAmendments?.[page.route] });
    return { route: page.route, before: original ? { title: original.currentTitle, h1: original.currentH1, headingTexts: original.currentHeadings, headingLevelsAvailable: false } : null,
      after: { title: page.title, h1: page.headings.find(h => h.level === 1)?.text, h2: page.headings.filter(h => h.level === 2).map(h => h.text) },
      sourceKeywordIds: spec?.sourceKeywordIds || [], proposedSourceKeywordIds: spec?.proposedSourceKeywordIds || [],
      headingEvidence: page.headings.filter(h => h.level === 2).map(h => ({ heading: h.text, bodyExcerpt: h.body.slice(0, 240), bodyLength: h.body.length })),
      faqEvidence: page.faq, linkCount: page.links.length, imageCount: page.images.length,
      unchangedReason: original && original.currentH1 === page.headings.find(h => h.level === 1)?.text ? 'Original H1 retained where suitable; exact prior text is from research baseline.' : undefined,
      issues };
  });
  const observedEvidence = recordEvidence(pages, contract);
  const historicalStatus = new Map(Object.entries(semanticData.priorCohorts).flatMap(([status, ids]) => ids.map(id => [id, status])));
  const priorRows = mapping.keywordRows.map(row => ({ ...row, text: row.keyword || row.text, status: historicalStatus.get(row.id), observed: historicalStatus.get(row.id) === 'unverified' ? [] : observedEvidence.get(row.id) || [] }));
  for (const row of priorRows.filter(row => ['mappedObserved', 'qualifiedObserved'].includes(row.status))) if (!row.observed.length) globalIssues.push(`Previously observed intent lost current contract evidence: ${row.id}`);
  const semanticResult = verifySemanticReview({ rows: semanticData.rows, sourceRows: contract.keywordSources, priorRows, pages, baseline: readJson(path.join(root, 'tests/fixtures/local-audit-immutable-baseline.json')) });
  globalIssues.push(...semanticResult.issues);
  exportSemanticReview(semanticResult, reportDir);
  const keywordEvidence = { rows: semanticResult.rollup.map(row => ({ ...row, status: row.finalDisposition, observed: row.evidence || row.observed || [], reason: row.rationale || row.reason })), counts: { mappedObserved: semanticResult.priorCohorts.observed - semanticData.priorCohorts.qualifiedObserved.length, qualifiedObserved: semanticData.priorCohorts.qualifiedObserved.length, heldServiceClaim: semanticResult.priorCohorts.held, ...semanticResult.counts, unverified: 0 } };
  const keywordById = new Map(keywordEvidence.rows.map(item => [item.id, item]));
  for (const row of rows) row.keywordReview = [...new Set([...row.sourceKeywordIds, ...row.proposedSourceKeywordIds])].map(id => ({ id, status: keywordById.get(id)?.status || 'not-in-source-map', reason: keywordById.get(id)?.reason }));
  const result = { generatedAt: new Date().toISOString(), scope: 'Local candidate only; no remote requests or enquiries sent', routeCount: routes.length, sourceImageHashesChecked: imageChecked, publishedImageHashesChecked: publishedImageChecked, blockedRemoteRequests: blocked.length,
    cssAcceptance: { protectedPrefixHash: baseline.layoutCssHash, intentionalScope: 'Separately protected .decision-hub, .guide-page / .guide-directory and .desktop-layout blocks', scopedCssHash: acceptance.scopedCssHash, guideScopedCssHash: guideAcceptance.scopedCssHash, desktopScopedCssHash: desktopAcceptance.scopedCssHash, allowedTemplates: desktopAcceptance.allowedTemplates }, plannedDispositionCounts: mapping.dispositions, observedKeywordCounts: keywordEvidence.counts, globalIssues, pageIssueCount: rows.reduce((n, p) => n + p.issues.length, 0), pages: rows, keywords: keywordEvidence.rows,
    interpretation: 'All 319 formerly unverified IDs now have individually authored final outcomes checked against current rendered answers or precise pending facts. The previous 135 observed and 94 held outcomes remain separately traced. Educational outcomes do not authorise a service; 440/14/94 are historical planning dispositions, not completion totals.' };
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(path.join(reportDir, 'task-4-verification.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ routes: result.routeCount, sourceImages: imageChecked, publishedImages: publishedImageChecked, globalIssues: globalIssues.length, pageIssues: result.pageIssueCount, observed: keywordEvidence.counts, report: path.join(reportDir, 'task-4-verification.json') }, null, 2));
  if (globalIssues.length || result.pageIssueCount) process.exitCode = 1;
}

function findUnresolvedFeedTargets(caseFeed, areaFeed, routes, assets, origin) {
  const urls = [caseFeed.homePageUrl, caseFeed.feedUrl, ...caseFeed.items.flatMap(item => [item.id, item.url, item.serviceUrl, ...item.images]), ...areaFeed.regions.flatMap(region => [region.url, ...region.suburbs.flatMap(suburb => [suburb.url, ...(suburb.relatedServiceUrls || [])])])];
  return [...new Set(urls.filter(Boolean))].flatMap(url => {
    let parsed;
    try { parsed = new URL(url); } catch { return [`Feed target invalid: ${url}`]; }
    return parsed.origin === origin && !routes.has(parsed.pathname) && !assets.has(parsed.pathname) ? [`Feed target unresolved: ${url}`] : [];
  });
}
module.exports = { verifyPage, classifyKeywordEvidence, recordEvidence, extractPage, findUnresolvedFeedTargets, verifyProtectedLayoutCss };
if (require.main === module) run().catch(error => { console.error(error); process.exitCode = 1; });
