const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const buildFixture = require('./build-fixture.cjs');
const preview = buildFixture(test, { SITE_ORIGIN: 'https://example.test' });
const schemaOf = html => JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];

function expectedGeneratedAssets(fixture) {
  const source = path.join(path.dirname(fixture.output), 'src/assets');
  const files = directory => fs.readdirSync(directory, { recursive: true })
    .filter(file => fs.statSync(path.join(directory, file)).isFile())
    .map(file => file.split(path.sep).join('/'));
  return ['css/site.css', 'js/site.js', 'mel-one-logo-authorized.png', 'mel-one-logo-authorized-224.webp',
    ...files(path.join(source, 'images/intake')).filter(file => file.endsWith('.png')).map(file => `images/${file}`),
    ...files(path.join(source, 'images/cases')).map(file => `images/cases/${file}`),
    ...Object.values(JSON.parse(fs.readFileSync(path.join(source, 'images/responsive-manifest.json'), 'utf8'))).flatMap(image => [...image.variants, ...image.avifVariants, ...(image.detailVariants || [])].map(variant => variant.src.replace('/assets/', ''))),
  ].sort();
}

test('configured canonicals and crawler indexes use the requested site origin', () => {
  assert.match(preview.read('index.html'), /rel="canonical" href="https:\/\/example\.test\/"/);
  for (const file of ['sitemap.xml', 'robots.txt', 'llms.txt']) {
    assert.match(preview.read(file), /https:\/\/example\.test\//);
    assert.doesNotMatch(preview.read(file), /localhost:4173|adelaidecarpentryhub/);
  }
});

test('LLM discovery text describes the live MEL ONE website in positive, accurate language', () => {
  const text = preview.read('llms.txt');
  assert.match(text, /This is MEL ONE’s Adelaide website\./);
  assert.match(text, /Availability, timing and specialist coordination are confirmed for each request\./);
  assert.doesNotMatch(text, /local website candidate|does not promise search or AI ranking/i);
});

test('About metadata, schema and crawler summary follow its dedicated content contract', () => {
  const fixture = buildFixture(test, { SITE_ORIGIN: 'https://example.test' }, content => {
    content.site.about.title = 'A changed About title';
    content.site.about.description = 'A changed About description from its approved source.';
  });
  const html = fixture.read('about/index.html');
  assert.match(html, /<title>A changed About title \| MEL ONE<\/title>/);
  assert.match(html, /name="description" content="A changed About description from its approved source\."/);
  assert.match(html, /property="og:description" content="A changed About description from its approved source\."/);
  const page = schemaOf(html).find(item => item['@type'] === 'WebPage');
  assert.equal(page.name, 'A changed About title | MEL ONE');
  assert.equal(page.description, 'A changed About description from its approved source.');
  assert.match(fixture.read('llms.txt'), /\[A changed About title\]\(https:\/\/example\.test\/about\/\): A changed About description from its approved source\./);
});

test('each indexable page has unique metadata and a consistent business entity', () => {
  const titles = new Set();
  const descriptions = new Set();
  for (const file of fs.readdirSync(preview.output, { recursive: true }).filter(file => file.endsWith('.html') && file !== '404.html')) {
    const html = preview.read(file);
    const title = html.match(/<title>([^<]+)<\/title>/)[1];
    const description = html.match(/name="description" content="([^"]+)"/)[1];
    assert.ok(!titles.has(title), `Duplicate title: ${file}`);
    assert.ok(!descriptions.has(description), `Duplicate description: ${file}`);
    titles.add(title); descriptions.add(description);
    assert.match(html, /name="robots" content="index,follow"/);
    const graph = schemaOf(html);
    const business = graph.find(item => item['@type'] === 'LocalBusiness');
    assert.ok(business, `${file} business entity`);
    assert.equal(business.name, 'MEL ONE');
    assert.equal(business.telephone, '0416 614 281');
    assert.equal(business.email, 'admin@melonemaintenance.com.au');
    assert.deepEqual(business.address, { '@type': 'PostalAddress', streetAddress: '63 Pirie St', addressLocality: 'Adelaide', addressRegion: 'SA', postalCode: '5000', addressCountry: 'AU' });
    assert.ok(graph.some(item => item['@type'] === 'WebPage' && item.isPartOf['@id'].endsWith('/#website')));
    assert.doesNotMatch(JSON.stringify(graph), /Review|AggregateRating|ratingValue|foundingDate/);
    assert.equal(business.openingHoursSpecification[0].opens, '09:00');
    assert.equal(business.openingHoursSpecification[0].closes, '21:00');
    assert.equal(business.openingHoursSpecification[0].dayOfWeek.length, 7);
  }
});

