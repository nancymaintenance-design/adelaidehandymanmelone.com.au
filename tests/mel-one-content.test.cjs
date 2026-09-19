const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const buildFixture = require('./build-fixture.cjs');

const root = path.resolve(__dirname, '..');
const contentPath = path.join(root, 'src', 'content-pack', 'mel-one-site-content.json');

function loadContent() {
  assert.equal(
    fs.existsSync(contentPath),
    true,
    'the MEL ONE content contract must exist',
  );
  return JSON.parse(fs.readFileSync(contentPath, 'utf8'));
}

function publicRecords(content) {
  return [
    content.site,
    ...content.services,
    ...content.news,
    ...content.guides,
    ...content.faqs,
  ].filter((record) => record.status === 'approved');
}

function routeFor(collection, record) {
  const segment = collection === 'services' ? 'services' : collection;
  return `/${segment}/${record.slug}/`;
}

test('content contract publishes only the confirmed MEL ONE identity and contacts', () => {
  const content = loadContent();

  assert.deepEqual(Object.keys(content).sort(), ['faqs', 'guides', 'news', 'services', 'site']);
  assert.equal(content.site.title, 'MEL ONE');
  assert.deepEqual(content.site.contact, {
    phone: '0416 614 281',
    email: 'admin@melonemaintenance.com.au',
    address: '63 Pirie St Adelaide SA 5000',
  });
});

