// Local evidence only. No network requests, writes to .seo-cache/, never deploys.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'public');
const cache = path.join(root, '.seo-cache');
const mode = process.argv[2] || 'candidate';
if (!['baseline', 'candidate'].includes(mode)) throw new Error('Expected baseline or candidate');
const decode = value => value.replace(/&amp;/g, '&').replace(/&#039;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const text = value => decode(value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
const sitemap = fs.readFileSync(path.join(output, 'sitemap.xml'), 'utf8');
const pages = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, url]) => {
  const route = new URL(decode(url)).pathname;
  const html = fs.readFileSync(path.join(output, route.slice(1), 'index.html'), 'utf8');
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
  const editorial = main.replace(/<(?:aside|form|nav)\b[^>]*>[\s\S]*?<\/(?:aside|form|nav)>/g, '').replace(/<section class="contact-band">[\s\S]*?<\/section>/g, '');
  const headings = [...editorial.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/g)].map(m => ({level:Number(m[1]), text:text(m[2])}));
  const links = [...editorial.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map(m => ({href:decode(m[1]),text:text(m[2])}));
  const violations = [];
  if (headings.filter(h => h.level === 1).length !== 1) violations.push('H1 count');
  let level = 0; for (const h of headings) { if (h.level > level + 1) violations.push('Heading jump: ' + h.text); level = h.level; }
  for (const link of links.filter(l => l.href.startsWith('/'))) {
    const target = new URL(link.href, 'https://www.adelaidehandymanmelone.com.au');
    const file = path.join(output, target.pathname.slice(1), target.pathname.endsWith('/') ? 'index.html' : '');
    if (!fs.existsSync(file)) violations.push('Broken link: ' + link.href);
    else if (target.hash && !new RegExp(`id=["']${target.hash.slice(1)}["']`).test(fs.readFileSync(file,'utf8'))) violations.push('Missing anchor: '+link.href);
  }
  return {route,title:text(html.match(/<title>(.*?)<\/title>/)[1]),description:decode(html.match(/<meta name="description" content="([^"]*)"/)[1]),headings,words:text(editorial).split(/\s+/).length,faqCount:(editorial.match(/<summary>/g)||[]).length,links,contentHash:crypto.createHash('sha256').update(editorial).digest('hex'),violations};
});
const previous = mode === 'candidate' && fs.existsSync(path.join(cache,'content-baseline.json')) ? JSON.parse(fs.readFileSync(path.join(cache,'content-baseline.json'),'utf8')) : null;
for (const page of pages) {
  const before = previous?.pages.find(p => p.route === page.route);
  if (before) page.change = {main:before.contentHash !== page.contentHash,title:before.title !== page.title,description:before.description !== page.description,wordsBefore:before.words,faqBefore:before.faqCount};
}
const duplicates = key => Object.entries(Object.groupBy(pages,p=>p[key])).filter(([,v])=>v.length>1).map(([value,group])=>({value,routes:group.map(p=>p.route)}));
const result = {cache_type:'content',analyzed_at:new Date().toISOString(),domain:'www.adelaidehandymanmelone.com.au',mode,scope:'Generated local candidate, not production',pages,duplicates:{title:duplicates('title'),description:duplicates('description')},limitations:['Word counts are diagnostic, not ranking factors.','No search volume or ranking improvement inferred.']};
fs.mkdirSync(cache,{recursive:true});
fs.writeFileSync(path.join(cache,`content-${mode}.json`),JSON.stringify(result,null,2));
if (mode === 'candidate') for (const page of pages) {
  let slug = page.route.replace(/^\/+|\/+$/g, '').replaceAll('/', '--').toLowerCase() || 'homepage';
  if (slug.length > 80) { const cut = slug.lastIndexOf('--', 80); slug = slug.slice(0, cut > 0 ? cut : 80); }
  const directory = path.join(cache, 'pages', slug);
  fs.mkdirSync(directory, {recursive:true});
  fs.writeFileSync(path.join(directory, 'content.json'), JSON.stringify({
    cache_type:'content', analyzed_at:result.analyzed_at,
    url:'https://www.adelaidehandymanmelone.com.au'+page.route, url_slug:slug,
    scope:result.scope, score:null,
    eeat_summary:'Confirmed business identity and original case evidence retained; no new credential or outcome claims.',
    ai_citation_readiness:page.route.startsWith('/guides/') && page.faqCount >= 2 ? 'Answer-first guide with source attribution and visible FAQs; actual AI citations unmeasured' : 'Structured local candidate; actual AI citations unmeasured',
    findings:{title:page.title, words:page.words, faq_count:page.faqCount, heading_count:page.headings.length, internal_links:page.links.filter(l=>l.href.startsWith('/')).length, changed:page.change},
    issues:page.violations, recommendations:['Obtain business-owner approval before publishing.', 'Measure search and conversion outcomes only after an approved release.'],
    limitations:result.limitations
  },null,2));
}
console.log(JSON.stringify({mode,pages:pages.length,changed:pages.filter(p=>p.change?.main).length,duplicates:result.duplicates,violations:pages.flatMap(p=>p.violations.map(v=>({route:p.route,issue:v}))),wordRange:[Math.min(...pages.map(p=>p.words)),Math.max(...pages.map(p=>p.words))]},null,2));
