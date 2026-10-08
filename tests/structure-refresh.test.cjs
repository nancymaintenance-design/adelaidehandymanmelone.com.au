const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const fixture = require('./build-fixture.cjs')(test);
const areas = require('../src/content-pack/service-areas.json');

test('every region feed target is a real hub linked from atlas and suburb breadcrumbs', () => {
  const feed = JSON.parse(fixture.read('service-areas/feed.json'));
  for (const area of feed.regions) {
    const route = new URL(area.url).pathname;
    const hub = fixture.read(`${route.slice(1)}index.html`);
    assert.match(hub, /<h1>/);
    assert.ok(fixture.read('service-areas/index.html').includes(`href="${route}"`));
    for (const suburb of area.suburbs) {
      const local = new URL(suburb.url).pathname;
      assert.ok(hub.includes(`href="${local}"`));
      assert.ok(fixture.read(`${local.slice(1)}index.html`).includes(`href="${route}"`));
    }
  }
  assert.equal(feed.regions.length, areas.length);
});

test('home exposes real before and after work and navigation exposes case studies', () => {
  const home = fixture.read('index.html');
  assert.match(home, /class="repair-record/);
  assert.match(home, />Before<\/span>/);
  assert.match(home, />After<\/span>/);
  assert.match(home, /href="\/case-studies\/">Our work/);
  assert.match(home, /id="featured-work"/);
  assert.match(home, /Tell us the problem\. We’ll assess it and explain the solution\./);
  assert.doesNotMatch(home, /The notebook/);
  assert.match(home, /class="photo-annotation"/);
  assert.match(home, /class="work-facts"/);
});

test('decorative task texture stays out of the card grid flow', () => {
  for (const page of ['index.html', 'services/index.html']) {
    const html = fixture.read(page);
    assert.match(html, /<section class="task-wall"[^>]*><img class="task-wall-texture"/);
  }
});

test('case details use four compact frames and lossless photo candidates', () => {
  const html = fixture.read('case-studies/burnside-driveway-pressure-cleaning/index.html');
  assert.match(html, /class="service-visual-gallery case-photo-grid"/);
  assert.equal((html.match(/class="case-photo-frame"/g) || []).length, 4);
  const gallery = html.match(/<section class="service-visual-gallery[^]*?<\/section>/)[0];
  assert.doesNotMatch(gallery, /image\/avif/);
  for (const img of gallery.match(/<img\b[^>]*>/g)) {
    assert.match(img, /srcset="[^"]+-detail\.webp \d+w/);
  }
});

test('all generated photos reserve geometry and serve responsive approved derivatives', () => {
  const pages = fs.readdirSync(fixture.output, { recursive: true }).filter(f => f.endsWith('.html'));
  for (const file of pages) {
    const html = fixture.read(file);
    for (const image of html.match(/<img\b[^>]*>/g) || []) {
      assert.match(image, /width="\d+"/, file);
      assert.match(image, /height="\d+"/, file);
      if (/src="\/assets\/images\//.test(image)) {
        assert.match(image, /srcset="[^"]+\.webp \d+w/, file);
        if (image.includes('data-detail-photo')) assert.match(image, /-detail\.webp/);
        for (const candidate of image.match(/srcset="([^"]+)"/)[1].split(', ')) {
          const [source] = candidate.split(' ');
          assert.ok(fs.existsSync(path.join(fixture.output, source)), `${file}: ${source}`);
        }
      }
    }
  }
});

test('HTML and llms discovery expose feeds and local pages link only genuine local cases', () => {
  assert.match(fixture.read('case-studies/index.html'), /rel="alternate" type="application\/json"[^>]*case-studies\/feed.json/);
  assert.match(fixture.read('llms.txt'), /case-studies\/feed.json/);
  const local = fixture.read('service-areas/eastern-suburbs/burnside/index.html');
  assert.match(local, /burnside-driveway-pressure-cleaning/);
  assert.doesNotMatch(local, /10,000|ten years|30 minutes/);
  const workflow = fixture.read('how-it-works/index.html');
  assert.match(workflow, /aria-label="Repair journey"/);
  assert.match(workflow, /Completion &amp; follow-up/);
  assert.equal((workflow.match(/<details class="method-disclosure">/g) || []).length, 8);
});

test('all 32 suburbs have distinct enquiry guidance and matching FAQ facts', () => {
  const feed = JSON.parse(fixture.read('service-areas/feed.json'));
  const questions = new Set();
  let count = 0;
  for (const area of feed.regions) for (const suburb of area.suburbs) {
    const html = fixture.read(`${new URL(suburb.url).pathname.slice(1)}index.html`);
    assert.match(html, /id="local-repair-guidance"/);
    assert.ok(suburb.enquiryFocus && suburb.preparation, suburb.name);
    assert.ok(html.includes(suburb.enquiryFocus), suburb.name);
    assert.ok(html.includes(suburb.preparation), suburb.name);
    assert.ok(!questions.has(suburb.faqs[0].question), suburb.name);
    questions.add(suburb.faqs[0].question);
    count++;
  }
  assert.equal(count, 32);
});

test('region search has a clear action and a live status', () => {
  const html = fixture.read('service-areas/index.html');
  assert.match(html, /data-area-search-clear/);
  assert.match(html, /role="status" data-area-search-status/);
});

test('repair facts in the feed match visible cards including assessment-only records', () => {
  const feed = JSON.parse(fixture.read('case-studies/feed.json'));
  const html = fixture.read('case-studies/index.html');
  for (const item of feed.items) {
    assert.ok(html.includes(item.problem));
    assert.ok(html.includes(item.result));
  }
  assert.equal(feed.items.find(item => item.url.includes('modbury-timber-fence-repair-assessment')).stage, 'assessment');
});
