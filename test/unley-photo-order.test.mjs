import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {load} from 'cheerio';
import {cabinetGardenSnapshot} from './helpers/cabinet-garden-baseline.mjs';
const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/cabinet-garden-20261022-baseline.json',import.meta.url),'utf8'));
test('Unley EN/ZH galleries retain the approved swap, captions and markup outside reviewed case paragraphs',()=>{
 for(const prefix of ['','zh/']){
  const file=prefix+'case-studies/unley-kitchen-cabinet-repair/index.html',html=fs.readFileSync(new URL('../public/'+file,import.meta.url),'utf8'),$=load(html);
  assert.deepEqual($('.case-photo-grid img').toArray().map(n=>$(n).attr('src').match(/unley-kitchen-cabinet-repair-0(\d)/)?.[1]),['4','2','3','1']);
  for(const selector of ['meta[property="og:image"]','meta[name="twitter:image"]'])assert.ok($(selector).attr('content').endsWith('unley-kitchen-cabinet-repair-04.png'));
  // Later approved body edits have their own frozen release contract. Keep the
  // complete image/head/link/FAQ and outside-paragraph checks rather than
  // requiring those five reviewed paragraphs to equal a pre-photo-swap release.
  const old=baseline.pages.find(x=>x.file===file),now=cabinetGardenSnapshot(html,'case-studies/unley-kitchen-cabinet-repair/');
  assert.deepEqual(now.protectedCopy,old.protectedCopy);
  assert.equal(now.maskedHash,old.maskedHash);
 }
});
