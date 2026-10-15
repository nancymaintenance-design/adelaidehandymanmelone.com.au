// October 14 stays immutable. Only exact fields already approved in Task 1/2
// may differ; source identity, facts, H1, controls and image identity stay strict.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const protectedImages = images => images.map(attrs => attrs.filter(([name]) => !['sizes', 'data-image-layout'].includes(name)));
const normalizeSlots = (images, exceptions = []) => images.map((attrs,index) => exceptions.includes(index) ? attrs.filter(([name,value]) => name !== 'sizes' && !(name === 'data-image-layout' && value === 'service-intro')) : attrs);
function imageGuards(pages) {
  const alts = ['Household electrical work','Home repair work','Door and window maintenance details','Garden care','Outdoor fence and structure','Home repair and renovation interior','Household removals and cleaning'];
  const imageSlotExceptions = {}, imageLayoutDigests = {};
  for(const page of pages) {
    const exceptions=[];
    if(page.route.startsWith('/services/')) for(const [index,attrs] of page.images.entries()) if(attrs.some(([name,value]) => name === 'alt' && alts.includes(value))) {
      exceptions.push(index);
      if(page.images[index-1]?.some(([name]) => name === 'type')) exceptions.push(index-1);
    }
    if(exceptions.length) imageSlotExceptions[page.route]=exceptions;
    imageLayoutDigests[page.route]=digest(normalizeSlots(page.images,exceptions));
  }
  return {imageSlotExceptions,imageLayoutDigests};
}
function compareApprovedDeltas(current, historical, manifest) {
  assert.equal(current.length, 102);
  assert.deepEqual(current.map(row => row.route), historical.map(row => row.route), 'route identity/order');
  assert.equal(digest(historical), manifest.historicalDigest, 'historical baseline changed');
  const immutable = require('../tests/fixtures/local-audit-immutable-baseline.json');
  const seen = new Set();
  for (let index = 0; index < current.length; index++) {
    const now = current[index], before = historical[index];
    assert.deepEqual(now.headings.filter(([level]) => level === 'H1').map(([,text]) => text), immutable.h1[now.route], now.route + ': immutable H1');
    for(const id of before.ids) assert.ok(now.ids.includes(id),now.route + ': original fragment/control ID removed: ' + id);
    assert.deepEqual(protectedImages(now.images), protectedImages(before.images), now.route + ': original image URLs/alt/dimensions/attributes');
    assert.equal(digest(normalizeSlots(now.images,manifest.imageSlotExceptions[now.route])),manifest.imageLayoutDigests[now.route],now.route + ': outside approved image slot deltas');
    for (const field of ['title', 'meta', 'canonical', 'controls']) assert.deepEqual(now[field], before[field], now.route + ': immutable ' + field);
    for (const field of ['schema', 'text', 'headings', 'links', 'ids']) {
      const key = now.route + ':' + field, delta = manifest.deltas[key];
      if (delta) {
        assert.equal(digest(before[field]), delta.before, key + ': old value');
        assert.equal(digest(now[field]), delta.approved, key + ': outside approved Task 1/2 delta');
        seen.add(key);
      } else assert.deepEqual(now[field], before[field], key + ': unapproved difference');
    }
  }
  assert.deepEqual([...seen].sort(), Object.keys(manifest.deltas).sort(), 'all deltas consumed exactly');
  for (const [file, expected] of Object.entries(manifest.protectedSourceHashes)) {
    const actual = crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
    assert.equal(actual, expected, file + ': confirmed business facts/source identity changed');
  }
  const byRoute=new Map(current.map(page=>[page.route,page])); let fragments=0;
  for(const page of current) for(const [href] of page.links) {
    if(!href || /^(?:tel:|mailto:)/.test(href)) continue;
    const target=new URL(href,'https://www.adelaidehandymanmelone.com.au'+page.route);
    if(target.origin!=='https://www.adelaidehandymanmelone.com.au'||!target.hash)continue;
    assert.ok(byRoute.get(target.pathname)?.ids.includes(decodeURIComponent(target.hash.slice(1))),page.route + ': missing fragment '+href);fragments++;
  }
  return { routes: current.length, approvedFieldDeltas: seen.size, protectedImages: current.reduce((n,p) => n + p.images.length, 0), fragments };
}
module.exports = { compareApprovedDeltas, digest, protectedImages, imageGuards };
