const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const buildFixture = require('./build-fixture.cjs');

const areasPath = path.join(__dirname, '../src/content-pack/service-areas.json');
const areas = JSON.parse(fs.readFileSync(areasPath, 'utf8'));

test('approved service-area data covers the eight Greater Adelaide regions only', () => {
  assert.deepEqual(areas.map(area => area.slug), [
    'cbd-north-adelaide', 'eastern-suburbs', 'inner-south', 'inner-west',
    'western-suburbs', 'north-north-east', 'adelaide-hills-foothills', 'southern-suburbs',
  ]);
  const visible = JSON.stringify(areas);
  assert.doesNotMatch(visible, /\b(?:Aranda|Canberra)\b/i);
  assert.ok(areas.every(area => area.name && area.description && area.context && area.suburbs.length));
});

test('every approved suburb has complete unique, customer-visible content', () => {
  const suburbs = areas.flatMap(area => area.suburbs);
  assert.equal(new Set(suburbs.map(suburb => suburb.slug)).size, suburbs.length);
  for (const suburb of suburbs) {
    assert.ok(suburb.primaryService && suburb.title && suburb.description && suburb.lead && suburb.localContext, suburb.slug);
    assert.equal(suburb.services.length, 6, `${suburb.slug} has six service modules`);
    assert.ok(suburb.faqs.length >= 3 && suburb.faqs.length <= 5, `${suburb.slug} has visible FAQs`);
    assert.ok(suburb.faqs.every(faq => faq.question && faq.answer), `${suburb.slug} FAQs are complete`);
  }
});

test('the build rejects an out-of-scope or duplicate service-area record', () => {
  const fixture = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'mel-one-areas-'));
  try {
    fs.copyFileSync(path.join(__dirname, '../build.mjs'), path.join(fixture, 'build.mjs'));
    fs.cpSync(path.join(__dirname, '../src'), path.join(fixture, 'src'), { recursive: true });
    const fixturePath = path.join(fixture, 'src/content-pack/service-areas.json');
    const invalid = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
    invalid[0].suburbs.push({ ...invalid[0].suburbs[0], name: 'Aranda', slug: invalid[0].suburbs[0].slug });
    fs.writeFileSync(fixturePath, JSON.stringify(invalid));
    assert.throws(() => execFileSync(process.execPath, ['build.mjs'], { cwd: fixture, stdio: 'pipe' }), /duplicate|Aranda|Canberra/i);
  } finally { fs.rmSync(fixture, { recursive: true, force: true }); }
});

test('the build publishes linked Greater Adelaide region and suburb pages', t => {
  const preview = buildFixture(t);
  const index = preview.read('service-areas/index.html');
  assert.match(index, /Adelaide CBD &amp; North Adelaide/);
  assert.match(index, /href="\/service-areas\/eastern-suburbs\/"/);
  const region = preview.read('service-areas/eastern-suburbs/index.html');
  assert.match(region, /href="\/service-areas\/eastern-suburbs\/norwood\/"/);
  const suburb = preview.read('service-areas/eastern-suburbs/norwood/index.html');
  assert.match(suburb, /<h1>Shower Screen Repairs in Norwood, Adelaide<\/h1>/);
  assert.match(suburb, /Shower screen repairs and adjustments/);
  assert.match(suburb, /href="\/contact\/\?region=eastern-suburbs&amp;suburb=norwood"/);
  const graph = JSON.parse(suburb.match(/application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  assert.ok(graph.some(item => item['@type'] === 'Service'));
  assert.ok(graph.some(item => item['@type'] === 'FAQPage'));
  const feed = JSON.parse(preview.read('service-areas/feed.json'));
  assert.equal(feed.regions.length, 8);
  assert.equal(feed.regions.find(area => area.slug === 'eastern-suburbs').suburbs[0].url, 'https://www.adelaidehandymanmelone.com.au/service-areas/eastern-suburbs/norwood/');
});
