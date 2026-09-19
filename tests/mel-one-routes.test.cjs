const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const buildFixture = require('./build-fixture.cjs');

const root = path.resolve(__dirname, '..');
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'mel-one-routes-'));
fs.copyFileSync(path.join(root, 'build.mjs'), path.join(fixture, 'build.mjs'));
fs.cpSync(path.join(root, 'src'), path.join(fixture, 'src'), { recursive: true });
const content = JSON.parse(fs.readFileSync(path.join(fixture, 'src/content-pack/mel-one-site-content.json'), 'utf8'));
execFileSync(process.execPath, ['build.mjs'], { cwd: fixture, env: { ...process.env, SITE_ORIGIN: 'https://example.test' }, stdio: 'pipe' });
const output = path.join(fixture, 'public');
const read = route => fs.readFileSync(path.join(output, route === '/404.html' ? '404.html' : `${route}/index.html`), 'utf8');
const required = ['/', '/services/', '/how-it-works/', '/service-areas/', '/news/', '/guides/', '/faq/', '/about/', '/contact/', '/privacy/', '/404.html'];
test.after(() => fs.rmSync(fixture, { recursive: true, force: true }));

test('shared desktop and mobile navigation includes Home with the correct current page', () => {
  const files = fs.readdirSync(output, { recursive: true }).filter(file => file.endsWith('.html'));
  assert.equal(files.length, 32, 'all existing routes and Field Notes are generated');
  for (const file of files) {
    const html = fs.readFileSync(path.join(output, file), 'utf8');
    const nav = html.match(/<nav id="primary-nav"[^>]*>([\s\S]*?)<\/nav>/);
    assert.ok(nav, `${file}: shared navigation`);
    const home = nav[1].match(/<a href="\/"([^>]*)>Home<\/a>/);
    assert.ok(home, `${file}: explicit Home link in the menu`);
    assert.equal(home[1].includes('aria-current="page"'), file === 'index.html', `${file}: Home is current only at /`);
    assert.match(html, /<button class="menu-toggle"[^>]*aria-expanded="false"[^>]*aria-controls="primary-nav"/);
    if (file.replaceAll('\\', '/').startsWith('services/')) {
      assert.match(nav[1], /href="\/services\/" aria-current="page"/);
    }
  }
});

test('About renders all five contract sections, contact material and escaped source updates', () => {
  const rendered = buildFixture(test, {}, data => {
    data.site.about.title = 'About <home> & "people"';
    data.site.about.description = 'A changed About introduction & useful details.';
    data.site.about.sections[0].heading = 'Purpose <script> & care';
    data.site.about.sections[0].paragraphs = ['Source paragraph <script>alert(1)</script> & "quoted".'];
    data.site.about.sections[4].paragraphs.push('Contact source update & next steps.');
  });
  const html = rendered.read('about/index.html');
  const main = html.match(/<main id="main">([\s\S]*?)<\/main>/)[1];
  assert.match(main, /<h1>About &lt;home&gt; &amp; &quot;people&quot;<\/h1>/);
  assert.match(main, /A changed About introduction &amp; useful details\./);
  assert.match(main, /<h2>Purpose &lt;script&gt; &amp; care<\/h2>/);
  assert.match(main, /<p>Source paragraph &lt;script&gt;alert\(1\)&lt;\/script&gt; &amp; &quot;quoted&quot;\.<\/p>/);
  const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  for (const section of rendered.content.site.about.sections) {
    assert.ok(main.includes(`<h2>${escape(section.heading)}</h2>`), `${section.id}: heading`);
    for (const paragraph of section.paragraphs) assert.ok(main.includes(`<p>${escape(paragraph)}</p>`), `${section.id}: paragraph`);
  }
  assert.match(main, /href="tel:\+61416614281"/);
  assert.match(main, /href="mailto:admin@melonemaintenance\.com\.au"/);
  assert.doesNotMatch(main, /<script>|A place to start with your home|Keep the conversation practical/);
});

test('shared scope conditions render once with the process, outside service cards and detail boundaries', () => {
  const rendered = buildFixture(test, {}, data => {
    data.site.exclusions = ['Shared scope fixture & timing condition.'];
  });
  const marker = 'Shared scope fixture &amp; timing condition.';
  const process = rendered.read('how-it-works/index.html').match(/<main id="main">([\s\S]*?)<\/main>/)[1];
  assert.equal(process.split(marker).length - 1, 1, 'process renders the source condition exactly once');
  assert.doesNotMatch(process, /An enquiry starts a discussion\. Scope, availability, timing and any quote need to be confirmed directly\./);
  for (const file of ['index.html', 'services/index.html']) {
    const html = rendered.read(file);
    const wall = html.match(/<section class="task-wall"[^>]*>([\s\S]*?)<\/section>/)[1];
    assert.ok(!html.includes(marker), `${file}: shared boundary belongs with process`);
    assert.doesNotMatch(wall, /\b(?:case by case|scope and availability|specialist assessment|specialist coordination|possible specialist referral)\b/i);
  }
  for (const service of rendered.content.services.filter(item => item.status === 'approved')) {
    const html = rendered.read(`services/${service.slug}/index.html`);
    assert.ok(!html.includes(marker), `${service.slug}: only category boundaries`);
    for (const boundary of service.exclusions) assert.ok(html.includes(boundary.replaceAll('&', '&amp;')), `${service.slug}: preserves category boundary`);
  }
});

