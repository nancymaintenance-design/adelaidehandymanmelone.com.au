// Approved local P2 edit: paragraph-only, with original headings, links and FAQs.
const link=(url,label)=>({url,label});
const edits={
 'cabinet-drawer-repair':[
  [0,0,'For a low-hanging cupboard front, identify the loose screw, moving hinge or swollen or crumbling fixing board. Tightening into weakened board may not provide a suitable repair.'],
  [0,1,['Our ',link('/case-studies/unley-kitchen-cabinet-repair/','Unley cupboard-door alignment repair'),' documents alignment work. The hinge plate and supporting board determine whether adjustment, refixing or compatible parts are appropriate.']],
  [1,0,'For a drawer that drops or stops halfway, note runner markings, whether the drawer box is square and any water-affected panels. These can require different work.'],
  [1,1,['The ',link('/case-studies/kitchen-drawer-runner-repair/','sagging kitchen drawer runner repair'),' documents damaged-runner work. Report catching or uneven closing; soft-close components must suit the actual system.']],
  [2,0,'Drawer runners control drawer travel; cupboard hinges support and align doors. MEL ONE assesses the affected fitting and surrounding cabinet together.'],
  [2,1,'Identify whether one drawer, several drawers or a door is affected. The quote distinguishes adjustment, hardware work and damaged-board repairs.'],
  [3,0,'The photos below show the sagging kitchen drawer before, during and after damaged-runner repair. The Unley job involved cupboard-door alignment.'],
  [3,1,'Replacement runners need compatible dimensions, fixings and load requirements. Share visible model markings; leave concealed fixings and heavy drawers in place for assessment.'],
  [4,0,'Targeted hardware work depends on suitable cabinet supports. Distorted drawer boxes, damaged board and worn fittings can change the scope; a soft-close conversion is not automatically included.'],
  [4,1,'Discuss matching requirements and neighbouring drawers. Confirm the work and written quote before proceeding; a photo is not a final parts specification.'],
 ],
 'flyscreen-repair':[
  [0,0,'From a safe position, identify torn mesh, a loose mesh edge or a poorly fitting frame. Remeshing depends on the mesh, spline and frame; it does not repair window rain entry or provide a weather seal.'],
  [0,1,['Our ',link('/case-studies/norwood-flyscreen-repair/','Norwood flyscreen remeshing record'),' documents mesh work. Bent frames and worn moving hardware need separate repair items.']],
  [1,0,'If intact mesh moves in a panel that drags, drops or leaves a closing gap, rollers, guides or track may need attention. Give the screen count and opening type.'],
  [1,1,['The ',link('/case-studies/henley-beach-sliding-screen-door-repair/','Henley Beach sliding-screen repair'),' documents lower-roller work and alignment. Describe where your ordinary insect screen catches; security screens, glazing and weatherproofing need separate assessment.']],
  [2,0,'Identify a fixed window screen, hinged flyscreen door or sliding screen. A usable frame may be retained for remeshing; binding or closing gaps also need frame or hardware assessment.'],
  [2,1,'Norwood documents window-screen mesh work; Henley Beach documents ordinary sliding-screen rollers and alignment. Remeshing alone does not resolve a movement fault.'],
  [2,2,'Ordinary insect-screen repairs do not establish a security rating. Security-rated frames, locks and proprietary security systems need a separate specialist scope.'],
  [4,0,'Confirm access, materials and the written quote before agreed work. Locks, glazing and specialist proprietary parts may need a different service arrangement and are not established as included.'],
  [4,1,'For moving screens, agree checks of closing, travel and mesh finish. Each screen is assessed on its own condition.'],
 ],
 'pressure-cleaning':[
  [0,0,'For a slippery or stained driveway after rain, identify the paving, shade, loose joints and standing water. The Burnside cleaning record does not establish a correction to falls or underground drainage.'],
  [0,1,['Our ',link('/case-studies/burnside-driveway-pressure-cleaning/','Burnside paved-driveway cleaning record'),' shows the mossy surface and visible result. Paving, coatings and joints need assessment before choosing a method; some stains can remain.']],
  [1,0,'Agree the cleaning boundary, method, water access and runoff arrangements. Damaged joints, coatings and nearby plants affect preparation; maximum pressure is not a substitute for assessment.'],
  [1,1,'Agree displaced-debris handling before the visit. Re-sanding, sealing, repairs and stain treatment are separate items where needed; cleaning does not correct poor drainage or damaged paving.'],
  [2,0,'MEL ONE assesses driveway and paved-surface cleaning by material, condition, access and intended result. Identify paving, concrete, coatings or sealants and the dirt or growth to address.'],
  [2,1,'Loose pavers, damaged joints and ageing coatings affect the method. Stronger pressure is not automatically suitable.'],
  [3,0,'The Burnside photos show the mossy paved driveway, cleaning in progress and visible result. Your surface needs its own assessment of method and expected finish.'],
  [3,1,'Mention roofs or delicate finishes separately: they need their own assessment and method rather than the driveway-paver approach.'],
  [4,0,'Give the approximate area, vehicle access, water availability, drainage and nearby belongings or plants. Note loose material, joint damage and previous coatings or treatments; a photo does not determine the method.'],
  [4,1,'The written quote identifies surfaces, agreed work and preparation responsibilities. Extra areas and stain guarantees are not automatic inclusions. Discuss remaining concerns after the work; cleaning does not establish an underlying repair.'],
 ],
};
export function applyP2CopyConcision(focused){
 for(const [slug,paragraphs]of Object.entries(edits)){
  const record=focused.find(x=>x.slug===slug);
  if(!record)throw Error(`Missing P2 service: ${slug}`);
  for(const [section,index,text]of paragraphs){
   const current=record.sections[section]?.paragraphs[index];
   if(!current)throw Error(`P2 paragraph drift: ${slug}:${section}:${index}`);
   const links=p=>Array.isArray(p)?p.filter(x=>typeof x==='object'):[];
   if(JSON.stringify(links(current))!==JSON.stringify(links(text)))throw Error(`P2 link drift: ${slug}:${section}:${index}`);
   record.sections[section].paragraphs[index]=text;
  }
 }
}
