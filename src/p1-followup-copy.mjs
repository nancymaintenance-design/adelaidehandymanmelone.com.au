// Approved paragraph-only follow-up. Case evidence, pictures and FAQs stay intact.
export function applyP1FollowupCopy(content,focused){
 const fence=focused.find(x=>x.slug==='fence-gate-repair');
 if(!fence)throw Error('Missing approved fence/gate service');
 const links=p=>Array.isArray(p)?p.filter(x=>typeof x==='object'):[];
 const replace=(record,s,p,text)=>{
  const old=record.sections[s]?.paragraphs[p];
  if(!old||JSON.stringify(links(old))!==JSON.stringify(links(text)))throw Error(`Follow-up paragraph/link drift: ${record.slug}:${s}:${p}`);
  record.sections[s].paragraphs[p]=text;
 };
 const fenceLink=links(fence.sections[0].paragraphs[1]),gateLink=links(fence.sections[1].paragraphs[1]);
 if(fenceLink.length!==2||gateLink.length!==1)throw Error('Follow-up case link drift');
 for(const[s,p,text]of[
  [0,0,'After wind or rain, identify broken palings, moving posts or a dragging gate, and any wet ground beside a post. Supports and connections need assessment; replacing one board may leave the main fault unresolved.'],
  [0,1,['Our ',fenceLink[0],' documents completed fence-section work; the ',fenceLink[1],' documents assessment only, with no completed repair recorded.']],
  [1,0,'Compare local board or rail work, post work and wider replacement separately. Timber condition, fixings, access and boundary permission affect scope. Keep clear of unstable sections; leaning retaining walls, washout and pool-barrier faults need a separate specialist scope.'],
  [1,1,['Our ',gateLink[0],' documents timber-gate work. Describe dragging through the swing or near closing; hinges, supports and latch contact are checked together. Pool barriers and security systems need a separate specialist scope.']],
  [2,0,'Describe the material, affected length and faulty component: board, rail, post, hinge or latch. MEL ONE assesses the connected supports before proposing a local repair.'],
  [2,1,'Report difficult gate movement or loose sections that could fall. Do not lean on unstable fencing or test it repeatedly.'],
  [4,0,'List fence components and garden-gate hardware separately, including damaged timber, hinge movement and latch contact. The condition of their supports determines whether a local repair is appropriate.'],
  [4,1,'Use the three records above to distinguish fence-section repairs, timber-gate work and assessment-only evidence. Your property needs its own assessed scope.'],
  [5,0,'Ask which components will be repaired or replaced, and separate timber, hardware, finishing and waste handling in the quote. Material, access and shared-boundary permission affect scope.'],
 ])replace(fence,s,p,text);
 const cases={
  'marion-wardrobe-sliding-door-repair':[
   'For your wardrobe, identify dragging, rubbing, uneven or off-track movement and any visible damage to lower rollers, guides or track. Door weight, frame alignment, track debris and surrounding hardware affect assessment.',
   'Give your suburb, room, nearby furniture, parking or access limits, tenancy or property-manager arrangements and preferred timing. Do not force a jammed door or remove a large panel without suitable support. A description is enough; safe existing full-door or lower-track photos are optional and can be emailed to admin@melonemaintenance.com.au.',
   'Use the photographed roller work and aligned panels as a reference when describing your wardrobe.',
  ],
  'mile-end-fence-repair':[
   'For another fence, identify affected palings, rails, posts or gate hardware and any lean. Scope depends on boundaries, access, neighbours, underground services and concealed components as well as the visible damage.',
   'Give your suburb and affected section, noting side access, pets, shared boundaries and tenant or owner coordination before timing and scope are agreed. A description is enough; safe existing photos are optional and can be emailed to admin@melonemaintenance.com.au.',
   'The photos record split palings, replacement timber during work and a repaired fence section. Use that sequence to identify the part you want assessed.',
  ],
  'north-adelaide-timber-gate-repair':[
   'For another timber gate, describe dragging, catching, latch contact or loose timber, and affected access for bins, pets or occupants. Hinges, fasteners, frame, posts, ground clearance and neighbouring fence connections are assessed together.',
   'Give your suburb and any tenancy, strata or owner approval details. Do not force a jammed gate or remove heavy-gate hinges without safe support. A description is enough; safe existing photos are optional and can be emailed to admin@melonemaintenance.com.au.',
   'The photos record accessible hinge and frame adjustment and a closed gate. Use them to describe the affected part of your ordinary timber gate.',
  ],
 };
 for(const[slug,text]of Object.entries(cases)){
  const record=content.caseStudies.find(x=>x.slug===slug);
  if(!record||record.sections.length!==4||record.faqs.length!==1)throw Error(`Follow-up case drift: ${slug}`);
  replace(record,2,0,text[0]);replace(record,2,1,text[1]);
  const entry=links(record.sections[3].paragraphs[0]);
  if(entry.length!==1)throw Error(`Follow-up comparison link drift: ${slug}`);
  replace(record,3,0,[text[2]+' Compare the repair scope: ',entry[0],'.']);
 }
}
