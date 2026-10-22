import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {followupDigest,followupSnapshot,followupParagraphs} from './helpers/p1-followup-baseline.mjs';
const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/p1-followup-20261022-baseline.json',import.meta.url),'utf8'));
const read=f=>fs.readFileSync(new URL('../public/'+f,import.meta.url),'utf8');
test('202 other pages including both Adelaide CBD case pages remain byte-identical to released 4e2240c',()=>{
 let count=0;for(const old of baseline.pages)if(!old.route){assert.equal(followupDigest(read(old.file)),old.sha256,old.file);count++;}assert.equal(count,202);
});
for(const route of Object.keys(followupParagraphs))test(`${route}: concise EN/ZH paragraphs retain facts, photos, all links, headings, FAQ and layout`,()=>{
 for(const old of baseline.pages.filter(p=>p.route===route)){
  const now=followupSnapshot(read(old.file),route);assert.deepEqual(now.protectedCopy,old.protectedCopy,old.file);
  assert.equal(now.maskedHash,old.maskedHash,old.file+' outside approved paragraphs');
  const size=x=>x.paragraphs.map(p=>p.text).join(' ').length;assert.ok(size(now)<size(old)*0.85,old.file+' shorter repeated copy');
 }
});
