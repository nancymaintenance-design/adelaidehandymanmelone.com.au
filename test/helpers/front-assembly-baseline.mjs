import {load} from 'cheerio';
import {createHash} from 'node:crypto';
export const frontAssemblyParagraphs={"case-studies/north-adelaide-door-repair/": [[3, 0], [4, 0]], "case-studies/kensington-furniture-assembly/": [[3, 1], [4, 0]]};
export const frontAssemblyFiles=new Set(Object.keys(frontAssemblyParagraphs).flatMap(p=>[p+'index.html','zh/'+p+'index.html']));
export const frontAssemblyDigest=s=>createHash('sha256').update(s.replaceAll('\r\n','\n')).digest('hex');
export function frontAssemblySnapshot(html,route){
 const $=load(html),sections=$('main section');
 const paragraphs=frontAssemblyParagraphs[route].map(([s,p])=>{const n=sections.eq(s).find('p').eq(p);if(n.length!==1)throw Error(`Missing approved paragraph ${route}:${s}:${p}`);return{section:s,index:p,text:n.text()};});
 const protectedCopy={head:$('head').toString(),title:$('title').text(),h1:$('h1').text(),meta:$('meta[name=description]').attr('content'),headings:$('main h2').toArray().map(n=>$(n).text()),links:$('a[href]').toArray().map(n=>$(n).toString()),images:$('img').toArray().map(n=>$(n).toString()),faq:$('details').toArray().map(n=>$(n).toString()),schema:$('script[type="application/ld+json"]').toArray().map(n=>$(n).text())};
 for(const[s,p]of frontAssemblyParagraphs[route])sections.eq(s).find('p').eq(p).text('APPROVED_FRONT_ASSEMBLY_PARAGRAPH');
 return{paragraphs,protectedCopy,maskedHash:frontAssemblyDigest($('body').toString())};
}
