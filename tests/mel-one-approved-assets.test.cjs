const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const buildFixture = require('./build-fixture.cjs');

const preview = buildFixture(test);
const approved = {
  hero: 'images/mel-one-adelaide-home-hero.jpg',
  taskWall: 'images/mel-one-maintenance-task-wall.jpg',
  roof: 'images/mel-one-roof-gutter-exterior.jpg',
  outdoor: 'images/mel-one-outdoor-structures-fences.jpg',
  repairs: 'images/mel-one-home-repairs-renovation.jpg',
  electrical: 'images/mel-one-household-electrical-work.jpg',
  interior: 'images/mel-one-interior-repair-assembly.jpg',
  doors: 'images/mel-one-door-window-maintenance.jpg',
  garden: 'images/mel-one-garden-landscape-care.jpg',
  roofWork: 'images/mel-one-gutter-care.jpg',
  cleaning: 'images/mel-one-household-removals-cleaning.jpg',
  workflow: [
    'images/mel-one-workflow-request-details.jpg',
    'images/mel-one-workflow-scope-discussion.jpg',
    'images/mel-one-workflow-contact-next-step.jpg',
  ],
  about: 'images/mel-one-about-home-maintenance.jpg',
  areas: 'images/mel-one-adelaide-service-area.jpg',
};

function html(file) {
  return preview.read(file);
}

test('approved intake assets are copied and appear only in their assigned page contexts', () => {
  const servedAssets = fs.readdirSync(path.join(preview.output, 'assets'), { recursive: true })
    .filter(file => fs.statSync(path.join(preview.output, 'assets', file)).isFile())
    .map(file => file.split(path.sep).join('/'));
  for (const asset of Object.values(approved).flat()) assert.ok(servedAssets.includes(asset), `serves ${asset}`);

  assert.match(html('index.html'), new RegExp(`/assets/${approved.hero}`));
  assert.match(html('index.html'), new RegExp(`/assets/${approved.taskWall}`));
  assert.match(html('services/roof-gutter-exterior-care/index.html'), new RegExp(`/assets/${approved.roof}`));
  assert.match(html('services/outdoor-structures-fences-pools/index.html'), new RegExp(`/assets/${approved.outdoor}`));
  assert.match(html('services/home-repairs-renovation-support/index.html'), new RegExp(`/assets/${approved.repairs}`));
  assert.match(html('services/home-electrical-repairs/index.html'), new RegExp(`/assets/${approved.electrical}`));
  assert.match(html('services/interior-repairs-assembly/index.html'), new RegExp(`/assets/${approved.interior}`));
  assert.match(html('services/doors-windows-screens/index.html'), new RegExp(`/assets/${approved.doors}`));
  assert.match(html('services/garden-landscape-care/index.html'), new RegExp(`/assets/${approved.garden}`));
  assert.match(html('services/roof-gutter-exterior-care/index.html'), new RegExp(`/assets/${approved.roofWork}`));
  assert.match(html('services/cleaning-removals-specialist-care/index.html'), new RegExp(`/assets/${approved.cleaning}`));
  const workflow = html('how-it-works/index.html');
  for (const asset of approved.workflow) assert.match(workflow, new RegExp(`/assets/${asset}`));
  assert.match(html('about/index.html'), new RegExp(`/assets/${approved.about}`));
  assert.match(html('service-areas/index.html'), new RegExp(`/assets/${approved.areas}`));
});

test('generated preview uses confirmed assets with neutral visual descriptions', () => {
  const publicText = fs.readdirSync(preview.output, { recursive: true })
    .filter(file => fs.statSync(path.join(preview.output, file)).isFile() && file.endsWith('.html'))
    .map(file => fs.readFileSync(path.join(preview.output, file), 'utf8'))
    .join('\n');
  for (const filename of ['3.png', '4.png', '5.png', '7.png', '10.png', '11.png']) assert.doesNotMatch(publicText, new RegExp(filename.replace('.', '\\.')));
  assert.doesNotMatch(publicText, /(?:real project|completed job|completed project|before\s*(?:and|&)\s*after)/i);
  for (const image of [...publicText.matchAll(/<img\b[^>]*>/g)].map(match => match[0])) {
    assert.doesNotMatch(image, /(?:real project|completed job|completed project|before\s*(?:and|&)\s*after)/i);
  }
});
