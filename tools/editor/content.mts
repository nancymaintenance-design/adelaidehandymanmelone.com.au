import {readFileSync,readdirSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {load,type CheerioAPI} from 'cheerio';
import type {AnyNode,Text} from 'domhandler';
import {publicRoot,pages,sourceRoot} from './manifest.mts';
import {EditorError,type DraftRevision} from './store.mts';

export const hash=(value:string):string=>createHash('sha256').update(value).digest('hex');
export type FieldKind='text'|'alt'|'seoTitle'|'seoDescription';
interface Slot {node:AnyNode;attr?:string;kind:FieldKind;value:string}
export interface EditorField {id:string;value:string;publishedValue:string;kind:FieldKind;sourcePath:string;locked:boolean}
export interface EditorModel {pageId:string;route:string;baseHash:string;fields:EditorField[];english:string;chinese:string}
const cache=new Map<string,{stamp:string;model:EditorModel}>();
const normalise=(s:string)=>s.replace(/\s+/g,' ').trim();
function translationLocations():Map<string,string>{
 const root=join(sourceRoot,'src/i18n'),en:Record<string,string>=JSON.parse(readFileSync(join(root,'en.json'),'utf8'));
 const owners=new Map<string,string>();
 for(const file of readdirSync(root).filter(file=>/^zh-.*\.json$/.test(file)))for(const id of Object.keys(JSON.parse(readFileSync(join(root,file),'utf8'))))owners.set(id,file);
 return new Map(Object.entries(en).map(([id,value])=>[normalise(value),`src/i18n/en.json#${id} → src/i18n/${owners.get(id)??'待助手核对'}#${id}`]));
}
function slots($:CheerioAPI):Slot[]{
 const out:Slot[]=[];
 function walk(node:AnyNode):void{
  if(node.type==='text'){
   // Include punctuation on BOTH sides: English '. The' may translate to '。'.
   // Filtering by language characters would shift every later paired field.
   if(node.data.trim())out.push({node,kind:'text',value:node.data.trim()});
   return;
  }
  if('name' in node&&['script','style','svg','noscript'].includes(node.name))return;
  if('attribs' in node&&node.attribs.translate==='no')return;
  if('attribs' in node&&node.name==='img'&&node.attribs.alt)out.push({node,attr:'alt',kind:'alt',value:node.attribs.alt});
  if('children' in node)node.children.forEach(walk);
 }
 const main=$('main')[0];if(main)walk(main);
 const title=$('title')[0];if(title&&'children' in title&&title.children[0])out.push({node:title.children[0],kind:'seoTitle',value:$(title).text()});
 $('meta[name="description"],meta[property="og:title"],meta[property="og:description"],meta[name="twitter:title"],meta[name="twitter:description"]').each((_,node)=>{out.push({node,attr:'content',kind:'seoDescription',value:$(node).attr('content')||''});});
 return out;
}
export function editorContent(pageId:string):EditorModel{
 const page=pages.find(page=>page.pageId===pageId);if(!page)throw new EditorError(404,'页面未登记');
 const stamp=[join(publicRoot,page.file),join(publicRoot,'zh',page.file)].map(file=>{const s=statSync(file);return s.mtimeMs+':'+s.size;}).join('|');
 const previous=cache.get(pageId);if(previous?.stamp===stamp)return previous.model;
 const english=readFileSync(join(publicRoot,page.file),'utf8');
 const chinese=readFileSync(join(publicRoot,'zh',page.file),'utf8');
 const en=slots(load(english)),zh=slots(load(chinese));
 if(en.length!==zh.length||en.some((slot,index)=>slot.kind!==zh[index].kind))throw new EditorError(409,`中英文结构不一致，请通知助手核对：${pageId}`);
 const locations=translationLocations();
 const fields=en.map((slot,index):EditorField=>({
  id:'field-'+index,value:slot.value,publishedValue:zh[index].value,kind:slot.kind,sourcePath:locations.get(normalise(slot.value))??page.file+'#field-'+index,
  locked:!/[\p{L}]/u.test(slot.value)||!/[\p{L}]/u.test(zh[index].value)||/@|\bABN\b|\bACN\b|0416|61416614281|63 Pirie|MEL ONE PROPERTY|\$\s*\d|\bAUD\b/i.test(slot.value),
 }));
 const model={pageId,route:page.route,baseHash:hash(english+chinese),fields,english,chinese};
 cache.set(pageId,{stamp,model});return model;
}
export function normalizeDraftChanges(model:EditorModel,input:unknown):Record<string,string>{
 if(!input||typeof input!=='object'||Array.isArray(input))throw new EditorError(400,'草稿格式无效');
 const out:Record<string,string>={};
 for(const [id,value] of Object.entries(input)){
  const field=model.fields.find(field=>field.id===id);
  if(!field||field.locked)throw new EditorError(400,'字段不可编辑，请重新载入');
  if(typeof value!=='string'||!value.trim()||value.length>20000)throw new EditorError(400,'中文内容不能为空或超过20000字');
  if(value!==field.publishedValue)out[id]=value;
 }
 return out;
}
export function checkedChanges(model:EditorModel,draft:DraftRevision|null):Record<string,string>{
 if(!draft)return {};
 if(model.baseHash!==draft.baseHash)throw new EditorError(409,'页面基线已更新，请让助手合并旧草稿，勿覆盖');
 return normalizeDraftChanges(model,draft.changes);
}
export function renderPreview(model:EditorModel,draft:DraftRevision|null,chinese:boolean,origin:string):string{
 const $=load(chinese?model.chinese:model.english),fields=slots($),changes=chinese?checkedChanges(model,draft):{};
 for(let index=0;index<fields.length;index++){
  const slot=fields[index],field=model.fields[index];
  if(changes[field.id]!==undefined){
   if(slot.attr&&'attribs' in slot.node)slot.node.attribs[slot.attr]=changes[field.id];
   else if(slot.node.type==='text'){
    const before=slot.node.data;
    slot.node.data=(before.match(/^\s*/)?.[0]||'')+changes[field.id]+(before.match(/\s*$/)?.[0]||'');
   }
  }
  if(chinese&&!field.locked&&slot.kind==='text')$(slot.node).replaceWith($('<span>').attr({'data-editor-field':field.id,tabindex:'0',role:'button','aria-label':'编辑中文'}).text((slot.node as Text).data));
 }
 // The preview cannot send enquiries, execute site tracking or contact map hosts.
 $('script,iframe').remove();
 $('link[rel="canonical"],link[rel="alternate"],meta[property="og:url"]').remove();
 $('head').prepend($('<base>').attr('href',origin+'/')).append('<meta name="robots" content="noindex,nofollow"><style>[data-editor-field]:hover,[data-editor-field]:focus-visible{outline:2px solid #075873;outline-offset:2px;cursor:text}</style>');
 const bridge=`document.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation()},true);document.addEventListener('click',e=>{const n=e.target.closest('[data-editor-field]');if(n){e.preventDefault();e.stopImmediatePropagation();parent.postMessage({type:'editor-field',id:n.dataset.editorField},new URL(document.baseURI).origin);return}if(e.target.closest('a,button,input,select,textarea')){e.preventDefault();e.stopImmediatePropagation()}},true);document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-editor-field]')){e.preventDefault();parent.postMessage({type:'editor-field',id:e.target.dataset.editorField},new URL(document.baseURI).origin)}});`;
 // Keep the site's collapsed mobile navigation geometry without running its
 // enquiry/analytics scripts. Navigation itself stays disabled in the preview.
 const navigation="document.documentElement.classList.add('nav-enhanced');const mq=matchMedia('(max-width:850px)'),nav=document.querySelector('#primary-nav'),menu=document.querySelector('.menu-toggle');function syncNav(){if(menu)menu.hidden=!mq.matches;if(nav)nav.hidden=mq.matches;}mq.addEventListener('change',syncNav);syncNav();";
 $('body').append($('<script>').text(navigation+bridge));
 return $.html();
}
