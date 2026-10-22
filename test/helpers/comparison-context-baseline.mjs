import {load} from 'cheerio';
import {createHash} from 'node:crypto';
export const comparisonContextParagraphs={"case-studies/unley-kitchen-cabinet-repair/": [[4, 0]], "case-studies/modbury-garden-pruning-tidy-up/": [[4, 0]], "case-studies/marion-wardrobe-sliding-door-repair/": [[4, 0]], "case-studies/mile-end-fence-repair/": [[4, 0]], "case-studies/north-adelaide-timber-gate-repair/": [[4, 0]], "case-studies/north-adelaide-door-repair/": [[4, 0]], "case-studies/prospect-gutter-cleaning/": [[4, 0]], "case-studies/henley-beach-sliding-screen-door-repair/": [[4, 0]]};
export const comparisonContextFiles=new Set(Object.keys(comparisonContextParagraphs).flatMap(p=>[p+'index.html','zh/'+p+'index.html']));
export const comparisonContextDigest=s=>createHash('sha256').update(s.replaceAll('\r\n','\n')).digest('hex');
export function comparisonContextSnapshot(html,route){
 const $=load(html),sections=$('main section');
 const paragraphs=comparisonContextParagraphs[route].map(([s,p])=>{const n=sections.eq(s).find('p').eq(p);if(n.length!==1)throw Error(`Missing approved paragraph ${route}:${s}:${p}`);return{section:s,index:p,text:n.text()};});
 const protectedCopy={head:$('head').toString(),title:$('title').text(),h1:$('h1').text(),meta:$('meta[name=description]').attr('content'),headings:$('main h2').toArray().map(n=>$(n).text()),links:$('a[href]').toArray().map(n=>$(n).toString()),images:$('img').toArray().map(n=>$(n).toString()),faq:$('details').toArray().map(n=>$(n).toString()),schema:$('script[type="application/ld+json"]').toArray().map(n=>$(n).text())};
 for(const[s,p]of comparisonContextParagraphs[route])sections.eq(s).find('p').eq(p).text('APPROVED_COMPARISON_CONTEXT_PARAGRAPH');
 return{paragraphs,protectedCopy,maskedHash:comparisonContextDigest($('body').toString())};
}

import fs from 'node:fs';
import assert from 'node:assert/strict';
export function assertComparisonProtected(html,file){const baseline=JSON.parse(fs.readFileSync(new URL('../fixtures/comparison-context-20261022-baseline.json',import.meta.url),'utf8')),old=baseline.pages.find(x=>x.file===file);if(!old?.route)throw Error('Missing comparison context baseline: '+file);const now=comparisonContextSnapshot(html,old.route);assert.deepEqual(now.protectedCopy,old.protectedCopy,file+' protected fields');assert.equal(now.maskedHash,old.maskedHash,file+' outside comparison');}