test('all required routes offer confirmed contacts and the authorized identity', () => {
  for (const route of required) {
    assert.ok(fs.existsSync(path.join(output, route === '/404.html' ? '404.html' : `${route}/index.html`)), `${route} missing`);
    const html = read(route);
    assert.match(html, /href="tel:\+61416614281"/, `${route}: call action`);
    assert.match(html, /href="mailto:admin@melonemaintenance\.com\.au"/, `${route}: email action`);
    assert.match(html, /63 Pirie St Adelaide SA 5000/, `${route}: address`);
    assert.match(html, /src="\/assets\/mel-one-logo-authorized\.png"/, `${route}: logo`);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${route}: one main heading`);
  }
  assert.match(read('/'), /src="\/assets\/images\/mel-one-adelaide-home-hero\.jpg"/);
  assert.match(read('/404.html'), /name="robots" content="noindex,\s*follow"/);
});

test('How it works renders the method contract as eight ordered articles and practical preparation', () => {
  const html = read('/how-it-works/');
  const main = html.match(/<main id="main">([\s\S]*?)<\/main>/)[1];
  const method = content.site.method;
  const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  assert.ok(main.includes(`<h1>${escape(method.title)}</h1>`));
  assert.ok(main.includes(`<p class="lede">${escape(method.description)}</p>`));
  const sequence = main.match(/<ol class="method-steps">([\s\S]*?)<\/ol>/);
  assert.ok(sequence, 'eight-step process is an ordered list');
  const articles = [...sequence[1].matchAll(/<li><article\b([^>]*)>([\s\S]*?)<\/article><\/li>/g)];
  assert.equal(articles.length, 8);
  method.steps.forEach((step, index) => {
    const [, attributes, body] = articles[index];
    assert.match(attributes, new RegExp(`aria-labelledby="${step.id}-heading"`));
    assert.ok(body.includes(`<span class="step-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>`));
    assert.ok(body.includes(`<h2 id="${step.id}-heading">${escape(step.heading)}</h2>`));
    for (const paragraph of step.paragraphs) assert.ok(body.includes(`<p>${escape(paragraph)}</p>`), `${step.id}: complete paragraph`);
    assert.doesNotMatch(attributes, /hidden|aria-hidden/);
    for (const boundary of content.site.exclusions) assert.equal(body.includes(escape(boundary)), step.id === 'confirm-scope', `${step.id}: shared conditions appear only at confirmation`);
  });
  for (const section of [method.preparation, method.expectations]) {
    assert.ok(main.includes(escape(section.heading)));
    for (const item of section.items) assert.ok(main.includes(`<li>${escape(item)}</li>`));
  }
  const faq = main.match(/<section[^>]*aria-labelledby="method-faq-heading"[^>]*>([\s\S]*?)<\/section>/);
  assert.ok(faq, 'related FAQs have a labelled section');
  for (const slug of method.faqSlugs) {
    const record = content.faqs.find(item => item.slug === slug);
    assert.ok(faq[1].includes(`<summary>${escape(record.question)}</summary>`));
    assert.ok(faq[1].includes(`<p>${escape(record.answer)}</p>`));
  }
  assert.match(main, /href="\/faq\/"/);
  assert.match(main, /href="tel:\+61416614281"/);
  assert.match(main, /href="\/contact\/">Start an enquiry/);
  assert.doesNotMatch(main, /\b(?:plumb(?:ing|er)|gas|licen[cs]ed?|insured|guaranteed?|same.day|next.day|24\/7|rapid|instant|fixed.price|free.quote|customer reviews?|testimonials?|our (?:team|staff|technicians)|always available|all suburbs|all jobs)\b/i);
});

test('method content updates are escaped and unrelated or unpublished FAQs stay off the workflow', () => {
  const fixture = buildFixture(test, {}, data => {
    data.site.method.title = 'Method <title> & "source"';
    data.site.method.description = 'Method <lead> & detail.';
    data.site.method.steps[0].heading = 'Step <heading> & detail';
    data.site.method.steps[0].paragraphs = ['Method <script>example</script> & detail.'];
    data.site.method.preparation.heading = 'Prepare <heading>';
    data.site.method.preparation.items = ['Preparation <item> & detail.'];
    data.site.method.expectations.heading = 'Expect <heading>';
    data.site.method.expectations.items = ['Expectation <item> & detail.'];
    data.site.method.faqSlugs = ['prepare-an-enquiry', 'private-workflow-faq', 'missing-faq'];
    data.faqs.push({ status: 'draft', noindex: true, slug: 'private-workflow-faq', title: 'Private question', question: 'Private question', answer: 'Private answer', description: 'Private question.', scope: [], exclusions: [] });
  });
  const main = fixture.read('how-it-works/index.html').match(/<main id="main">([\s\S]*?)<\/main>/)[1];
  for (const escaped of ['Method &lt;title&gt; &amp; &quot;source&quot;', 'Method &lt;lead&gt; &amp; detail.', 'Step &lt;heading&gt; &amp; detail', 'Method &lt;script&gt;example&lt;/script&gt; &amp; detail.', 'Prepare &lt;heading&gt;', 'Preparation &lt;item&gt; &amp; detail.', 'Expect &lt;heading&gt;', 'Expectation &lt;item&gt; &amp; detail.']) assert.ok(main.includes(escaped), escaped);
  assert.equal((main.match(/<details\b/g) || []).length, 1, 'only requested approved FAQs render');
  assert.doesNotMatch(main, /Private question|Private answer|<script>/);
});

