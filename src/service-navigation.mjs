import fs from 'node:fs';
import { serviceCityPilot } from './service-city-pilot.mjs';
import path from 'node:path';
import {load} from 'cheerio';

// Editorial relationships, not URL-directory inference. The current commercial
// URLs stay in place; broad multi-service categories remain useful in parallel.
export const priorityServices = ['cabinet-drawer-repair','sliding-door-repair','wall-patching-repair','pressure-cleaning','flyscreen-repair','door-repair','gutter-cleaning','fence-gate-repair','flat-pack-assembly'];
export const caseParents = {
  'norwood-flyscreen-repair':'flyscreen-repair',
  'north-adelaide-door-repair':'door-repair',
  'burnside-window-repair':'doors-windows-screens',
  'kensington-furniture-assembly':'flat-pack-assembly',
  'unley-kitchen-cabinet-repair':'cabinet-drawer-repair',
  'goodwood-wall-repair':'wall-patching-repair',
  'mile-end-fence-repair':'fence-gate-repair',
  'prospect-gutter-cleaning':'gutter-cleaning',
  'adelaide-cbd-wall-repair':'wall-patching-repair',
  'modbury-timber-fence-repair-assessment':'fence-gate-repair',
  // A shower screen is not an insect screen or a patio sliding door.
  'marion-shower-screen-repair':'doors-windows-screens',
  'henley-beach-sliding-screen-door-repair':'flyscreen-repair',
  'stirling-deck-pergola-timber-repair':'outdoor-structures-fences-pools',
  'modbury-garden-pruning-tidy-up':'garden-landscape-care',
  'north-adelaide-timber-gate-repair':'fence-gate-repair',
  'burnside-driveway-pressure-cleaning':'pressure-cleaning',
  'stirling-flat-pack-wardrobe-assembly':'flat-pack-assembly',
  'marion-wardrobe-sliding-door-repair':'door-repair',
  'kitchen-drawer-runner-repair':'cabinet-drawer-repair',
  'sliding-patio-door-roller-track-repair':'sliding-door-repair',
};
// Each choice was checked against the actual sections, including mixed-topic
// guides. Null means a collection parent, not a guessed commercial owner.
export const guideParents = {
  'field-notes-doors-windows-screens-enquiry':'doors-windows-screens',
  'field-notes-wall-interior-repairs-job-list':'wall-patching-repair',
  'field-notes-roof-gutter-exterior-observations':'gutter-cleaning',
  'field-notes-garden-outdoor-seasonal-preparation':null,
  'field-notes-rental-end-of-lease-maintenance-list':null,
  'field-notes-pre-sale-home-maintenance-list':'home-repairs-renovation-support',
  'field-notes-grouping-multiple-household-jobs':null,
  'field-notes-cleaning-removals-preparation':'pressure-cleaning',
  'prepare-household-maintenance-enquiry':null,
  'home-maintenance-walk-through-checklist':null,
};
const hubs = {
  '/':['home','Home'], '/services/':['service-collection','Services'],
  '/case-studies/':['case-collection','Our work'], '/guides/':['guide-collection','Guides'],
  '/news/':['news-collection','News'], '/service-areas/':['area-collection','Service areas'],
  '/about/':['company','About'], '/contact/':['contact','Contact'],
  '/how-it-works/':['process','How it works'], '/faq/':['questions','Repair FAQs'],
  '/service-standards/':['standards','Service standards'], '/privacy/':['privacy','Privacy'],
};
const serviceRoute = slug => `/services/${slug}/`;
const fileFor = (siteDir, route) => path.join(siteDir, route.slice(1), 'index.html');
const esc = text => String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeJson = object => JSON.stringify(object).replace(/</g,'\\u003c');

