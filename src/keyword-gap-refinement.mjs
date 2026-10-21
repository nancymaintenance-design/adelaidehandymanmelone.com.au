/** October 12: deepen existing keyword owners; no new services or case outcomes. */
const link=(url,label)=>({url,label});
const service=(slug,label,hash='')=>link(`/services/${slug}/${hash}`,label);
const work=(slug,label)=>link(`/case-studies/${slug}/`,label);
const guide=(slug,label)=>link(`/guides/${slug}/`,label);
const ask=label=>link('/contact/',label);
const section=(id,heading,paragraphs,links=[])=>({id,heading,paragraphs,links});
const faq=(question,answer)=>({question,answer});

function replaceSection(record,oldHeading,replacement){
 const index=record.sections.findIndex(s=>(s.heading||s.title)===oldHeading||s.id===replacement.id);
 if(index<0)throw new Error(`Missing keyword-gap section: ${record.slug}/${oldHeading}`);
 record.sections[index]=replacement;
}
function addLinks(record,links){
 record.relatedReading||=[];
 for(const l of links)if(!record.relatedReading.some(r=>r.url===l.url))record.relatedReading.push(l);
}

export function applyKeywordGapRefinement(content,focused){
 const get=slug=>{
  const r=[...content.services,...focused,...content.guides,...content.caseStudies].find(r=>r.slug===slug);
  if(!r)throw new Error(`Missing keyword-gap owner: ${slug}`);
  return r;
 };

 const screen=get('flyscreen-repair');
 screen.title='Flyscreen repair & mesh replacement in Adelaide';
 screen.description='Torn flyscreen mesh or a sticking ordinary screen door in Adelaide? Compare MEL ONE repair records and arrange an assessment of mesh, frames and rollers.';
 replaceSection(screen,'Mesh, frames and sliding screens',section('ordinary-screen-repairs','Flyscreen Mesh Replacement and Screen Door Hardware',[
  'Flyscreen repair starts with the part that is damaged. Torn mesh may need remeshing while retaining a usable frame. A screen that binds or leaves a gap when closed may need its frame, rollers or track assessed as well. Tell us whether it is a fixed window screen, hinged flyscreen door or sliding screen.',
  'The Norwood record shows window-screen mesh work. The Henley Beach record concerns lower rollers and alignment on an ordinary sliding screen door. These are different repairs: replacing the mesh does not by itself resolve a movement fault.',
  'An ordinary insect screen is not the same as a security screen door. Security-rated frames, locking hardware and proprietary systems need a separate specialist scope; the mesh and roller work described here does not establish a security rating.'
 ],[work('norwood-flyscreen-repair','Window flyscreen mesh replacement in Norwood'),work('henley-beach-sliding-screen-door-repair','Ordinary sliding-screen roller repair in Henley Beach'),ask('Request a flyscreen or ordinary screen-door assessment')]));
 screen.faqs[2]=faq('Is ordinary flyscreen repair the same as security screen door repair?','No. This page concerns ordinary insect-screen mesh, frames and moving screens. Security-rated doors, locks and proprietary security components need a separate specialist scope. Describe the existing system so the appropriate arrangements can be confirmed.');

 const door=get('door-repair');
 replaceSection(door,'Describe how the door behaves',section('sliding-door-types','Hinged Doors, Wardrobe Panels and Screen Doors',[
  'A hinged door that rubs or will not latch is a different repair from a wardrobe panel that catches along its track. MEL ONE assesses the movement, fittings and supporting material before agreeing an adjustment or parts repair. Describe the door type and where normal movement stops being smooth.',
  'We repair sliding wardrobe-door hardware, including the lower-roller and alignment work shown in our Marion case. Tell us where your panel catches or sits unevenly. We check the actual mechanism and compatible parts before agreeing your repair.',
  'For a sliding flyscreen, use the ordinary screen-repair information. For glass patio-door rollers and tracks, see the separate sliding-door repair page and its supplied patio-door case. Broken glazing, fire doors and security fittings still need separate assessment. Leave heavy panels in place rather than lifting them out for a photograph.'
 ],[work('marion-wardrobe-sliding-door-repair','Wardrobe sliding-door roller repair in Marion'),work('north-adelaide-door-repair','Hinged-door closing alignment in North Adelaide'),service('flyscreen-repair','Ordinary sliding-screen mesh and roller enquiries'),ask('Ask about a door or wardrobe sliding-door problem')]));
 const window=get('doors-windows-screens');
 replaceSection(window,'Sliding door and wardrobe roller repairs',section('door-repair-options','Choose the repair information for your door type',[
  'Start with the fitting, not just the symptom. A hinged door that catches, a wardrobe panel with worn moving parts and a sliding insect screen require different checks. Use the door-repair page for hinged doors and wardrobe sliding-door assessment, or the flyscreen page for ordinary mesh and moving-screen enquiries.',
  'The Burnside window record concerns sliding-window operation. For patio-door movement problems, the sliding-door service page has a separate lower-roller and dusty-track case. Broken glass, security and fire-rated systems need their own assessment and appropriate specialist arrangements; name those features in the request.'
 ],[service('door-repair','Door repairs and wardrobe sliding-door assessment','#sliding-door-types'),service('flyscreen-repair','Flyscreen mesh replacement and ordinary screen-door repair','#ordinary-screen-repairs'),work('burnside-window-repair','Sliding-window hardware repair in Burnside')]));

 const interior=get('interior-repairs-assembly');
 interior.seoTitle='Cabinet Repairs & Furniture Assembly Adelaide';
 interior.seoDescription='Kitchen cupboard hinges, sticking drawers or flat-pack furniture in Adelaide? MEL ONE assesses the fittings, compatible parts and agreed work before quoting.';
 replaceSection(interior,'Cabinet hinges and drawer alignment',section('cabinet-door-drawer-repairs','Kitchen cupboard doors, cabinet hinges and drawer runners',[
  'A cupboard front that hangs unevenly, a hinge screw that no longer holds and a drawer that jams are separate repair questions. Tell us which doors or drawers are affected, whether the issue changes during normal use and whether the supporting cabinet edge is visibly damaged.',
  "We check cupboard-door alignment, hinge condition and the material holding each fixing. Our Unley case shows door-alignment work. If the supporting board is damaged, that mounting point needs its own repair assessment before an adjustment is agreed.",
  'For a drawer, mention the cabinet or furniture model and any safely visible runner markings. Compatible dimensions, mounting points and the cabinet condition need checking before adjustment or replacement is agreed. Do not remove a heavy drawer or buy a similar-looking runner just to prepare the request.',
  'A flat-pack wardrobe needing assembly belongs with furniture assembly. A sliding wardrobe door needing roller or guide assessment belongs with door repair. These tasks can be listed together, but their scope and parts remain separate.'
 ],[work('unley-kitchen-cabinet-repair','Kitchen cupboard hinge and alignment record in Unley'),service('flat-pack-assembly','Flat-pack furniture and wardrobe assembly'),service('door-repair','Wardrobe sliding-door roller assessment','#sliding-door-types'),ask('Request a cupboard, cabinet or drawer assessment')]));
 // Keep wall-mounted fittings separate rather than repeating the expanded cabinet copy.
 replaceSection(interior,'Cupboard doors, drawer runners and wall-mounted fittings',section('wall-mounted-fittings','Picture hanging, shelves and curtain fittings',[
  'For a picture, mirror, shelf or curtain-rod bracket, give the product dimensions, weight if known and intended position. Identify an existing loose fitting separately from a new installation request. Wall construction, fixing points and concealed services affect what can be agreed.',
  'Tell us the mirror, shelf, blind or curtain-system model, size and intended load. We assess the actual product, wall and fixing points before agreeing installation. Keep an unstable fitting unused; product requirements, permission and any cord-safety arrangements form part of that assessment.'
 ],[link('https://www.productsafety.gov.au/business/search-mandatory-standards/blinds-curtains-and-window-fittings-mandatory-standard','ACCC guidance on blinds, curtains and cord safety'),ask('Discuss a picture, shelf or curtain-fitting request')]));

 const wall=get('home-repairs-renovation-support');
 wall.seoTitle='Wall Patching & Plasterboard Repairs Adelaide';
 wall.seoDescription='Discuss local plasterboard wall patches, skirting repairs and finishing in Adelaide. Compare MEL ONE repair records and confirm patching and painting scope.';
 replaceSection(wall,'Wall patches and skirting repairs',section('wall-patching','Local wall patching, plasterboard repairs and skirting',[
  'A hole in a plasterboard wall, damaged lower-wall finish and loose skirting should be listed as separate items. Give the room, approximate affected area and any nearby corner or trim. If you know the wall material or have paint details, include them without opening or sanding the surface.',
  'People sometimes describe plasterboard patching as Gyprock repair. The material and finish still need checking: this page concerns local wall-repair assessment, not an assumed service for every plaster, ceiling or structural problem. Note known water marks, recurring cracks or movement before cosmetic work is discussed.',
  'The Goodwood record shows a specific wall patch; the Adelaide CBD record includes lower-wall and skirting work. For your repair, confirm preparation, patching, drying stages and the requested finish. Painting is a separate scope item, and an exact local colour or texture match cannot be assumed.'
 ],[work('goodwood-wall-repair','Plasterboard wall patch record in Goodwood'),work('adelaide-cbd-wall-repair','Lower-wall and skirting repair in Adelaide CBD'),guide('field-notes-wall-interior-repairs-job-list','Prepare a wall-patching and finishing work list'),ask('Request a local wall or skirting repair assessment')]));

 const cleaning=get('cleaning-removals-specialist-care');
 replaceSection(cleaning,'Driveway and paved surface cleaning',section('pressure-cleaning','Driveway pressure cleaning and paved-surface assessment',[
  'For driveway pressure cleaning in Adelaide, identify the surface before deciding on a method. Tell MEL ONE about paving or concrete, any known coating, stains, loose sections and damaged joints. Include the approximate area, water access and drainage; a photograph does not by itself establish which method suits the surface.',
  'In Burnside, we pressure-cleaned driveway pavers. For your property, we assess the material, condition and expected result before agreeing the method. Roofs and coated or delicate surfaces need their own assessment; driveway cleaning is not a promise to remove every stain.',
  'Keep cleaning separate from repairs and waste collection. Ask which areas, preparation and waste handling are included, and which damaged joints or pavers need another scope. List any household clear-out or garden work as a separate line in the request.'
 ],[work('burnside-driveway-pressure-cleaning','Paved-driveway pressure cleaning record in Burnside'),guide('field-notes-cleaning-removals-preparation','Prepare driveway and paver cleaning details'),service('garden-landscape-care','Garden tidy-ups and green-waste arrangements'),ask('Request a driveway or paved-surface cleaning assessment')]));

 const flat=get('flat-pack-assembly');
 replaceSection(flat,'Identify the product and assembly stage',section('furniture-assembly','Flat-pack furniture assembly: product, parts and instructions',[
  'MEL ONE assesses flat-pack furniture assembly in Adelaide using the supplied product, parts and instructions. Give the model, item count and intended room, and say whether the cartons are unopened or assembly has already started. Identify missing hardware or damaged panels before the visit is planned.',
  'The Kensington record shows assembly of an IKEA KALLAX shelving unit; the Stirling record shows a flat-pack wardrobe. These are different products, not a promise to assemble every model. IKEA is the product brand in the case record; MEL ONE is not an official IKEA assembly service or affiliated provider.',
  'Assembly, wall anchoring, moving heavy items and packaging removal are separate scope questions. Share manufacturer requirements and the intended position so access, suitable fixing arrangements and permission can be confirmed before the written quote is approved.'
 ],[work('kensington-furniture-assembly','IKEA KALLAX assembly record in Kensington'),work('stirling-flat-pack-wardrobe-assembly','Flat-pack wardrobe assembly record in Stirling'),service('interior-repairs-assembly','Cupboard hinges and drawer repair enquiries','#cabinet-door-drawer-repairs'),ask('Request flat-pack furniture assembly')]));
 flat.faqs[0]=faq('Can I enquire about IKEA furniture assembly, and are you affiliated with IKEA?','You can describe the IKEA product and share its instructions for assessment. The Kensington record shows an IKEA KALLAX assembly. MEL ONE is not an official IKEA service or affiliated provider; the included assembly and any anchoring are confirmed for your product.');

 const gutter=get('gutter-cleaning');
 replaceSection(gutter,'Agree what cleaning includes',section('gutter-cleaning-scope','Gutter cleaning, outlets and repairs: agree the scope',[
  'Confirm the gutter sections that can be safely accessed, debris handling and any included accessible outlet checks in the quote. Downpipe blockage removal, damaged joints, resealing and roof repairs are not automatically included in gutter cleaning. Report overflow or a leak separately so the appropriate work can be assessed.',
  'The Prospect record shows gutter debris being cleared. It documents that property, not the cause of water spilling at your home. Ask what was observed after cleaning and which remaining concerns need separate repair or qualified assessment; clearing leaves is not a weatherproofing guarantee.'
 ],[work('prospect-gutter-cleaning','Photographed gutter cleaning in Prospect'),service('roof-gutter-exterior-care','Separate roof, fascia and exterior-maintenance concerns'),ask('Request a gutter-cleaning assessment')]));

 const fence=get('fence-gate-repair');
 replaceSection(fence,'Repair scope and evidence',section('timber-fence-gate-scope','Timber Fence Repairs and Gate Hardware',[
  'For a timber fence, distinguish damaged palings from loose rails or posts. For a timber garden gate, describe dragging, hinge movement and latch contact. Connected supports are assessed before a local repair is proposed; replacing the visible damaged piece alone may not address the cause.',
  'The Mile End fence and North Adelaide timber-gate records show repair work on different components. The Modbury fence record is assessment-only: it documents condition and planning, not completed repair. Ask the quote to identify boards, supports, hardware, finishing and waste handling where relevant.',
  'For a security gate, automatic gate or pool barrier, identify the system when you contact us. Those systems need a separate specialist scope from the ordinary timber fence and garden-gate repairs shown here.'
 ],[work('mile-end-fence-repair','Timber fence-section repair in Mile End'),work('north-adelaide-timber-gate-repair','Timber gate and latch repair in North Adelaide'),work('modbury-timber-fence-repair-assessment','Modbury fence condition assessment only'),service('outdoor-structures-fences-pools','Deck, pergola and wider outdoor-timber concerns'),ask('Request a timber fence or garden-gate assessment')]));

 // Guides recommend existing owners, not new thin landing pages.
 const guides={
  'field-notes-doors-windows-screens-enquiry':[
   service('door-repair','Hinged-door and wardrobe sliding-door enquiries','#sliding-door-types'),service('flyscreen-repair','Ordinary screen-door repair and fly screen replacement','#ordinary-screen-repairs')],
  'field-notes-wall-interior-repairs-job-list':[
   service('interior-repairs-assembly','Kitchen cabinet hinges and drawer-runner assessment','#cabinet-door-drawer-repairs'),service('home-repairs-renovation-support','Wall patching and skirting repair assessment','#wall-patching')],
  'field-notes-cleaning-removals-preparation':[
   service('cleaning-removals-specialist-care','Driveway pressure-cleaning assessment','#pressure-cleaning')],
  'field-notes-rental-end-of-lease-maintenance-list':[
   service('door-repair','Door adjustment on an approved rental work list'),service('interior-repairs-assembly','Cupboard and drawer repairs requiring approval','#cabinet-door-drawer-repairs'),service('home-repairs-renovation-support','Wall patching before an agreed rental handover','#wall-patching')],
  'field-notes-pre-sale-home-maintenance-list':[
   service('door-repair','Door adjustments before sale'),service('flyscreen-repair','Flyscreen mesh repairs before inspection'),service('cleaning-removals-specialist-care','Assess paved-driveway cleaning separately','#pressure-cleaning')]
 };
 for(const [slug,links]of Object.entries(guides))addLinks(get(slug),links);

 // Keep each original result untouched; add precise next-step navigation only.
 for(const [slug,target,label]of[
  ['marion-wardrobe-sliding-door-repair','/services/door-repair/#sliding-door-types','Compare your wardrobe sliding-door repair enquiry'],
  ['unley-kitchen-cabinet-repair','/services/interior-repairs-assembly/#cabinet-door-drawer-repairs','Kitchen cupboard hinges, cabinet doors and drawers'],
  ['goodwood-wall-repair','/services/home-repairs-renovation-support/#wall-patching','Local plasterboard wall patching and finishing'],
  ['adelaide-cbd-wall-repair','/services/home-repairs-renovation-support/#wall-patching','Wall and skirting repairs for an assessed work list'],
  ['burnside-driveway-pressure-cleaning','/services/cleaning-removals-specialist-care/#pressure-cleaning','Driveway pressure-cleaning scope and enquiry details']
 ])addLinks(get(slug),[link(target,label)]);
}
