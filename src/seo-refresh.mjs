/** Authored October 9 content. Describes assessment, not unrecorded job findings. */
const section = (heading, ...paragraphs) => ({ heading, paragraphs });
const faq = (question, answer) => ({ question, answer });
const guideLink = slug => `/guides/${slug}/`;

export const serviceDetails = {
  'doors-windows-screens': {
    seoTitle: 'Door, Window & Flyscreen Repairs Adelaide',
    description: 'Door, window and flyscreen repairs in Adelaide: sticking doors, worn rollers, damaged mesh and loose hardware. Arrange an assessment with MEL ONE.',
    sections: [
      section('Sliding door and wardrobe roller repairs', 'A sliding panel that drags, catches or sits unevenly needs its rollers, guides and track checked together. Tell us whether the problem occurs along the whole track or at one point, and whether it affects a patio door, wardrobe or insect screen.', 'MEL ONE assesses movement and accessible hardware before proposing an adjustment or compatible replacement. A worn roller, distorted track and loose guide need different solutions. Do not force a jammed panel or remove a heavy door to obtain part measurements.'),
      section('Flyscreen mesh and frame repairs', 'A tear in the mesh does not necessarily mean the entire screen needs replacing. The frame, corners, retaining spline and fit in the opening also matter. We check the affected screen and explain whether remeshing or further frame work is appropriate.', 'Include whether the screen is fitted to a window or door. Insect mesh and security screens serve different purposes; describe the product before choosing material or hardware.'),
      section('Door hinges, handles and window fittings', 'For a door that rubs or fails to latch, note the contact point and any recent flooring changes. Assessment covers accessible hinges, fixings, clearances and latch contact before a repair is agreed. Window enquiries should identify the opening type and affected catch or handle.'),
      section('Preparing for assessment and completion', 'Send the fitting type, symptoms and any available product details. Safe existing photos are optional. Keep the opening accessible and tell us about tenancy approval, furniture or security concerns.', 'The written quote sets out the agreed work and required parts. When work is complete, review movement and closing with MEL ONE and raise any remaining concern. Glazing and safety-related hardware follow the appropriate specialist process.'),
    ],
    faqs: [
      faq('Should I buy replacement rollers before the assessment?', 'Wait until the roller housing, dimensions and track have been checked. Similar-looking parts can have different mounting points and load requirements. We confirm the parts needed for the agreed work.'),
      faq('Can torn mesh be repaired without replacing the frame?', 'Remeshing can be suitable when the frame and retaining parts are serviceable. MEL ONE checks the screen and explains any frame work needed before quoting.'),
      faq('Can I include a wardrobe door and a window in one request?', 'Yes. Describe each fitting separately, including where it catches or fails to operate. We assess the individual mechanisms and agree the work for each item.'),
    ],
    guides: ['field-notes-doors-windows-screens-enquiry'],
  },
  'interior-repairs-assembly': {
    seoTitle: 'Furniture Assembly & Interior Repairs Adelaide',
    description: 'Furniture assembly and interior repairs in Adelaide, including flat-pack wardrobes, shelving, cabinet hinges and household fittings. Contact MEL ONE.',
    sections: [
      section('Flat-pack furniture and wardrobe assembly', 'Share the product model, instructions and box count before arranging assembly. We review the supplied kit and intended position, then confirm the work and space required. A partly assembled unit should be described at its current stage, including missing fittings or damaged panels.', 'Keep small parts together and provide a clear area for laying out panels. Manufacturer securing instructions and the suitability of the supporting surface are considered before any wall fixing is agreed.'),
      section('Cabinet hinges and drawer alignment', 'Cupboard doors that hang unevenly and drawers that jam need their own checks. Hinge mounting points, runners, cabinet alignment and damaged material can affect the repair. Show the affected unit closed and the accessible hardware with it open.', 'We assess whether adjustment, refixing or compatible replacement parts are needed. A loose screw in deteriorated material requires a different approach from a serviceable hinge that needs alignment.'),
      section('Wall fittings, patches and interior trims', 'Curtain rods, blinds, hooks and shelves need fixings suited to the surface and load. Tell us what the fitting will support and provide its instructions if available. Wall patches and trim repairs should include the extent of damage and the finish you want included.'),
      section('Agreeing assembly and finishing details', 'The quote should identify assembly, securing, patching and finishing items separately where relevant. Confirm whether packaging removal or materials are included before the visit.', 'At completion, review the agreed fittings and opening or drawer movement with MEL ONE. Mention any remaining alignment issue. Appliance faults and concealed services follow a separate assessment rather than being treated as ordinary furniture repairs.'),
    ],
    faqs: [
      faq('Do I need to unpack every furniture box first?', 'Send the model and box details first. We confirm how to prepare the room and whether the panels should remain packed until assembly.'),
      faq('Can you assess a partly assembled wardrobe?', 'Yes. Include the instructions, current assembly stage and any missing or damaged parts. We review the kit before agreeing how to complete or correct the assembly.'),
      faq('Can cabinet hinges and drawer repairs be included together?', 'Yes. Identify each affected door and drawer. We assess their hardware and supporting material and confirm the individual work items in the quote.'),
    ],
    guides: ['field-notes-wall-interior-repairs-job-list', 'field-notes-grouping-multiple-household-jobs'],
  },
  'cleaning-removals-specialist-care': {
    seoTitle: 'Pressure Cleaning & Household Clear-Outs Adelaide',
    description: 'Adelaide pressure cleaning, driveway cleaning and household clear-out enquiries. MEL ONE assesses surfaces, access and waste before quoting.',
    sections: [
      section('Driveway and paved surface cleaning', 'Mossy or stained paving needs the surface, joints and surrounding area assessed before a cleaning method is agreed. Tell us about loose pavers, damaged joints, coatings and the areas you want cleaned. The Burnside case below records pressure cleaning of a paved driveway.', 'Water supply, drainage, nearby plants and access affect preparation. Cleaning is planned for the condition found; worn joints and damaged paving may need separate attention. We explain the proposed method and included areas before work begins.'),
      section('Household and end-of-lease cleaning', 'Identify the rooms, accessible windows and outdoor areas involved. A room-by-room list makes it easier to agree what needs cleaning and what belongs to a separate repair request. Include access, occupancy and any property-manager instructions.', 'Explain whether furniture will remain in place. Discuss difficult marks and surface finishes during assessment so the agreed cleaning scope is clear.'),
      section('Furniture removal and household clear-outs', 'List the items, approximate dimensions and access route rather than moving heavy furniture for a photograph. Stairs, narrow passages and parking restrictions affect handling. Waste type and disposal arrangements must be confirmed before collection is agreed.'),
      section('Reviewing the result and separate concerns', 'At completion, review the agreed surfaces or removed items and ask about any remaining issue. The quote should distinguish cleaning, handling, disposal and repairs where these are separate tasks.', 'Pest, mould and suspected hazardous-material concerns require the appropriate specialist assessment. Leave suspect materials undisturbed and report the concern when arranging the visit.'),
    ],
    faqs: [
      faq('What information helps with a driveway cleaning quote?', 'Provide a wider driveway photo if safely available, note surface type and damaged joints, and explain water access and drainage. MEL ONE confirms the cleaning approach after assessment.'),
      faq('Should I clear the driveway before requesting assessment?', 'Tell us which vehicles, pots or furniture normally occupy it. Preparation and the areas to clear are agreed before work; do not move heavy items just to obtain photos.'),
      faq('Does a clear-out request include disposal?', 'List the items and waste type. Handling and disposal arrangements, including what is included in the quote, are confirmed for the particular request.'),
    ],
    guides: ['field-notes-cleaning-removals-preparation'],
  },
  'outdoor-structures-fences-pools': {
    seoTitle: 'Fence, Gate & Outdoor Timber Repairs Adelaide',
    description: 'Fence, gate, deck and pergola repair enquiries in Adelaide. MEL ONE assesses affected timber, hardware and access to explain a targeted solution.',
    sections: [
      section('Fence panels and timber gate repairs', 'Split palings, loose panels and a dragging gate should be described separately. We assess the affected timber, accessible fixing points, hinges and latch movement. Report whether the gate needs lifting to close or catches along its swing.', 'Assessment helps distinguish a local fixing or hardware problem from deterioration involving supporting timber. We explain the repair and any replacement needed for the agreed area.'),
      section('Deck boards and pergola timber', 'For a split or deteriorated board, identify its position and the surrounding area from a safe location. A wider view helps plan access and locate adjoining posts or connections. Avoid using a section that appears unstable.', 'MEL ONE follows up on the reported problem, assesses accessible timber and fixings and proposes a targeted solution. Structural changes or wider movement require the appropriate assessment before a work scope is agreed.'),
      section('Outdoor fittings and pool-area boundaries', 'Outdoor furniture, shed fittings and storage repairs can be discussed alongside timber work. Describe the product and affected part. Pool equipment, barriers and safety-related changes require appropriate specialist arrangements; they are not treated as ordinary cosmetic repairs.'),
      section('Preparation and review of agreed work', 'Tell us about pets, stairs, furniture, shared boundaries and the entry route. Confirm any owner or neighbour permissions relevant to the proposed work. The quote should identify the affected area and included preparation or finishing.', 'Review the agreed repair with MEL ONE at completion and raise any remaining concern. Do not assume a local repair includes replacement of an entire fence or structure; the included work is set out in the quote.'),
    ],
    faqs: [
      faq('Can one damaged fence section be assessed?', 'Yes. Show the damaged section and adjoining supports from a safe position. We assess the affected area before confirming whether local repair or further replacement is appropriate.'),
      faq('Can a deck request include nearby pergola damage?', 'Yes. Identify each affected area. MEL ONE assesses the reported timber and connections and agrees the included repair items and any further assessment needed.'),
      faq('What should I include for a gate that drags?', 'Describe where it catches, whether the latch engages and whether it needs lifting. Safe photos of the hinges, latch and lower clearance help prepare the assessment.'),
    ],
    guides: ['field-notes-garden-outdoor-seasonal-preparation', 'home-maintenance-walk-through-checklist'],
  },
  'garden-landscape-care': {
    seoTitle: 'Garden Maintenance & Pruning Adelaide',
    description: 'Adelaide garden maintenance, hedge trimming, pruning and garden tidy-ups. Discuss retained plants, access and green-waste arrangements with MEL ONE.',
    sections: [
      section('Garden tidy-ups, mowing and edging', 'Describe the lawn, garden beds and paths you want included. We discuss the intended result, access and tasks to retain or remove before agreeing the work. A simple marked list can distinguish mowing and edging from weeding or a garden-bed refresh.'),
      section('Hedge trimming and small-plant pruning', 'Identify the plants and the clearance you want around paths or fences. Point out growth to retain rather than leaving the pruning boundary open to interpretation. The Modbury garden case below provides a real pruning and tidy-up record.', 'Tree work and tasks near services need separate assessment. Tell us about cables, irrigation fittings or restricted access when describing the area.'),
      section('Green waste and garden preparation', 'Confirm whether green waste will stay on site or needs agreed collection and disposal. Waste type, access and the amount involved affect the plan. Discuss pots, outdoor furniture and pets before the visit; do not move heavy objects for photos.'),
      section('Irrigation, paths and completion review', 'Damaged irrigation fittings, uneven watering and path concerns can be included as separate observations. Explain where the issue occurs. MEL ONE assesses the request and confirms the suitable work and any qualified service arrangements.', 'Review the retained plants, cleared access and agreed tidy-up areas at completion. Confirm any further maintenance questions with the team.'),
    ],
    faqs: [
      faq('How do I show which plants should stay?', 'Label a safe existing photo or point out retained plants during assessment. We agree pruning boundaries and the intended clearance before work.'),
      faq('Can a tidy-up include green-waste removal?', 'Discuss the waste type and collection arrangements with MEL ONE. Disposal is included only as agreed in the work scope and quote.'),
      faq('Can I report an irrigation issue with garden maintenance?', 'Yes. Describe the damaged fitting or uneven watering separately. We assess the concern and confirm the repair and qualified arrangements for any regulated work.'),
    ],
    guides: ['field-notes-garden-outdoor-seasonal-preparation'],
  },
  'roof-gutter-exterior-care': {
    seoTitle: 'Gutter Cleaning & Exterior Maintenance Adelaide',
    description: 'Gutter cleaning and exterior maintenance enquiries in Adelaide. Report debris, overflow and visible damage from ground level for MEL ONE assessment.',
    sections: [
      section('Gutter debris and overflow observations', 'Leaf build-up, overflow at a corner and water spilling along a gutter are useful observations to report. Tell us where and when the problem occurs without climbing to investigate. The Prospect case below documents gutter debris being cleared.', 'A cleaning request and damaged drainage hardware can need different work. MEL ONE assesses the reported area and explains whether clearing debris or a further repair assessment is appropriate.'),
      section('Roof and exterior fitting concerns', 'Describe visible tile, sheet, flashing, fascia or eaves concerns from a safe ground-level position. Include the affected side of the property and changes you have noticed. The work plan and appropriate specialist arrangements are confirmed before roof access or weatherproofing work.'),
      section('Exterior surfaces, seals and trims', 'Paint touch-ups, weather seals and minor trim concerns should identify the surface and affected fitting. Preparation and finishing depend on the existing condition. Cleaning and repairs should be listed separately so their included areas can be agreed.'),
      section('Access planning and completion', 'Tell us about the entry route, restricted access and any property-manager requirements. Ground-level photos are optional. Do not use a ladder or enter a roof space to gather information for the enquiry.', 'The quote confirms the agreed tasks and access arrangements. Review the documented work with MEL ONE at completion and report any remaining overflow or exterior concern for follow-up.'),
    ],
    faqs: [
      faq('Do I need to climb up to photograph the gutter?', 'No. Provide observations and safe ground-level photos if available. Access and the assessment method are arranged by the team.'),
      faq('Can I report gutter overflow and damaged fascia together?', 'Yes. Identify each concern separately. We assess the affected areas and explain the included work and any further specialist assessment needed.'),
      faq('Does gutter clearing include drainage repairs?', 'Clearing debris and repairing a damaged fitting are separate work items. MEL ONE checks the reported condition and confirms the agreed tasks in the quote.'),
    ],
    guides: ['field-notes-roof-gutter-exterior-observations'],
  },
  'home-repairs-renovation-support': {
    seoTitle: 'Wall Repairs & Home Maintenance Adelaide',
    description: 'Adelaide wall repairs, skirting and home maintenance support. Organise cosmetic repairs and finishing tasks for a MEL ONE assessment and quote.',
    sections: [
      section('Wall patches and skirting repairs', 'Describe holes, damaged finishes and loose skirting by room and location. Include the adjoining corner or trim where relevant. We assess the affected surface and confirm preparation, repair and the finish to include.', 'Tell us about a known water issue or damage that is still changing. A cosmetic patch should not stand in for assessment of an ongoing cause or structural concern.'),
      section('Pre-sale and end-of-lease repair lists', 'Separate presentation tasks from items needing further assessment. List wall damage, loose fittings and trim issues individually rather than asking for a general room refresh. For rental properties, confirm the owner or property-manager approval and access arrangements.'),
      section('Small-room finishing and repair decisions', 'Surface, trim and non-structural joinery requests can be grouped into an agreed list. Discuss the expected finish and any supplied materials before work. Matching existing colour or texture needs assessment rather than an assumed identical result.'),
      section('Qualified work and completion review', 'Tiling, wet-area, flooring and structural concerns should be raised clearly. MEL ONE confirms the appropriate assessment, qualified service arrangements and any approval-dependent responsibilities before work.', 'At completion, review the agreed repair areas against the list. Discuss further work separately so additions are not confused with the original quote.'),
    ],
    faqs: [
      faq('Can a wall repair include the adjoining skirting?', 'Yes. Identify both areas so MEL ONE can assess their junction and include the agreed preparation, fixing and finishing in the quote.'),
      faq('Should I buy paint before requesting a patch repair?', 'Discuss the desired finish and any existing paint details first. The required preparation and materials are confirmed after assessment.'),
      faq('Can I group several pre-sale touch-ups?', 'Yes. Provide a room-by-room list and identify priorities. We assess the items and agree which repairs and finishes are included.'),
    ],
    guides: ['field-notes-wall-interior-repairs-job-list', 'field-notes-pre-sale-home-maintenance-list', 'field-notes-rental-end-of-lease-maintenance-list'],
  },
  'maintenance-planning-inspection-support': {
    seoTitle: 'Home Maintenance Planning Adelaide',
    description: 'Organise Adelaide home maintenance into a clear assessment and work list. MEL ONE confirms priorities, access, specialist arrangements and a written quote.',
    sections: [
      section('Turn observations into an assessable work list', 'Use a separate line for each fitting or repair area, with its room and symptoms. Describe what you have noticed rather than guessing the cause. This lets MEL ONE assess the individual tasks and explain appropriate solutions.'),
      section('Priorities, permissions and access', 'Identify tasks affecting everyday use and any dates you need considered. Include occupancy, key collection and owner or property-manager approval where relevant. Availability and appointment timing are confirmed directly; an enquiry is not a reserved visit.'),
      section('Separate routine maintenance from formal assessment', 'Requests involving property-condition reports, defects, approvals or certificates require the appropriate process. A general maintenance list helps prepare the discussion but does not replace a formal report. MEL ONE confirms professional and authority responsibilities within the agreed scope.'),
      section('A written scope and clear handover', 'After assessment, confirm included items, materials, access and any specialist arrangements in the written quote. Changes found during work should be discussed before they are added.', 'Use the agreed list at completion to review finished items and remaining questions. The photographed cases show examples of individual maintenance tasks; they are not formal inspection reports.'),
    ],
    faqs: [
      faq('Can I include different rooms in one maintenance request?', 'Yes. Keep each task separate and identify its location and symptoms. MEL ONE assesses the list and confirms the included work.'),
      faq('Does a maintenance list replace a formal property report?', 'No. Formal reports, approvals and certifications follow the appropriate professional process. We clarify the required next step for the reported concern.'),
      faq('What if the work list changes during a visit?', 'Discuss the new item with the team. Additional work and any change to the quote or qualified arrangements are agreed before proceeding.'),
    ],
    guides: ['home-maintenance-walk-through-checklist', 'field-notes-grouping-multiple-household-jobs'],
  },
  'home-electrical-repairs': {
    seoTitle: 'Home Electrical Repairs Adelaide',
    description: 'Discuss lights, switches, ceiling fans and power-point concerns in Adelaide. MEL ONE confirms assessment and appropriately qualified service arrangements.',
    sections: [
      section('Describe lights, switches and power-point concerns', 'Identify the fitting, room and change you have noticed, such as flickering or failure to operate. Tell us whether other fittings are affected and when the issue started. Keep the report to observations; do not remove covers or test wiring for the enquiry.'),
      section('Ceiling fans and replacement enquiries', 'Provide the existing product model and any replacement information already available. Describe whether the concern involves operation, noise or damage. Assessment and product compatibility are confirmed before replacement work is agreed.'),
      section('Assessment and qualified service arrangements', 'MEL ONE coordinates the request and confirms appropriately qualified service arrangements for work requiring trade authorisation. The work scope, appointment and written quote are agreed before work begins.', 'Electrical faults and recurring power interruptions require the appropriate assessment rather than being treated as ordinary household fitting adjustments. Report the concern clearly and seek appropriate urgent assistance when needed.'),
      section('Prepare the information, not the electrical fitting', 'Safe existing photos and model details can help prepare the enquiry. Leave damaged fittings undisturbed and explain access restrictions or owner approvals. Do not open equipment or approach a hazard to gather information.', 'Completion and any required documentation are discussed with the qualified provider for the agreed work. Raise remaining questions with MEL ONE so the appropriate follow-up can be arranged.'),
    ],
    faqs: [
      faq('Do I need to open a fitting to identify the fault?', 'No. Describe the symptoms and provide only safely available product information. Electrical assessment and work are handled through the appropriate qualified arrangements.'),
      faq('Should I buy a new ceiling fan before enquiring?', 'Share the current model and proposed product first. Compatibility and the installation requirements should be confirmed before purchasing parts for the agreed work.'),
      faq('Who confirms the electrical work scope?', 'MEL ONE confirms the appropriately qualified service arrangements. The assessment, agreed work and any required documentation are clarified with the responsible provider.'),
    ],
    guides: ['prepare-household-maintenance-enquiry'],
  },
};

