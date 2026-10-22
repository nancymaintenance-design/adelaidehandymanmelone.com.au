import {load} from 'cheerio';
import {createHash} from 'node:crypto';
export const followupParagraphs={
 'services/fence-gate-repair/':[[0,0],[0,1],[1,0],[1,1],[2,0],[2,1],[4,0],[4,1],[5,0]],
 'case-studies/marion-wardrobe-sliding-door-repair/':[[3,0],[3,1],[4,0]],
 'case-studies/mile-end-fence-repair/':[[3,0],[3,1],[4,0]],
 'case-studies/north-adelaide-timber-gate-repair/':[[3,0],[3,1],[4,0]],
};
export const followupFiles=new Set(Object.keys(followupParagraphs).flatMap(p=>[p+'index.html','zh/'+p+'index.html']));
export const followupDigest=s=>createHash('sha256').update(s.replaceAll('\r\n','\n')).digest('hex');
export function followupSnapshot(html,route){
 const $=load(html),sections=$('main section');
 const paragraphs=followupParagraphs[route].map(([s,p])=>{const n=sections.eq(s).find('p').eq(p);if(n.length!==1)throw Error(`Missing approved paragraph ${route}:${s}:${p}`);return{section:s,index:p,text:n.text()};});
 const protectedCopy={title:$('title').text(),h1:$('h1').text(),meta:$('meta[name=description]').attr('content'),headings:$('main h2').toArray().map(n=>$(n).text()),links:$('a[href]').toArray().map(n=>$(n).toString()),images:$('img').toArray().map(n=>$(n).toString()),faq:$('details').toArray().map(n=>$(n).toString()),schema:$('script[type="application/ld+json"]').toArray().map(n=>$(n).text())};
 for(const[s,p]of followupParagraphs[route])sections.eq(s).find('p').eq(p).text('APPROVED_FOLLOWUP_PARAGRAPH');
 return{paragraphs,protectedCopy,maskedHash:followupDigest($('body').toString())};
}
