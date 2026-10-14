const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const buildFixture = require('./build-fixture.cjs');
const root = path.resolve(__dirname, '..');
const text = html => html.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/\s+/g, ' ').trim();
const headings = (html, level) => [...html.matchAll(new RegExp(`<h${level}[^>]*>([^]*?)<\\/h${level}>`, 'g'))].map(m => text(m[1]));

test('maintenance output answers repair-list and regular-maintenance intent', t => {
  const { read } = buildFixture(t);
  const html = read('services/maintenance-planning-inspection-support/index.html');
  assert.match(text(html.match(/<title>([^]*?)<\/title>/)[1]), /Home & Property Maintenance Adelaide/);
  assert.deepEqual(headings(html, 1), ['Home & Property Maintenance Adelaide']);
  for (const heading of ['Property Repair Checklist for Small Home Repairs', 'Preventative Home Maintenance for Local Homes', 'Regular Home Maintenance: One-Off and Recurring Jobs', 'Rental Property Maintenance and Repair Access', 'Home Maintenance Quotes: Labour, Materials and Access']) assert.ok(headings(html, 2).includes(heading), heading);
  for (const heading of ['Turn observations into an assessable work list', 'Priorities, permissions and access', 'Separate routine maintenance from formal assessment', 'A written scope and clear handover']) assert.ok(!headings(html, 2).includes(heading), heading);
  for (const question of ['What is included in a general property maintenance visit?', 'Can I book regular home maintenance in Adelaide?', 'How is preventative maintenance different from emergency repair?']) assert.ok(text(html).includes(question), question);
  for (const term of ['drawer', 'hinge', 'flyscreen', 'interstate']) assert.ok(text(html).toLowerCase().includes(term), term);
  for (const slug of ['kitchen-drawer-runner-repair', 'north-adelaide-door-repair', 'norwood-flyscreen-repair']) assert.ok(html.includes(`/case-studies/${slug}/`), slug);
});

test('102-route inventory locks reviewed service, editorial, local and functional intent', t => {
  const contractPath = path.join(root, 'src/content-pack/keyword-content-contract.json');
  assert.ok(fs.existsSync(contractPath), 'the reviewed content contract must exist');
  const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  const { read } = buildFixture(t);
  const sitemapRoutes = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1]).pathname).sort();
  assert.equal(contract.pages.length, 102);
  assert.deepEqual(contract.pages.map(p => p.route).sort(), sitemapRoutes);
  const ids = new Set(contract.keywordSources.map(k => k.id));
  assert.equal(ids.size, 548);
  assert.deepEqual(Object.fromEntries(['核心词', '蒸馏词', '场景使用词', '问题科普词', '意向提问词'].map(type => [type, contract.keywordSources.filter(k => k.type === type).length])), { '核心词': 156, '蒸馏词': 97, '场景使用词': 97, '问题科普词': 97, '意向提问词': 101 });
  assert.deepEqual(Object.fromEntries(['map_to_existing_content', 'qualified_answer_only_no_unsupported_promise', 'hold_service_claim_pending_verified_scope'].map(disposition => [disposition, contract.keywordSources.filter(k => k.disposition === disposition).length])), { map_to_existing_content: 440, qualified_answer_only_no_unsupported_promise: 14, hold_service_claim_pending_verified_scope: 94 });
  const sourceById = new Map(contract.keywordSources.map(k => [k.id, k]));
  for (const page of contract.pages) {
    assert.ok(page.primaryTopic && page.evidenceBoundary, page.route);
    assert.ok(page.primarySourceKeywordIds.length || page.primaryVerifiedBusinessEvidence || page.functionalIntentException, page.route);
    assert.ok(page.headingTopics.length >= 2, page.route);
    assert.ok(Array.isArray(page.questionTopics), page.route);
    for (const id of [...page.sourceKeywordIds, ...page.primarySourceKeywordIds, ...page.headingTopics.flatMap(h => h.sourceKeywordIds), ...page.questionTopics.flatMap(q => q.sourceKeywordIds)]) assert.ok(ids.has(id), `${page.route}: ${id}`);
    for (const id of page.sourceKeywordIds) assert.notEqual(sourceById.get(id).disposition, 'hold_service_claim_pending_verified_scope', `${page.route}: held reviewed claim ${id}`);
    for (const id of page.proposedSourceKeywordIds) {
      assert.equal(sourceById.get(id).proposedOwnerRoute, page.route, `${page.route}: source assignment ${id}`);
      assert.notEqual(sourceById.get(id).disposition, 'hold_service_claim_pending_verified_scope', `${page.route}: held service claim ${id}`);
    }
    assert.deepEqual(page.sourceKeywordIds, [...new Set([...page.primarySourceKeywordIds, ...page.headingTopics.flatMap(h => h.sourceKeywordIds), ...page.questionTopics.flatMap(q => q.sourceKeywordIds)])], `${page.route}: delivered IDs are reviewed element sources`);
    const html = read(page.route === '/' ? 'index.html' : `${page.route.slice(1)}index.html`);
    if (page.regressionLocked) {
      assert.deepEqual(headings(html, 1), [page.primaryTopic], `${page.route}: rendered H1`);
      for (const topic of page.headingTopics) assert.ok([...headings(html, 2), ...headings(html, 3)].includes(topic.heading), `${page.route}: rendered heading ${topic.heading}`);
    }
  }
  const servicePages = contract.pages.filter(p => p.route.startsWith('/services/') && p.route !== '/services/');
  assert.equal(servicePages.length, 18);
  assert.equal(new Set(servicePages.map(p => p.headingTopics.map(h => h.heading).join('|'))).size, 18);
  assert.equal(contract.pages.filter(p => p.enforcement === 'planned').length, 0);
  for (const page of contract.pages) assert.equal(page.regressionLocked, true, `${page.route}: independently locked`);
});

