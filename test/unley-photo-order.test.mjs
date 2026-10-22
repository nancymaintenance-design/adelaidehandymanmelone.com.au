import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {load} from 'cheerio';
import {digest} from './helpers/p2-render-baseline.mjs';
import {restoreUnleyPhotoOrder} from './helpers/unley-photo-order.mjs';
const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/p2-20261022-baseline.json',import.meta.url),'utf8'));
test('Unley EN/ZH galleries swap only the first/fourth photos and retain captions and all other markup',()=>{
 for(const prefix of ['','zh/']){
  const file=prefix+'case-studies/unley-kitchen-cabinet-repair/index.html',html=fs.readFileSync(new URL('../public/'+file,import.meta.url),'utf8'),$=load(html);
  assert.deepEqual($('.case-photo-grid img').toArray().map(n=>$(n).attr('src').match(/unley-kitchen-cabinet-repair-0(\d)/)?.[1]),['4','2','3','1']);
  for(const selector of ['meta[property="og:image"]','meta[name="twitter:image"]'])assert.ok($(selector).attr('content').endsWith('unley-kitchen-cabinet-repair-04.png'));
  assert.equal(digest(restoreUnleyPhotoOrder(html,file)),baseline.pages.find(x=>x.file===file).sha256);
 }
});
