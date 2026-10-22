import {load} from 'cheerio';
import {createHash} from 'node:crypto';
export const cabinetGardenParagraphs={"case-studies/unley-kitchen-cabinet-repair/": [[3, 0], [3, 1], [4, 0]], "case-studies/modbury-garden-pruning-tidy-up/": [[3, 1], [4, 0]]};
export const cabinetGardenFiles=new Set(Object.keys(cabinetGardenParagraphs).flatMap(p=>[p+'index.html','zh/'+p+'index.html']));
export const cabinetGardenDigest=s=>createHash('sha256').update(s.replaceAll('\r\n','\n')).digest('hex');
export function cabinetGardenSnapshot(html,route){
 const $=load(html),sections=$('main section');
 const paragraphs=cabinetGardenParagraphs[route].map(([s,p])=>{const n=sections.eq(s).find('p').eq(p);if(n.length!==1)throw Error(`Missing approved paragraph ${route}:${s}:${p}`);return{section:s,index:p,text:n.text()};});
 const protectedCopy={head:$('head').toString(),title:$('title').text(),h1:$('h1').text(),meta:$('meta[name=description]').attr('content'),headings:$('main h2').toArray().map(n=>$(n).text()),links:$('a[href]').toArray().map(n=>$(n).toString()),images:$('img').toArray().map(n=>$(n).toString()),faq:$('details').toArray().map(n=>$(n).toString()),schema:$('script[type="application/ld+json"]').toArray().map(n=>$(n).text())};
 for(const[s,p]of cabinetGardenParagraphs[route])sections.eq(s).find('p').eq(p).text('APPROVED_CABINET_GARDEN_PARAGRAPH');
 return{paragraphs,protectedCopy,maskedHash:cabinetGardenDigest($('body').toString())};
}