// Explicit editorial choices, not keyword inference or city-name substitution.
export const localServiceMap = {
  'Adelaide CBD': ['home-repairs-renovation-support', 'interior-repairs-assembly'],
  'North Adelaide': ['doors-windows-screens', 'outdoor-structures-fences-pools'],
  'Kent Town': ['interior-repairs-assembly'], Bowden: ['interior-repairs-assembly'],
  Norwood: ['doors-windows-screens'], Burnside: ['cleaning-removals-specialist-care', 'doors-windows-screens'],
  Kensington: ['interior-repairs-assembly'], Magill: ['doors-windows-screens'],
  Unley: ['interior-repairs-assembly'], Goodwood: ['home-repairs-renovation-support'],
  Parkside: ['interior-repairs-assembly'], Millswood: ['interior-repairs-assembly'],
  'Mile End': ['outdoor-structures-fences-pools'], Thebarton: ['outdoor-structures-fences-pools'],
  Torrensville: ['doors-windows-screens'], Brompton: ['interior-repairs-assembly'],
  'Henley Beach': ['doors-windows-screens'], 'West Beach': ['doors-windows-screens'],
  'Glenelg': ['doors-windows-screens'], 'Semaphore': ['outdoor-structures-fences-pools'],
  Prospect: ['roof-gutter-exterior-care'], Modbury: ['outdoor-structures-fences-pools', 'garden-landscape-care'],
  Campbelltown: ['roof-gutter-exterior-care'], 'Golden Grove': ['outdoor-structures-fences-pools'],
  Stirling: ['outdoor-structures-fences-pools', 'interior-repairs-assembly'],
  Crafers: ['outdoor-structures-fences-pools'], Aldgate: ['garden-landscape-care'], Blackwood: ['outdoor-structures-fences-pools'],
  Marion: ['doors-windows-screens'], Brighton: ['doors-windows-screens'],
  'Hallett Cove': ['outdoor-structures-fences-pools'], 'Morphett Vale': ['interior-repairs-assembly'],
};

