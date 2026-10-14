const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const buildFixture = require('./build-fixture.cjs');
const root = path.resolve(__dirname, '..');
const text = s => s.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/\s+/g, ' ').trim();
const hs = html => [...html.matchAll(/<h[23][^>]*>([^]*?)<\/h[23]>/g)].map(m => text(m[1]));

test('all 32 suburb decision FAQs are genuine questions, separate from statement headings and matched in schema', t => {
  const { read } = buildFixture(t);
  const expected = JSON.parse(fs.readFileSync(path.join(root, 'src/content-pack/keyword-content-expectations.json')));
  let count = 0;
  for (const region of JSON.parse(read('service-areas/feed.json')).regions) for (const suburb of region.suburbs) {
    const route = new URL(suburb.url).pathname;
    const html = read(`${route.slice(1)}index.html`);
    const first = [...html.matchAll(/<details\b[^>]*>([^]*?)<\/details>/g)][0][1];
    const question = text(first.match(/<summary>([^]*?)<\/summary>/)[1]);
    const answer = text(first.match(/<p>([^]*?)<\/p>/)[1]);
    assert.match(question, /^(?:Can|Why|Will|How|What|Should|When|Does|Are|Is) .+\?$/, suburb.name);
    assert.equal(question, expected.pages[route].questionTopics[0].question, `${suburb.name}: independent question expectation`);
    assert.ok(!hs(html).includes(question), `${suburb.name}: FAQ question must not replace a statement H2`);
    assert.ok(hs(html).includes(expected.pages[route].headingTopics[1].heading), `${suburb.name}: statement H2 preserved`);
    const faq = JSON.parse(html.match(/<script type="application\/ld\+json">([^]*?)<\/script>/)[1])['@graph'].find(s => s['@type'] === 'FAQPage');
    assert.equal(faq.mainEntity[0].name, question);
    assert.equal(faq.mainEntity[0].acceptedAnswer.text, answer);
    count++;
  }
  assert.equal(count, 32);
});

test('West Beach and Glenelg decision bodies name the diagnostic comparison without relying on a question heading', t => {
  const { read } = buildFixture(t);
  const checks = [
    ['west-beach', 'Door Latch Faults and Frame Contact', /whether the latch sticks while the door is open or only when it closes\. That observation/i],
    ['glenelg', 'Patio Door Rollers and Screen Panel Hardware', /Patio glass panels and insect-screen panels are different repair enquiries\. Their weight/i]
  ];
  for (const [slug, heading, comparison] of checks) {
    const html = read(`service-areas/western-suburbs/${slug}/index.html`);
    const section = html.split(`<h2>${heading}</h2>`)[1].split('</section>')[0];
    assert.match(text(section), comparison, slug);
  }
});

test('regional decision answers explain every promised task and retain answer locks', t => {
  const expected = JSON.parse(fs.readFileSync(path.join(root, 'src/content-pack/keyword-content-expectations.json')));
  const { read } = buildFixture(t);
  const answers = {
    'cbd-north-adelaide': ['building entry', 'repair items'],
    'eastern-suburbs': ['paver', 'hardware', 'separate'],
    'inner-south': ['hinge', 'primer', 'paint'],
    'inner-west': ['boundary', 'access', 'latch'],
    'western-suburbs': ['mesh', 'rollers', 'panel'],
    'north-north-east': ['debris', 'plants', 'assessment'],
    'adelaide-hills-foothills': ['supporting timber', 'access route', 'assembly space'],
    'southern-suburbs': ['compatible', 'furniture', 'instructions', 'missing parts']
  };
  for (const [slug, terms] of Object.entries(answers)) {
    const topic = expected.pages[`/service-areas/${slug}/`].headingTopics[1];
    const html = read(`service-areas/${slug}/index.html`);
    const match = [...html.matchAll(/<h2[^>]*>([^]*?)<\/h2>/g)].find(m => text(m[1]) === topic.heading);
    const body = text(html.slice(match.index + match[0].length).split(/<h[23][ >]/)[0]).toLowerCase();
    for (const term of terms) assert.ok(body.includes(term), `${slug}: decision section explains ${term}`);
    for (const term of terms) assert.ok(topic.bodyTerms?.includes(term), `${slug}: independent lock for ${term}`);
  }
});

