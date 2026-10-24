import {serviceDecisionFiles,assertServiceDecisionProtected} from './helpers/service-decision-baseline.mjs';
import test from 'node:test';
import {comparisonContextFiles,assertComparisonProtected} from './helpers/comparison-context-baseline.mjs';
import {cabinetGardenFiles} from './helpers/cabinet-garden-baseline.mjs';
import {frontAssemblyFiles} from './helpers/front-assembly-baseline.mjs';
import {screenWardrobeFiles} from './helpers/screen-wardrobe-baseline.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {followupDigest,followupSnapshot,followupParagraphs} from './helpers/p1-followup-baseline.mjs';
import {seasonalFiles} from './helpers/seasonal-copy-baseline.mjs';
const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/p1-followup-20261022-baseline.json',import.meta.url),'utf8'));
const read=f=>fs.readFileSync(new URL('../public/'+f,import.meta.url),'utf8');
test('182 other pages retain their baseline or independent paragraph checks; CBD remains unchanged',()=>{
 let count=0;for(const old of baseline.pages)if(!old.route&&!cabinetGardenFiles.has(old.file)&&!seasonalFiles.has(old.file)&&!screenWardrobeFiles.has(old.file)&&!frontAssemblyFiles.has(old.file)){if(serviceDecisionFiles.has(old.file)){assertServiceDecisionProtected(read(old.file),old.file);count++;continue;}if(comparisonContextFiles.has(old.file)){assertComparisonProtected(read(old.file),old.file);count++;continue;}assert.equal(followupDigest(read(old.file)),old.sha256,old.file);count++;}assert.equal(count,182);
});
for(const route of Object.keys(followupParagraphs))test(`${route}: concise EN/ZH paragraphs retain facts, photos, all links, headings, FAQ and layout`,()=>{
 for(const old of baseline.pages.filter(p=>p.route===route)){
  if(comparisonContextFiles.has(old.file)){assertComparisonProtected(read(old.file),old.file);continue;}
  const now=followupSnapshot(read(old.file),route);assert.deepEqual(now.protectedCopy,old.protectedCopy,old.file);
  assert.equal(now.maskedHash,old.maskedHash,old.file+' outside approved paragraphs');
  const size=x=>x.paragraphs.map(p=>p.text).join(' ').length;assert.ok(size(now)<size(old)*0.85,old.file+' shorter repeated copy');
 }
});
