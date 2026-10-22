import test from 'node:test';
import {comparisonContextFiles,assertComparisonProtected} from './helpers/comparison-context-baseline.mjs';
import {cabinetGardenFiles} from './helpers/cabinet-garden-baseline.mjs';
import {frontAssemblyFiles} from './helpers/front-assembly-baseline.mjs';
import {screenWardrobeFiles} from './helpers/screen-wardrobe-baseline.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {seasonalDigest,seasonalSnapshot,seasonalParagraphs} from './helpers/seasonal-copy-baseline.mjs';
const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/seasonal-copy-20261022-baseline.json',import.meta.url),'utf8'));
const read=f=>fs.readFileSync(new URL('../public/'+f,import.meta.url),'utf8');
test('190 other pages retain their baseline or a narrowly reviewed comparison paragraph; CBD remains unchanged to released 7dcddd2',()=>{
 let count=0;for(const old of baseline.pages)if(!old.route&&!cabinetGardenFiles.has(old.file)&&!screenWardrobeFiles.has(old.file)&&!frontAssemblyFiles.has(old.file)){if(comparisonContextFiles.has(old.file)){assertComparisonProtected(read(old.file),old.file);count++;continue;}assert.equal(seasonalDigest(read(old.file)),old.sha256,old.file);count++;}assert.equal(count,190);
});
for(const route of Object.keys(seasonalParagraphs))test(`${route}: concise EN/ZH paragraphs retain facts, photos, all links, headings, FAQ and layout`,()=>{
 for(const old of baseline.pages.filter(p=>p.route===route)){
  if(comparisonContextFiles.has(old.file)){assertComparisonProtected(read(old.file),old.file);continue;}
  const now=seasonalSnapshot(read(old.file),route);assert.deepEqual(now.protectedCopy,old.protectedCopy,old.file);
  assert.equal(now.maskedHash,old.maskedHash,old.file+' outside approved paragraphs');
  const size=x=>x.paragraphs.map(p=>p.text).join(' ').length;assert.ok(size(now)<size(old)*0.85,old.file+' shorter repeated copy');
 }
});