test('approved records have a complete contract and globally unique slugs', () => {
  const content = loadContent();
  const collections = ['services', 'news', 'guides', 'faqs'];
  const records = [content.site, ...collections.flatMap((key) => content[key])];

  for (const record of records) {
    assert.ok(['approved', 'draft'].includes(record.status), `${record.slug} has an invalid status`);
    assert.match(record.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${record.slug} is not a route-safe slug`);
    assert.equal(typeof record.title, 'string');
    assert.notEqual(record.title.trim(), '');
    assert.equal(typeof record.description, 'string');
    assert.notEqual(record.description.trim(), '');
    assert.ok(Array.isArray(record.scope), `${record.slug} scope must be an array`);
    assert.ok(Array.isArray(record.exclusions), `${record.slug} exclusions must be an array`);
    if (record.status === 'draft') {
      assert.equal(record.noindex, true, `${record.slug} draft records must be noindex`);
    }
  }

  const approvedSlugs = publicRecords(content).map((record) => record.slug);
  assert.equal(new Set(approvedSlugs).size, approvedSlugs.length, 'approved slugs must be unique');
});

test('approved content contains no Review or AggregateRating data or historical claims', () => {
  const content = loadContent();
  const approvedJson = JSON.stringify(publicRecords(content));

  assert.doesNotMatch(approvedJson, /"(?:review|reviews|rating|aggregateRating)"\s*:/i);
  assert.doesNotMatch(
    approvedJson,
    /\b(?:licensed?|insured|founded|established|years? (?:of )?experience|case stud(?:y|ies)|completed projects?|customer reviews?|star rating|award-winning)\b/i,
  );
});

test('nine household categories publish detailed enquiry scopes without excluded trades', () => {
  const content = loadContent();
  const services = content.services.filter(record => record.status === 'approved');
  assert.equal(services.length, 9);
  assert.ok(services.some(record => /home electrical repairs/i.test(record.title)));
  for (const service of services) {
    assert.ok(service.scope.length >= 5, `${service.slug} needs useful job-level choices`);
    assert.ok(service.exclusions.length > 0, `${service.slug} needs a scope boundary`);
  }
  assert.match(content.site.exclusions.join(' '), /scope.*timing.*availability.*each request/i);
  assert.doesNotMatch(JSON.stringify(content), /\b(?:plumbing|plumber|gas|0403|2011|handymanfelix|adelaidecarpentryhub)\b/i);
});

test('service summaries lead with household tasks and keep generic conditions out of cards', () => {
  const content = loadContent();
  const summaries = content.services.map(service => service.description.trim().toLowerCase());
  assert.equal(new Set(summaries).size, summaries.length, 'each category needs a distinctive summary');
  for (const service of content.services) {
    assert.doesNotMatch(service.description, /\b(?:coordination|scope|availability|case by case|specialist assessment)\b/i, `${service.slug} should describe household tasks`);
    assert.doesNotMatch(service.scope.join(' '), /\b(?:specialist assessment|specialist coordination|possible specialist referral)\b/i, `${service.slug} should keep specialist conditions in boundaries`);
  }
  const genericConditions = content.services.flatMap(service => service.exclusions)
    .filter(line => /scope.*availability.*case.by.case/i.test(line));
  assert.ok(genericConditions.length <= 1, 'the shared enquiry condition must not repeat on every service');
  const electrical = content.services.find(service => service.slug === 'home-electrical-repairs');
  assert.match(electrical.exclusions.join(' '), /appropriately qualified external specialist/);
  assert.match(electrical.exclusions.join(' '), /[Cc]oordination options are confirmed for the individual request/);
});

test('About source provides purpose, practical process, grouped requests, boundaries and contacts', () => {
  const { site } = loadContent();
  assert.ok(site.about, 'About needs dedicated source material');
  assert.ok(site.about.title && site.about.description);
  const sections = new Map(site.about.sections.map(section => [section.id, section]));
  for (const id of ['purpose', 'approach', 'multiple-jobs', 'specialist-work', 'contact']) {
    const section = sections.get(id);
    assert.ok(section?.heading && section.paragraphs?.length, `About needs ${id} content`);
    assert.ok(section.paragraphs.join(' ').split(/\s+/).length >= 30, `${id} needs useful reading content`);
  }
  assert.match(sections.get('purpose').paragraphs.join(' '), /Adelaide.*household|household.*Adelaide/i);
  assert.match(sections.get('approach').paragraphs.join(' '), /photos/i);
  assert.match(sections.get('multiple-jobs').paragraphs.join(' '), /room|outdoor area/i);
  assert.match(sections.get('specialist-work').paragraphs.join(' '), /case by case/i);
  assert.match(sections.get('specialist-work').paragraphs.join(' '), /appropriately qualified external specialist/i);
  for (const value of Object.values(site.contact)) {
    assert.ok(sections.get('contact').paragraphs.join(' ').includes(value), `About must include ${value}`);
  }
});

test('service and About source avoid unverified commercial and company-history claims', () => {
  const content = loadContent();
  const text = JSON.stringify([content.site, ...content.services]);
  assert.doesNotMatch(text, /\b(?:licensed?|insured|founded|established|years? (?:of )?experience|award-winning|five.star|5.star|customer reviews?|customer testimonials?|satisfaction guaranteed|guaranteed results?|our (?:team|staff|technicians)|completed projects?)\b/i);
  assert.doesNotMatch(text, /\$\s*\d|\b\d+\s*(?:years|customers|projects|staff)\b/i);
});

test('editorial records offer substantive company-context reading and valid service links', () => {
  const content = loadContent();
  assert.equal(content.news.filter(record => record.status === 'approved').length, 2);
  assert.equal(content.guides.filter(record => record.status === 'approved').length, 10);
  const fieldNoteSlugs = [
    'field-notes-doors-windows-screens-enquiry',
    'field-notes-wall-interior-repairs-job-list',
    'field-notes-roof-gutter-exterior-observations',
    'field-notes-garden-outdoor-seasonal-preparation',
    'field-notes-rental-end-of-lease-maintenance-list',
    'field-notes-pre-sale-home-maintenance-list',
    'field-notes-grouping-multiple-household-jobs',
    'field-notes-cleaning-removals-preparation',
  ];
  for (const slug of fieldNoteSlugs) {
    const note = content.guides.find(record => record.slug === slug && record.status === 'approved');
    assert.ok(note, `${slug} needs an approved Field Note`);
    assert.equal(note.date, '2026-09-18');
    assert.equal(note.sections.length, 3, `${slug} needs three useful sections`);
    assert.ok(note.scope.length >= 3, `${slug} needs a practical preparation checklist`);
    assert.ok(note.relatedServices.length >= 1, `${slug} needs an internal service connection`);
  }
  for (const collection of ['news', 'guides']) {
    for (const article of content[collection]) {
      assert.ok(article.sections.length >= 3);
      assert.match(JSON.stringify(article), /MEL ONE/);
      assert.ok(article.sections.every(section => section.heading && section.paragraphs?.length));
      assert.ok(article.relatedServices.every(slug => content.services.some(service => service.slug === slug && service.status === 'approved')));
    }
  }
});

test('generated sitemap includes approved and excludes draft service, news and guide routes', () => {
  const content = loadContent();
  const fixture = buildFixture(test, { SITE_ORIGIN: 'https://example.test' });
  const sitemap = fixture.read('sitemap.xml');
  const routableCollections = ['services', 'news', 'guides'];
  const draftRoutes = routableCollections.flatMap((collection) => content[collection]
    .filter((record) => record.status === 'draft')
    .map((record) => routeFor(collection, record)));

  for (const route of draftRoutes) {
    assert.doesNotMatch(sitemap, new RegExp(`<loc>https://example\\.test${route}</loc>`));
  }
  for (const collection of routableCollections) {
    for (const record of content[collection].filter(record => record.status === 'approved')) {
      assert.ok(sitemap.includes(`<loc>https://example.test${routeFor(collection, record)}</loc>`));
    }
  }
});
