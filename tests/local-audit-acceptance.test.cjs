const test = require('node:test');
const assert = require('node:assert/strict');
const buildFixture = require('./build-fixture.cjs');
const { compareApprovedDeltas, digest, imageGuards } = require('../scripts/local-audit-semantic-deltas.cjs');

// A legacy 780px hint overfetches a photograph painted in a 320px side column.
test('compact single service photographs advertise the actual desktop and intrinsic mobile slots', t => {
  const { read } = buildFixture(t);
  for (const slug of ['home-electrical-repairs', 'interior-repairs-assembly', 'doors-windows-screens', 'garden-landscape-care', 'outdoor-structures-fences-pools', 'home-repairs-renovation-support', 'cleaning-removals-specialist-care']) {
    const html = read(`services/${slug}/index.html`);
    const intro = html.match(/class="wrap desktop-service-intro"[^]*?<\/figure>/)?.[0];
    assert.ok(intro, slug + ': shared introduction');
    const images = [...intro.matchAll(/<(?:img|source)\b[^>]*sizes="([^"]*)"[^>]*>/g)];
    assert.ok(images.length >= 2, slug + ': picture sources');
    for (const [, sizes] of images) {
      // Original intake PNGs are 1448x1086 (4:3); derivative decode rounding
      // must not become the source of the authored slot expectation.
      assert.equal(sizes, '(max-width: 520px) min(calc(100vw - 36px), 320.00px), (max-width: 650px) min(calc(100vw - 40px), 320.00px), (max-width: 850px) min(calc(100vw - 40px), 373.33px), 320px', slug + ': sizes must match the 320px side column and 240/280px intrinsic caps');
    }
  }
});

test('approved semantic deltas reject changes to H1, facts, URLs, controls, images and unapproved text', () => {
  const immutable = require('./fixtures/local-audit-immutable-baseline.json');
  const historical = Object.entries(immutable.h1).map(([route,h1]) => ({ route, title:'Original title',meta:[],canonical:'https://www.adelaidehandymanmelone.com.au'+route,controls:['<button>Menu</button>'],images:[[['src','/original.png'],['alt','Original evidence'],['width','600'],['height','450'],['sizes','300px']]],schema:[],text:'Original body',headings:h1.map(text=>['H1',text]),links:[['/contact/','Contact']],ids:['main'] }));
  const current = structuredClone(historical); current[0].text='Approved useful answer';
  const manifest = {historicalDigest:digest(historical),protectedSourceHashes:{},...imageGuards(historical),deltas:{[current[0].route+':text']:{before:digest('Original body'),approved:digest('Approved useful answer')}}};
  assert.equal(compareApprovedDeltas(current,historical,manifest).routes,102);
  const cases = [
    ['H1', p=>{p[0].headings[0][1]='Changed H1';},/immutable H1/],
    ['canonical',p=>{p[0].canonical='https://wrong.example/';},/immutable canonical/],
    ['controls',p=>{p[0].controls=[];},/immutable controls/],
    ['image bytes/identity URL',p=>{p[0].images[0][0][1]='/replacement.png';},/original image/],
    ['image size outside seven service slots',p=>{p[0].images[0].at(-1)[1]='999px';},/image slot/],
    ['link URL',p=>{p[0].links[0][0]='/invented/';},/unapproved difference/],
    ['unapproved body',p=>{p[0].text='A new unsupported promise';},/outside approved/],
    ['new fragment removal',p=>{p[0].ids=[];},/fragment.*removed/],
    ['business schema',p=>{p[0].schema=[{'priceRange':'$1'}];},/unapproved difference/],
  ];
  for(const [name,mutate,pattern] of cases) {const changed=structuredClone(current);mutate(changed);assert.throws(()=>compareApprovedDeltas(changed,historical,manifest),pattern,name);}
  const changedFacts={...manifest,protectedSourceHashes:{'src/content-pack/business-facts.json':'invalid'}};
  assert.throws(()=>compareApprovedDeltas(current,historical,changedFacts),/confirmed business facts/);
});
