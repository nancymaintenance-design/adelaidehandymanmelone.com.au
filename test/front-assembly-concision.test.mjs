import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {frontAssemblyDigest,frontAssemblySnapshot,frontAssemblyParagraphs} from './helpers/front-assembly-baseline.mjs';
const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/front-assembly-20261022-baseline.json',import.meta.url),'utf8'));
const read=f=>fs.readFileSync(new URL('../public/'+f,import.meta.url),'utf8');
test('206 other pages including both Adelaide CBD case pages remain byte-identical to released da20294',()=>{
 let count=0;for(const old of baseline.pages)if(!old.route){assert.equal(frontAssemblyDigest(read(old.file)),old.sha256,old.file);count++;}assert.equal(count,206);
});
for(const route of Object.keys(frontAssemblyParagraphs))test(`${route}: concise EN/ZH paragraphs retain facts, photos, all links, headings, FAQ and layout`,()=>{
 for(const old of baseline.pages.filter(p=>p.route===route)){
  const now=frontAssemblySnapshot(read(old.file),route);assert.deepEqual(now.protectedCopy,old.protectedCopy,old.file);
  if(route.includes('north-adelaide'))assert.doesNotMatch(now.paragraphs.map(p=>p.text).join(' '),/latch and strike adjustment|门闩与门框扣板的调整/,old.file+' photos do not establish strike adjustment');
  assert.equal(now.maskedHash,old.maskedHash,old.file+' outside approved paragraphs');
  const size=x=>x.paragraphs.map(p=>p.text).join(' ').length;assert.ok(size(now)<size(old)*0.85,old.file+' shorter repeated copy');
 }
});
