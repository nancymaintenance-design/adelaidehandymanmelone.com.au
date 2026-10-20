import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {load} from 'cheerio';
import {removePublicReferenceLinks} from '../src/public-reference-policy.mjs';

// Independent customer-approved destinations: removal must not affect these.
const retained=[
  'https://abr.business.gov.au/ABN/View?abn=39666325408',
  'https://share.google/bnkU7OE83VYCSh44T',
  'https://www.instagram.com/melone.maintenance1/',
  'https://www.youtube.com/@MelOneMaintenance',
  'https://www.tiktok.com/@melonemaintenance5',
  'https://maps.app.goo.gl/rtHK3cyEqyp7kiea8',
];
const disallowed=/https?:\/\/(?:business\.gov\.au|(?:www\.)?cbs\.sa\.gov\.au|cdn\.environment\.sa\.gov\.au|www\.(?:asbestos\.sa\.gov\.au|atfa\.com\.au|consumerprotection\.wa\.gov\.au|gyprock\.com\.au|legislation\.sa\.gov\.au|phifer\.com|productsafety\.gov\.au|sa\.gov\.au|safework\.sa\.gov\.au|selleys\.com\.au|yourhome\.gov\.au)|ardexaustralia\.com)\//;

test('reference removal drops citation-only blocks but retains meaningful prose and allowed links',()=>{
  const url='https://cbs.sa.gov.au/find-a-licence-holder';
  const prefix='<html><body><h1>Existing service</h1><p>Leave unknown material undisturbed.</p>';
  const suffix='<a href="/services/door-repair/">Door repairs</a><a href="https://abr.business.gov.au/ABN/View?abn=39666325408">ABN</a><iframe src="https://www.google.com/maps?q=63%20Pirie%20St"></iframe></body></html>';
  assert.equal(removePublicReferenceLinks(prefix+`<p>Read <a href="${url}">CBS</a> for the general guidance; the actual product and work still need assessment.</p><ul><li><a href="${url}">CBS</a></li><li><a href="/contact/">Contact us</a></li></ul>`+suffix),prefix+'<ul><li><a href="/contact/">Contact us</a></li></ul>'+suffix);
  assert.equal(removePublicReferenceLinks(prefix+`<p>Check <a href="${url}">the licence</a> before approving work.</p>`+suffix),prefix+'<p>Check the licence before approving work.</p>'+suffix);
  assert.equal(removePublicReferenceLinks(prefix+suffix),prefix+suffix);
  assert.equal(removePublicReferenceLinks(prefix+`<div class="desktop-topic-unit"> <p><a href="${url}">CBS</a></p> </div>`+suffix),prefix+suffix);
  assert.throws(()=>removePublicReferenceLinks(prefix+`<script type="application/ld+json">{"url":"${url}"}</script>`+suffix),/remains in markup or structured data/);
});

test('published bilingual HTML and machine feeds contain no removed reference destinations',()=>{
  const routes=[...fs.readFileSync('public/sitemap.xml','utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
  const seen=new Set();
  for(const route of routes){
    const html=fs.readFileSync(path.join('public',route.slice(1),'index.html'),'utf8'),$=load(html);
    assert.doesNotMatch(html,disallowed,route);
    $('a[href^="http"]').each((i,a)=>{const href=$(a).attr('href');if(!href.includes('adelaidehandymanmelone.com.au')){assert.ok(retained.includes(href),route+': unexpected external link '+href);seen.add(href);}});
    assert.ok(!$('main p').toArray().some(e=>/^Read\s+for the general guidance/.test($(e).text())),route+': dangling citation introduction');
    assert.ok(!$('.desktop-topic-unit').toArray().some(e=>!$(e).text().trim()&&!$(e).find('img,iframe,input,button').length),route+': empty topic column');
  }
  assert.deepEqual([...seen].sort(),[...retained].sort());
  for(const prefix of ['','zh/'])for(const file of ['feed.json','feed.xml','schema-feed.json','llms.txt','case-studies/feed.json','service-areas/feed.json']){
    assert.doesNotMatch(fs.readFileSync(path.join('public',prefix,file),'utf8'),disallowed,prefix+file);
  }
});

test('removing citations leaves genuine safety guidance and service links in both languages',()=>{
  for(const prefix of ['','zh/']){
    const $=load(fs.readFileSync('public/'+prefix+'services/home-repairs-renovation-support/index.html','utf8'));
    assert.match($('main').text(),prefix?/石棉/:/asbestos/);
    assert.match($('main').text(),prefix?/铅/:/lead/);
    assert.ok($('a[href="/'+prefix+'contact/"]').length);
    assert.ok($('h1').text().trim());
  }
});
