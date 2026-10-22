import test from 'node:test';
import {cabinetGardenFiles} from './helpers/cabinet-garden-baseline.mjs';
import {frontAssemblyFiles} from './helpers/front-assembly-baseline.mjs';
import {screenWardrobeFiles} from './helpers/screen-wardrobe-baseline.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {p2Snapshot,digest} from './helpers/p2-render-baseline.mjs';
import {restoreUnleyPhotoOrder} from './helpers/unley-photo-order.mjs';
import {followupFiles} from './helpers/p1-followup-baseline.mjs';
import {seasonalFiles} from './helpers/seasonal-copy-baseline.mjs';
const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/p2-20261022-baseline.json',import.meta.url),'utf8'));
const read=file=>fs.readFileSync(new URL('../public/'+file,import.meta.url),'utf8');
test('176 other pages retain the normalized prior baseline; later bodies have independent paragraph checks',()=>{
 let count=0;for(const old of baseline.pages)if(!old.slug&&!cabinetGardenFiles.has(old.file)&&!followupFiles.has(old.file)&&!seasonalFiles.has(old.file)&&!screenWardrobeFiles.has(old.file)&&!frontAssemblyFiles.has(old.file)){assert.equal(digest(restoreUnleyPhotoOrder(read(old.file),old.file)),old.sha256,old.file);count++;}assert.equal(count,176);
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
