import {load} from 'cheerio';
import {createHash} from 'node:crypto';
export const screenWardrobeParagraphs={"case-studies/henley-beach-sliding-screen-door-repair/": [[3, 0], [3, 1], [4, 0]], "case-studies/stirling-flat-pack-wardrobe-assembly/": [[3, 0], [3, 1], [4, 0]]};
export const screenWardrobeFiles=new Set(Object.keys(screenWardrobeParagraphs).flatMap(p=>[p+'index.html','zh/'+p+'index.html']));
export const screenWardrobeDigest=s=>createHash('sha256').update(s.replaceAll('\r\n','\n')).digest('hex');
export function screenWardrobeSnapshot(html,route){
 const $=load(html),sections=$('main section');
 const paragraphs=screenWardrobeParagraphs[route].map(([s,p])=>{const n=sections.eq(s).find('p').eq(p);if(n.length!==1)throw Error(`Missing approved paragraph ${route}:${s}:${p}`);return{section:s,index:p,text:n.text()};});
 const derivedKeywords=[];
 $('script[type="application/ld+json"]').each((_,n)=>{const normalize=value=>{if(Array.isArray(value))return value.map(normalize);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,v])=>{if(key==='keywords'&&Array.isArray(v)){derivedKeywords.push(v);return[key,'APPROVED_DERIVED_KEYWORDS'];}return[key,normalize(v)];}));return value;};$(n).text(JSON.stringify(normalize(JSON.parse($(n).text()))));});
 const protectedCopy={head:$('head').toString(),title:$('title').text(),h1:$('h1').text(),meta:$('meta[name=description]').attr('content'),headings:$('main h2').toArray().map(n=>$(n).text()),links:$('a[href]').toArray().map(n=>$(n).toString()),images:$('img').toArray().map(n=>$(n).toString()),faq:$('details').toArray().map(n=>$(n).toString()),schema:$('script[type="application/ld+json"]').toArray().map(n=>$(n).text())};
 for(const[s,p]of screenWardrobeParagraphs[route])sections.eq(s).find('p').eq(p).text('APPROVED_SCREEN_WARDROBE_PARAGRAPH');
 return{paragraphs,derivedKeywords,protectedCopy,maskedHash:screenWardrobeDigest($('body').toString())};
}