test('repeat gutter cleaning uses the existing recurring-upkeep guidance, not debris keyword provenance', () => {
  const expected = JSON.parse(fs.readFileSync(path.join(root, 'src/content-pack/keyword-content-expectations.json')));
  const guide = expected.pages['/guides/field-notes-roof-gutter-exterior-observations/'];
  const source = fs.readFileSync(path.join(root, 'src/content-refinement.mjs'), 'utf8');
  const maintenanceRecord = source.split("'maintenance-planning-inspection-support': {")[1].split("'roof-gutter-exterior-care': {")[0];
  for (const element of [guide.headingTopics[1], guide.questionTopics[0]]) {
    assert.deepEqual(element.sourceKeywordIds, [], 'no research ID claims an unsupported interval meaning');
    const evidence = element.verifiedBusinessEvidence;
    assert.equal(evidence.sourceFile, 'src/content-refinement.mjs');
    assert.equal(evidence.recordKey, 'serviceEdits:maintenance-planning-inspection-support');
    assert.ok(evidence.sourceClues.some(clue => /preferred interval/.test(clue)));
    for (const clue of evidence.sourceClues) assert.ok(maintenanceRecord.includes(clue), `record-scoped recurrence evidence: ${clue}`);
  }
});

test('case comparison FAQs use natural questions and preserve IKEA capitalization', t => {
  const { read } = buildFixture(t);
  const feed = JSON.parse(read('case-studies/feed.json'));
  for (const item of feed.items) {
    const html = read(`${new URL(item.url).pathname.slice(1)}index.html`);
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([^]*?)<\/script>/)[1])['@graph'];
    const question = graph.find(s => s['@type'] === 'FAQPage').mainEntity[0].name;
    assert.doesNotMatch(question, /this .* record\?|recorded fault/i, item.url);
    assert.doesNotMatch(question, /ikea/, item.url);
    assert.ok(question.length <= 100, item.url);
    if (item.url.includes('kensington-furniture-assembly')) assert.match(question, /IKEA KALLAX/);
    if (item.url.includes('kitchen-drawer-runner-repair')) assert.equal(question, 'What details help compare a similar drawer runner repair?');
  }
});

test('all 102 routes have independently authored semantic expectations', t => {
  const expected = JSON.parse(fs.readFileSync(path.join(root, 'src/content-pack/keyword-content-expectations.json')));
  const contract = JSON.parse(fs.readFileSync(path.join(root, 'src/content-pack/keyword-content-contract.json')));
  assert.equal(Object.keys(expected.pages || {}).length, 84);
  assert.equal(contract.pages.filter(p => p.regressionLocked).length, 102);
  const { read } = buildFixture(t);
  const missingBodyTerms = [];
  for (const [route, page] of Object.entries(expected.pages)) {
    const actual = contract.pages.find(p => p.route === route);
    assert.equal(actual.primaryTopic, page.primaryTopic, route);
    assert.deepEqual(actual.headingTopics, page.headingTopics, route);
    assert.deepEqual(actual.questionTopics, page.questionTopics, route);
    const html = read(route === '/' ? 'index.html' : `${route.slice(1)}index.html`);
    const main = html.match(/<main\b[^>]*>([^]*?)<\/main>/)[1];
    assert.equal(text(main.match(/<h1[^>]*>([^]*?)<\/h1>/)[1]), page.primaryTopic, route);
    for (const topic of page.headingTopics) {
      assert.ok(hs(main).includes(topic.heading), `${route}: ${topic.heading}`);
      assert.ok(topic.sourceKeywordIds.length || topic.verifiedBusinessEvidence || topic.functionalIntentException, `${route}: heading provenance`);
      const match = [...main.matchAll(/<h[23][^>]*>([^]*?)<\/h[23]>/g)].find(m => text(m[1]) === topic.heading);
      const body = text(main.slice(match.index + match[0].length).split(/<h[23][ >]/)[0]).toLowerCase();
      for (const term of topic.bodyTerms || []) if (!body.includes(term)) missingBodyTerms.push(`${route}: ${topic.heading} explains ${term}`);
    }
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([^]*?)<\/script>/)[1])['@graph'];
    for (const topic of page.questionTopics) {
      assert.ok(text(main).includes(topic.question), `${route}: visible FAQ`);
      assert.ok(graph.find(s => s['@type'] === 'FAQPage')?.mainEntity.some(q => q.name === topic.question && q.acceptedAnswer.text.length > 70), `${route}: substantive FAQ schema`);
    }
  }
  assert.deepEqual(missingBodyTerms, []);
});

