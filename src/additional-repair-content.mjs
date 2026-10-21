/** Supplied repair evidence, 12 October 2026. No job suburb or work date was supplied. */
const section=(heading,...paragraphs)=>{
 const linked=paragraphs.map(text=>{
  const matches=[...text.matchAll(/<a href="([^"]+)">([^<]+)<\/a>/g)];
  if(!matches.length)return text;
  const parts=[];let end=0;
  for(const match of matches){parts.push(text.slice(end,match.index),{url:match[1],label:match[2]});end=match.index+match[0].length;}
  parts.push(text.slice(end));return parts;
 });
 return {heading,paragraphs:linked};
};
const enquiry='Contact MEL ONE with your suburb, a short description and preferred contact details to arrange assessment. Safe existing photos are optional; email them to admin@melonemaintenance.com.au. The condition, compatible materials and written quote are confirmed before agreed work begins.';
export const additionalFocusedServices=[
 {
  slug:'cabinet-drawer-repair',title:'Cabinet and drawer repair in Adelaide',
  description:'Sagging drawer, damaged runners or uneven cabinet doors? MEL ONE assesses Adelaide cabinet and drawer repairs. View real repair photos and request a written quote.',
  parent:'interior-repairs-assembly',caseSlugs:['kitchen-drawer-runner-repair','unley-kitchen-cabinet-repair'],
  sections:[
   section('Drawer Runners and Cabinet Door Hinges', 'Cabinet and drawer repair starts with the part that is not working as it should. A kitchen drawer that drops, catches or will not close may have a runner or fixing problem. A cupboard door hanging unevenly raises different questions about hinges, attachment points and alignment. MEL ONE assesses the fitting and surrounding cabinet before recommending work.', 'Tell us whether the problem affects one drawer, several drawers or a cabinet door. Describe where movement catches and whether the front has dropped. Runner repair, hinge adjustment and repair of damaged cabinet material are different tasks; the quote should identify which are needed.'),
   section('A sagging kitchen drawer: the photographed record', "We repaired the sagging kitchen drawer shown below after damaged runners made it hard to open and close. The photos show the drawer before, during and after runner work. Our Unley case shows a different job: cupboard-door alignment.", "For your cabinet, we check the drawer box, mounting points and runner arrangement together before agreeing the repair. Replacement runners need compatible dimensions, fixings and load requirements. Share model markings if already visible; leave concealed fixings and heavy drawers in place for assessment."),
   section('Cabinet Condition and Targeted Hardware Repairs', 'A targeted hardware repair may be appropriate when the cabinet and fixing points remain suitable. Loose or damaged board, distorted drawer boxes and worn hardware can change the scope. A replacement runner must suit the dimensions and existing arrangement; a soft-close conversion is not automatically included.', 'Assessment separates adjustment from parts work or cabinet repair. Discuss any matching requirement and whether surrounding drawers need attention. We confirm the proposed work and written quote before proceeding, rather than treating a photo as a final parts specification.'),
   section('Prepare your cabinet repair enquiry', 'Provide your suburb, the number of affected drawers or doors and whether they still operate. A safe photo of the full cabinet and a visible runner or hinge helps explain the problem. Empty loose contents if this can be done safely, but do not repeatedly force a sagging drawer or remove it solely for a photograph.', enquiry, 'For a new kit rather than an existing cabinet fault, see <a href="/services/flat-pack-assembly/">flat-pack furniture assembly</a>. Use the <a href="/guides/field-notes-wall-interior-repairs-job-list/">interior repair job-list guide</a> when grouping several small jobs. <a href="/contact/">Request a cabinet or drawer assessment</a>.'),
  ],
  faqs:[
   {question:'Can a sagging drawer be repaired without replacing the kitchen?',answer:'A targeted repair may be possible. The runners, drawer box and cabinet fixing points need assessment before deciding whether hardware work or additional cabinet repair is appropriate.'},
   {question:'Do all damaged drawer runners need replacing?',answer:"Not every damaged runner needs replacement. We check its condition, fixings and compatible parts before agreeing adjustment, runner repair or replacement."},
   {question:'Can you also assess uneven cupboard doors?',answer:"Yes. We assess cupboard hinges, fixing points and alignment as well as drawer problems. Our Unley case shows cupboard-door alignment work."},
  ],
 },
 {
  slug:'sliding-door-repair',title:'Sliding door repair in Adelaide',
  description:'Sliding glass door hard to move or noisy? MEL ONE assesses rollers, tracks and movement in Adelaide. See a real patio-door repair and prepare your enquiry.',
  parent:'doors-windows-screens',caseSlugs:['sliding-patio-door-roller-track-repair','marion-wardrobe-sliding-door-repair'],
  sections:[
   section('A sliding glass door that drags or makes noise', 'Sliding door repair in Adelaide starts with the door type and the reported movement problem. Tell MEL ONE whether a glass patio panel drags along the track, catches at one point or makes noise when pushed. Lower rollers, accumulated debris, the track and alignment need checking before a repair is proposed.', 'Avoid forcing a heavy panel to keep it moving. Describe any instability, visible glass damage or inability to close the door when enquiring. A noisy or stiff door is a symptom, not enough information to specify a roller or conclude that cleaning alone will solve it.'),
   section('Real evidence: lower rollers and a dusty track', "We repaired damaged lower rollers and cleared track dust on the patio door shown below. The door had been difficult to move and noisy when pushed forcefully. The photo sequence shows the lower-track condition, roller work and reinstalled door.", 'The Marion record concerns a sliding wardrobe door, not patio glazing. Keeping these examples separate matters: panel weight, roller housings, guides and track profiles vary between systems. An insect-screen enquiry belongs on our <a href="/services/flyscreen-repair/">flyscreen repair page</a>.'),
   section('Roller repair, track clearing and wider issues', 'Assessment considers the lower running hardware, accessible track, alignment and the surrounding frame. Clearing loose debris and repairing a damaged roller are distinct parts of a potential work scope. A bent or heavily worn track may need a different approach from a dirty channel.', 'Compatible parts depend on the actual door system. Glass replacement, security hardware, fire-rated assemblies and substantial frame damage are not automatically included in roller or track work. Explain those concerns separately so suitable specialist arrangements can be discussed before approval. We do not promise a particular part or repair outcome from photos alone.'),
   section('What to send before an assessment', 'Give your suburb, the door type, how many panels are affected and whether access or closing is restricted. Safe existing photos of the full door and lower track are useful. If a manufacturer label is already accessible, include it; do not lift out a glass panel or dismantle the door to find one.', enquiry, 'For hinged doors, see <a href="/services/door-repair/">door alignment and hinge repair</a>. The <a href="/guides/field-notes-doors-windows-screens-enquiry/">door and screen enquiry guide</a> helps organise the details. <a href="/contact/">Request a sliding-door assessment</a>.'),
  ],
  faqs:[
   {question:'Will cleaning the track fix a hard-to-move sliding door?',answer:'It may help when debris is the issue, but damaged rollers or a worn track can require repair. The supplied patio-door record had both damaged lower rollers and dust in the channel.'},
   {question:'Are patio doors and wardrobe doors repaired the same way?',answer:'Not necessarily. Panel weight, rollers, guides and track profiles differ. Identify the door type so the assessment and compatible parts relate to the actual system.'},
   {question:'Should I remove the glass panel for photos?',answer:'No. Leave heavy panels in place. Safe existing photos and a description are enough to request assessment; do not force a stuck or unstable door.'},
  ],
 },
 {
  slug:'wall-patching-repair',title:'Wall patching and repair in Adelaide',
  description:'Arrange wall patching and small internal wall repairs in Adelaide. Compare MEL ONE Goodwood and CBD cases, discuss the finish and request an assessment.',
  parent:'home-repairs-renovation-support',caseSlugs:['goodwood-wall-repair','adelaide-cbd-wall-repair'],
  sections:[
   section('Small internal wall damage, assessed before patching', 'Wall patching and repair enquiries in Adelaide are clearer when the damaged area and desired finish are described together. MEL ONE assesses small internal wall damage and the surrounding surface before agreeing the work. Tell us whether there is a hole, impact damage, loose material or damage close to skirting.', 'If you are searching for plasterboard or gyprock repair, identify the wall material if known rather than assuming it from the paint finish. Approximate size and safe photos of the full wall and damaged area help frame the assessment; they do not confirm the cause or hidden condition.'),
   section('Goodwood wall patch and Adelaide CBD repair records', 'The Goodwood record documents a completed internal wall patch. The Adelaide CBD record covers lower-wall and skirting repair. These are two different repair settings, with photographs showing their individual work stages.', "Tell us which wall area and adjoining trim need attention. We assess their condition before agreeing patching and finishing. Mention moisture, movement or recurring cracks early: those causes need consideration before cosmetic work."),
   section('Agree the patch and finishing scope', 'Discuss the wall surface, access, preparation, patching and finishing expected in the written quote. Painting, colour matching and repairs to adjoining trim should be identified separately rather than assumed to be included. Existing texture, paint age and lighting affect how a repaired area appears.', 'A patch does not address the source of a leak or structural movement. Suspected hazardous materials, electrical fittings or extensive damage need appropriate assessment before disturbance. Describe what is known without removing wall material to investigate.'),
   section('Prepare the wall repair request', 'Provide your suburb, approximate affected area, room and any tenancy or owner approval needed. Mention furniture that limits access and whether spare matching paint is available. Safe existing photos are optional; keep personal documents and identifying details out of the frame.', enquiry, 'For several indoor jobs, use our <a href="/guides/field-notes-wall-interior-repairs-job-list/">wall and interior repair checklist</a>. Compare <a href="/service-standards/#quote-details">what a written quote should cover</a>, then <a href="/contact/">request a wall repair assessment</a>.'),
  ],
  faqs:[
   {question:'Is painting included with wall patching?',answer:'Not automatically. Confirm preparation, patching, painting and any colour-matching requirement in the written quote so the agreed finish is clear.'},
   {question:'Can a recurring crack simply be patched?',answer:'The cause needs consideration first. Mention repeated cracking, movement or moisture during the enquiry; cosmetic patching does not resolve an underlying leak or structural issue.'},
   {question:'What photos help explain a small wall repair?',answer:'A safe photo of the full wall and a closer view of the affected area are useful. Include approximate size and nearby skirting or fittings without disturbing wall material.'},
  ],
 },
 {
  slug:'pressure-cleaning',title:'Pressure cleaning in Adelaide',
  description:'Discuss driveway and paved-surface pressure cleaning in Adelaide. See the MEL ONE Burnside driveway case and confirm surface condition, access and cleaning scope.',
  parent:'cleaning-removals-specialist-care',caseSlugs:['burnside-driveway-pressure-cleaning'],
  sections:[
   section('Driveway and paved-surface cleaning', 'Pressure cleaning in Adelaide needs a surface-specific plan. MEL ONE assesses driveway and paved-surface cleaning requests by looking at the material, condition, access and proposed result. Tell us whether the area is paved, concrete, coated or sealed and describe the dirt or growth you want addressed.', 'Stronger pressure is not automatically the right treatment. Loose pavers, damaged joints and an ageing coating can affect the method and scope. An assessment helps separate cleaning from repairs, sealing or stain treatment that may need their own agreement.'),
   section('The Burnside driveway cleaning record', "We pressure-cleaned the paved driveway shown in our Burnside case. The photos show the original mossy surface, work in progress and visible result. For your driveway, we assess its material, condition and stains before agreeing the method and expected finish.", "Tell us the surface material, coating and current condition. Roofs and delicate finishes need a separate assessment and method from driveway pavers. Mention those surfaces in your request so the work can be scoped appropriately."),
   section('Confirm access, water and surrounding areas', 'Give the approximate area and explain vehicle access, water availability, drainage and nearby plants or belongings. Mention damaged joints, loose material and any known coating or previous treatment. These details help plan the visit without deciding the cleaning method from a photo.', 'The written quote should identify the included surfaces, agreed cleaning work and preparation responsibilities. Sealing, joint repairs, stain guarantees and cleaning additional areas are not automatic inclusions. Discuss any remaining concern after the agreed work rather than assuming cleaning has repaired the underlying surface.'),
   section('Prepare a pressure cleaning enquiry', 'Provide your suburb, surface type if known and safe existing photos showing the area and visible condition. Describe access restrictions and items that need moving. Do not move heavy objects solely for an enquiry photograph; agree preparation arrangements before the visit.', enquiry, 'Read the <a href="/guides/field-notes-cleaning-removals-preparation/">cleaning preparation guide</a> and <a href="/service-standards/#quote-details">quote checklist</a>. <a href="/contact/">Request a driveway cleaning assessment</a>.'),
  ],
  faqs:[
   {question:'Will pressure cleaning remove every driveway stain?',answer:"Some marks can remain after cleaning. We assess the surface, stains and previous coatings with you before agreeing the cleaning method and expected result."},
   {question:'Does driveway cleaning include sealing or joint repairs?',answer:'Not automatically. Cleaning, sealing and repairs are separate work items that need to be identified in the written quote.'},
   {question:'What access details should I send?',answer:'Include approximate area, vehicle access, water availability, drainage and nearby items or plants. Mention damaged joints, loose pavers and any known surface coating.'},
  ],
 },
];

