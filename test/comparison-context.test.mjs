import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {comparisonContextDigest,comparisonContextSnapshot,comparisonContextParagraphs,assertComparisonProtected} from './helpers/comparison-context-baseline.mjs';
const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/comparison-context-20261022-baseline.json',import.meta.url),'utf8'));
const read=file=>fs.readFileSync(new URL('../public/'+file,import.meta.url),'utf8');
test('194 other HTML pages including CBD remain identical to the preceding local candidate',()=>{
 let n=0;for(const old of baseline.pages)if(!old.route){assert.equal(comparisonContextDigest(read(old.file)),old.sha256,old.file);n++;}assert.equal(n,194);
});
for(const route of Object.keys(comparisonContextParagraphs))test(`${route}: only the bilingual comparison explanation changes; facts, FAQ, photos and links remain`,()=>{
 for(const old of baseline.pages.filter(r=>r.route===route)){
  const html=read(old.file),now=comparisonContextSnapshot(html,route);assertComparisonProtected(html,old.file);
  assert.notEqual(now.paragraphs[0].text,old.paragraphs[0].text,old.file+' substantive comparison revision');
 }
});
