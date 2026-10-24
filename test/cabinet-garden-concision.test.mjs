import {serviceDecisionFiles,assertServiceDecisionProtected} from './helpers/service-decision-baseline.mjs';
import test from 'node:test';
import {comparisonContextFiles,assertComparisonProtected} from './helpers/comparison-context-baseline.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {cabinetGardenDigest,cabinetGardenSnapshot,cabinetGardenParagraphs} from './helpers/cabinet-garden-baseline.mjs';
const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/cabinet-garden-20261022-baseline.json',import.meta.url),'utf8'));
const read=f=>fs.readFileSync(new URL('../public/'+f,import.meta.url),'utf8');
test('206 other pages retain their baseline or a narrowly reviewed comparison paragraph; CBD remains unchanged to released ca9c7b4',()=>{
 let count=0;for(const old of baseline.pages)if(!old.route){if(serviceDecisionFiles.has(old.file)){assertServiceDecisionProtected(read(old.file),old.file);count++;continue;}if(comparisonContextFiles.has(old.file)){assertComparisonProtected(read(old.file),old.file);count++;continue;}assert.equal(cabinetGardenDigest(read(old.file)),old.sha256,old.file);count++;}assert.equal(count,206);
});
for(const route of Object.keys(cabinetGardenParagraphs))test(`${route}: concise EN/ZH paragraphs retain facts, photos, all links, headings, FAQ and layout`,()=>{
 for(const old of baseline.pages.filter(p=>p.route===route)){
  if(comparisonContextFiles.has(old.file)){assertComparisonProtected(read(old.file),old.file);continue;}
  const now=cabinetGardenSnapshot(read(old.file),route);assert.deepEqual(now.protectedCopy,old.protectedCopy,old.file);
  assert.equal(now.maskedHash,old.maskedHash,old.file+' outside approved paragraphs');
  const size=x=>x.paragraphs.map(p=>p.text).join(' ').length;assert.ok(size(now)<size(old)*0.85,old.file+' shorter repeated copy');
 }
});
