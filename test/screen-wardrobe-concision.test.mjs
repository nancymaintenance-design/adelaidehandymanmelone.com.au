import {serviceDecisionFiles,assertServiceDecisionProtected} from './helpers/service-decision-baseline.mjs';
import test from 'node:test';
import {comparisonContextFiles,assertComparisonProtected} from './helpers/comparison-context-baseline.mjs';
import {cabinetGardenFiles} from './helpers/cabinet-garden-baseline.mjs';
import {frontAssemblyFiles} from './helpers/front-assembly-baseline.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {screenWardrobeDigest,screenWardrobeSnapshot,screenWardrobeParagraphs} from './helpers/screen-wardrobe-baseline.mjs';
const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/screen-wardrobe-20261022-baseline.json',import.meta.url),'utf8'));
const read=f=>fs.readFileSync(new URL('../public/'+f,import.meta.url),'utf8');
test('198 other pages retain their baseline or a narrowly reviewed comparison paragraph; CBD remains unchanged to released abd886d',()=>{
 let count=0;for(const old of baseline.pages)if(!old.route&&!cabinetGardenFiles.has(old.file)&&!frontAssemblyFiles.has(old.file)){if(serviceDecisionFiles.has(old.file)){assertServiceDecisionProtected(read(old.file),old.file);count++;continue;}if(comparisonContextFiles.has(old.file)){assertComparisonProtected(read(old.file),old.file);count++;continue;}assert.equal(screenWardrobeDigest(read(old.file)),old.sha256,old.file);count++;}assert.equal(count,198);
});
for(const route of Object.keys(screenWardrobeParagraphs))test(`${route}: concise EN/ZH paragraphs retain facts, photos, all links, headings, FAQ and layout`,()=>{
 for(const old of baseline.pages.filter(p=>p.route===route)){
  if(comparisonContextFiles.has(old.file)){assertComparisonProtected(read(old.file),old.file);continue;}
  const now=screenWardrobeSnapshot(read(old.file),route);assert.deepEqual(now.protectedCopy,old.protectedCopy,old.file);
  const removed=old.file==='case-studies/stirling-flat-pack-wardrobe-assembly/index.html'?'flat pack assembly':old.file==='zh/case-studies/henley-beach-sliding-screen-door-repair/index.html'?'推拉门维修':null;
  const expected=old.derivedKeywords.map(list=>removed?[...list.filter(x=>x!==removed),old.protectedCopy.headings[2]]:list);
  assert.deepEqual(now.derivedKeywords,expected,old.file+' exact derived keyword delta only');
  assert.equal(now.maskedHash,old.maskedHash,old.file+' outside approved paragraphs');
  const size=x=>x.paragraphs.map(p=>p.text).join(' ').length;assert.ok(size(now)<size(old)*0.85,old.file+' shorter repeated copy');
 }
});