test('remaining-page sources resolve to approved records and reviewed research meanings', () => {
  const expected = JSON.parse(fs.readFileSync(path.join(root, 'src/content-pack/keyword-content-expectations.json')));
  const contract = JSON.parse(fs.readFileSync(path.join(root, 'src/content-pack/keyword-content-contract.json')));
  const sources = new Map(contract.keywordSources.map(s => [s.id, s]));
  for (const [route, page] of Object.entries(expected.pages)) {
    const elements = [{ sourceKeywordIds: page.primarySourceKeywordIds, verifiedBusinessEvidence: page.primaryVerifiedBusinessEvidence, functionalIntentException: page.functionalIntentException }, ...page.headingTopics, ...page.questionTopics];
    for (const element of elements) {
      assert.ok(element.sourceKeywordIds.length || element.verifiedBusinessEvidence || element.functionalIntentException, `${route}: provenance required`);
      for (const id of element.sourceKeywordIds) {
        assert.ok(sources.has(id), `${route}: known source`);
        assert.notEqual(sources.get(id).disposition, 'hold_service_claim_pending_verified_scope', `${route}: no held service claim`);
      }
      const ev = element.verifiedBusinessEvidence;
      if (ev) {
        assert.ok(ev.explanation.length > 60 && ev.recordKey && ev.sourceClues.length, `${route}: specific source evidence`);
        const source = fs.readFileSync(path.join(root, ev.sourceFile), 'utf8').toLowerCase();
        for (const clue of ev.sourceClues) assert.ok(source.includes(clue.toLowerCase()), `${route}: evidence contains ${clue}`);
        assert.ok(!ev.sourceFile.includes('keyword-led') && !ev.sourceFile.includes('public/'), `${route}: evidence predates implementation`);
      }
    }
  }
  const guide = expected.pages['/guides/field-notes-wall-interior-repairs-job-list/'];
  assert.deepEqual(guide.headingTopics[0].sourceKeywordIds, ['ADH-0118', 'ADH-0138']);
  assert.match(sources.get('ADH-0138').text, /patch and paint/i);
  const rental = expected.pages['/guides/field-notes-rental-end-of-lease-maintenance-list/'];
  assert.deepEqual(rental.questionTopics[0].sourceKeywordIds, ['ADH-0421']);
  assert.match(sources.get('ADH-0421').text, /guarantee.*bond/i);
  assert.deepEqual(expected.pages['/privacy/'].primarySourceKeywordIds, []);
});

