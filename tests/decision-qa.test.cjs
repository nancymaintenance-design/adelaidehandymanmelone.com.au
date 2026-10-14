const test = require('node:test');
const assert = require('node:assert/strict');
const buildFixture = require('./build-fixture.cjs');
const text = html => html.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/\s+/g, ' ').trim();

test('decision hub answers actual quote, repair and booking intent before a single short process', t => {
  const { read } = buildFixture(t);
  const html = read('how-it-works/index.html');
  const main = html.match(/<main[^>]*>([^]*?)<\/main>/)[1];
  assert.match(main, /Handyman Adelaide: Quotes &amp; Booking/);
  assert.equal((main.match(/class="answer-category"/g) || []).length, 5);
  const questions = [...main.matchAll(/<details[^>]*data-source-ids="([^"]+)"[^>]*>([^]*?)<\/details>/g)];
  assert.equal(questions.length, 22);
  for (const [id, terms] of [
    ['ADH-0512', ['travel', 'setup']], ['ADH-0511', ['estimate', 'fixed', 'scope']],
    ['ADH-0496', ['photos', 'on-site']], ['ADH-0497', ['labour', 'materials', 'travel', 'GST']],
    ['ADH-0057', ['rollers', 'track']], ['ADH-0102', ['length', 'load']],
    ['ADH-0091', ['board', 'fixing']], ['ADH-0118', ['sanding', 'painting']],
    ['ADH-0085', ['hinge', 'mounting']], ['ADH-0499', ['parts', 'compatible']],
    ['ADH-0501', ['09:00', '21:00', 'appointment']], ['ADH-0463', ['access', 'approve']]
  ]) {
    const row = questions.find(q => q[1].split(' ').includes(id));
    assert.ok(row, `Actual intent ${id} needs its own answer`);
    const answer = text(row[2].replace(/<summary>[^]*?<\/summary>/, ''));
    assert.ok(answer.length > 100, `${id}: substantive answer`);
    for (const term of terms) assert.ok(answer.toLowerCase().includes(term.toLowerCase()), `${id}: ${term}`);
  }
  assert.match(questions[0][0], /\bopen[ >]/);
  assert.ok(main.indexOf('answer-category') < main.indexOf('booking-process'));
  assert.doesNotMatch(main, /The eight steps|method-disclosure|journey-overview|method-notes-grid/);
  for (const id of ['prepare-request','group-jobs','initial-discussion','specialist-boundary','confirm-scope','prepare-visit','on-site-work','completion-next-steps','method-steps','method-preparation','method-expectations','method-faq-heading']) assert.match(main, new RegExp(`id="${id}"`));
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([^]*?)<\/script>/)[1])['@graph'].find(x=>x['@type']==='FAQPage');
  assert.equal(schema.mainEntity.length, 22);
  for (const row of questions) {
    const q = text(row[2].match(/<summary>([^]*?)<\/summary>/)[1]);
    const answer = text(row[2].match(/<p>([^]*?)<\/p>/)[1]);
    assert.ok(schema.mainEntity.some(x=>x.name===q && x.acceptedAnswer.text===answer), q);
  }
});

test('statement headings and local-selection copy reduce repetition while retaining factual geography', t => {
  const { read } = buildFixture(t);
  const routes = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>new URL(x[1]).pathname);
  let adelaide = 0, questions = 0;
  for (const route of routes) {
    const main = read(route.slice(1)+'index.html').match(/<main[^>]*>([^]*?)<\/main>/)[1].replace(/<h1[^>]*>[^]*?<\/h1>/g,'');
    adelaide += (text(main).match(/\bAdelaide\b/gi)||[]).length;
    if(route !== '/how-it-works/') questions += [...main.matchAll(/<h[23][^>]*>([^]*?)<\/h[23]>/g)].filter(x=>/\?/.test(x[1])).length;
  }
  assert.ok(adelaide < 700, `Non-H1 main-text Adelaide count ${adelaide}; baseline 967`);
  assert.ok(questions <= 5, `Question H2/H3 count ${questions}; baseline 57`);
  assert.match(text(read('index.html')), /handyman near me/i);
  assert.match(text(read('service-areas/index.html')), /Norwood.*Burnside.*Glenelg.*Marion/);
  assert.match(read('case-studies/north-adelaide-door-repair/index.html'), /North Adelaide/);
  assert.match(read('case-studies/adelaide-cbd-wall-repair/index.html'), /Adelaide CBD/);
});