const photos=(prefix,alts,captions)=>['before','during','after'].map((stage,i)=>({src:`/assets/images/cases/${prefix}-${stage}.png`,alt:alts[i],caption:`${['Before','During','After'][i]}: ${captions[i]}`}));
const newCases=[
 {
  slug:'kitchen-drawer-runner-repair',title:'Kitchen Drawer Runner Repair: A Sagging Drawer',
  description:'A MEL ONE kitchen drawer runner repair record: damaged runners caused the drawer to sag and made opening and closing difficult. See before, during and after photos.',
  suburb:null,publishedDate:'2026-10-12',service:'interior-repairs-assembly',
  keywords:['drawer runner repair','sagging kitchen drawer','drawer slide repair'],
  problem:'Damaged drawer runners caused sagging and difficult opening and closing',
  result:'Drawer runner repair documented in before, during and after photographs',
  images:photos('drawer-runner-repair',[
   'Sagging kitchen drawer with exposed side runner before repair',
   'Technician working on the kitchen drawer side runner with a cordless tool',
   'Kitchen drawer and side runner after the recorded repair',
  ],[
   'the kitchen drawer sits unevenly, with the side runner and drawer edge visible.',
   'a technician supports the drawer while working on the runner fixings.',
   'the final supplied view shows the drawer and runner after the repair stage.',
  ]),
  sections:[
   section('The problem: a drawer that sagged and would not travel smoothly', 'We repaired a kitchen drawer with damaged runners that caused sagging and difficult opening and closing. The before photo shows the uneven drawer front, exposed side runner and surrounding cabinet.'),
   section('The repair sequence', 'During the repair, the technician supported the drawer while working on the side runner. The final photo shows the drawer after runner repair. For another drawer, we check its dimensions, mounting points and compatible hardware before agreeing parts.', 'For a sagging or stiff drawer, tell us where it catches and whether it closes squarely. We assess the runner, drawer box and cabinet support together to decide whether adjustment, runner work or further cabinet repair is needed.'),
   section('Have a similar drawer problem?', 'Describe whether the drawer drops, catches or will not close. The runner, drawer box and cabinet attachment points need checking together before the scope is confirmed. Do not force a sagging drawer or remove it solely to take a photograph.', enquiry),
  ],
 },
 {
  slug:'sliding-patio-door-roller-track-repair',title:'Sliding Patio Door Repair: Lower Rollers and a Dusty Track',
  description:'A MEL ONE sliding patio-door repair record: damaged lower rollers and dust in the track made movement difficult and noisy. View before, during and after photographs.',
  suburb:null,publishedDate:'2026-10-12',service:'doors-windows-screens',
  keywords:['sliding door roller repair','patio door track cleaning','sliding glass door hard to move','noisy sliding door'],
  problem:'Damaged lower rollers and dust in the track caused difficult movement and noise when pushed forcefully',
  result:'Lower roller repair and track clearing documented in the supplied photo sequence',
  images:photos('sliding-patio-door-roller-repair',[
   'Sliding glass patio door with dust and debris in the lower track before repair',
   'Technician working on a removed glass patio-door panel supported on protective blankets',
   'Sliding patio door and cleared lower track after the recorded repair',
  ],[
   'dust and debris are visible along the lower patio-door track.',
   'a technician works on the removed patio-door panel, supported on protective blankets with tools nearby.',
   'the final supplied view shows the door and a clearer lower track after work.',
  ]),
  sections:[
   section('The problem: stiff movement and noise under force', 'We repaired lower rollers and cleared dust from the track on this patio door. Damaged rollers and debris had made movement difficult and noisy when the door was pushed forcefully. The before photo shows the affected lower track and debris.'),
   section('Lower roller work and track clearing', 'The during photograph records a technician working on the removed glass patio-door panel, supported on protective blankets. Tools and hardware are visible beside the panel. The after photograph shows the door reinstalled and the lower track following the recorded repair and clearing work.', 'For your patio door, we check the panel, lower rollers, track and alignment before agreeing the repair and compatible parts. Leave heavy or unstable panels in place and describe any noise or catching noticed during normal use.'),
   section('Prepare a sliding-door repair request', 'Identify whether the door is a glass patio panel, wardrobe panel or insect screen. Describe where it catches, any noise and whether it closes. Leave heavy or unstable panels in place and avoid forcing a stuck door.', enquiry),
  ],
 },
];

