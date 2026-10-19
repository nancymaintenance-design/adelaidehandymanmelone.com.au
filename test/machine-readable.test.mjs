import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {load} from 'cheerio';
const root=path.resolve(import.meta.dirname,'../public'),origin='https://www.adelaidehandymanmelone.com.au';
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const fileFor=url=>{const route=new URL(url).pathname;return route.slice(1)+'index.html';};
const plain=s=>s.replace(/\s+/g,' ').trim();
test('all bilingual feed items are the existing visible content, not hidden keyword pages',()=>{
 for(const prefix of ['', 'zh/']){
  const feed=JSON.parse(read(prefix+'feed.json')),schema=JSON.parse(read(prefix+'schema-feed.json'));
  assert.equal(feed.version,'https://jsonfeed.org/version/1.1');assert.equal(feed.items.length,102);
  assert.equal(new Set(feed.items.map(i=>i.id)).size,102);
  assert.equal(schema['@type'],'DataFeed');assert.equal(schema.dataFeedElement.length,102);
  for(const item of feed.items){
   const $=load(read(fileFor(item.url))),graph=JSON.parse($('script[type="application/ld+json"]').first().text())['@graph'];
   assert.equal(item.title,plain($('main h1').first().text()),item.url);
   assert.equal(item.summary,$('meta[name="description"]').attr('content'));
   assert.equal(item.id,item.url);assert.ok(item.url.startsWith(origin+'/'+prefix));
   const body=load(item.content_html);assert.equal(body('script,style,form,nav,iframe').length,0);
   const text=plain(body.text()).toLowerCase();
   assert.ok(item.tags.length<=8&&item.tags.length>0);
   for(const tag of item.tags)assert.ok(text.includes(tag.toLowerCase()),`${item.url}: ${tag}`);
   const webpage=graph.find(n=>n['@type']==='WebPage');assert.deepEqual(webpage.keywords,item.tags);
   assert.equal(webpage['@id'],item.url+'#webpage');
   assert.equal(graph.find(n=>n['@type']==='LocalBusiness').telephone,'0416 614 281');
   const service=graph.find(n=>n['@type']==='Service'),article=graph.find(n=>n['@type']==='Article');
   if(service){assert.equal(webpage.mainEntity['@id'],service['@id']);assert.equal(service.serviceType,item.title);assert.ok(!('keywords' in service));}
   if(article)assert.equal(article.mainEntityOfPage['@id'],webpage['@id']);
   assert.equal($('link[data-machine-feed]').length,3);
   assert.ok(!item.date_modified&&!item.date_published,'Do not invent timestamps from date-only sources');
  }
 }
});
test('company and service catalogues describe the existing entity and listed services',()=>{
 for(const prefix of ['', 'zh/']){
  const $=load(read(prefix+'services/index.html')),graph=JSON.parse($('script[type="application/ld+json"]').first().text())['@graph'];
  const catalogue=graph.find(n=>n['@type']==='OfferCatalog'),business=graph.find(n=>n['@type']==='LocalBusiness');
  assert.ok(catalogue.itemListElement.length>=9);assert.equal(business.hasOfferCatalog['@id'],catalogue['@id']);
  assert.equal(business.legalName,'MEL ONE PROPERTY MAINTENANCE PTY LTD');
  for(const offer of catalogue.itemListElement){assert.ok(!('price' in offer));assert.ok(offer.itemOffered['@id'].startsWith(origin+'/'+prefix+'services/'));}
  const rss=load(read(prefix+'feed.xml'),{xmlMode:true});assert.equal(rss('rss').attr('version'),'2.0');assert.equal(rss('channel > item').length,102);
  assert.equal(rss('parsererror').length,0);assert.equal(rss('pubDate,lastBuildDate').length,0);
  for(const n of rss('item').toArray())assert.ok(rss(n).find('content\\:encoded').text().length>80);
  const cases=JSON.parse(read(prefix+'case-studies/feed.json'));
  assert.equal(cases.version,1);assert.ok(cases.items.every(i=>i.id===i.url&&i.keywords.length));
  const areas=JSON.parse(read(prefix+'service-areas/feed.json'));
  assert.ok(areas.regions.every(r=>r.suburbs.every(s=>s.keywords.length)));
 }
});
