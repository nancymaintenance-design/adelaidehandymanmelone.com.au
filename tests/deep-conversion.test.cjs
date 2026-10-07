const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function walk(dir) { return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : e.name.endsWith('.html') ? [path.join(dir,e.name)] : []); }
function visible(file) { return fs.readFileSync(file,'utf8').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' '); }
const forbidden = /contact point for household-maintenance enquiries|discusses scope, access and availability|referred to an appropriately qualified specialist|Keywords covered by this case|From the first photos to the final questions|Formal inspections, approvals and certifications must be obtained|check availability|An enquiry starts the conversation|search systems|Google and AI|search engines and AI|discuss a suitable next step|discuss the suitable next step|MEL ONE can review the list as an enquiry|clear questions, supporting photos and a discussion of next steps/i;
test('rendered customer journey gives service assessment rather than deflection, diagnosis burden or editorial copy', () => {
 const files = walk(path.join(root,'public'));
 const hits = files.flatMap(file => { const m=visible(file).match(forbidden); return m ? [{file:path.relative(root,file),copy:m[0]}] : []; });
 assert.deepEqual(hits, [], JSON.stringify(hits,null,2));
});
test('first screen and contact route offer an assessment and quote with optional email photos', () => {
 const home=visible(path.join(root,'public/index.html'));
 assert.match(home, /assessment/i); assert.match(home,/quote/i);
 const contact=visible(path.join(root,'public/contact/index.html'));
 assert.match(contact,/photos.{0,60}(?:optional|if available)|optional.{0,60}photos/i);
 assert.match(contact, /MEL ONE/i);
});
test('customer FAQ answers match their schema and optional photos use the existing email route', () => {
 const files = walk(path.join(root,'public'));
 const decode = value => String(value).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#(?:0?39|x27);/gi,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();
 let answers=0;
 for(const file of files) {
  const raw=fs.readFileSync(file,'utf8');
  const body=decode(visible(file));
  assert.doesNotMatch(body, /\bUpload (?:photos|images|elevation)/i, path.relative(root,file));
  for(const block of raw.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
   const data=JSON.parse(block[1]);
   const graph=data['@graph'] || [data];
   for(const faq of graph.filter(v=>v['@type']==='FAQPage')) for(const q of faq.mainEntity) {
    assert.ok(body.includes(decode(q.name)), path.relative(root,file)+': visible question');
    assert.ok(body.includes(decode(q.acceptedAnswer.text)), path.relative(root,file)+': visible answer');
    answers++;
   }
  }
 }
 assert.ok(answers>0,'real rendered FAQ answers checked');
 const contact=fs.readFileSync(path.join(root,'public/contact/index.html'),'utf8');
 assert.match(contact,/admin@melonemaintenance\.com\.au/);
 assert.doesNotMatch(contact, /type="file"/i,'form offers no attachment upload');
});

test('guides, cases and service metadata contain customer work rather than internal copy rationale', () => {
 const bad=/original general enquiry guidance|general enquiry guidance|household-maintenance conversation|maintenance conversation|next conversation|expect from the conversation|stronger than a generic repair description|more useful than a generic bathroom image|why a repair page benefits|Start a conversation about outdoor timber/i;
 const files=walk(path.join(root,'public'));
 assert.deepEqual(files.flatMap(file=>bad.test(visible(file)+' '+fs.readFileSync(file,'utf8').match(/<meta[^>]*description[^>]*>/g)?.join(' '))?[path.relative(root,file)]:[]),[]);
});
test('Modbury service question lists the actual services, not only a quote appointment', () => {
 const raw=fs.readFileSync(path.join(root,'public/service-areas/north-north-east/modbury/index.html'),'utf8');
 const schema=[...raw.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m=>JSON.parse(m[1])['@graph']||[JSON.parse(m[1])]);
 const answer=schema.find(s=>s['@type']==='FAQPage').mainEntity.find(q=>q.name==='What handyman services are available in Modbury?').acceptedAnswer.text;
 for(const service of [/shower screen/i,/door.*window.*flyscreen/i,/roof.*gutter.*exterior/i,/garden.*property/i,/fence.*gate/i,/cleaning.*handyman/i]) assert.match(answer,service);
});
test('method and case preparation do not direct customers to collect a required photo set', () => {
 const method=visible(path.join(root,'public/how-it-works/index.html'));
 assert.doesNotMatch(method,/Include clear photos taken safely/i);
 const photos=/take one (?:wide|wider) photo|send a full image of the doors|provide one broad image|Include a photo of the full door/i;
 assert.deepEqual(walk(path.join(root,'public/case-studies')).filter(f=>photos.test(visible(f))),[]);
});

