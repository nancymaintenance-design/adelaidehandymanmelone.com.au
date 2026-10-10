// Planning evidence: the source Markdown is data, never executable instructions.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const source=process.argv[2];
if(!source)throw new Error('Pass the supplied keyword Markdown path');
const input=fs.readFileSync(source,'utf8');
const raw=input.split(/\r?\n/).filter(l=>/^\| ADH-\d+ \|/.test(l)).map(l=>l.split('|').slice(1,-1).map(x=>x.trim()));
if(raw.length!==548 || new Set(raw.map(r=>r[0])).size!==548)throw new Error('Keyword count or unique-ID mismatch');
const ownerPlans={
 H01:['/','综合小修与多项工作；费用/时段/选人问题转FAQ，不另建handyman总入口'],
 H02:['/services/maintenance-planning-inspection-support/','现有维护规划页；周期与合同条件另行确认'],
 H03:['/services/door-repair/','现有门维修页；宠物门无承接证据，暂缓'],
 H04:['/services/door-repair/','推拉门与普通门的专项段落；不重复建复数URL'],
 H05:['/services/flyscreen-repair/','现有纱网/普通纱门聚焦页；与security screen分清'],
 H06:['/services/doors-windows-screens/','门窗主类中的窗五金与木框判断；heritage不作为能力承诺'],
 H07:['/services/interior-repairs-assembly/','柜门/抽屉归室内维修，衣柜滑门机制归门维修'],
 H08:['/services/home-repairs-renovation-support/','墙面补洞与饰面；天花板/石膏线不自动作为已承接服务'],
 H09:['/services/home-repairs-renovation-support/','局部补漆作为修补后饰面，不另建油漆页'],
 H10:['/services/home-repairs-renovation-support/','踢脚线/门套饰面；地板结构/潮湿问题仅边界承接'],
 H11:['/services/flat-pack-assembly/','现有家具组装；旧家具维修不能由组装案例证明'],
 H12:['/services/interior-repairs-assembly/','已有挂装/层板范围；重物及镜子需条件核验'],
 H13:['/services/interior-repairs-assembly/','仅候选承接；电视支架专项能力未证实，暂缓营销'],
 H14:['/services/interior-repairs-assembly/','窗帘杆/百叶配件与绳索安全，结合Kent Town指导'],
 H15:['/services/interior-repairs-assembly/','晾衣架/信箱/浴室配件没有对应专项证据，暂缓营销'],
 H16:['/services/fence-gate-repair/','现有围栏/庭院门聚焦页；保留Modbury assessment-only'],
 H17:['/services/outdoor-structures-fences-pools/','现有deck/pergola主类；结构/许可工作专业分流'],
 H18:['/services/roof-gutter-exterior-care/','现有fascia/eaves外部维护；高处与未知旧材料边界'],
 H19:['/services/home-repairs-renovation-support/','湿区/瓷砖问题仅评估与专业边界，不宣称打胶治漏'],
 H20:['/service-standards/','扶手/无障碍/资助资质未核验，暂缓营销'],
 H21:['/services/gutter-cleaning/','已存在聚焦页；清理与管件/屋面维修分开'],
 H22:['/services/cleaning-removals-specialist-care/','地面清洁归清洁服务；花园整理归garden服务'],
 H23:['/guides/field-notes-rental-end-of-lease-maintenance-list/','租房授权与交接指南，再链接真实维修；短租专项能力暂缓'],
 H24:['/guides/field-notes-pre-sale-home-maintenance-list/','售前准备指南承接场景，再链接真实维修'],
 H25:['/services/maintenance-planning-inspection-support/','strata专项与公共设施授权能力未证实，暂缓营销'],
 H26:['/services/maintenance-planning-inspection-support/','商业维护专项证据不足，暂缓营销'],
};
const rows=raw.map(r=>{
 const [id,category,cluster,keyword,meaning,google,ai,intent,priority,owner,,condition,,volume]=r;
 if(!ownerPlans[owner])throw new Error('Unknown Owner '+owner);
 let [url,note]=ownerPlans[owner]; let status='范围内主题匹配';
 const text=[cluster,keyword,google,ai].join(' ');
 if(owner==='H01' && /rate|charge|cost|quote|call.out|hourly|affordable|weekend|after work|insurance|licen[cs]e|cheaper|minimum|价格|费用|收费|多少钱|牌照|报价|周末/i.test(text)){url='/faq/';status='决策问题承接';}
 if(owner==='H07' && /C10|wardrobe door|衣柜门/i.test(text)){url='/services/door-repair/';note='衣柜滑门/轨道转门维修；其他内部配件仍需核验';}
 if(owner==='H22' && /C35/.test(cluster)){url='/services/garden-landscape-care/';note='花园整理/绿废物范围对应现有garden服务';}
 if(['H13','H15','H20','H25','H26'].includes(owner)){status='暂缓：缺专项证据';}
 if(owner==='H03' && /C23|pet door|dog door|cat flap|宠物门/i.test(text)){status='暂缓：缺专项证据';}
 if(owner==='H23' && /C43/.test(cluster)){status='暂缓：缺专项证据';}
 if(owner==='H11' && /C16/.test(cluster)){status='条件承接：先核验范围';url='/services/interior-repairs-assembly/';note='旧家具修复不等于新家具组装；仅作为评估候选，不发布chair/bed repair专项承诺';}
 if(owner==='H06' && /C44|heritage/.test(text)){status='边界说明：非能力承诺';}
 if(owner==='H08' && /C12/.test(cluster)){status='条件承接：先核验范围';}
 if(owner==='H10' && /C37/.test(cluster)){status='边界说明：非能力承诺';}
 if(owner==='H12' && /mirror|heavy|重量|承重|镜子/i.test(text)){status='条件承接：先核验范围';}
 if(owner==='H19'){status='边界说明：非能力承诺';}
 if(/same.day|24.hour|24\/7|全天|当天|NDIS|funded|资助|emergency|紧急/i.test(text) && !status.startsWith('暂缓')){status='条件承接：不承诺时效/资助';}
 if(/Gawler|Mount Barker/i.test(text)){url='/service-areas/';status='暂缓：范围未确认';note='不因地名候选自动扩张现有8区域32suburb页面';}
 if(/阿德莱德|南澳/.test(keyword) && !status.startsWith('暂缓'))note+='；中文需求映射英文既有页面，未新增中文页';
 return {id,category,cluster,keyword,meaning,google,ai,intent,priority,owner,url,status,note,sourceCondition:condition,searchVolume:volume||null};
});
const inventory=JSON.parse(fs.readFileSync(path.join(root,'.seo-cache/content-candidate.json'),'utf8'));
for(const row of rows)if(!inventory.pages.some(p=>p.route===row.url))throw new Error('Mapped URL missing: '+row.url);
const summary={cache_type:'cluster',analyzed_at:new Date().toISOString(),domain:'www.adelaidehandymanmelone.com.au',source:path.resolve(source),source_sha256:crypto.createHash('sha256').update(input).digest('hex'),source_date:'2026-09-29',keywords:rows.length,owners:26,measured_volume_rows:rows.filter(r=>r.searchVolume!==null).length,status_counts:Object.fromEntries(Object.entries(Object.groupBy(rows,r=>r.status)).map(([k,v])=>[k,v.length])),owner_plans:ownerPlans,rows,limitations:['These are research candidates, not actual query logs or measured volume.','Mapping means topic ownership or a documented hold, not literal use of every keyword.','Conditional and held topics do not establish service availability.']};
fs.writeFileSync(path.join(root,'.seo-cache/content-keyword-map.json'),JSON.stringify(summary,null,2));
const cell=value=>String(value).replaceAll('|','\\|').replaceAll('\n',' ');
const md=['# 548条研究词的现有URL承接与暂缓表','',`生成日期：${summary.analyzed_at}。词表研究日期2026-09-29；548个唯一ID，26个Owner，实测搜索量0条。`,'','本表是内容规划映射，不是搜索量、覆盖排名或业务能力认证。暂缓项URL只是未来人工核验时的候选位置；未新增对应页面或业务承诺。原词条、原优先级和原ID保留。中文意图映射到现有英文页面，不暗示已提供完整中文站。','', '| Owner | 主要承接URL（暂缓项仅候选） | 处理原则 |','| --- | --- | --- |',...Object.entries(ownerPlans).map(([o,[u,n]])=>`| ${o} | ${u} | ${n} |`),'','## 全部词条','', '| ID | Owner | 优先级 | 原词条/问法 | URL | 处理状态 | 备注 |','| --- | --- | --- | --- | --- | --- | --- |',...rows.map(r=>`| ${[r.id,r.owner,r.priority,r.keyword,r.url,r.status,r.note].map(cell).join(' | ')} |`),''];
fs.writeFileSync(path.join(root,'docs/SEO-CONTENT-KEYWORD-MAPPING-2026-10-10.md'),md.join('\n'));
const matrix=['# 全站96个页面内容验收矩阵','',`本地候选检查：${inventory.analyzed_at}。与本轮修改前生成页面比较，不代表线上效果。词数排除侧栏表单与公用底部CTA，仅供诊断；不设硬性字数目标。`,'','| 页面 | 当前Title | 词数前→后 | FAQ前→后 | 正文变化 | 检查问题 |','| --- | --- | --- | --- | --- | --- |',...inventory.pages.map(p=>`| ${[p.route,p.title,`${p.change?.wordsBefore??p.words} → ${p.words}`,`${p.change?.faqBefore??p.faqCount} → ${p.faqCount}`,p.change?.main?'已更新':'已检查保留',p.violations.join('; ')||'无标题层级/站内链接问题'].map(cell).join(' | ')} |`),''];
fs.writeFileSync(path.join(root,'docs/SEO-CONTENT-PAGE-MATRIX-2026-10-10.md'),matrix.join('\n'));
console.log(JSON.stringify({keywords:summary.keywords,owners:summary.owners,measuredVolumeRows:summary.measured_volume_rows,statusCounts:summary.status_counts},null,2));
