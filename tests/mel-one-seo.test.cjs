const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const buildFixture = require('./build-fixture.cjs');
const preview = buildFixture(test);
const schemaOf = html => JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];

test('default canonicals and crawler indexes address the actual local preview', () => {
  assert.match(preview.read('index.html'), /rel="canonical" href="http:\/\/127\.0\.0\.1:5173\/"/);
  for (const file of ['sitemap.xml', 'robots.txt', 'llms.txt']) {
    assert.match(preview.read(file), /http:\/\/127\.0\.0\.1:5173\//);
    assert.doesNotMatch(preview.read(file), /example\.test|localhost:4173|adelaidecarpentryhub/);
  }
});

test('About metadata, schema and crawler summary follow its dedicated content contract', () => {
  const fixture = buildFixture(test, {}, content => {
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
  assert.match(fixture.read('llms.txt'), /\[A changed About title\]\(http:\/\/127\.0\.0\.1:5173\/about\/\): A changed About description from its approved source\./);
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
    assert.doesNotMatch(JSON.stringify(graph), /Review|AggregateRating|ratingValue|openingHours|foundingDate/);
  }
});

test('workflow metadata and FAQ schema follow only its visible approved method content', () => {
  const fixture = buildFixture(test, {}, content => {
    content.site.method.title = 'A changed workflow title';
    content.site.method.description = 'A changed workflow description from the approved method.';
    content.site.method.faqSlugs = ['prepare-an-enquiry', 'confirm-before-scheduling'];
  });
  const html = fixture.read('how-it-works/index.html');
  assert.match(html, /<title>A changed workflow title \| MEL ONE<\/title>/);
  assert.match(html, /name="description" content="A changed workflow description from the approved method\."/);
  assert.match(html, /property="og:description" content="A changed workflow description from the approved method\."/);
  assert.match(html, /rel="canonical" href="http:\/\/127\.0\.0\.1:5173\/how-it-works\/"/);
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
  assert.match(fixture.read('llms.txt'), /\[A changed workflow title\]\(http:\/\/127\.0\.0\.1:5173\/how-it-works\/\): A changed workflow description from the approved method\./);
});

test('article markup describes visible original editorial pages with publisher identity', () => {
  for (const collection of ['news', 'guides']) {
    for (const item of preview.content[collection].filter(item => item.status === 'approved')) {
      const html = preview.read(`${collection}/${item.slug}/index.html`);
      const article = schemaOf(html).find(item => item['@type'] === 'Article');
      assert.equal(article.headline, item.title);
      assert.equal(article.datePublished, item.date);
      assert.equal(article.publisher['@id'], 'http://127.0.0.1:5173/#business');
      assert.equal(article.author['@id'], article.publisher['@id']);
      assert.equal(article.inLanguage, 'en-AU');
      assert.match(html, /<article>/);
      assert.match(html, /0416 614 281/);
      assert.match(html, /admin@melonemaintenance\.com\.au/);
    }
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
    assert.doesNotMatch(html, /plumbing|gas/i);
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
  assert.deepEqual(generatedAssets, [
    'css/site.css',
    'images/mel-one-about-home-maintenance.png',
    'images/mel-one-adelaide-home-hero.png',
    'images/mel-one-adelaide-service-area.png',
    'images/mel-one-door-window-maintenance.png',
    'images/mel-one-garden-landscape-care.png',
    'images/mel-one-gutter-care.png',
    'images/mel-one-home-repairs-renovation.png',
    'images/mel-one-household-electrical-work.png',
    'images/mel-one-household-removals-cleaning.png',
    'images/mel-one-interior-repair-assembly.png',
    'images/mel-one-maintenance-task-wall.png',
    'images/mel-one-outdoor-structures-fences.png',
    'images/mel-one-roof-gutter-exterior.png',
    'images/mel-one-workflow-contact-next-step.png',
    'images/mel-one-workflow-request-details.png',
    'images/mel-one-workflow-scope-discussion.png',
    'js/site.js',
    'mel-one-logo-authorized.png',
  ]);
  assert.ok(!fs.existsSync(arbitraryAsset), 'arbitrary legacy assets must not remain publicly served');
});
