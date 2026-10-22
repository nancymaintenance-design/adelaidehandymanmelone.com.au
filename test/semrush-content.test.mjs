import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import {restoreUnleyPhotoOrder} from './helpers/unley-photo-order.mjs';
import {followupFiles} from './helpers/p1-followup-baseline.mjs';
import {seasonalFiles} from './helpers/seasonal-copy-baseline.mjs';

const examples = [
  ['services/gutter-cleaning', 'How do gutter guards affect a cleaning enquiry?'],
  ['services/gutter-cleaning', 'What affects the cost of residential gutter cleaning?'],
  ['services/pressure-cleaning', 'What affects a driveway pressure cleaning quote?'],
  ['services/sliding-door-repair', 'Can replacement rollers be chosen just because a sliding door is aluminium?'],
  ['services/cabinet-drawer-repair', 'Should I buy kitchen drawer runners or cupboard hinges before assessment?'],
  ['services/wall-patching-repair', 'Are drywall, wallboard and plasterboard repair the same enquiry?'],
  ['services/flat-pack-assembly', 'What affects the cost of flat-pack furniture assembly?'],
  ['services/garden-landscape-care', 'How do I compare a one-off garden clean-up with regular maintenance?'],
  ['services/cleaning-removals-specialist-care', 'Which rooms and tasks should I list for household cleaning?'],
  ['services/cleaning-removals-specialist-care', 'Does moving a few furniture items establish a whole-house removal service?'],
  ['services/fence-gate-repair', 'What should a timber fence and gate repair quote separate?'],
  ['guides/prepare-household-maintenance-enquiry', 'Can I compare an hourly rate with a fixed repair quote?'],
  ['guides/field-notes-cleaning-removals-preparation', 'How should I request cleaning for limestone or other stone pavers?'],
  ['guides/field-notes-doors-windows-screens-enquiry', 'What should I report about a sticking sliding window?'],
];
const read = file => load(restoreUnleyPhotoOrder(fs.readFileSync(new URL('../public/' + file, import.meta.url), 'utf8'),file));
for (const [route, question] of examples) test(`${route}: ${question}`, () => {
  const en=read(route+'/index.html'),zh=read('zh/'+route+'/index.html');
  const item=en('details').filter((_,n)=>en(n).find('summary').text()===question);
  assert.equal(item.length,1,'new question must answer a distinct customer intent');
  assert.ok(item.find('p').text().length>70);
  assert.equal(en('details').length,zh('details').length);
  for(const $ of [en,zh]){
    const graph=JSON.parse($('script[type="application/ld+json"]').first().text())['@graph'];
    const schema=graph.find(x=>x['@type']==='FAQPage').mainEntity;
    const visible=$('details').toArray().map(n=>({question:$(n).find('summary').text(),answer:$(n).find('p').text()}));
    assert.deepEqual(schema.map(x=>({question:x.name,answer:x.acceptedAnswer.text})),visible);
    assert.equal(new Set(visible.map(x=>x.question)).size,visible.length);
  }
});
test('duplicate stain, painting and IKEA questions are replaced while their substantive answers remain',()=>{
  for(const [route,old,kept]of [
    ['pressure-cleaning','Will pressure cleaning remove every driveway stain?','Can pressure cleaning remove every driveway stain?'],
    ['wall-patching-repair','Is painting included with wall patching?','Does a wall patch quote include painting?'],
    ['flat-pack-assembly','Can you assemble IKEA furniture or several items together?','Can I enquire about IKEA furniture assembly, and are you affiliated with IKEA?'],
  ]){const $=read('services/'+route+'/index.html'),questions=$('details summary').toArray().map(n=>$(n).text());assert.ok(!questions.includes(old));assert.ok(questions.includes(kept));}
});
test('all 210 published-baseline titles, H1, metadata, links, images and non-FAQ layout remain protected',()=>{
  const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/semrush-20261022-baseline.json',import.meta.url),'utf8'));
  assert.equal(baseline.pages.length,210);
  const affected=new Set(examples.map(x=>x[0]+'/index.html').flatMap(x=>[x,'zh/'+x]));
  const dig=s=>createHash('sha256').update(s).digest('hex');
  const p1Entries=new Set(['case-studies/goodwood-wall-repair/index.html','case-studies/modbury-timber-fence-repair-assessment/index.html','service-areas/north-north-east/modbury/index.html'].flatMap(x=>[x,'zh/'+x]));
  const p2Entries=new Set(['cabinet-drawer-repair','flyscreen-repair','pressure-cleaning'].flatMap(x=>[`services/${x}/index.html`,`zh/services/${x}/index.html`]));
  for(const old of baseline.pages){const $=read(old.file);
    assert.equal($('title').text(),old.title,old.file);assert.equal($('h1').text(),old.h1,old.file);assert.equal($('meta[name=description]').attr('content'),old.meta,old.file);
    const links=$('main a[href]').toArray().map(n=>$(n).attr('href'));
    if(p1Entries.has(old.file)){
      let cursor=0;for(const link of links)if(link===old.links[cursor])cursor++;assert.equal(cursor,old.links.length,old.file+' original links retained in order');
    }else assert.deepEqual(links,old.links,old.file);
    assert.deepEqual($('main img').toArray().map(n=>$(n).toString()),old.images,old.file);
    // The later approved P1 entry/FAQ changes have a separate released-baseline
    // contract in p1-local-entry.test.mjs. Title/H1/meta/images/links remain above.
    // Six P2 bodies have a narrower paragraph-level released-baseline contract.
    if(p1Entries.has(old.file)||p2Entries.has(old.file)||followupFiles.has(old.file)||seasonalFiles.has(old.file))continue;
    if(!affected.has(old.file))assert.equal(dig($('body').toString()),old.bodyHash,old.file);
    else{const body=$('body').clone();body.find('.faq-list').text('REVIEWED_FAQ_GROUP');body.find('.article-date time').attr('datetime','REVIEW_DATE').text('REVIEW_DATE');assert.equal(dig(body.toString()),old.maskedBodyHash,old.file);}
  }
});