const guideTitles = {
  'field-notes-doors-windows-screens-enquiry': 'Door, Window & Flyscreen Repair Preparation',
  'field-notes-wall-interior-repairs-job-list': 'Wall Repairs & Interior Fittings: What to Prepare',
  'field-notes-roof-gutter-exterior-observations': 'Gutter & Roof Concerns: Ground-Level Checklist',
  'field-notes-garden-outdoor-seasonal-preparation': 'Garden Pruning & Outdoor Timber Assessment',
  'field-notes-rental-end-of-lease-maintenance-list': 'Rental Repairs: Access, Approval & Handover',
  'field-notes-pre-sale-home-maintenance-list': 'Pre-Sale Home Repairs: Prioritise Your List',
  'field-notes-grouping-multiple-household-jobs': 'Group Household Repairs Into One Work List',
  'field-notes-cleaning-removals-preparation': 'Driveway Cleaning & Household Clear-Out Preparation',
};
const guideCases = {
  'field-notes-doors-windows-screens-enquiry': ['norwood-flyscreen-repair', 'marion-wardrobe-sliding-door-repair', 'henley-beach-sliding-screen-door-repair'],
  'field-notes-wall-interior-repairs-job-list': ['unley-kitchen-cabinet-repair', 'goodwood-wall-repair', 'stirling-flat-pack-wardrobe-assembly'],
  'field-notes-roof-gutter-exterior-observations': ['prospect-gutter-cleaning'],
  'field-notes-garden-outdoor-seasonal-preparation': ['modbury-garden-pruning-tidy-up', 'stirling-deck-pergola-timber-repair'],
  'field-notes-rental-end-of-lease-maintenance-list': ['adelaide-cbd-wall-repair'],
  'field-notes-pre-sale-home-maintenance-list': ['goodwood-wall-repair', 'unley-kitchen-cabinet-repair'],
  'field-notes-grouping-multiple-household-jobs': ['kensington-furniture-assembly', 'marion-wardrobe-sliding-door-repair'],
  'field-notes-cleaning-removals-preparation': ['burnside-driveway-pressure-cleaning'],
  'prepare-household-maintenance-enquiry': ['north-adelaide-door-repair'],
  'home-maintenance-walk-through-checklist': ['prospect-gutter-cleaning', 'stirling-deck-pergola-timber-repair'],
};

