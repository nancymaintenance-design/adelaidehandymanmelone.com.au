import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {load} from 'cheerio';
import {p1BodyHash} from './helpers/p1-render-baseline.mjs';
import {restoreUnleyPhotoOrder} from './helpers/unley-photo-order.mjs';
const paths=['case-studies/goodwood-wall-repair/','case-studies/modbury-timber-fence-repair-assessment/','service-areas/north-north-east/modbury/'];
const read=file=>restoreUnleyPhotoOrder(fs.readFileSync(new URL('../public/'+file,import.meta.url),'utf8'),file);
const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/p1-20261022-baseline.json',import.meta.url),'utf8'));
test('Goodwood explains a distinct wall-patch enquiry and links to the matching service and local contact',()=>{
 const d=load(read(paths[0]+'index.html'));
 assert.ok(d('main').text().includes('Describe the patch, not a whole-room renovation'));
 assert.equal(d('main a[href="/contact/?suburb=goodwood"]').length,1);
 assert.ok(d('main a[href="/services/wall-patching-repair/"]').length>=2);
 assert.ok(d('main').text().includes('Wall patch completed'));
});
test('Modbury distinguishes assessment-only fence evidence from a separate garden-gate enquiry',()=>{
 for(const p of paths.slice(1)){
  const d=load(read(p+'index.html'));assert.ok(d('main').text().includes('This fence assessment does not document a gate repair'));
  assert.ok(d('main').text().includes('assessment'));
  assert.ok(d('main a[href="/services/fence-gate-repair/#timber-fence-gate-scope"]').length>=1);
 }
 const d=load(read(paths[1]+'index.html'));assert.equal(d('main a[href="/contact/?suburb=modbury"]').length,1);
 assert.ok(d('main').text().includes('Damage documented for assessment'));
});
test('six affected pages retain paired questions and visible FAQ matches JSON-LD',()=>{
 for(const route of paths)for(const prefix of ['','zh/']){
  const d=load(read(prefix+route+'index.html'));const graph=JSON.parse(d('script[type="application/ld+json"]').first().text())['@graph'];
  const faq=graph.find(x=>x['@type']==='FAQPage');assert.deepEqual(faq.mainEntity.map(x=>({question:x.name,answer:x.acceptedAnswer.text})),d('details').toArray().map(n=>({question:d(n).find('summary').text(),answer:d(n).find('p').text()})));
  assert.ok(d('[data-language-switch]').attr('href').includes(route));
 }
});
test('198 other HTML pages stay identical; P1 bodies retain their narrow contract and six P2 bodies have separate released-baseline checks',()=>{
 const affected=new Set(paths.flatMap(p=>[p+'index.html','zh/'+p+'index.html']));let count=0;
 const p2=new Set(['cabinet-drawer-repair','flyscreen-repair','pressure-cleaning'].flatMap(s=>[`services/${s}/index.html`,`zh/services/${s}/index.html`]));
 for(const p of baseline.pages)if(p2.has(p.file))continue;else if(!affected.has(p.file)){assert.equal(createHash('sha256').update(read(p.file).replaceAll('\r\n','\n')).digest('hex'),p.sha256,p.file);count++;}else assert.equal(p1BodyHash(read(p.file),p.file),p.maskedBodyHash,p.file);
 assert.equal(count,198);
});
