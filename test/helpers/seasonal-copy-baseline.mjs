import {load} from 'cheerio';
import {createHash} from 'node:crypto';
export const seasonalParagraphs={"services/gutter-cleaning/":[[0,1],[1,1],[2,0],[2,1],[3,0],[4,0],[4,1],[5,0]],"services/outdoor-structures-fences-pools/":[[0,1],[1,1],[2,0],[2,1],[3,0],[3,1],[5,0],[5,1],[6,0],[7,0]],"case-studies/prospect-gutter-cleaning/":[[3,0],[3,1],[4,0]],"case-studies/stirling-deck-pergola-timber-repair/":[[3,0],[3,1],[4,0]]};
export const seasonalFiles=new Set(Object.keys(seasonalParagraphs).flatMap(p=>[p+'index.html','zh/'+p+'index.html']));
export const seasonalDigest=s=>createHash('sha256').update(s.replaceAll('\r\n','\n')).digest('hex');
export function seasonalSnapshot(html,route){
 const $=load(html),sections=$('main section');
 const paragraphs=seasonalParagraphs[route].map(([s,p])=>{const n=sections.eq(s).find('p').eq(p);if(n.length!==1)throw Error(`Missing approved paragraph ${route}:${s}:${p}`);return{section:s,index:p,text:n.text()};});
 const protectedCopy={title:$('title').text(),h1:$('h1').text(),meta:$('meta[name=description]').attr('content'),headings:$('main h2').toArray().map(n=>$(n).text()),links:$('a[href]').toArray().map(n=>$(n).toString()),images:$('img').toArray().map(n=>$(n).toString()),faq:$('details').toArray().map(n=>$(n).toString()),schema:$('script[type="application/ld+json"]').toArray().map(n=>$(n).text())};
 for(const[s,p]of seasonalParagraphs[route])sections.eq(s).find('p').eq(p).text('APPROVED_SEASONAL_PARAGRAPH');
 return{paragraphs,protectedCopy,maskedHash:seasonalDigest($('body').toString())};
}