const guideAdditions = {
  'field-notes-doors-windows-screens-enquiry': [
    section('Torn mesh or damaged screen frame?', 'Show the whole screen as well as the tear. A serviceable frame may suit remeshing; bent corners or loose frame sections also need assessment. The Norwood case records a remeshed screen, not a reason to assume every torn screen needs the same work.'),
    section('Wardrobe rollers and lower tracks', 'Note whether the panel drags throughout its travel or catches at one point. Roller housing, guides and track condition affect compatible parts. Leave a heavy or unstable panel in place for assessment rather than lifting it out. The Marion wardrobe record illustrates the lower hardware area.'),
  ],
  'field-notes-wall-interior-repairs-job-list': [
    section('Furniture assembly and cabinet hardware need different notes', 'For a new or partly assembled wardrobe, provide its model, instructions and missing-part list. For a cupboard, identify the affected hinge or drawer and show the unit closed. These details separate kit assembly from adjustment of existing hardware.'),
  ],
  'field-notes-cleaning-removals-preparation': [
    section('Prepare a paved driveway cleaning assessment', 'Identify surface type, coatings, loose pavers and damaged joints. Explain water supply, drainage and nearby plants. Do not assume stronger pressure is the appropriate method: MEL ONE assesses the surface and agrees the cleaning plan.', 'Confirm which vehicles and objects need moving before the booked work. Cleaning and repair of damaged joints should be discussed as separate items. The Burnside record shows the documented driveway result.'),
  ],
  'field-notes-garden-outdoor-seasonal-preparation': [
    section('Separate pruning boundaries from timber repair concerns', 'For pruning, identify retained plants and the clearance you want around paths. For deck or pergola timber, show the damaged position and wider structure from a safe place. Do not walk on an area that appears unstable.', 'These requests need different assessment information and work scopes. The Modbury garden record and Stirling timber record illustrate their different subjects; neither establishes the cause of a new problem at another property.'),
  ],
};

