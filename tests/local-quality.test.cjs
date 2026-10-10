const test = require('node:test');
const assert = require('node:assert/strict');
const fixture = require('./build-fixture.cjs')(test);
const main = html => html.match(/<main\b[^>]*>([^]*?)<\/main>/)[1];
const graph = html => JSON.parse(html.match(/<script type="application\/ld\+json">([^]*?)<\/script>/)[1])['@graph'];

test('customers can find standards and confirmed Adelaide identity before making an enquiry', () => {
  for (const route of ['index.html', 'about/index.html', 'contact/index.html']) {
    const html = fixture.read(route);
    assert.match(main(html), /href="\/service-standards\/"/, route);
    assert.match(html, /independent Adelaide team/i);
    assert.match(html, /by appointment/i);
  }
  const html = fixture.read('service-standards/index.html');
  assert.match(main(html), /written quote/i);
  assert.match(main(html), /licence|licensed/i);
  assert.match(main(html), /insurance documents/i);
  assert.match(main(html), /inspection.*commit|assessment.*approval/i);
  assert.match(main(html), /0416 614 281/);
  assert.equal(graph(html).find(x => x['@type'] === 'WebPage').url, 'https://www.adelaidehandymanmelone.com.au/service-standards/');
  assert.equal((fixture.read('sitemap.xml').match(/<loc>/g) || []).length, 96);
  assert.match(fixture.read('llms.txt'), /independent Adelaide team/);
});

test('guide revisions show their original case photo source, publisher and matching metadata only', () => {
  for (const guide of fixture.content.guides.filter(x => x.status === 'approved')) {
    const html = fixture.read(`guides/${guide.slug}/index.html`);
    const article = graph(html).find(x => x['@type'] === 'Article');
    assert.match(main(html), /Published by MEL ONE/);
    assert.match(main(html), /Original case photograph/);
    assert.match(main(html), /Updated <time datetime="2026-10-10"/);
    assert.equal(article.dateModified, '2026-10-10');
    assert.equal(article.image, graph(html).find(x => x['@type'] === 'WebPage').primaryImageOfPage.url);
    assert.ok(main(html).includes(new URL(article.image).pathname));
    assert.ok(fixture.read('sitemap.xml').includes(`<loc>https://www.adelaidehandymanmelone.com.au/guides/${guide.slug}/</loc><lastmod>2026-10-10</lastmod>`));
  }
  for (const news of fixture.content.news.filter(x => x.status === 'approved')) {
    const article = graph(fixture.read(`news/${news.slug}/index.html`)).find(x => x['@type'] === 'Article');
    assert.equal(article.dateModified, undefined);
    assert.equal(article.image, undefined);
    assert.ok(fixture.read('sitemap.xml').includes(`<loc>https://www.adelaidehandymanmelone.com.au/news/${news.slug}/</loc></url>`));
  }
});

test('all 32 suburb pages have distinct useful task background and two or three suitable service links', () => {
  const feed = JSON.parse(fixture.read('service-areas/feed.json'));
  const backgrounds = new Set();
  for (const region of feed.regions) for (const suburb of region.suburbs) {
    const html = fixture.read(`${new URL(suburb.url).pathname.slice(1)}index.html`);
    const background = main(html).match(/<p class="task-background">([^]*?)<\/p>/)?.[1];
    assert.ok(background?.length > 90, suburb.name);
    backgrounds.add(background);
    assert.ok(suburb.relatedServiceUrls.length >= 2 && suburb.relatedServiceUrls.length <= 3, suburb.name);
    for (const url of suburb.relatedServiceUrls) assert.ok(main(html).includes(`href="${new URL(url).pathname}"`), suburb.name);
    assert.doesNotMatch(html, /noindex/);
  }
  assert.equal(backgrounds.size, 32);
  assert.match(main(fixture.read('service-areas/adelaide-hills-foothills/crafers/index.html')), /Regional example.*Stirling/s);
  assert.match(main(fixture.read('service-areas/southern-suburbs/brighton/index.html')), /Regional example.*Marion/s);
});

test('a guide with no mapped case omits the photo and revision date', t => {
  const changed = require('./build-fixture.cjs')(t, {}, content => {
    content.guides.push({ ...content.guides[0], slug: 'unmapped-enquiry-guide', relatedReading: [] });
  });
  const html = changed.read('guides/unmapped-enquiry-guide/index.html');
  const article = graph(html).find(x => x['@type'] === 'Article');
  assert.match(main(html), /Published by MEL ONE/);
  assert.doesNotMatch(main(html), /Original case photograph|Updated <time/);
  assert.equal(article.image, undefined);
  assert.equal(article.dateModified, undefined);
});

test('a documented revision cannot invent a missing case mapping or missing photograph', async () => {
  const { guideRevision } = await import('../src/local-quality.mjs');
  const guide = { slug: 'sample-guide', relatedReading: [] };
  const revisions = { 'sample-guide': { date: '2026-10-10', reason: 'Case photograph added.', caseSlug: 'known-case' } };
  const cases = [{ slug: 'known-case', images: [{ src: '/original.png' }] }];
  assert.equal(guideRevision(guide, cases, revisions), undefined);
  guide.relatedReading = [{ url: '/case-studies/known-case/' }];
  assert.equal(guideRevision(guide, [], revisions), undefined);
  assert.equal(guideRevision(guide, [{ slug: 'known-case', images: [] }], revisions), undefined);
  assert.equal(guideRevision(guide, cases, revisions).image.src, '/original.png');
});