test('generated business and Article schema use only configured regions and visible images', () => {
  const areas = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/content-pack/service-areas.json'), 'utf8'));
  const sampleGuide = preview.content.guides.find(item => item.status === 'approved');
  const sampleCase = preview.content.caseStudies[0];
  const pages = [
    'index.html',
    `service-areas/${areas[0].slug}/index.html`,
    `guides/${sampleGuide.slug}/index.html`,
    `case-studies/${sampleCase.slug}/index.html`,
  ];

  for (const file of pages) {
    const html = preview.read(file);
    const graph = schemaOf(html);
    const business = graph.find(item => item['@type'] === 'LocalBusiness');
    assert.equal(business.image, 'https://example.test/assets/images/mel-one-adelaide-service-area.png');
    assert.deepEqual(business.areaServed, areas.map(area => ({ '@type': 'AdministrativeArea', name: area.name })));
    assert.doesNotMatch(JSON.stringify(business), /aggregateRating|review|priceRange|geo|foundingDate/i);
    assert.equal(business.openingHoursSpecification[0].opens, '09:00');
    assert.equal(business.openingHoursSpecification[0].closes, '21:00');
    for (const article of graph.filter(item => item['@type'] === 'Article')) {
      const visibleImages = [...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map(match => new URL(match[1], 'https://example.test').href);
      if (article.image) {
        const articleImages = Array.isArray(article.image) ? article.image : [article.image];
        assert.ok(articleImages.length > 0);
        assert.ok(articleImages.every(image => visibleImages.includes(image)), `${file} Article image is visible`);
      } else {
        assert.equal(file, `guides/${sampleGuide.slug}/index.html`, `${file} omits Article image when no image is visible`);
      }
      assert.equal(article.dateModified, file.startsWith('guides/') ? '2026-10-10' : undefined);
    }
  }
});

test('workflow metadata and FAQ schema follow only its visible approved method content', () => {
  const fixture = buildFixture(test, { SITE_ORIGIN: 'https://example.test' }, content => {
    content.site.method.title = 'A changed workflow title';
    content.site.method.description = 'A changed workflow description from the approved method.';
    content.site.method.faqSlugs = ['prepare-an-enquiry', 'confirm-before-scheduling'];
  });
  const html = fixture.read('how-it-works/index.html');
  assert.match(html, /<title>A changed workflow title \| MEL ONE<\/title>/);
  assert.match(html, /name="description" content="A changed workflow description from the approved method\."/);
  assert.match(html, /property="og:description" content="A changed workflow description from the approved method\."/);
  assert.match(html, /rel="canonical" href="https:\/\/example\.test\/how-it-works\/"/);
  const graph = schemaOf(html);
  const page = graph.find(item => item['@type'] === 'WebPage');
  assert.equal(page.name, 'A changed workflow title | MEL ONE');
  assert.equal(page.description, 'A changed workflow description from the approved method.');
  const faqs = graph.find(item => item['@type'] === 'FAQPage');
  assert.ok(faqs, 'visible related FAQs have matching schema');
  assert.deepEqual(faqs.mainEntity.map(item => [item.name, item.acceptedAnswer.text]), fixture.content.site.method.faqSlugs.map(slug => {
    const record = fixture.content.faqs.find(item => item.slug === slug);
    return [record.question, record.answer];
  }));
  assert.ok(graph.some(item => item['@type'] === 'BreadcrumbList' && item.itemListElement.at(-1).item.endsWith('/how-it-works/')));
  assert.match(fixture.read('llms.txt'), /\[A changed workflow title\]\(https:\/\/example\.test\/how-it-works\/\): A changed workflow description from the approved method\./);
});

test('social and WebPage image metadata follow actual content photos after homepage substitution', () => {
  const examples = [
    ['index.html', '/assets/images/cases/burnside-driveway-pressure-cleaning-01.png'],
    ['services/home-electrical-repairs/index.html', '/assets/images/mel-one-household-electrical-work.png'],
    ['case-studies/norwood-flyscreen-repair/index.html', '/assets/images/cases/norwood-flyscreen-repair-01.png'],
    ['service-areas/index.html', '/assets/images/mel-one-adelaide-service-area.png'],
    ['service-areas/cbd-north-adelaide/index.html', '/assets/images/cases/north-adelaide-door-repair-04.png'],
  ];
  for (const [file, image] of examples) {
    const html = preview.read(file);
    const expected = `https://example.test${image}`;
    assert.equal(html.match(/property="og:image" content="([^"]+)"/)[1], expected, `${file} Open Graph photo`);
    assert.equal(html.match(/name="twitter:image" content="([^"]+)"/)[1], expected, `${file} Twitter photo`);
    assert.equal(schemaOf(html).find(item => item['@type'] === 'WebPage').primaryImageOfPage['@type'], 'ImageObject');
    assert.equal(schemaOf(html).find(item => item['@type'] === 'WebPage').primaryImageOfPage.url, expected);
    assert.ok(fs.existsSync(path.join(preview.output, image)), `${file} image asset exists`);
    const main = html.match(/<main id="main">([\s\S]*?)<\/main>/)[1];
    assert.ok(main.includes(`src="${image}"`), `${file} primary image is visible in main`);
  }
});

test('pages without content photos use a social fallback without claiming a primary or Article image', () => {
  const guide = preview.content.guides.find(item => item.status === 'approved' && item.noindex !== true);
  for (const file of ['contact/index.html', 'service-areas/inner-west/thebarton/index.html', '404.html']) {
    const html = preview.read(file);
    const expected = 'https://example.test/assets/images/mel-one-adelaide-service-area.png';
    assert.equal(html.match(/property="og:image" content="([^"]+)"/)[1], expected, `${file} fallback`);
    assert.equal(html.match(/name="twitter:image" content="([^"]+)"/)[1], expected);
    for (const entity of schemaOf(html).filter(item => ['WebPage', 'Article'].includes(item['@type']))) {
      assert.equal(entity.primaryImageOfPage, undefined, `${file} no claimed primary image`);
      assert.equal(entity.image, undefined, `${file} no claimed Article image`);
    }
    assert.ok(fs.existsSync(path.join(preview.output, new URL(expected).pathname)));
  }
  assert.match(preview.read('404.html'), /name="robots" content="noindex,follow"/);
});

test('a region without photographed cases has no primary image and keeps the shared social fallback', () => {
  const fixture = buildFixture(test, { SITE_ORIGIN: 'https://example.test' }, content => {
    for (const study of content.caseStudies.filter(item => ['North Adelaide', 'Adelaide CBD'].includes(item.suburb))) study.suburb = 'Norwood';
  });
  const html = fixture.read('service-areas/cbd-north-adelaide/index.html');
  assert.equal(schemaOf(html).find(item => item['@type'] === 'WebPage').primaryImageOfPage, undefined);
  assert.equal(html.match(/property="og:image" content="([^"]+)"/)[1], 'https://example.test/assets/images/mel-one-adelaide-service-area.png');
  assert.equal(html.match(/name="twitter:image" content="([^"]+)"/)[1], 'https://example.test/assets/images/mel-one-adelaide-service-area.png');
});

test('service schema uses configured regions while preserving suburb-specific coverage', () => {
  const areas = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/content-pack/service-areas.json'), 'utf8'));
  for (const record of preview.content.services.filter(item => item.status === 'approved' && item.noindex !== true)) {
    const service = schemaOf(preview.read(`services/${record.slug}/index.html`)).find(item => item['@type'] === 'Service');
    assert.deepEqual(service.areaServed, areas.map(area => ({ '@type': 'AdministrativeArea', name: area.name })), record.slug);
  }
  const local = schemaOf(preview.read('service-areas/eastern-suburbs/norwood/index.html')).find(item => item['@type'] === 'Service');
  assert.deepEqual(local.areaServed, { '@type': 'City', name: 'Norwood, Adelaide' });
});

test('article markup describes visible original editorial pages with publisher identity', () => {
  for (const collection of ['news', 'guides']) {
    for (const item of preview.content[collection].filter(item => item.status === 'approved' && item.noindex !== true)) {
      const html = preview.read(`${collection}/${item.slug}/index.html`);
      const articles = schemaOf(html).filter(item => item['@type'] === 'Article');
      assert.equal(articles.length, 1, `${collection}/${item.slug} exactly one Article`);
      const [article] = articles;
      const revisions = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/content-pack/editorial-updates.json'), 'utf8'));
      const revision = collection === 'guides' ? revisions[item.slug] : undefined;
      if (revision) {
        const study = preview.content.caseStudies.find(study => study.slug === revision.caseSlug);
        assert.equal(article.image, `https://example.test${study.images[0].src}`);
        assert.match(html, /Original case photograph/);
        assert.equal(article.dateModified, revision.date);
        assert.match(html, /Published by MEL ONE/);
      } else {
        assert.equal(article.image, undefined, `${collection}/${item.slug} no editorial photo is documented`);
        assert.equal(article.dateModified, undefined);
      }
      assert.equal(article.headline, item.title);
      assert.equal(article.datePublished, item.date);
      assert.equal(article.publisher['@id'], 'https://example.test/#business');
      assert.equal(article.author['@id'], article.publisher['@id']);
      assert.equal(article.inLanguage, 'en-AU');
      assert.match(html, /<article>/);
      assert.match(html, /0416 614 281/);
      assert.match(html, /admin@melonemaintenance\.com\.au/);
    }
  }
  for (const study of preview.content.caseStudies) {
    const html = preview.read(`case-studies/${study.slug}/index.html`);
    const articles = schemaOf(html).filter(item => item['@type'] === 'Article');
    assert.equal(articles.length, 1, `${study.slug} exactly one Article`);
    assert.deepEqual(articles[0].image, study.images.map(image => `https://example.test${image.src}`), `${study.slug} all documented photos in order`);
    assert.equal(articles[0].dateModified, undefined);
  }
  assert.ok(!schemaOf(preview.read('index.html')).some(item => item['@type'] === 'Article'));
});

test('draft records never enter crawler indexes or generated pages', () => {
  const fixture = buildFixture(test, { SITE_ORIGIN: 'https://example.test' }, content => {
    content.guides.push({ status: 'draft', noindex: true, slug: 'draft-only-fixture', title: 'Private draft', description: 'Not public.', scope: [], exclusions: [] });
  });
  for (const file of ['sitemap.xml', 'llms.txt']) assert.doesNotMatch(fixture.read(file), /draft-only-fixture|404\.html|\/admin\//);
  assert.ok(!fs.existsSync(path.join(fixture.output, 'guides/draft-only-fixture/index.html')));
  assert.match(fixture.read('robots.txt'), /Disallow: \/admin\//);
  assert.match(fixture.read('sitemap.xml'), /https:\/\/example\.test\//);
  const sitemapRoutes = [...fixture.read('sitemap.xml').matchAll(/<loc>https:\/\/example\.test([^<]+)<\/loc>/g)].map(match => match[1]);
  for (const route of sitemapRoutes) {
    assert.ok(fs.existsSync(path.join(fixture.output, route, 'index.html')), route);
    assert.ok(fixture.read('llms.txt').includes(`https://example.test${route})`), route);
  }
});

test('mobile quick actions provide both calling and enquiry navigation on every page', () => {
  for (const file of fs.readdirSync(preview.output, { recursive: true }).filter(file => file.endsWith('.html'))) {
    const actions = preview.read(file).match(/<nav class="mobile-actions"[^>]*>([\s\S]*?)<\/nav>/);
    assert.ok(actions, `${file} persistent actions`);
    assert.match(actions[1], /href="tel:\+61416614281"/);
    assert.match(actions[1], /href="\/contact\/"/);
  }
  assert.match(preview.read('assets/css/site.css'), /\.mobile-actions\s*\{[^}]*position:\s*fixed/);
  assert.match(preview.read('assets/css/site.css'), /prefers-reduced-motion/);
});

test('home page exposes the Gold Standard visual system markers', () => {
  const home = preview.read('index.html');
  for (const marker of ['gold-route', 'task-wall', 'mobile-actions']) {
    assert.match(home, new RegExp(`class="${marker}"`), `home ${marker} marker`);
  }
});

test('home and services expose all nine approved categories in a semantic task wall', () => {
  const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  const records = preview.content.services.filter(item => item.status === 'approved' && item.noindex !== true);
  assert.equal(records.length, 9);
  for (const file of ['index.html', 'services/index.html']) {
    const html = preview.read(file);
    const wall = html.match(/<section class="task-wall"[^>]*>([\s\S]*?)<\/section>/);
    assert.ok(wall, `${file} semantic task wall`);
    const articles = [...wall[1].matchAll(/<article class="task-card task-card--\d+">([\s\S]*?)<\/article>/g)];
    assert.equal(articles.length, 9, `${file} nine service articles`);
    assert.ok((html.match(/href="\/services\//g) || []).length >= 9);
    assert.doesNotMatch(wall[1], /plumbing|gas/i);
    const icons = new Set();
    articles.forEach(([article], index) => {
      const record = records[index];
      assert.ok(article.includes(escape(record.title)));
      assert.ok(article.includes(escape(record.description)));
      assert.ok(article.includes(`href="/services/${record.slug}/"`));
      const icon = article.match(/<svg class="task-icon" aria-hidden="true" focusable="false"[^>]*>([\s\S]*?)<\/svg>/);
      assert.ok(icon, `${record.slug} local decorative icon`);
      icons.add(icon[1]);
      const scopes = [...article.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(match => match[1]);
      assert.deepEqual(scopes, record.scope.slice(0, 3).map(escape));
    });
    assert.equal(icons.size, 9, 'each category has a distinct local icon');
  }
});

test('task wall escapes content and limits scope previews to three items', () => {
  const fixture = buildFixture(test, {}, content => {
    content.services[0].title = 'Fixture <title> & "text"';
    content.services[0].description = 'Fixture <description> & "text"';
    content.services[0].scope = ['<script>fixture</script>', 'A & B', '"Third"', 'Fourth must stay off the wall'];
  });
  for (const file of ['index.html', 'services/index.html']) {
    const wall = fixture.read(file).match(/<section class="task-wall"[^>]*>([\s\S]*?)<\/section>/);
    assert.ok(wall);
    assert.match(wall[1], /Fixture &lt;title&gt; &amp; &quot;text&quot;/);
    assert.match(wall[1], /Fixture &lt;description&gt; &amp; &quot;text&quot;/);
    assert.match(wall[1], /&lt;script&gt;fixture&lt;\/script&gt;/);
    assert.match(wall[1], /A &amp; B/);
    assert.match(wall[1], /&quot;Third&quot;/);
    assert.doesNotMatch(wall[1], /Fourth must stay off the wall|<script>/);
  }
});

test('rebuilding removes the retired generated form-submission script', () => {
  const fixture = buildFixture(test);
  const retiredScript = path.join(fixture.output, 'assets/base.js');
  fs.writeFileSync(retiredScript, 'fetch("/api/contact", {method:"POST"})');
  execFileSync(process.execPath, ['build.mjs'], { cwd: path.dirname(fixture.output), env: { ...process.env, SITE_ORIGIN: '' }, stdio: 'pipe' });
  assert.ok(!fs.existsSync(retiredScript), 'retired submission code must not remain publicly served');
});

test('rebuilding removes the retired generated theme stylesheet and legacy Ellis output', () => {
  const fixture = buildFixture(test);
  const retiredTheme = path.join(fixture.output, 'assets/theme.css');
  fs.writeFileSync(retiredTheme, '/* Ellis legacy generated theme */');
  execFileSync(process.execPath, ['build.mjs'], { cwd: path.dirname(fixture.output), env: { ...process.env, SITE_ORIGIN: '' }, stdio: 'pipe' });
  assert.ok(!fs.existsSync(retiredTheme), 'retired theme stylesheet must not remain publicly served');
  for (const file of fs.readdirSync(fixture.output, { recursive: true })) {
    if (fs.statSync(path.join(fixture.output, file)).isFile()) {
      assert.doesNotMatch(fs.readFileSync(path.join(fixture.output, file), 'utf8'), /Ellis/i, `${file} must not contain legacy Ellis text`);
    }
  }
});

test('rebuilding replaces generated assets with the approved asset whitelist', () => {
  const fixture = buildFixture(test);
  const arbitraryAsset = path.join(fixture.output, 'assets/legacy/arbitrary-old-asset.jpg');
  fs.mkdirSync(path.dirname(arbitraryAsset), { recursive: true });
  fs.writeFileSync(arbitraryAsset, 'legacy asset that must not be served');
  fs.writeFileSync(path.join(fixture.output, 'assets/base.css'), 'legacy stylesheet');

  execFileSync(process.execPath, ['build.mjs'], { cwd: path.dirname(fixture.output), env: { ...process.env, SITE_ORIGIN: '' }, stdio: 'pipe' });

  const generatedAssets = fs.readdirSync(path.join(fixture.output, 'assets'), { recursive: true })
    .filter(file => fs.statSync(path.join(fixture.output, 'assets', file)).isFile())
    .map(file => file.split(path.sep).join('/'))
    .sort();
  assert.deepEqual(generatedAssets, expectedGeneratedAssets(fixture));
  assert.ok(!fs.existsSync(arbitraryAsset), 'arbitrary legacy assets must not remain publicly served');
});
