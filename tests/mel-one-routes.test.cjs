const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const buildFixture = require('./build-fixture.cjs');

const root = path.resolve(__dirname, '..');
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'mel-one-routes-'));
require('./english-builder-fixture.cjs')(root, fixture);
fs.cpSync(path.join(root, 'src'), path.join(fixture, 'src'), { recursive: true });
const content = JSON.parse(fs.readFileSync(path.join(fixture, 'src/content-pack/mel-one-site-content.json'), 'utf8'));
const serviceAreas = JSON.parse(fs.readFileSync(path.join(fixture, 'src/content-pack/service-areas.json'), 'utf8'));
execFileSync(process.execPath, ['build.mjs'], { cwd: fixture, env: { ...process.env, SITE_ORIGIN: 'https://example.test' }, stdio: 'pipe' });
const output = path.join(fixture, 'public');
const read = route => fs.readFileSync(path.join(output, route === '/404.html' ? '404.html' : `${route}/index.html`), 'utf8');
const required = ['/', '/services/', '/how-it-works/', '/service-standards/', '/service-areas/', '/news/', '/guides/', '/faq/', '/about/', '/contact/', '/privacy/', '/404.html'];
test.after(() => fs.rmSync(fixture, { recursive: true, force: true }));

test('shared desktop and mobile navigation includes Home with the correct current page', () => {
  const files = fs.readdirSync(output, { recursive: true }).filter(file => file.endsWith('.html'));
  assert.ok(files.length >= required.length, 'all baseline and generated routes are present');
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
    assert.match(html, /src="\/assets\/mel-one-logo-authorized-224\.webp"/, `${route}: logo`);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${route}: one main heading`);
  }
  assert.match(read('/'), /src="\/assets\/images\/cases\/burnside-driveway-pressure-cleaning-01\.png"/);
  assert.match(read('/'), /src="\/assets\/images\/cases\/burnside-driveway-pressure-cleaning-04\.png"/);
  assert.match(read('/404.html'), /name="robots" content="noindex,\s*follow"/);
});

test('How it works renders useful answer categories, links and a single booking process', () => {
  const main = read('/how-it-works/').match(/<main id="main">([\s\S]*?)<\/main>/)[1];
  assert.equal((main.match(/class="answer-category"/g) || []).length, 5);
  assert.equal((main.match(/data-source-ids=/g) || []).length, 22);
  assert.equal((main.match(/class="booking-process"/g) || []).length, 1);
  assert.match(main, /href="\/services\/sliding-door-repair\/"/);
  assert.match(main, /href="\/case-studies\/kitchen-drawer-runner-repair\/"/);
  assert.match(main, /href="tel:\+61416614281"/);
  assert.doesNotMatch(main, /\b(?:our licensed (?:team|staff|technicians)|insured|guaranteed?|same.day|next.day|24\/7|rapid|instant|fixed.price|free.quote|customer reviews?|testimonials?|always available|all suburbs|all jobs)\b/i);
});
test('hub content is escaped and draft or noindex answers stay out of visible content and schema', () => {
  const fixture = buildFixture(test, {}, data => {
    const method = data.site.method;
    method.title = 'Method <title> & "source"';
    method.description = 'Method <lead> & detail.';
    method.steps[0].heading = 'Step <heading> & detail';
    method.steps[0].paragraphs = ['Method <script>example</script> & detail.'];
    method.categories[0].heading = 'Category <heading>';
    method.categories[0].intro = 'Category <intro>';
    method.categories[0].questions[0].question = 'Question <unsafe> & detail?';
    method.categories[0].questions[0].answer = 'Answer <script>example</script> & detail.';
    method.categories[0].questions.push({id:'draft',sourceIds:[],status:'draft',question:'Private question',answer:'Private answer'}, {id:'hidden',sourceIds:[],noindex:true,question:'Hidden question',answer:'Hidden answer'});
  });
  const html = fixture.read('how-it-works/index.html');
  const main = html.match(/<main id="main">([\s\S]*?)<\/main>/)[1];
  for (const escaped of ['Method &lt;title&gt; &amp; &quot;source&quot;', 'Method &lt;lead&gt; &amp; detail.', 'Step &lt;heading&gt; &amp; detail', 'Method &lt;script&gt;example&lt;/script&gt; &amp; detail.', 'Category &lt;heading&gt;', 'Category &lt;intro&gt;', 'Question &lt;unsafe&gt; &amp; detail?', 'Answer &lt;script&gt;example&lt;/script&gt; &amp; detail.']) assert.ok(main.includes(escaped), escaped);
  assert.equal((main.match(/data-source-ids=/g) || []).length, 22);
  assert.doesNotMatch(html, /Private question|Private answer|Hidden question|Hidden answer/);
  assert.doesNotMatch(main, /<script>/);
});

test('home hero keeps confirmed contact actions and real repair photos beside a decorative gold route', () => {
  const home = read('/');
  const heroStage = home.match(/<section class="hero-stage">([\s\S]*?)<\/section>/);
  assert.ok(heroStage, 'home exposes a semantic hero-stage section');
  assert.match(heroStage[1], /<svg class="gold-route" aria-hidden="true" focusable="false"[^>]*>[\s\S]*?<path\b/);
  assert.match(heroStage[1], /href="tel:\+61416614281">Call 0416 614 281<\/a>/);
  assert.match(heroStage[1], /href="\/contact\/">Request an assessment and quote/);
  assert.match(heroStage[1], /alt="Mossy paved driveway before pressure cleaning in Burnside Adelaide"/);
  assert.match(heroStage[1], /alt="Cleaned paved driveway after pressure cleaning in Burnside Adelaide"/);
  assert.doesNotMatch(heroStage[1], /Concept illustration|concept (?:image|illustration)/i);
  assert.match(home, /<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-9KMWMVLZ3"><\/script>/);
  assert.doesNotMatch(home, /<img[^>]+src="https?:|<link[^>]+href="https?:[^>]+rel="stylesheet"|<link[^>]+rel="stylesheet"[^>]+href="https?:/);
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
  allowed.add('/case-studies/');
  for (const slug of ['flyscreen-repair', 'door-repair', 'gutter-cleaning', 'fence-gate-repair', 'flat-pack-assembly', 'cabinet-drawer-repair', 'sliding-door-repair', 'wall-patching-repair', 'pressure-cleaning']) allowed.add(`/services/${slug}/`);
  for (const slug of ['kitchen-drawer-runner-repair','sliding-patio-door-roller-track-repair']) allowed.add(`/case-studies/${slug}/`);
  for (const study of content.caseStudies) allowed.add(`/case-studies/${study.slug}/`);
  for (const area of serviceAreas) {
    allowed.add(`/service-areas/${area.slug}/`);
    const knownSuburbs = new Map(area.suburbs.map(suburb => [suburb.name, suburb.slug]));
    for (const name of area.popularSuburbs) {
      const slug = knownSuburbs.get(name) || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      allowed.add(`/service-areas/${area.slug}/${slug}/`);
    }
  }
  const actual = [...sitemap.matchAll(/<loc>https:\/\/example\.test([^<]+)<\/loc>/g)].map(match => match[1]);
  assert.deepEqual(actual.sort(), [...allowed].sort());
});

test('enquiry form is disclosed and submits only to the first-party endpoint', () => {
  const html = read('/contact/');
  assert.match(html, /data-enquiry-form/);
  assert.match(html, /MEL ONE will receive the details by email/i);
  assert.doesNotMatch(html, /action="(?:https?:|\/api\/)/);
  for (const name of ['message', 'suburb', 'timing', 'contactPreference', 'phone', 'email']) assert.match(html, new RegExp(`name="${name}"`));
  assert.doesNotMatch(html, /name="photo"/);
});

test('privacy disclosure matches the enabled analytics and enquiry implementation', () => {
  const privacy = read('/privacy/');
  assert.match(privacy, /uses Google Analytics/i);
  assert.match(privacy, /phone numbers and email addresses are sent to MEL ONE’s enquiry endpoint, not to Google Analytics/i);
});