export function applySeoRefresh(content, facts) {
  for (const service of content.services) {
    if (service.status !== 'approved' || service.noindex === true) continue;
    const details = serviceDetails[service.slug];
    if (!details) throw new Error(`Missing SEO service details: ${service.slug}`);
    const { description, ...pageDetails } = details;
    Object.assign(service, pageDetails, { seoDescription: description });
    service.relatedReading = details.guides.map(slug => {
      const guide = content.guides.find(item => item.slug === slug);
      if (!guide || guide.status !== 'approved') throw new Error(`Missing related guide: ${slug}`);
      return { url: guideLink(slug), label: guideTitles[slug] || guide.title };
    });
  }
  for (const guide of content.guides) {
    if (guideAdditions[guide.slug]) guide.sections.push(...guideAdditions[guide.slug]);
    const links = (guideCases[guide.slug] || []).map(slug => {
      const study = content.caseStudies.find(item => item.slug === slug);
      if (!study) throw new Error(`Missing related case: ${slug}`);
      return { url: `/case-studies/${slug}/`, label: `${study.title} — ${study.suburb}` };
    });
    guide.relatedReading = [...(guide.relatedReading || []), ...links].filter((item, index, all) => all.findIndex(other => other.url === item.url) === index);
  }
  for (const study of content.caseStudies) {
    const fact = facts[study.slug];
    if (!fact) throw new Error(`Missing repair facts: ${study.slug}`);
    const original = study.sections;
    const scope = original.at(-1).paragraphs.find(text => /For a .*enquiry|For a similar|Contact MEL ONE/i.test(text)) || original.at(-1).paragraphs[0];
    const result = fact[1];
    study.sections = [
      section(`The reported problem in ${study.suburb}`, `${fact[0]}. ${study.description}`),
      section('Documented work and result', `${result}. The image sequence below the introduction records this ${study.suburb} maintenance job.`, study.images.filter(image => /work|during|technician|assem|repair/i.test(image.caption)).map(image => image.caption).slice(0, 1).join(' ') || study.images[0].caption),
      section('Assessment for a similar problem', original[0].paragraphs[1] || `MEL ONE follows up on each reported maintenance issue with a targeted solution. We assess the affected fitting or area, identify the work required and confirm the agreed scope and written quote.`, scope),
    ];
    study.problem = fact[0];
    study.result = result;
    study.relatedReading = Object.entries(guideCases).filter(([, slugs]) => slugs.includes(study.slug)).slice(0, 2).map(([slug]) => ({ url: guideLink(slug), label: guideTitles[slug] || content.guides.find(g => g.slug === slug).title }));
    if (!study.relatedReading.length) {
      const slug = serviceDetails[study.service].guides[0];
      study.relatedReading = [{ url: guideLink(slug), label: guideTitles[slug] || content.guides.find(g => g.slug === slug).title }];
      const guide = content.guides.find(g => g.slug === slug);
      guide.relatedReading.push({ url: `/case-studies/${study.slug}/`, label: `${study.title} — ${study.suburb}` });
    }
  }
  for (const news of content.news) {
    const slug = news.slug.includes('handover') ? 'field-notes-rental-end-of-lease-maintenance-list' : 'field-notes-grouping-multiple-household-jobs';
    news.relatedReading = [{ url: guideLink(slug), label: guideTitles[slug] }];
  }
}