test('home hero keeps confirmed contact actions and truthful artwork beside a decorative gold route', () => {
  const home = read('/');
  const heroStage = home.match(/<section class="hero-stage">([\s\S]*?)<\/section>/);
  assert.ok(heroStage, 'home exposes a semantic hero-stage section');
  assert.match(heroStage[1], /<svg class="gold-route" aria-hidden="true" focusable="false"[^>]*>[\s\S]*?<path\b/);
  assert.match(heroStage[1], /href="tel:\+61416614281">Call 0416 614 281<\/a>/);
  assert.match(heroStage[1], /href="\/contact\/">Start an enquiry/);
  assert.match(heroStage[1], /alt="Adelaide home exterior and household-maintenance tools"/);
  assert.doesNotMatch(heroStage[1], /Concept illustration|concept (?:image|illustration)/i);
  assert.doesNotMatch(home, /<(?:img|script)[^>]+src="https?:|<link[^>]+href="https?:[^>]+rel="stylesheet"|<link[^>]+rel="stylesheet"[^>]+href="https?:/);
});

test('generated public pages remove conceptual image labels while retaining factual image alt text', () => {
  const files = fs.readdirSync(output, { recursive: true }).filter(file => file.endsWith('.html'));
  const prohibited = /concept (?:image|illustration)|conceptual (?:image|illustration)/i;
  for (const file of files) {
    const html = fs.readFileSync(path.join(output, file), 'utf8');
    assert.doesNotMatch(html, prohibited, `${file}: conceptual image framing`);
    for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
      const alt = match[1].match(/\balt="([^"]*)"/i);
      assert.ok(alt && alt[1].trim(), `${file}: every image has non-empty alt text`);
    }
  }
});

test('every generated HTML and schema excludes legacy facts and unapproved records', () => {
  const files = fs.readdirSync(output, { recursive: true }).filter(file => file.endsWith('.html'));
  const forbidden = /0403\s?202\s?949|handymanfelix|adelaidecarpentryhub|Ellis Services|Founded in 2011|13\+ years|written guarantee|24 hours|\"@type\"\s*:\s*\"(?:Review|AggregateRating)\"|\/(?:insights|services\/house-framing)\//i;
  for (const file of files) {
    const html = fs.readFileSync(path.join(output, file), 'utf8');
    assert.doesNotMatch(html, forbidden, file);
    for (const collection of ['services', 'news', 'guides']) {
      for (const record of content[collection].filter(record => record.status !== 'approved')) {
        assert.ok(!html.includes(`/${collection}/${record.slug}/`), `${file}: exposes draft ${record.slug}`);
        assert.ok(!html.includes(record.title), `${file}: exposes draft title ${record.title}`);
      }
    }
    for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      const schema = JSON.parse(match[1]);
      const inspect = value => {
        if (!value || typeof value !== 'object') return;
        for (const [key, child] of Object.entries(value)) {
          assert.ok(!/^(?:review|reviews|aggregateRating)$/i.test(key), `${file}: prohibited ${key}`);
          if (key === 'telephone') assert.equal(child, '0416 614 281');
          if (key === 'email') assert.equal(child, 'admin@melonemaintenance.com.au');
          inspect(child);
        }
      };
      inspect(schema);
    }
  }
  const sitemap = fs.readFileSync(path.join(output, 'sitemap.xml'), 'utf8');
  assert.doesNotMatch(sitemap, forbidden);
  const allowed = new Set(required.filter(route => route !== '/404.html'));
  for (const collection of ['services', 'news', 'guides']) {
    for (const record of content[collection].filter(record => record.status === 'approved')) allowed.add(`/${collection}/${record.slug}/`);
  }
  const actual = [...sitemap.matchAll(/<loc>https:\/\/example\.test([^<]+)<\/loc>/g)].map(match => match[1]);
  assert.deepEqual(actual.sort(), [...allowed].sort());
});

test('local enquiry is disclosed and cannot submit to an external handler', () => {
  const html = read('/contact/');
  assert.match(html, /data-local-enquiry/);
  assert.match(html, /local preview/i);
  assert.doesNotMatch(html, /action="(?:https?:|\/api\/)/);
  for (const name of ['message', 'suburb', 'timing', 'contactPreference', 'phone', 'email', 'photo']) assert.match(html, new RegExp(`name="${name}"`));
});
