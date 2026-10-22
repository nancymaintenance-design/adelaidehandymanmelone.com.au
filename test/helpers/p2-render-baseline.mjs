import {load} from 'cheerio';
import {createHash} from 'node:crypto';
export const p2Paragraphs={
 'cabinet-drawer-repair':[[0,0],[0,1],[1,0],[1,1],[2,0],[2,1],[3,0],[3,1],[4,0],[4,1]],
 'flyscreen-repair':[[0,0],[0,1],[1,0],[1,1],[2,0],[2,1],[2,2],[4,0],[4,1]],
 'pressure-cleaning':[[0,0],[0,1],[1,0],[1,1],[2,0],[2,1],[3,0],[3,1],[4,0],[4,1]],
};
export const digest=text=>createHash('sha256').update(text.replaceAll('\r\n','\n')).digest('hex');
export function p2Snapshot(html,slug){
 const $=load(html),sections=$('main section');
 const paragraphs=p2Paragraphs[slug].map(([s,p])=>{
  const node=sections.eq(s).find('p').eq(p);if(node.length!==1)throw Error(`Missing P2 paragraph ${slug}:${s}:${p}`);
  return {section:s,paragraph:p,text:node.text()};
 });
 const protectedCopy={title:$('title').text(),h1:$('h1').text(),meta:$('meta[name=description]').attr('content'),headings:$('main h2').toArray().map(n=>$(n).text()),links:$('a[href]').toArray().map(n=>$(n).toString()),images:$('img').toArray().map(n=>$(n).toString()),faq:$('details').toArray().map(n=>$(n).toString()),schema:$('script[type="application/ld+json"]').toArray().map(n=>$(n).text())};
 for(const [s,p]of p2Paragraphs[slug])sections.eq(s).find('p').eq(p).text('REVIEWED_P2_BODY_PARAGRAPH');
 return {protectedCopy,paragraphs,maskedHash:digest($('body').toString())};
}