test('all 18 core expectations are independently authored with meaningful provenance', () => {
  const expectedPath = path.join(root, 'src/content-pack/keyword-content-expectations.json');
  assert.ok(fs.existsSync(expectedPath), 'reviewed expectations must be committed separately from generated inventory');
  const expected = JSON.parse(fs.readFileSync(expectedPath, 'utf8'));
  const contract = JSON.parse(fs.readFileSync(path.join(root, 'src/content-pack/keyword-content-contract.json'), 'utf8'));
  const core = contract.pages.filter(p => p.enforcement === 'core');
  assert.equal(Object.keys(expected.services).length, 18);
  assert.deepEqual(core.map(p => p.route).sort(), Object.keys(expected.services).map(slug => `/services/${slug}/`).sort());
  const sources = new Map(contract.keywordSources.map(row => [row.id, row]));
  const business = JSON.parse(fs.readFileSync(path.join(root, 'src/content-pack/mel-one-site-content.json'), 'utf8'));
  for (const page of core) {
    const reviewed = expected.services[page.route.split('/')[2]];
    assert.equal(page.regressionLocked, true, page.route);
    assert.equal(page.primaryTopic, reviewed.primaryTopic, page.route);
    assert.deepEqual(page.primarySourceKeywordIds, reviewed.primarySourceKeywordIds, page.route);
    assert.deepEqual(page.primaryVerifiedBusinessEvidence || null, reviewed.primaryVerifiedBusinessEvidence || null, page.route);
    assert.deepEqual(page.headingTopics, reviewed.headingTopics, page.route);
    assert.deepEqual(page.questionTopics, reviewed.questionTopics, page.route);
    const elements = [
      { ids: page.primarySourceKeywordIds, fallback: page.primaryVerifiedBusinessEvidence },
      ...page.headingTopics.map(h => ({ ids: h.sourceKeywordIds, fallback: h.verifiedBusinessEvidence })),
      ...page.questionTopics.map(q => ({ ids: q.sourceKeywordIds, fallback: q.verifiedBusinessEvidence })),
    ];
    for (const element of elements) {
      assert.ok(element.ids.length || element.fallback, `${page.route}: every core element has provenance`);
      for (const id of element.ids) assert.notEqual(sources.get(id)?.disposition, 'hold_service_claim_pending_verified_scope', `${page.route}: ${id} held`);
      if (element.fallback) {
        const evidence = element.fallback;
        assert.ok(evidence.explanation.length > 35, `${page.route}: explicit evidence explanation`);
        const service = business.services.find(item => item.slug === evidence.serviceSlug);
        assert.equal(service?.status, 'approved', `${page.route}: verified existing service`);
        for (const field of evidence.sourceFields) assert.ok(service[field], `${page.route}: ${field} evidence field`);
        const citedCopy = evidence.sourceFields.map(field => JSON.stringify(service[field])).join(' ').toLowerCase();
        assert.ok(evidence.sourceClues?.length, `${page.route}: factual source clues`);
        for (const clue of evidence.sourceClues) assert.ok(citedCopy.includes(clue.toLowerCase()), `${page.route}: source contains ${clue}`);
        if (evidence.faqSlug) {
          const faq = business.faqs.find(item => item.slug === evidence.faqSlug);
          assert.ok(faq, `${page.route}: existing FAQ evidence`);
          assert.ok(evidence.faqClue && JSON.stringify(faq).toLowerCase().includes(evidence.faqClue.toLowerCase()), `${page.route}: existing FAQ states ${evidence.faqClue}`);
        }
      }
    }
  }
  const interior = core.find(p => p.route === '/services/interior-repairs-assembly/');
  assert.deepEqual(interior.primarySourceKeywordIds, ['ADH-0158', 'ADH-0147']);
  assert.equal(sources.get('ADH-0158').text, 'flat pack assembly Adelaide');
  assert.equal(sources.get('ADH-0147').text, 'skirting board repairs Adelaide');
  const presale = core.find(p => p.route === '/services/home-repairs-renovation-support/');
  assert.deepEqual(presale.headingTopics[1].sourceKeywordIds, ['ADH-0138', 'ADH-0147']);
  assert.deepEqual(presale.questionTopics[0].sourceKeywordIds, ['ADH-0432']);
  assert.match(sources.get('ADH-0138').text, /patch and paint/i);
  assert.match(sources.get('ADH-0432').text, /pre-sale handyman scope/i);
  for (const slug of ['home-electrical-repairs', 'cleaning-removals-specialist-care']) {
    const p = core.find(page => page.route === `/services/${slug}/`);
    assert.equal(p.primarySourceKeywordIds.length, 0);
    assert.ok(p.primaryVerifiedBusinessEvidence);
    assert.ok(p.headingTopics.every(h => h.verifiedBusinessEvidence && !h.sourceKeywordIds.length));
    assert.ok(p.questionTopics.every(q => q.verifiedBusinessEvidence && !q.sourceKeywordIds.length));
  }
});

