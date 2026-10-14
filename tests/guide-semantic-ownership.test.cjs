const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const buildFixture = require('./build-fixture.cjs');
const pressureSlug = 'field-notes-cleaning-removals-preparation';

// Editorially authored topic ownership, not expectations derived from generated copy.
// These grouped expressions catch paraphrases of the reported duplication, not just identical paragraphs.
const ownership = [
 ['field-notes-doors-windows-screens-enquiry', /insect barrier|rollers carry/i, 1, /security rat|security screen/i, 3],
 ['field-notes-wall-interior-repairs-job-list', /primer|paint touch-up|wider painted/i, 1, /cupboard|kit|skirting/i, 3],
 ['field-notes-roof-gutter-exterior-observations', /interval|fixed calendar|repeat schedule/i, 2, /removed debris|debris.handling|debris will go/i, 3],
 ['field-notes-garden-outdoor-seasonal-preparation', /plants to retain|retained plants|what should stay/i, 1, /green.waste|waste arrangement/i, 1],
 ['field-notes-rental-end-of-lease-maintenance-list', /invoice|completion notes|completed items/i, 2, /authoris|approv.*changes|changes.*approv/i, 3],
 ['field-notes-pre-sale-home-maintenance-list', /drying|agent visits|deliveries/i, 3, /moisture|recurring crack/i, 2],
 ['field-notes-grouping-multiple-household-jobs', /discount|saving|charges/i, 2, /instructions|deliveries/i, 4],
 ['field-notes-cleaning-removals-preparation', /resealing|joint repairs|reasonable.*marks/i, 3, /vehicles|shared access/i, 4],
 ['prepare-household-maintenance-enquiry', /GST|labour|travel|disposal/i, 1, /codes|private tenancy/i, 3],
 ['home-maintenance-walk-through-checklist', /cupboard|skirting/i, 1, /roof access|pool.barrier/i, 3],
];
test('guide consumers give each developed idea one section instead of concatenating paraphrases', t => {
 const {read} = buildFixture(t);
 for (const [slug, ...rules] of ownership) {
  const html = read('guides/' + slug + '/index.html');
  const bodies = [...html.matchAll(/<section id="guide-topic-\d+"[^>]*>([^]*?)<\/section>/g)]
   .map(m => m[1].replace(/<h2[^>]*>[^]*?<\/h2>/g, '').replace(/<[^>]*>/g, ' '));
  assert.equal(bodies.length, 4, slug);
  for (let i = 0; i < rules.length; i += 2) {
   const owners = bodies.flatMap((body, n) => rules[i].test(body) ? [n + 1] : []);
   assert.deepEqual(owners, [rules[i + 1]], slug + ': ' + rules[i]);
  }
 }
});
test('pressure guide stays paving-specific for base and every upstream consumer; removals remain on service', async () => {
 const content = JSON.parse(fs.readFileSync('src/content-pack/mel-one-site-content.json', 'utf8'));
 const facts = JSON.parse(fs.readFileSync('src/content-pack/repair-record-facts.json', 'utf8'));
 const {focusedServices} = await import('../src/focused-services.mjs');
 const stages = [
  ['base', () => {}],
  ['seo refresh', c => import('../src/seo-refresh.mjs').then(m => m.applySeoRefresh(c, facts))],
  ['content refinement', c => import('../src/content-refinement.mjs').then(m => m.applyContentRefinement(c, focusedServices))],
  ['keyword gaps', c => import('../src/keyword-gap-refinement.mjs').then(m => m.applyKeywordGapRefinement(c, focusedServices))],
  ['additional repairs', c => import('../src/additional-repair-content.mjs').then(m => m.applyAdditionalRepairContent(c, facts))],
  ['topic links', c => import('../src/topic-link-refinement.mjs').then(m => m.applyTopicLinkRefinement(c))],
  ['keyword editorial', c => import('../src/keyword-led-content.mjs').then(m => m.applyKeywordLedContent(c, focusedServices))],
 ];
 for (const [name, apply] of stages) {
  await apply(content);
  const record = content.guides.find(g => g.slug === pressureSlug);
  const prose = JSON.stringify({title: record.title, description: record.description, scope: record.scope, exclusions: record.exclusions, sections: record.sections, answer: record.answerSummary, faqs: record.faqs}, (key,value) => key === 'url' ? undefined : value);
  assert.doesNotMatch(prose, /furniture|clear-out|donat|collection|waste type|removal|pests|mould/i, name);
  assert.match(prose, /pav(?:ing|er)|driveway/i, name);
 }
 const removals = JSON.stringify(content.services.find(s => s.slug === 'cleaning-removals-specialist-care'));
 for (const topic of [/dimensions/i, /stairs/i, /disposal/i, /shared entrances/i, /dismantling/i]) assert.match(removals, topic);
});
test('Burnside before photograph is explicitly distinguished from the linked finished sequence', t => {
 const {read} = buildFixture(t);
 const html = read('guides/' + pressureSlug + '/index.html');
 const figure = html.match(/<figure class="guide-case-photo">([^]*?)<\/figure>/)?.[1];
 assert.ok(figure);
 assert.match(figure, /burnside-driveway-pressure-cleaning-01.png/);
 assert.match(figure, /Before cleaning:/);
 assert.match(figure, /case sequence[^<]*finished result/i);
 assert.match(figure, /href="\/case-studies\/burnside-driveway-pressure-cleaning\/"/);
});
test('guide consumers preserve contextual author links instead of substituting directory labels', t => {
 const {read} = buildFixture(t);
 const door = read('guides/field-notes-doors-windows-screens-enquiry/index.html');
 assert.match(door, /href="\/guides\/prepare-household-maintenance-enquiry\/">quote preparation guide<\/a>/);
 const sale = read('guides/field-notes-pre-sale-home-maintenance-list/index.html');
 assert.match(sale, /href="\/guides\/field-notes-grouping-multiple-household-jobs\/">multi-job repair list<\/a>/);
 const rental = read('guides/field-notes-rental-end-of-lease-maintenance-list/index.html');
 assert.match(rental, /<h2>Rental Repair Handover: Status, Invoices and Completion Notes<\/h2>/);
});
