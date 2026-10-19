import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {load} from 'cheerio';

const inventory=JSON.parse(fs.readFileSync(new URL('./machine-keywords.json',import.meta.url),'utf8')).terms;
const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
const json=value=>JSON.stringify(value).replace(/</g,'\\u003c');
const unique=values=>[...new Set(values.filter(Boolean))];
const ref=id=>({'@id':id});
const types=node=>[].concat(node?.['@type']??[]);
const xml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const cdata=value=>'<![CDATA['+String(value).replace(/]]>/g,']]]]><![CDATA[>')+']]>';
export const stripMachineMarkup=html=>html.replace(/<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g,'<SCHEMA>').replace(/<link\b[^>]*data-machine-feed[^>]*>/g,'');

function readPage(siteDir,route,origin){
 const file=path.join(siteDir,route.slice(1),'index.html'),html=fs.readFileSync(file,'utf8'),$=load(html);
 const raw=$('script[type="application/ld+json"]').first().text(),data=JSON.parse(raw),graph=data['@graph'];
 if(!Array.isArray(graph))throw Error(`Missing existing graph: ${route}`);
 const h1=clean($('main h1').first().text()),summary=$('meta[name="description"]').attr('content'),language=$('html').attr('lang');
 const main=$('main').clone();
 // Publish the same editorial content, not navigation, enquiry inputs or scripts.
 main.find('script,style,nav,form,aside,iframe,.contact-band,.sticky-contact,.mobile-contact').remove();
 main.find('[hidden],[aria-hidden="true"],.breadcrumbs').remove();
 main.find('*').each((_,node)=>{
  for(const [name,value] of Object.entries(node.attribs??{})){
   if(['href','src','poster'].includes(name))node.attribs[name]=new URL(value,origin+route).href;
   else if(name==='srcset')delete node.attribs[name];
   else if(!['alt','width','height','datetime','title','colspan','rowspan'].includes(name))delete node.attribs[name];
  }
 });
 const text=clean(main.text()),lower=text.toLocaleLowerCase('en-AU');
 const matches=inventory.filter(row=>lower.includes(row[language.startsWith('zh')?2:1].toLocaleLowerCase('en-AU'))).sort((a,b)=>b[1].length-a[1].length);
 const keywords=unique([h1,...matches.map(row=>row[language.startsWith('zh')?2:1]),...main.find('h2').toArray().map(node=>clean(main.find(node).text()))]).filter(s=>s.length<=130).slice(0,8);
 const url=new URL(route,origin).href;
 return {file,html,$,data,graph,h1,summary,language,route,url,text,content:main.html(),keywords,matchedIds:matches.map(row=>row[0])};
}

function enhanceGraph(page,pages,origin,prefix){
 const {graph,url,h1,summary,language,keywords}=page;
 const business=graph.find(n=>types(n).includes('LocalBusiness'));
 const website=graph.find(n=>types(n).includes('WebSite'));
 const webpage=graph.find(n=>types(n).includes('WebPage'));
 if(!business||!website||!webpage)throw Error(`Incomplete existing entities: ${page.route}`);
 webpage.name=h1;webpage.description=summary;webpage.inLanguage=language;webpage.keywords=keywords;
 website.publisher=ref(business['@id']);website.inLanguage=language;
 website.subjectOf=ref(origin+prefix+'schema-feed.json#feed');
 business.subjectOf=ref(origin+prefix+'about/#webpage');
 const about=pages.find(p=>p.route===prefix+'about/');
 const introduction=about?.$('main p').toArray().map(n=>clean(about.$(n).text())).find(s=>s.includes(business.legalName));
 if(introduction)business.disambiguatingDescription=introduction;
 if([prefix,prefix+'about/',prefix+'services/'].includes(page.route)){
  business.hasOfferCatalog=ref(origin+prefix+'services/#service-catalog');
  const linked=new Set(page.$('main a[href]').toArray().map(n=>new URL(page.$(n).attr('href'),url).href));
  const visibleServices=pages.filter(p=>linked.has(p.url)&&p.route.startsWith(prefix+'services/')).map(p=>p.graph.find(n=>types(n).includes('Service'))).filter(Boolean);
  if(visibleServices.length)business.knowsAbout=unique(visibleServices.map(s=>s.name));
 }
 const primary=graph.find(n=>types(n).includes('Service')||types(n).includes('Article'));
 if(primary){
  webpage.mainEntity=ref(primary['@id']);primary.url=url;primary.mainEntityOfPage=ref(webpage['@id']);
  if(types(primary).includes('Service')){primary.serviceType=h1;primary.provider=ref(business['@id']);}
  else {primary.keywords=keywords;primary.headline=h1;primary.description=summary;primary.inLanguage=language;}
 }
 const localRoute=page.route.slice(prefix.length-1);
 if(localRoute==='/about/'||localRoute==='/contact/'){
  webpage.additionalType='https://schema.org/'+(localRoute==='/about/'?'AboutPage':'ContactPage');
  webpage.mainEntity=ref(business['@id']);
 }
 if(['/services/','/guides/','/case-studies/','/service-areas/','/news/'].includes(localRoute)){
  const links=new Set(page.$('main a[href]').toArray().map(n=>new URL(page.$(n).attr('href'),url).href));
  const members=pages.filter(p=>p!==page&&links.has(p.url)&&p.route.startsWith(page.route));
  const id=url+'#content-list';
  graph.push({'@type':'ItemList','@id':id,name:h1,numberOfItems:members.length,itemListElement:members.map((p,i)=>({'@type':'ListItem',position:i+1,name:p.h1,url:p.url,item:ref(p.url+'#webpage')}))});
  webpage.mainEntity=ref(id);
  if(localRoute==='/services/'){
   const services=members.map(p=>p.graph.find(n=>types(n).includes('Service'))).filter(Boolean);
   const catalogue={'@type':'OfferCatalog','@id':url+'#service-catalog',name:h1,itemListElement:services.map(s=>({'@type':'Offer',itemOffered:ref(s['@id'])}))};
   graph.push(catalogue);business.hasOfferCatalog=ref(catalogue['@id']);
   business.knowsAbout=services.map(s=>s.name);
  }
 }
 // Preserve all historical IDs, FAQ evidence, dates, prices (if any) and contacts.
 return graph;
}

