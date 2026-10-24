import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {load} from 'cheerio';
import {parse} from 'parse5';
const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/advisor-contacts-20261024.json',import.meta.url),'utf8'));
const hash=s=>createHash('sha256').update(s.replaceAll('\r\n','\n')).digest('hex');
test('only the four home/About pages add the contact section and its stylesheet; all other HTML stays unchanged',()=>{
 for(const [file,oldHash] of Object.entries(baseline.before)){
  let html=fs.readFileSync('public/'+file,'utf8');
  if(baseline.pages[file]){
   const nodes=[];const visit=n=>{nodes.push(n);for(const c of n.childNodes||[])visit(c)};visit(parse(html,{sourceCodeLocationInfo:true}));
   const additions=nodes.filter(n=>n.attrs?.some(a=>(a.name==='id'&&a.value==='advisors')||(n.tagName==='link'&&a.name==='href'&&a.value==='/assets/css/advisor-contacts.css')));
   assert.equal(additions.length,2,file);
   for(const n of additions.sort((a,b)=>b.sourceCodeLocation.startOffset-a.sourceCodeLocation.startOffset)){const p=n.sourceCodeLocation;html=html.slice(0,p.startOffset)+html.slice(p.endOffset)}
  }
  assert.equal(hash(html),oldHash,file+' preserves all pre-existing HTML');
 }
});
test('the four bilingual sections share precisely the supplied names, telephone links, email links and approved photos',()=>{
 const expected=[['Ella','0416 614 281','+61416614281','admin@melonemaintenance.com.au','ella'],['Felix','0403 202 949','+61403202949','handymanfelix.au2026@outlook.com','felix'],['Riley','0482 422 607','+61482422607','riley@melonemaintenance.com.au','riley']];
 for(const file of Object.keys(baseline.pages)){
  const $=load(fs.readFileSync('public/'+file,'utf8'));const cards=$('#advisors article');assert.equal(cards.length,3);
  cards.each((i,e)=>{const [name,phone,tel,email,image]=expected[i];assert.equal($(e).find('h3').text(),name);assert.equal($(e).find('.advisor-phone').text(),phone);assert.equal($(e).find('.advisor-phone').attr('href'),'tel:'+tel);assert.equal($(e).find('.advisor-email').text(),email);assert.equal($(e).find('.advisor-email').attr('href'),'mailto:'+email);assert.equal($(e).find('img').attr('src'),'/assets/images/advisors/'+image+'.webp')});
  assert.equal($('#advisors details').length,0);
  if(!file.includes('about/'))assert.equal($('#advisors .section-heading a').attr('href'),file.startsWith('zh/')?'/zh/about/#advisors':'/about/#advisors');
 }
});