test('case and local feed evidence agrees with visible HTML and FAQ schema', t => {
  const { read } = buildFixture(t);
  const feed = JSON.parse(read('case-studies/feed.json'));
  assert.equal(feed.items.length, 20);
  for (const item of feed.items) {
    const html = read(`${new URL(item.url).pathname.slice(1)}index.html`);
    const main = text(html.match(/<main\b[^>]*>([^]*?)<\/main>/)[1]);
    for (const value of [item.title, item.problem, item.result]) assert.ok(main.includes(value), item.url);
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([^]*?)<\/script>/)[1])['@graph'];
    const article = graph.find(s => s['@type'] === 'Article');
    assert.equal(article.datePublished, item.datePublished.slice(0, 10));
    assert.equal(article.dateModified, item.dateModified);
    assert.deepEqual(article.image, item.images);
    assert.ok(graph.find(s => s['@type'] === 'FAQPage')?.mainEntity.length);
  }
  assert.equal(feed.items.find(i => i.url.includes('modbury-timber-fence-repair-assessment')).stage, 'assessment');
  for (const region of JSON.parse(read('service-areas/feed.json')).regions) for (const suburb of region.suburbs) {
    const html = read(`${new URL(suburb.url).pathname.slice(1)}index.html`);
    assert.ok(hs(html).includes(suburb.enquiryFocus), suburb.name);
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([^]*?)<\/script>/)[1])['@graph'];
    const faqs = graph.find(s => s['@type'] === 'FAQPage').mainEntity;
    assert.deepEqual(faqs.map(q => ({ question: q.name, answer: q.acceptedAnswer.text })), suburb.faqs);
  }
});

test('editorial answers, local tasks and recorded case stages replace generic helper copy', t => {
  const { read } = buildFixture(t);
  const guide = read('guides/field-notes-wall-interior-repairs-job-list/index.html');
  assert.ok(hs(guide).includes('Wall Patching, Sanding, Priming and Paint Finishing'));
  assert.match(text(guide), /primer/i);
  const region = read('service-areas/eastern-suburbs/index.html');
  assert.match(text(region.match(/<h1[^>]*>([^]*?)<\/h1>/)[1]), /Handyman/);
  assert.ok(!hs(region).includes('Match the task to the assessment'));
  const local = read('service-areas/eastern-suburbs/norwood/index.html');
  assert.ok(hs(local).includes('Torn Flyscreen Mesh, Spline and Frame Corners'));
  assert.ok(!hs(local).includes('Helpful answers'));
  const drawer = read('case-studies/kitchen-drawer-runner-repair/index.html');
  assert.ok(hs(drawer).includes('Sagging Drawer Runners: Recorded Fault'));
  assert.ok(!hs(drawer).includes('The repair sequence'));
  assert.ok(!hs(guide).includes('Have a question?'));
  assert.ok(!hs(read('services/door-repair/index.html')).includes('Tell us the problem'));
  const privacy = read('privacy/index.html');
  assert.match(text(privacy.match(/<h1[^>]*>([^]*?)<\/h1>/)[1]), /MEL ONE Enquiry Privacy/);
});

test('editable service titles remain plain text in both scope and boundary headings', t => {
  const { read } = buildFixture(t, {}, (_content, fixture) => {
    const file = path.join(fixture, 'src/keyword-led-content.mjs');
    const source = fs.readFileSync(file, 'utf8');
    assert.ok(source.includes("title: 'Roof, Gutter & Exterior Maintenance Adelaide'"));
    fs.writeFileSync(file, source.replace("title: 'Roof, Gutter & Exterior Maintenance Adelaide'", "title: 'Roof, Gutter & <em>Exterior</em> Maintenance Adelaide'"));
  });
  const html = read('services/roof-gutter-exterior-care/index.html');
  const labels = [...html.matchAll(/<h2[^>]*>([^]*?)<\/h2>/g)].map(match => match[1]);
  assert.ok(labels.includes('Roof, Gutter &amp; &lt;em&gt;Exterior&lt;/em&gt; Maintenance: Tasks and Materials'), labels.join(' | '));
  assert.ok(labels.includes('Roof, Gutter &amp; &lt;em&gt;Exterior&lt;/em&gt; Maintenance: Specialist Requirements'), labels.join(' | '));
});