export function enhanceMachineData({siteDir,routes,origin}){
 const verified=[];
 for(const prefix of ['/','/zh/']){
  const pages=routes.map(({route})=>readPage(siteDir,prefix==='/'?route:'/zh'+route,origin));
  const language=prefix==='/'?'en-AU':'zh-Hans',home=pages.find(p=>p.route===prefix);
  const feedUrl=origin+prefix+'feed.json',rssUrl=origin+prefix+'feed.xml',schemaUrl=origin+prefix+'schema-feed.json';
  for(const p of pages){
   enhanceGraph(p,pages,origin,prefix);
   const replaced=p.html.replace(/(<script\b[^>]*type="application\/ld\+json"[^>]*>)[\s\S]*?(<\/script>)/,(_,start,end)=>start+json(p.data)+end);
   const discovery=`<link data-machine-feed rel="alternate" type="application/feed+json" href="${feedUrl}"><link data-machine-feed rel="alternate" type="application/rss+xml" href="${rssUrl}"><link data-machine-feed rel="alternate" type="application/ld+json" href="${schemaUrl}">`;
   const output=replaced.replace('</head>',discovery+'</head>');
   assert.equal(stripMachineMarkup(output),stripMachineMarkup(p.html),`Non-JSON page change: ${p.route}`);
   fs.writeFileSync(p.file,output);
   verified.push({route:p.route,unchangedVisibleHtml:true,title:p.h1,keywords:p.keywords,keywordIds:p.matchedIds,entities:p.graph.map(n=>({'@id':n['@id'],'@type':n['@type']}))});
  }
  const items=pages.map(p=>({id:p.url,url:p.url,title:p.h1,summary:p.summary,content_html:p.content,language,tags:p.keywords}));
  const feed={version:'https://jsonfeed.org/version/1.1',title:home.h1,home_page_url:home.url,feed_url:feedUrl,description:home.summary,language,items};
  const schema={'@context':'https://schema.org','@type':'DataFeed','@id':schemaUrl+'#feed',url:schemaUrl,name:home.h1,description:home.summary,inLanguage:language,publisher:ref(home.graph.find(n=>types(n).includes('LocalBusiness'))['@id']),dataFeedElement:pages.map(p=>({'@type':'DataFeedItem',item:{'@type':'WebPage','@id':p.url+'#webpage',url:p.url,name:p.h1,description:p.summary,inLanguage:language,keywords:p.keywords,mainEntity:ref(p.graph.find(n=>types(n).includes('WebPage')).mainEntity?.['@id']??home.graph.find(n=>types(n).includes('LocalBusiness'))['@id'])}}))};
  const rss=`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${xml(home.h1)}</title><link>${xml(home.url)}</link><description>${xml(home.summary)}</description><language>${language}</language><atom:link href="${feedUrl.replace(/feed\.json$/,'feed.xml')}" rel="self" type="application/rss+xml"/>${items.map(item=>`<item><guid isPermaLink="true">${xml(item.id)}</guid><link>${xml(item.url)}</link><title>${xml(item.title)}</title><description>${xml(item.summary)}</description><content:encoded>${cdata(item.content_html)}</content:encoded>${item.tags.map(tag=>`<category>${xml(tag)}</category>`).join('')}</item>`).join('')}</channel></rss>`;
  const root=path.join(siteDir,prefix.slice(1));
  fs.writeFileSync(path.join(root,'feed.json'),JSON.stringify(feed,null,2));
  fs.writeFileSync(path.join(root,'schema-feed.json'),JSON.stringify(schema,null,2));
  fs.writeFileSync(path.join(root,'feed.xml'),rss);
  // Extend, do not replace, the two historical custom catalogues or their IDs.
  for(const name of ['case-studies','service-areas']){
   const file=path.join(root,name,'feed.json'),catalogue=JSON.parse(fs.readFileSync(file,'utf8'));
   const enrich=item=>{const p=pages.find(p=>p.url===item.url);if(p){item.keywords=p.keywords;item.summary=p.summary;item.mainEntityOfPage=ref(p.url+'#webpage');}return item;};
   if(catalogue.items)catalogue.items.forEach(enrich);
   if(catalogue.regions)catalogue.regions.forEach(r=>{enrich(r);r.suburbs.forEach(enrich);});
   catalogue.language=language;catalogue.relatedFeedUrl=feedUrl;
   fs.writeFileSync(file,JSON.stringify(catalogue,null,2));
  }
 }
 return verified;
}