export function applyAdditionalRepairContent(content,facts){
 // Each service already explains assessment and approval in its specific scope.
 // Keep the task preparation and direct contact link without repeating the shared enquiry paragraph.
 for(const service of additionalFocusedServices){
  for(const item of service.sections)item.paragraphs=item.paragraphs.filter(text=>text!==enquiry);
 }
 for(const study of newCases){
  const record=structuredClone(study);
  record.sections[1].paragraphs.unshift(`${study.result}.`);
  record.relatedReading=[{url:'/service-standards/',label:'Assessment, written quote and scope boundaries'}];
  content.caseStudies.push(record);
  facts[study.slug]=[study.problem,study.result];
 }
 for(const service of additionalFocusedServices){
  for(const slug of service.caseSlugs){
   const study=content.caseStudies.find(item=>item.slug===slug);
   study.relatedReading=[...(study.relatedReading||[]),{url:`/services/${service.slug}/`,label:service.title}];
  }
 }
 for(const [guideSlug,caseSlug] of [
  ['field-notes-wall-interior-repairs-job-list','kitchen-drawer-runner-repair'],
  ['field-notes-doors-windows-screens-enquiry','sliding-patio-door-roller-track-repair']]){
  const guide=content.guides.find(item=>item.slug===guideSlug);
  const study=content.caseStudies.find(item=>item.slug===caseSlug);
  guide.relatedReading.push({url:`/case-studies/${caseSlug}/`,label:study.title});
  study.relatedReading.push({url:`/guides/${guideSlug}/`,label:guide.title});
 }
}
