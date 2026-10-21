import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {generateLlmsIndex} from '../src/llms-index.mjs';

const origin='https://www.adelaidehandymanmelone.com.au';
function fixture(t) {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mel-llms-'));
  t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  for(const route of ['/about/','/zh/about/']){
    fs.mkdirSync(path.join(dir,route),{recursive:true});
    fs.copyFileSync('public'+route+'index.html',path.join(dir,route,'index.html'));
  }
  fs.copyFileSync('public/sitemap.xml',path.join(dir,'sitemap.xml'));
  return {siteDir:dir,origin,selection:[{group:'company',route:'/about/'}]};
}

test('llms generator follows changed body text without changing HTML and is deterministic', t=>{
  const options=fixture(t),file=path.join(options.siteDir,'about/index.html');
  const original=fs.readFileSync(file,'utf8');
  const changed=original.replaceAll('Meet our handyman team, see','Discuss a room-by-room repair list with MEL ONE. See');
  assert.notEqual(changed,original);
  fs.writeFileSync(file,changed);
  generateLlmsIndex(options);
  const first=fs.readFileSync(path.join(options.siteDir,'llms.txt'),'utf8');
  assert.match(first,/Discuss a room-by-room repair list with MEL ONE\./);
  assert.equal(fs.readFileSync(file,'utf8'),changed);
  generateLlmsIndex(options);
  assert.equal(fs.readFileSync(path.join(options.siteDir,'llms.txt'),'utf8'),first);
});

for(const [name,mutate] of [
  ['missing translation',o=>fs.renameSync(path.join(o.siteDir,'zh/about/index.html'),path.join(o.siteDir,'zh/about/missing.html'))],
  ['noindex page',o=>{const p=path.join(o.siteDir,'about/index.html');fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace('index,follow','noindex,follow'));}],
  ['wrong canonical',o=>{const p=path.join(o.siteDir,'zh/about/index.html');fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace(`rel="canonical" href="${origin}/zh/about/"`,`rel="canonical" href="${origin}/about/"`));}],
  ['wrong language',o=>{const p=path.join(o.siteDir,'zh/about/index.html');fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace('lang="zh-Hans"','lang="en-AU"'));}],
  ['missing reciprocal alternate',o=>{const p=path.join(o.siteDir,'zh/about/index.html');fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace(/<link[^>]*hreflang="en-AU"[^>]*>/,''));}],
  ['page absent from sitemap',o=>{const p=path.join(o.siteDir,'sitemap.xml');fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace(`<loc>${origin}/zh/about/</loc>`,''));}],
  ['duplicate selected owner',o=>o.selection.push({group:'services',route:'/about/'})],
  ['private route',o=>{o.selection=[{group:'company',route:'/admin/'}];}],
  ['path traversal',o=>{o.selection=[{group:'company',route:'/../private/'}];}],
  ['unknown grouping',o=>{o.selection=[{group:'invented',route:'/about/'}];}],
]) test(`invalid ${name} fails before replacing existing indexes`,t=>{
  const options=fixture(t);
  for(const file of ['llms.txt','zh/llms.txt'])fs.writeFileSync(path.join(options.siteDir,file),'last valid index');
  mutate(options);
  assert.throws(()=>generateLlmsIndex(options),/llms|ENOENT/i);
  for(const file of ['llms.txt','zh/llms.txt'])assert.equal(fs.readFileSync(path.join(options.siteDir,file),'utf8'),'last valid index');
});
