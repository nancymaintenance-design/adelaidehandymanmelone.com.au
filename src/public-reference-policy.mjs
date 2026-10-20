import fs from 'node:fs';
import path from 'node:path';
import {parse} from 'parse5';

// User-approved public removal, 2026-10-20. Private research provenance is not
// erased, and these citations must not be moved to hidden markup or feeds.
export const removedReferenceUrls = new Set([
  'https://ardexaustralia.com/ardex-answers/pre-mixed-tile-adhesives-in-wet-areas-what-you-need-to-know/',
  'https://business.gov.au/people/contractors/prepare-quotes',
  'https://cbs.sa.gov.au/find-a-licence-holder',
  'https://cdn.environment.sa.gov.au/environment/docs/tech_note3_1.pdf',
  'https://www.asbestos.sa.gov.au/in-your-home/asbestos-in-your-home/homeowners2',
  'https://www.atfa.com.au/uncategorized/what-to-do-when-you-have-a-flooring-problem-consumer/',
  'https://www.atfa.com.au/wp-content/uploads/2024/02/Pages-from-ATFA-Timber-Floors-Magazine-Issue-53-3.pdf',
  'https://www.cbs.sa.gov.au/documents/licence_categories_guide_plumbers.pdf',
  'https://www.cbs.sa.gov.au/find-a-licence-holder',
  'https://www.consumerprotection.wa.gov.au/announcements/the-commissioner-be-aware-of-the-signs-of-stressed-ceiling',
  'https://www.gyprock.com.au/products/cornice/standard/cove-cornice',
  'https://www.legislation.sa.gov.au/_legislation-documents/lz/c/a/residential-tenancies-act-1995/current/1995.63.auth.pdf',
  'https://www.phifer.com/blog/what-size-and-type-of-spline/',
  'https://www.productsafety.gov.au/business/search-mandatory-standards/blinds-curtains-and-window-fittings-mandatory-standard',
  'https://www.productsafety.gov.au/consumers/be-safe-around-the-home/use-products-inside-the-home-safely/toppling-furniture-and-televisions-guide',
  'https://www.sa.gov.au/topics/business-and-trade/licensing/building-and-trades/building-work-contractor-s-licence',
  'https://www.sa.gov.au/topics/business-and-trade/licensing/building-and-trades/licensing',
  'https://www.sa.gov.au/topics/housing/keeping-your-property-safe/pool-and-spa-safety',
  'https://www.safework.sa.gov.au/news-and-alerts/news/news/2025/deadly-asbestos-prompts-school-holiday-warning-for-diy-home-renovators',
  'https://www.safework.sa.gov.au/workplaces/electrical/safe-electrical-practices',
  'https://www.safework.sa.gov.au/workplaces/work-tasks-and-projects/lead-risk-work',
  'https://www.selleys.com.au/products/sealants/wet-area-silicone/wet-area-silicone/',
  'https://www.yourhome.gov.au/passive-design/ventilation-airtightness',
]);
const attribute=(node,name)=>node.attrs?.find(a=>a.name===name)?.value;
const text=node=>node.nodeName==='#text'?node.value:(node.childNodes||[]).map(text).join('');
const normal=value=>value.replace(/\s+/g,' ').trim();
const boilerplate=new Set(['','.',
  'Read for the general guidance; the actual product and work still need assessment.',
  'For the applicable rules, read .',
  'For those task descriptions, read and .',
  'Use , and when comparing the proposed arrangements.',
]);
export function removePublicReferenceLinks(html){
  const document=parse(html,{sourceCodeLocationInfo:true}),nodes=[];
  const visit=node=>{nodes.push(node);for(const child of node.childNodes||[])visit(child);};visit(document);
  const targets=nodes.filter(n=>n.tagName==='a'&&removedReferenceUrls.has(attribute(n,'href')));
  const edits=new Map();
  for(const anchor of targets){
    let parent=anchor.parentNode;while(parent&&!['p','li','details','section','main','body'].includes(parent.tagName))parent=parent.parentNode;
    let remove=anchor,replacement='';
    if(parent&&['p','li'].includes(parent.tagName)){
      const inside=targets.filter(a=>{let p=a.parentNode;while(p&&p!==parent)p=p.parentNode;return p===parent;});
      let remainder=text(parent);for(const link of inside)remainder=remainder.replace(text(link),'');
      if(boilerplate.has(normal(remainder)))remove=parent;
      else replacement=html.slice(anchor.sourceCodeLocation.startTag.endOffset,anchor.sourceCodeLocation.endTag.startOffset);
    }
    // Remove the now-empty layout unit only when this citation was its sole content.
    const unit=remove.parentNode;
    if(!replacement&&attribute(unit,'class')?.split(/\s+/).includes('desktop-topic-unit')&&unit.childNodes.every(n=>n===remove||(n.nodeName==='#text'&&!n.value.trim())))remove=unit;
    const loc=remove.sourceCodeLocation;edits.set(loc.startOffset,{start:loc.startOffset,end:loc.endOffset,text:replacement});
  }
  // A unit may contain several citation paragraphs, all removed in this pass.
  for(const unit of nodes.filter(n=>attribute(n,'class')?.split(/\s+/).includes('desktop-topic-unit'))){
    const loc=unit.sourceCodeLocation;
    const within=[...edits.values()].filter(e=>e.start>=loc.startTag.endOffset&&e.end<=loc.endTag.startOffset);
    if(!within.length)continue;
    let content=html.slice(loc.startTag.endOffset,loc.endTag.startOffset);
    for(const e of within.sort((a,b)=>b.start-a.start))content=content.slice(0,e.start-loc.startTag.endOffset)+e.text+content.slice(e.end-loc.startTag.endOffset);
    if(!content.trim())edits.set(loc.startOffset,{start:loc.startOffset,end:loc.endOffset,text:''});
  }
  const all=[...edits.values()],outer=all.filter(e=>!all.some(p=>p!==e&&p.start<=e.start&&p.end>=e.end));
  for(const edit of outer.sort((a,b)=>b.start-a.start))html=html.slice(0,edit.start)+edit.text+html.slice(edit.end);
  for(const url of removedReferenceUrls)if(html.includes(url))throw Error('Removed public citation remains in markup or structured data: '+url);
  return html;
}
export function applyPublicReferencePolicy({siteDir,routes}){
  for(const {route}of routes){const file=path.join(siteDir,route.slice(1),'index.html'),before=fs.readFileSync(file,'utf8'),after=removePublicReferenceLinks(before);if(after!==before)fs.writeFileSync(file,after);}
}