export function createNavigationMap({siteDir,routes,origin,services,focusedServices,caseStudies,guides,news,serviceAreas}) {
  const records = new Map();
  const add=(route,type,parent,owner,rationale,label)=>{
    if(records.has(route))throw Error('Duplicate navigation record: '+route);
    const $=load(fs.readFileSync(fileFor(siteDir,route),'utf8'));
    if($('meta[name=robots]').attr('content')?.includes('noindex'))throw Error('Noindex navigation record: '+route);
    records.set(route,{route,url:origin+route,locale:'en-AU',type,parent,owner,serviceGroup:owner?.replace('/services/','').replace(/\/$/,'')||null,label:label||serviceCityPilot[route]?.beforeTitle||$('h1').text().trim(),counterpart:origin+'/zh'+route,rationale});
  };
  for(const [route,[type,label]] of Object.entries(hubs))add(route,type,route==='/'?null:'/',route==='/'?'/':null,'Existing public navigation destination',label);
  for(const service of [...services,...focusedServices])add(serviceRoute(service.slug),'service','/',serviceRoute(service.slug),'Established service URL; homepage remains the broad city-business destination');
  for(const study of caseStudies){
    if(!Object.hasOwn(caseParents,study.slug))throw Error('Review case parent: '+study.slug);
    const owner=serviceRoute(caseParents[study.slug]);
    add(`/case-studies/${study.slug}/`,'case',owner,owner,'Recorded task and supplied work evidence match this service; no completion claim added');
  }
  for(const guide of guides){
    if(!Object.hasOwn(guideParents,guide.slug))throw Error('Review guide parent: '+guide.slug);
    const owner=guideParents[guide.slug]?serviceRoute(guideParents[guide.slug]):null;
    add(`/guides/${guide.slug}/`,'guide',owner||'/guides/',owner,owner?'Guide sections principally address this service':'Mixed-service or general preparation guide; retain the guide collection');
  }
  for(const article of news)add(`/news/${article.slug}/`,'news','/news/',null,'General maintenance update; retain its collection');
  for(const area of serviceAreas){
    const region=`/service-areas/${area.slug}/`;
    add(region,'region','/service-areas/',null,'Approved regional hub, not a single-service landing page',area.name);
    // Exact region membership comes from the approved area content source.
    for(const suburb of area.suburbs)add(`${region}${suburb.slug}/`,'suburb',region,null,'Approved suburb membership; retain geographic hierarchy',suburb.name);
  }
  if(records.size!==routes.length||routes.some(x=>!records.has(x.route)))throw Error('Navigation coverage differs from published routes: '+JSON.stringify({registered:records.size,published:routes.length,missing:routes.filter(x=>!records.has(x.route)),extra:[...records.keys()].filter(p=>!routes.some(x=>x.route===p))}));
  validateNavigationMap(records);
  return records;
}

export function validateNavigationMap(records) {
  for(const entry of records.values()){
    if(!entry.label||!entry.rationale)throw Error('Incomplete navigation record: '+entry.route);
    if(entry.owner&&!records.has(entry.owner))throw Error('Missing service owner: '+entry.route);
    const seen=new Set([entry.route]);let parent=entry.parent;
    while(parent){
      if(seen.has(parent))throw Error('Navigation cycle: '+entry.route);
      if(!records.has(parent))throw Error('Missing navigation parent: '+entry.route);
      seen.add(parent);parent=records.get(parent).parent;
    }
  }
}
export function breadcrumbFor(entry, records, origin) {
  if(!entry.parent)return null;
  const chain=[entry];let node=entry;
  while(node.parent){node=records.get(node.parent);chain.unshift(node);}
  const items=chain.map((item,index)=>({'@type':'ListItem',position:index+1,name:item.label,item:origin+item.route}));
  const schema={'@type':'BreadcrumbList','@id':origin+entry.route+'#breadcrumb',itemListElement:items};
  const html=`<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${items.map((item,i)=>`<li>${i?'<span class="breadcrumb-separator" aria-hidden="true">/</span>':''}${i===items.length-1?`<span aria-current="page">${esc(item.name)}</span>`:`<a href="${esc(item.item)}" data-breadcrumb-position="${item.position}" data-breadcrumb-owner="${esc(entry.owner||'')}">${esc(item.name)}</a>`}</li>`).join('')}</ol></nav>`;
  return {html,schema};
}

