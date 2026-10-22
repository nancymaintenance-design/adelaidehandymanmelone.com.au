import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {p2Snapshot,digest} from './helpers/p2-render-baseline.mjs';
import {restoreUnleyPhotoOrder} from './helpers/unley-photo-order.mjs';
const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/p2-20261022-baseline.json',import.meta.url),'utf8'));
const read=file=>fs.readFileSync(new URL('../public/'+file,import.meta.url),'utf8');
test('202 other HTML pages stay identical and the later approved Unley gallery swap has its own narrow check',()=>{
 let count=0;for(const old of baseline.pages)if(!old.slug){assert.equal(digest(restoreUnleyPhotoOrder(read(old.file),old.file)),old.sha256,old.file);count++;}assert.equal(count,204);
});
for(const slug of ['cabinet-drawer-repair','flyscreen-repair','pressure-cleaning'])test(`${slug}: both languages shorten repeated body copy and retain FAQ, links, facts and layout`,()=>{
 for(const old of baseline.pages.filter(x=>x.slug===slug)){
  const now=p2Snapshot(read(old.file),slug);
  assert.deepEqual(now.protectedCopy,old.protectedCopy,old.file+' protected fields');
  assert.equal(now.maskedHash,old.maskedHash,old.file+' outside approved paragraphs');
  const size=items=>items.map(p=>p.text).join(' ').length;
  assert.ok(size(now.paragraphs)<size(old.paragraphs)*0.80,old.file+' edited copy must shrink by at least 20%');
 }
});