test('home, service directory and enquiry entry points name real repair intent', t => {
  const { read } = buildFixture(t);
  const home = read('index.html');
  const directory = read('services/index.html');
  const contact = read('contact/index.html');
  const faq = read('faq/index.html');
  assert.deepEqual(headings(home, 1), ['Handyman Services & Home Repairs Adelaide']);
  for (const heading of ['Handyman Services and Small Home Repairs', 'Handyman Quotes, Repair Lists and Booking', 'Local Handyman Repair Case Studies', 'Handyman Service Areas Across Greater Adelaide', 'Small Jobs Handyman: Combine Your Home Repair List']) assert.ok(headings(home, 2).includes(heading), heading);
  assert.deepEqual(headings(directory, 1), ['Handyman Services & Property Maintenance Adelaide']);
  assert.ok(directory.includes('/services/cabinet-drawer-repair/'));
  assert.ok(directory.includes('/services/maintenance-planning-inspection-support/'));
  assert.deepEqual(headings(contact, 1), ['Adelaide Handyman Assessment & Repair Quotes']);
  assert.deepEqual(headings(faq, 1), ['Adelaide Handyman Costs, Bookings & Repair Questions']);
  for (const html of [home, contact, faq]) {
    for (const phrase of ['minimum call-out', 'weekend', 'several']) assert.ok(text(html).toLowerCase().includes(phrase), phrase);
  }
  for (const html of [contact, faq]) assert.match(text(html), /family member|parent/i);
});

test('all core service output follows its topic, explanatory copy and FAQ contract', t => {
  const contractPath = path.join(root, 'src/content-pack/keyword-content-contract.json');
  assert.ok(fs.existsSync(contractPath), 'the reviewed content contract must exist');
  const { pages } = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  const { read } = buildFixture(t);
  for (const page of pages.filter(p => p.enforcement === 'core')) {
    const html = read(page.route === '/' ? 'index.html' : `${page.route.slice(1)}index.html`);
    const main = html.match(/<main\b[^>]*>([^]*?)<\/main>/)?.[1];
    assert.ok(main, `${page.route}: visible main body`);
    assert.equal(headings(html, 1).length, 1, page.route);
    assert.equal(headings(html, 1)[0], page.primaryTopic, page.route);
    assert.ok(text(html.match(/<title>([^]*?)<\/title>/)[1]).includes(page.primaryTopic), page.route);
    const hs = [...headings(html, 2), ...headings(html, 3)];
    for (const topic of page.headingTopics.filter(h => h.required !== false)) {
      assert.ok(hs.includes(topic.heading), `${page.route}: ${topic.heading}`);
      const headingEnd = html.indexOf('</h2>', html.indexOf(topic.heading.replaceAll('&', '&amp;')));
      if (topic.bodyTerms?.length) {
        const copy = text(html.slice(headingEnd + 5).split(/<h[23][ >]/)[0]).toLowerCase();
        assert.ok(copy.length > 150, `${page.route}: substantive body for ${topic.heading}`);
        for (const term of topic.bodyTerms) assert.ok(copy.includes(term), `${page.route}: ${topic.heading} explains ${term}`);
      }
    }
    const faq = JSON.parse(html.match(/<script type="application\/ld\+json">([^]*?)<\/script>/)[1])['@graph'].find(s => s['@type'] === 'FAQPage');
    for (const topic of page.questionTopics.filter(q => q.required !== false)) {
      assert.ok(text(main).includes(topic.question), `${page.route}: visible ${topic.question}`);
      assert.ok(faq?.mainEntity.some(q => q.name === topic.question && q.acceptedAnswer.text.length > 80), `${page.route}: schema ${topic.question}`);
    }
  }
});