export function applyServiceNavigation(options) {
  const {siteDir,origin}=options, records=createNavigationMap(options);
  const insertBeforeContact=(html,markup)=>{
    const marker=/<section class="contact-band"/;
    return marker.test(html)?html.replace(marker,markup+'$&'):html.replace('</main>',markup+'</main>');
  };
  for(const entry of records.values()){
    let html=fs.readFileSync(fileFor(siteDir,entry.route),'utf8');
    // Replace the single legacy renderer, rather than output a second trail.
    html=html.replace(/<div class="wrap"><nav class="breadcrumbs"[^]*?<\/nav><\/div>/g,'');
    const breadcrumb=breadcrumbFor(entry,records,origin);
    if(breadcrumb)html=html.replace('<main id="main">',`<main id="main"><div class="wrap">${breadcrumb.html}</div>`);
    html=html.replace(/(<script type="application\/ld\+json">)([^]*?)(<\/script>)/g,(_,open,text,close)=>{
      const data=JSON.parse(text);
      if(!data['@graph'])return open+text+close;
      data['@graph']=data['@graph'].filter(n=>n['@type']!=='BreadcrumbList');
      for(const node of data['@graph'].filter(n=>n['@type']==='WebPage')){
        if(breadcrumb)node.breadcrumb={'@id':breadcrumb.schema['@id']};else delete node.breadcrumb;
      }
      if(breadcrumb)data['@graph'].push(breadcrumb.schema);
      return open+safeJson(data)+close;
    });
    const $=load(html);
    const exposed=new Set($('main a').map((i,a)=>{try{return new URL($(a).attr('href'),origin).pathname;}catch{return null;}}).get());
    if(entry.route==='/'){
      const links=priorityServices.map(slug=>records.get(serviceRoute(slug)));
      // Within the existing service section: no new hero, full-width band or
      // repeated FAQ/area list. Each target has its stable customer-facing name.
      const list=`<nav class="service-shortcuts" aria-label="Repair services"><h3>Find the repair you need</h3><ul>${links.map(item=>`<li><a href="${item.route}">${esc(item.label)}</a></li>`).join('')}</ul></nav>`;
      const servicesLink=/<a class="text-link section-link" href="\/services\/"[^]*?<\/a>/;
      if(!servicesLink.test(html))throw Error('Homepage service section boundary changed');
      html=html.replace(servicesLink,'$&'+list);
    }
    if(entry.type==='service'){
      const missing=[...records.values()].filter(child=>child.parent===entry.route&&!exposed.has(child.route));
      if(missing.length){
        const group=(type,heading)=>{const children=missing.filter(x=>x.type===type);return children.length?`<h2>${heading}</h2><ul>${children.map(x=>`<li><a href="${x.route}">${esc(x.label)}</a></li>`).join('')}</ul>`:'';};
        html=insertBeforeContact(html,`<section class="section wrap service-paths">${group('case','Our work')}${group('guide','Repair guides')}</section>`);
      }
    }
    const contextualOwner = entry.owner && $('main p a').toArray().some(a => {
      try {return new URL($(a).attr('href'),origin).pathname===entry.owner;} catch {return false;}
    });
    if(['case','guide'].includes(entry.type)&&entry.owner&&!contextualOwner){
      // Do not repeat an existing contextual service entry. Only a genuinely
      // missing prose-level next step gets this small fallback.
      const owner=records.get(entry.owner);
      const panel=`<p class="wrap repair-next-step">We can assess your repair. Explore <a href="${entry.owner}">${esc(owner.label)}</a> or <a href="/contact/">request an assessment and quote</a>.</p>`;
      html=insertBeforeContact(html,panel);
    }
    html=html.replace('</head>','<link rel="stylesheet" href="/assets/css/service-navigation.css"></head>');
    fs.writeFileSync(fileFor(siteDir,entry.route),html);
  }
  return records;
}
