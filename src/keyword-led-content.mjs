/** Approved research intent, adapted to MEL ONE's existing repair scope.
 * These topics are not measured search demand or evidence of trade authorisation.
 * Guide/local builders may extend keywordPageCopy without changing the service API.
 */
const section = (heading, ...paragraphs) => ({ heading, paragraphs });
const question = (question, answer) => ({ question, answer });
const work = (slug, label) => ({ url: `/case-studies/${slug}/`, label });

export const keywordCollectionCopy = {
  homeServices: 'Handyman Services and Small Home Repairs',
  homeQuotes: 'Handyman Quotes, Repair Lists and Booking',
  homeGuides: 'Home Repair and Maintenance Guides',
  homeFaq: 'Handyman Costs, Weekend Bookings and Family Repairs',
  homeAreas: 'Handyman Service Areas Across Greater Adelaide',
  homeCases: 'Local Handyman Repair Case Studies',
  serviceDirectory: 'Handyman Services & Property Maintenance Adelaide',
  serviceCategories: 'Home Repair and Property Maintenance Services',
  focusedServices: 'Specific Door, Cabinet and Household Repairs',
  serviceQuestions: 'Service Repair and Maintenance Questions',
  quoteCta: 'Request a Handyman Repair Quote',
  contactHeading: 'Tell Us About Your Home Repairs',
  faqHeading: 'Handyman Prices, Small Jobs and Visit Arrangements',
};

export const keywordPageCopy = {
  '/news/': { title: 'Adelaide Home Repair & Maintenance Notes' },
  '/guides/': { title: 'Adelaide Handyman Repair & Maintenance Guides' },
  '/case-studies/': { title: 'Adelaide Handyman Repair Case Studies' },
  '/service-areas/': { title: 'Handyman Service Areas Across Greater Adelaide' },
  '/service-standards/': { title: 'Adelaide Handyman Quotes, Work Scope & Service Standards' },
  '/privacy/': { title: 'MEL ONE Enquiry Privacy' },
  '/': { title: 'Handyman Services & Home Repairs Adelaide' },
  '/services/': { title: keywordCollectionCopy.serviceDirectory },
  '/contact/': { title: 'Adelaide Handyman Assessment & Repair Quotes', description: 'Request an Adelaide handyman quote for small repairs, property maintenance or several jobs. Tell MEL ONE your suburb, work list and preferred timing.' },
  '/faq/': { title: 'Adelaide Handyman Costs, Bookings & Repair Questions', description: 'Answers about Adelaide handyman costs, weekend bookings, several small jobs, materials and arranging repairs for family. Confirm the assessed work and written quote with MEL ONE.' },
};

export const serviceKeywordCopy = {
  'cabinet-drawer-repair': {
    title: 'Cabinet & Drawer Repairs Adelaide',
    shortTitle: 'Cabinet & Drawer Repairs',
    description: 'Cabinet and drawer repairs: loose cupboard hinges, uneven doors and sagging or sticking drawers. MEL ONE checks the fittings and compatible repair options.',
    sections: [
      section('Loose Cabinet Hinge Screws and Damaged Fixing Points', 'An uneven cupboard door may rub against the next front or leave a changing gap around the cabinet. The hinge, mounting plate and material holding its screws all affect alignment. Tightening an adjustment on a hinge will not repair a fixing that has pulled out of damaged board.', 'MEL ONE checks the door and cabinet together before agreeing adjustment, refixing or compatible replacement hardware. The Unley cabinet record gives a photographed example of hinge and door-alignment work; the condition of your unit determines the repair.'),
      section('Drawer Runners, Sagging Drawers and Closing Movement', 'A sagging drawer can catch the cabinet below, while a runner fault may make it bind part-way through travel. Drawer-box condition, runner mounting points and available clearance need checking together. A replacement must fit the existing cabinet and drawer rather than simply look like the old part.', 'Describe which drawer catches and whether it closes squarely. The kitchen drawer-runner record shows one supplied repair sequence. Soft-close hardware and replacement runners are discussed against the system found, without assuming every mechanism uses interchangeable parts.'),
    ],
    faqs: [question('Can cupboard hinges and drawer runners be repaired in the same visit?', 'They can be assessed in one repair list. Each hinge, runner and supporting cabinet is checked separately; MEL ONE confirms suitable parts, the agreed work and whether it can be combined in one appointment.')],
  },
  'sliding-door-repair': {
    title: 'Sliding Door Repairs Adelaide',
    shortTitle: 'Sliding Door Repairs',
    description: 'Sliding door repairs for dragging patio panels, worn lower rollers and track problems. MEL ONE assesses the mechanism and confirms compatible parts and scope.',
    sections: [
      section('Sliding Door Roller Replacement and Dragging Panels', 'A patio door that needs extra force may have worn lower rollers, uneven adjustment or a track problem. The point where the panel catches helps explain the symptom, but the roller housing and track must be checked before replacement is chosen. Repeatedly forcing the panel can damage other moving parts.', 'Assessment considers how the panel travels and meets the frame. The supplied sliding patio-door record shows lower-roller work and a dusty track on that particular door. It provides a repair example rather than a diagnosis for every heavy or sticking panel.'),
      section('Sliding Door Tracks, Guides and Closing Alignment', 'Dirt, a damaged track edge and a misaligned guide can produce different movement problems. A panel may move freely along most of its travel but catch near closing, or leave an uneven gap when it meets the jamb. Describe the point of resistance and any visible track damage already noticed.', 'MEL ONE checks the accessible operating parts and discusses cleaning, adjustment or compatible parts as appropriate. Glazing damage and safety-related hardware need the appropriate specialist arrangements. Leave heavy panels in place and do not dismantle the door to measure a roller.'),
    ],
    faqs: [question('Will new sliding door rollers fix a damaged track?', 'Not necessarily. Rollers run on the track, so a damaged running surface or misaligned guide may still cause binding after roller replacement. MEL ONE assesses the panel, track and guides together before agreeing a targeted repair.')],
  },
  'wall-patching-repair': {
    title: 'Plasterboard Repairs & Wall Patching Adelaide',
    shortTitle: 'Plasterboard Repairs & Wall Patching',
    description: 'Plasterboard repairs and wall patching for local holes, dents and damaged edges. Discuss patch size, backing and paint finishing with MEL ONE.',
    sections: [
      section('Plasterboard Holes, Dents and Patch Support', 'A shallow dent and a hole through plasterboard need different preparation. The damaged edges, surrounding board and backing available for a patch affect the work required. Report whether the surface is dry and firm or shows staining, crumbling material or repeat damage.', 'MEL ONE assesses local wall damage and explains the patching scope. Dampness, recurring cracks or a suspected movement problem need their cause considered before cosmetic repair. The Goodwood wall record shows a local patch rather than a guarantee that every crack can be covered.'),
      section('Patch and Paint Finishing Around Existing Walls', 'A repaired patch needs a finishing plan as well as a sound base. Filling, sanding, priming and painting may be separate work items, and an old wall finish can make a small touch-up visible. Existing paint details help discuss the desired result without guaranteeing an invisible match.', 'Identify nearby skirting, corners and fittings affected by the damage. MEL ONE confirms which finishing stages and materials are included. The Adelaide CBD wall and skirting record illustrates connected repair items that should be named individually in the work list.'),
    ],
    faqs: [question('Does a wall patch quote include painting?', 'Confirm painting separately. The quote should identify patch preparation, filling, sanding, priming and any painting agreed. Paint age, colour and the surrounding finish affect the options; a patch-only quote does not automatically include repainting the wall.')],
  },
  'pressure-cleaning': {
    title: 'Pressure Cleaning Adelaide',
    shortTitle: 'Pressure Cleaning',
    description: 'Pressure cleaning for driveways and suitable paved surfaces. MEL ONE checks the surface, drainage and access before agreeing the cleaning method and quote.',
    sections: [
      section('Driveway Pressure Cleaning and Paved Surface Condition', 'Driveway dirt, surface growth and staining do not all respond to the same cleaning method. Concrete, pavers, joints and any existing coating need checking before pressure is selected. Loose material or damaged joints can be made worse by an unsuitable approach.', 'MEL ONE discusses the affected area and assesses the surface before agreeing the work. The Burnside driveway record documents one photographed cleaning job. It does not establish that every stain can be removed or that the same pressure suits every surface.'),
      section('Paving Joints, Runoff and Nearby Garden Areas', 'Paving joints and drainage paths affect how cleaning is planned. Water and loosened dirt need somewhere appropriate to go, and nearby doors, garden beds and stored items may need protection or a different approach. Mention pooled water and areas that already have loose sand or damaged edges.', 'Agree water access, the cleaning boundary and handling of displaced debris before the visit. Re-sanding joints, sealing, repairs and stain treatment should be discussed as separate items where needed. Cleaning alone does not correct damaged paving or poor drainage.'),
    ],
    faqs: [question('Can pressure cleaning remove every driveway stain?', 'No universal result can be promised. The surface, stain type, coating and previous damage affect what cleaning can achieve. MEL ONE assesses the area, explains the proposed method and agrees the cleaning scope before work is approved.')],
  },
  'flyscreen-repair': {
    title: 'Flyscreen & Screen Door Repairs Adelaide',
    shortTitle: 'Flyscreen & Screen Door Repairs',
    description: 'Flyscreen and ordinary screen door repairs: torn mesh, loose spline, bent frames and sticking rollers. Discuss remeshing or hardware repair with MEL ONE.',
    sections: [
      section('Flyscreen Mesh Replacement, Spline and Frame Fit', 'Torn insect mesh can often be considered separately from the frame. The retaining spline, corner joints and fit in the opening determine whether remeshing is suitable. New mesh will not remove a gap caused by a bent frame or a frame that does not sit correctly.', 'Describe whether the screen is on a window or door and which edges are loose. MEL ONE assesses mesh, frame and fittings before agreeing materials. The Norwood flyscreen record shows photographed mesh work within the existing confirmed service scope.'),
      section('Sliding Screen Door Rollers and Track Alignment', 'An ordinary sliding screen door may drag because of its rollers, guide, track condition or alignment rather than the mesh. Describe where it catches and whether it closes with a gap. A clean-looking screen can still have worn operating parts, so movement and insect protection are separate checks.', 'The Henley Beach screen-door record concerns lower rollers and alignment. MEL ONE assesses the affected screen system and confirms compatible work. Security screens, locks and glazing need their own assessment and are not established by an ordinary insect-screen repair.'),
    ],
    faqs: [question('Can new mesh fix a screen door that will not slide?', 'New mesh addresses the insect barrier, not necessarily the movement fault. Rollers, track, frame and guides need checking if the door drags or closes unevenly. MEL ONE confirms whether remeshing, hardware work or both are appropriate.')],
  },
  'door-repair': {
    title: 'Door Repairs Adelaide',
    shortTitle: 'Door Repairs',
    description: 'Door repairs for catching hinged doors, loose hinges, latch alignment and sliding wardrobe problems. MEL ONE assesses the door and supporting fittings.',
    sections: [
      section('Sticking Doors, Loose Hinges and Latch Alignment', 'A hinged door can rub along the frame, catch the floor or miss the latch opening. Loose hinge fixings, worn hardware and changes around the opening can have different remedies. Trimming the door before checking its alignment may remove material without correcting the cause.', 'Note where the contact occurs and whether it started after a flooring or hardware change. MEL ONE checks the door, hinges and closing movement before proposing adjustment or repair. The North Adelaide front-door record provides a photographed example of closing-alignment work.'),
      section('Wardrobe Sliding Door Rollers and Bottom Guides', 'A sliding wardrobe panel that catches or sits unevenly needs its rollers, track and guides checked together. The panel position, wheel condition and supporting fixings influence how it travels. A similar-looking replacement roller may have a different mounting arrangement.', 'The Marion wardrobe record documents lower-roller repair and panel alignment on one system. Mention the affected panel and where it binds; leave heavy panels in place. Glass, fire-rated doors and security-related hardware require the appropriate separate arrangements.'),
    ],
    faqs: [question('Does a sticking door always need trimming?', 'No. Hinge position, fixings, latch alignment and clearances should be checked first. MEL ONE assesses the contact point and door condition before agreeing a repair; removing material is not a universal solution to poor closing.')],
  },
  'gutter-cleaning': {
    title: 'Gutter Cleaning Adelaide',
    shortTitle: 'Gutter Cleaning',
    description: 'Gutter cleaning: leaf debris, blocked outlets and overflow observations. MEL ONE confirms safe access, gutter condition and the agreed clearing scope.',
    sections: [
      section('Leaf Debris, Gutter Outlets and Rainwater Overflow', 'Leaf debris can restrict a gutter channel or collect around an outlet, but overflow can also relate to damage, alignment or a downstream blockage. Note where water spills during rain and whether the problem repeats at the same corner. An observation from the ground helps explain the issue without diagnosing the whole system.', 'MEL ONE assesses the accessible gutters and clearing requirements. The Prospect record shows a photographed gutter-cleaning job. Cleaning and repair are distinct work items; a cleared gutter does not by itself establish that a damaged joint or blocked downpipe has been repaired.'),
      section('Gutter Cleaning Access, Trees and Debris Removal', 'Building height, roof shape, nearby trees and access around the property affect a gutter-cleaning plan. Mention narrow side passages, overhead obstructions and places where debris regularly builds up. Existing ground-level photographs are useful; do not climb to inspect an outlet for the enquiry.', 'Confirm the gutter sections included and how removed debris will be handled. A repeat cleaning interval can be discussed according to leaf fall and observed build-up, with each visit arranged directly. Roof repair, access equipment and separate faults must be confirmed in the assessed scope.'),
    ],
    faqs: [question('Will gutter cleaning stop all overflow?', 'Clearing debris may restore flow where build-up is the cause, but overflow can also involve gutter damage, alignment or a downstream obstruction. MEL ONE distinguishes the cleaning work from any separate repair or specialist assessment required.')],
  },
  'fence-gate-repair': {
    title: 'Fence & Gate Repairs Adelaide',
    shortTitle: 'Fence & Gate Repairs',
    description: 'Fence and gate repairs: loose timber panels, gate hinges, latches and dragging movement. MEL ONE checks damaged parts and their support before quoting.',
    sections: [
      section('Timber Fence Panels, Rails and Supporting Posts', 'A loose paling or panel may be a local fixing problem, while movement in a rail or post can affect a wider section. Timber condition at the fixing points matters: refastening into deteriorated material may not hold. Show the affected section and describe movement already noticed without pushing on an unstable fence.', 'MEL ONE assesses the damaged parts and their support before agreeing repair or replacement. The Mile End record documents timber-fence work. The Modbury record is an assessment, so it must not be read as evidence of a completed fence repair.'),
      section('Gate Hinge Repairs, Latches and Ground Clearance', 'A gate that drags or needs lifting to latch may have loose hinges, worn fixings or movement in its supporting post. The hinge position, latch contact and bottom clearance need checking together. Cutting the gate base may leave a support problem unresolved.', 'Describe whether the gate catches throughout its swing or only near closing. The North Adelaide timber side-gate record gives a relevant photographed example. Boundary permission, shared access and safety-related gates need to be clarified for the particular work before repair is agreed.'),
    ],
    faqs: [question('Can you repair a gate that drags on the ground?', 'MEL ONE assesses the hinges, supporting post, latch and clearances to identify a suitable repair. The cause may be alignment or a damaged support; trimming the base is not assumed. The scope, parts and quote are agreed after assessment.')],
  },
  'flat-pack-assembly': {
    title: 'Flat Pack & Furniture Assembly Adelaide',
    shortTitle: 'Flat Pack & Furniture Assembly',
    description: 'Flat pack and furniture assembly, including IKEA units and wardrobes. Share the model, instructions and current assembly stage with MEL ONE.',
    sections: [
      section('IKEA and Flat Pack Furniture: Panels, Parts and Instructions', 'The furniture model and manufacturer instructions determine the assembly sequence and fittings. Box count, missing hardware and damaged panels matter before work begins. A unit partly assembled the wrong way may need selected steps reversed rather than simply adding the remaining panels.', 'MEL ONE reviews the kit and current stage before agreeing assembly. Keep loose fittings together and mention substitutions already made. The Kensington IKEA KALLAX record illustrates an existing assembly service; it is not a promise that every model or incomplete kit can be finished in one visit.'),
      section('Wardrobe Assembly, Door Alignment and Securing Requirements', 'A flat-pack wardrobe needs enough space to assemble safely and stand in its intended position. Drawer alignment, door clearances and the unit sitting level affect normal use after the carcass is assembled. Manufacturer securing instructions should be considered against the actual wall and supplied fittings.', 'Share the intended position, floor space and instructions. The Stirling wardrobe record is a relevant photographed example. MEL ONE confirms assembly, any agreed securing work and packaging arrangements separately; concealed services and unsuitable surfaces may change the fixing plan.'),
    ],
    faqs: [question('Can you finish furniture that I have partly assembled?', 'Send the model, instructions and current stage, including missing fittings or damaged panels. MEL ONE reviews the assembled sections and kit before agreeing how to complete or correct it. Additional parts or a separate visit may be needed.')],
  },
  'home-electrical-repairs': {
    title: 'Home Electrical Repairs Adelaide',
    shortTitle: 'Home Electrical Repairs',
    description: 'Discuss household electrical concerns involving lights, switches, power points or fans. MEL ONE confirms assessment and qualified service arrangements before work.',
    sections: [
      section('Lights, Switches and Power Point Repair Enquiries', 'A flickering light, damaged switch or power point that no longer works needs electrical assessment rather than an ordinary hardware adjustment. Describe what you have already noticed, which fitting is affected and whether the problem occurs repeatedly. Do not open a cover, touch damaged components or test a suspected fault to prepare the request.', 'MEL ONE confirms the qualified service arrangements for electrical work before it begins. Identify any connected household repairs separately so wall finishing or access work can be scoped alongside the electrical request without treating the tasks as interchangeable.'),
      section('Ceiling Fan Replacement and Existing Fitting Details', 'For a ceiling fan or light replacement enquiry, include the product details and whether there is an existing fitting in the intended position. Installation requirements, the support and the electrical connection need the appropriate qualified assessment. The presence of a fitting does not establish that a replacement can be connected without further work.', 'Discuss who will supply the product and confirm suitability before buying it. MEL ONE agrees the provider, work scope and quote for the request; this service category does not establish an unrestricted electrical licence or guarantee availability for every product.'),
    ],
    faqs: [question('Can electrical work be included with my other home repairs?', 'List the electrical concern separately from doors, furniture or wall repairs. MEL ONE confirms the qualified service arrangements and respective work scope before approval. A combined enquiry does not mean every task can be performed by the same person or in one appointment.')],
  },
  'interior-repairs-assembly': {
    title: 'Furniture Assembly & Interior Repairs Adelaide',
    shortTitle: 'Furniture Assembly & Interior Repairs',
    description: 'Furniture assembly and interior repairs: cupboard hinges, drawers, shelves, curtain fittings and small finishing jobs. Agree each repair with MEL ONE.',
    sections: [
      section('Furniture Assembly, Cupboard Doors and Drawer Repairs', 'Interior repair lists often mix a new furniture kit with existing cupboard or drawer faults. Flat-pack assembly follows the product instructions; a cupboard door needs its hinge and fixing material checked; a sticking drawer needs runner and cabinet alignment assessed. These should be named as individual work items.', 'The Kensington assembly, Unley cupboard and supplied drawer-runner records show different confirmed tasks. MEL ONE can assess a combined list while confirming each repair and suitable parts. A cabinet-hinge repair is different from replacing an entire kitchen.'),
      section('Shelves, Picture Hanging and Curtain Rod Fixings', 'Shelves, mirrors, pictures and curtain rods place different loads on their fixings. The wall material, mounting positions and product instructions affect what is suitable. A loose bracket may need the supporting surface repaired as well as the visible screws tightened.', 'Describe what will be supported and whether the fitting is new or already loose. MEL ONE assesses the surface and agrees the fixing scope. Paint touch-ups, wall patches and trim work should be identified separately so the finish and any additional materials are clear.'),
    ],
    faqs: [question('Can I combine furniture assembly with cupboard and shelf repairs?', 'Yes, list the product to assemble and each existing fitting that needs attention. MEL ONE checks instructions, hardware and supporting surfaces, then confirms the individual work items, materials and appointment arrangements in the quote.')],
  },
  'doors-windows-screens': {
    title: 'Door, Window & Flyscreen Repairs Adelaide',
    shortTitle: 'Door, Window & Flyscreen Repairs',
    description: 'Door, window and flyscreen repairs for catching hinges, worn rollers, loose catches and torn mesh. Choose the fitting and discuss the symptoms with MEL ONE.',
    sections: [
      section('Window Hardware Repairs, Catches and Sliding Movement', 'A sliding window that binds and a window that will not latch need different hardware checks. The track, rollers where fitted, catch and frame alignment can each affect normal operation. Describe the window type and whether the resistance occurs across the full opening or at one point.', 'The Burnside sliding-window record gives a photographed example within the confirmed service scope. MEL ONE assesses accessible fittings and the supporting frame before agreeing repair. Broken glass, deteriorated frames and safety-related hardware may require separate specialist arrangements.'),
      section('Door Hinges, Sliding Rollers and Flyscreen Mesh', 'A rubbing hinged door, dragging patio panel and torn insect screen are related household concerns but use different repair methods. Hinges and latch clearance matter for a hinged door; rollers and tracks matter for a sliding panel; mesh, spline and frame condition matter for a flyscreen.', 'Choose the focused door, sliding-door or flyscreen page for detailed repair examples. MEL ONE can assess several openings in one list while confirming compatible parts for each. A mesh repair does not establish security-screen performance, and a hardware adjustment does not repair broken glazing.'),
    ],
    faqs: [question('Should I describe the window or door type before requesting a repair?', 'Yes. Say whether it is hinged, sliding, a wardrobe panel or an ordinary insect screen, and describe where it catches or fails to close. The mechanism determines the assessment and likely parts, so “sticking door” alone may not identify the work required.')],
  },
  'roof-gutter-exterior-care': {
    title: 'Roof, Gutter & Exterior Maintenance Adelaide',
    shortTitle: 'Roof, Gutter & Exterior Maintenance',
    description: 'Roof, gutter and exterior maintenance enquiries: gutter clearing, overflow observations and local exterior timber concerns. Confirm access and the assessed scope.',
    sections: [
      section('Gutter Cleaning, Outlets and Exterior Water Marks', 'Leaves around a gutter outlet and a mark below an exterior joint give different clues about maintenance needs. Describe where debris or overflow is visible from the ground and whether a mark appears after rain. Cleaning a gutter channel and repairing a leak should be treated as separate work items.', 'The Prospect gutter record shows confirmed cleaning work. MEL ONE assesses the reported concern and agrees access and scope. Roof faults and concealed water paths may require a qualified specialist rather than a surface patch or a promise that clearing gutters will stop every leak.'),
      section('Fascia, Eaves and Local Exterior Timber Repairs', 'Fascia and other exterior timber can show peeling finish, loose edges or soft material at a fixing. The condition of nearby timber and the source of repeated wetting affect whether a local repair is suitable. A fresh coating alone will not restore deteriorated material or a failed support.', 'Report the location and extent visible from a safe position. MEL ONE distinguishes local exterior maintenance from wider roof, structural or specialist work and confirms the appropriate arrangements. Any timber replacement and finishing should be identified in the assessed quote.'),
    ],
    faqs: [question('Is gutter clearing the same as fixing a roof leak?', 'No. Gutter clearing removes agreed debris; a roof leak may involve joints, roofing, flashing or another water path. MEL ONE assesses the reported symptoms and confirms any separate qualified service arrangements and repair scope before work begins.')],
  },
  'garden-landscape-care': {
    title: 'Garden Maintenance & Garden Tidy Ups Adelaide',
    shortTitle: 'Garden Maintenance & Garden Tidy Ups',
    description: 'Garden maintenance and tidy ups, including mowing, edging, hedges and small-plant pruning. Discuss the areas, retained plants and green waste with MEL ONE.',
    sections: [
      section('Garden Tidy Ups, Mowing and Lawn Edging', 'A garden tidy-up should identify the lawn, paths and beds that need attention. Mowing and edging have different requirements from clearing overgrowth around stored items or repairing damaged paving. Mention uneven ground, narrow access and features that need to be left undisturbed.', 'MEL ONE assesses the area and agrees the garden tasks and waste arrangements. A one-off tidy-up can establish what ongoing care would involve, but repeat visits and their timing are discussed separately rather than assumed from the first booking.'),
      section('Hedge Trimming, Small Plant Pruning and Green Waste', 'Before trimming a hedge or small plant, identify which plants should stay, the areas to reduce and the clearance needed around paths or fences. Plant size, access and the amount of cut material affect the work. Large trees, overhead hazards and specialist plant work need separate consideration.', 'The Modbury garden record shows photographed pruning and tidy-up work. MEL ONE confirms the agreed garden boundary and how green waste will be handled. A tidy-up does not automatically include tree removal, irrigation repair or a new landscaping project.'),
    ],
    faqs: [question('Can I arrange regular garden maintenance after a tidy-up?', 'Discuss the lawn, hedges and other agreed tasks with MEL ONE. Repeat care can be considered around growth, access and the work required, with the visit frequency and quote confirmed directly. The first tidy-up does not automatically reserve recurring appointments.')],
  },
  'outdoor-structures-fences-pools': {
    title: 'Deck, Pergola & Outdoor Repairs Adelaide',
    shortTitle: 'Deck, Pergola & Outdoor Repairs',
    description: 'Deck, pergola and outdoor repairs for local timber damage, loose boards, fence panels and gate fittings. MEL ONE assesses the affected parts and supporting structure.',
    sections: [
      section('Deck Board Repairs and Local Timber Replacement', 'A loose deck board, damaged edge or soft fixing point needs the surrounding timber checked before a local repair is chosen. Board condition and the support beneath it influence whether refixing or replacement is appropriate. A new board cannot compensate for an unresolved problem in its supporting structure.', 'The Stirling deck and pergola record shows photographed local timber work. MEL ONE assesses the reported area and agrees the repair and finish. Widespread movement or deterioration may need specialist assessment rather than a cosmetic replacement.'),
      section('Pergola Timber, Fence Panels and Gate Fittings', 'Outdoor timber enquiries should identify the affected component: a pergola member, fence panel, gate hinge or latch. Repeated wetting, deteriorated fixing material and movement in nearby supports affect the repair choice. Each component needs its own scope even when it belongs to the same outdoor area.', 'MEL ONE can discuss the confirmed local timber and fence work, including relevant Stirling, Mile End and North Adelaide records. New structural works and pool-barrier safety or compliance are separate matters requiring appropriate qualified arrangements; ordinary timber repair is not a compliance certification.'),
    ],
    faqs: [question('Can a local deck repair replace a full deck assessment?', 'No. A local repair concerns the agreed damaged area. If supporting timber is soft, loose or moving, MEL ONE discusses the additional assessment needed before proceeding. Replacing a board does not certify the whole deck or establish the condition of concealed components.')],
  },
  'home-repairs-renovation-support': {
    title: 'Home Repairs & Pre-Sale Maintenance Adelaide',
    shortTitle: 'Home Repairs & Pre-Sale Maintenance',
    description: 'Home repairs and pre-sale maintenance: wall patches, skirting, cupboard adjustments and small finishing tasks. Organise a practical repair list with MEL ONE.',
    sections: [
      section('Pre-Sale Home Repairs: Walls, Doors and Interior Trim', 'A pre-sale repair list can include visible wall damage, loose skirting, a catching door and cupboard fronts that no longer align. Group the items by room and distinguish a repair from an optional cosmetic change. Condition, compatible material and drying or finishing stages influence how work is planned.', 'MEL ONE assesses the listed tasks and confirms the agreed scope. The Goodwood patch and Adelaide CBD wall-and-skirting records show actual local repair examples. They do not establish a property valuation effect or guarantee a sale-ready deadline.'),
      section('Patch and Paint, Skirting Boards and Small Finishing Jobs', 'A plasterboard patch, paint touch-up and skirting repair are connected but distinct work items. The wall needs sound material and a suitable base before finishing; replacement trim needs its profile and adjoining joints considered. Existing paint and trim details help discuss what can be matched.', 'Include the affected area and desired finishing stages in the list. MEL ONE confirms repairs, materials and any specialist work before approval. Dampness, repeat cracking and wider renovation works need their cause and requirements considered rather than being hidden with a cosmetic patch.'),
    ],
    faqs: [question('Which small repairs should I list before selling my home?', 'List visible wall damage, loose trim, sticking doors and cupboard or drawer faults by room, then separate optional decorating from repairs. MEL ONE assesses the tasks and confirms the work, materials and finishing stages; sale timing and outcomes are not guaranteed.')],
  },
  'maintenance-planning-inspection-support': {
    title: 'Home & Property Maintenance Adelaide',
    shortTitle: 'Home & Property Maintenance',
    description: 'Home and property maintenance: drawer, door, flyscreen and small-repair lists, one-off jobs and regular care discussed with MEL ONE after assessment.',
    sections: [
      { ...section('Property Repair Checklist for Small Home Repairs', 'Start a property repair checklist by room: a sagging kitchen drawer, cupboard hinge that has loosened, door that catches and torn flyscreen are useful individual entries. Describe what happens during normal use and whether the item still works. A short list of observable faults helps distinguish compatible hardware repairs from surface finishing or cleaning.', 'MEL ONE assesses these small home repairs and agrees a targeted work list. The supplied drawer-runner case, North Adelaide door record and Norwood flyscreen record show different confirmed repairs. They help explain the types of task to list without assuming every property needs the same solution.'), links: [work('kitchen-drawer-runner-repair', 'Kitchen drawer runner repair example'), work('north-adelaide-door-repair', 'North Adelaide door repair example'), work('norwood-flyscreen-repair', 'Norwood flyscreen repair example')] },
      section('Preventative Home Maintenance for Local Homes', 'Preventative home maintenance looks for small changes before they interrupt everyday use: a hinge beginning to loosen, a drawer starting to sag, insect mesh pulling away from its edge or leaf debris collecting in gutters. Routine observation can identify a task to assess; it does not establish the cause or certify hidden parts of the building.', 'Discuss the actual fittings and outdoor areas that need care. MEL ONE can assess an agreed maintenance list and explain the suitable repair or cleaning work. A recurring fault, damp patch or movement concern may need further investigation rather than repeated cosmetic attention.'),
      section('Regular Home Maintenance: One-Off and Recurring Jobs', 'A one-off maintenance visit may address several small repairs such as door alignment, a cupboard hinge and a flyscreen. Regular maintenance starts with the tasks that recur, their condition and suitable intervals: garden growth and gutter leaf build-up have different patterns from a worn drawer runner that needs repair.', 'Tell MEL ONE whether you need a single repair list or would like to discuss regular care. We confirm the agreed tasks, frequency, access and quote directly. Recurring appointments, bundled discounts and completion of every item in one visit are not assumed; parts or specialist arrangements may require separate work.'),
      section('Rental Property Maintenance and Repair Access', 'For rental property maintenance, identify the resident, access contact and person who can approve the repair list and quote. Keep the descriptions specific: which door catches, which drawer sags or which screen is torn. An owner living interstate can request assessment and a repair list for an Adelaide property without presenting a routine visit as a formal building inspection.', 'Agree how findings and updates will be shared with the authorised person. MEL ONE assesses the reported tasks and confirms proposed repairs before approval. Tenancy access, any property-manager requirements and sensitive entry details should be discussed directly, with no access codes in the initial web form.'),
      { ...section('Home Maintenance Quotes: Labour, Materials and Access', 'A home maintenance quote should identify each agreed task and the parts or materials needed. Drawer runners and hinges must suit the existing unit; mesh and spline must suit the frame. Labour, access, procurement and any waste handling can differ across the repair list, so ask which items the written quote includes.', 'MEL ONE confirms the assessed work and quote before you approve repair work. Ask about any assessment or minimum call-out charge, travel and GST treatment when arranging the visit. No universal hourly rate or recurring-maintenance price is published here; optional photos help explain the list but do not establish a final quote.'), links: [{ url: '/service-standards/#quote-details', label: 'What to confirm in a written quote' }] },
    ],
    faqs: [
      question('What is included in a general property maintenance visit?', 'The agreed list may include small repairs such as a loose cupboard hinge, sagging drawer, catching door or torn flyscreen, and separately agreed cleaning or garden tasks. MEL ONE assesses the items and confirms the work, parts, materials and access in the quote; a general visit does not automatically include every trade or a formal building inspection.'),
      question('Can I book regular home maintenance in Adelaide?', 'Discuss the recurring tasks and preferred frequency with MEL ONE. We assess the property maintenance list and confirm the suitable work, access, appointment arrangements and quote. Each recurring visit needs agreement; there is no published subscription price or automatic reservation of future dates.'),
      question('How is preventative maintenance different from emergency repair?', 'Preventative maintenance addresses agreed care and early signs of wear before routine use is interrupted. An urgent fault needs a separate response based on its safety and specialist requirements. A planned maintenance visit is not a guaranteed emergency service, and opening hours do not promise immediate attendance.'),
    ],
  },
  'cleaning-removals-specialist-care': {
    title: 'Household Cleaning & Furniture Removal Adelaide',
    shortTitle: 'Household Cleaning & Furniture Removal',
    description: 'Household cleaning and furniture removal enquiries, including suitable driveway cleaning and clear-outs. Confirm surfaces, access, items and waste arrangements with MEL ONE.',
    sections: [
      section('Household Cleaning, Driveways and Suitable Surfaces', 'Household cleaning and exterior pressure cleaning need different preparation. Identify the rooms or paved areas, the visible dirt and any delicate finishes. Surface condition, coatings and joints influence the cleaning method; extra pressure is not a remedy for every stain or damaged material.', 'MEL ONE assesses the agreed area and explains the cleaning scope. The Burnside driveway record is a photographed pressure-cleaning example, not evidence of every specialist treatment. Repairs, resealing or guaranteed stain removal are not assumed within an ordinary cleaning request.'),
      section('Furniture Removal, Household Clear-Outs and Access', 'A furniture removal or clear-out list should identify the items, their approximate size and any stairs, tight doorways or shared access. State what is staying as clearly as what is leaving. Heavy items, dismantling and disposal arrangements affect the work required and should be agreed before anything is moved.', 'MEL ONE confirms the items and access for the request, including any separate handling or waste arrangements. Do not move a heavy unit yourself to prepare photographs. Hazardous materials, specialist waste and regulated removal work need the appropriate service arrangements rather than an ordinary household clear-out.'),
    ],
    faqs: [question('What details help quote furniture removal or a household clear-out?', 'List the items and approximate sizes, identify anything that must stay and describe stairs, narrow access and parking. MEL ONE confirms the handling, any dismantling and agreed waste arrangements after assessment; hazardous or specialist waste is considered separately.')],
  },
};

export const serviceSectionHeadings = Object.fromEntries(Object.entries(serviceKeywordCopy).map(([slug, copy]) => {
  const topic = copy.title.replace(/ Adelaide$/, '');
  return [slug, { questions: `${topic}: Repair Questions`, scope: `${topic}: Tasks and Materials`, boundaries: `${topic}: Specialist Requirements`, reading: `${topic}: Guides and Repair Examples`, related: `${topic}: Related Services`, cases: `${topic}: Photographed Work` }];
}));

const preparationHeadings = {
  'home-electrical-repairs': { 'Assessment and qualified service arrangements': 'Electrical Fault Assessment and Qualified Service Arrangements', 'Prepare the information, not the electrical fitting': 'Electrical Fitting Details for a Safe Repair Enquiry' },
  'interior-repairs-assembly': { 'Agreeing assembly and finishing details': 'Furniture Securing, Packaging and Interior Finishing' },
  'doors-windows-screens': { 'Choose the repair information for your door type': 'Hinged Doors, Sliding Panels and Ordinary Insect Screens', 'Preparing for assessment and completion': 'Door and Window Parts, Access and Operation Checks' },
  'roof-gutter-exterior-care': { 'Access planning and completion': 'Gutter Access, Leaf Debris and Exterior Repair Checks' },
  'garden-landscape-care': { 'Agree what stays, what is trimmed and what leaves the site': 'Retained Plants, Pruning Limits and Garden Waste' },
  'outdoor-structures-fences-pools': { 'Preparation and review of agreed work': 'Outdoor Timber Condition, Access and Repair Finish' },
  'home-repairs-renovation-support': { 'Qualified work and completion review': 'Finishing Stages and Specialist Home Repair Work' },
  'cleaning-removals-specialist-care': { 'Reviewing the result and separate concerns': 'Cleaning Results, Remaining Stains and Separate Repairs', 'Choose the surface before choosing the cleaning method': 'Surface Materials and Suitable Cleaning Methods' },
  'cabinet-drawer-repair': { 'Prepare your cabinet repair enquiry': 'Cabinet Model, Runner Markings and Repair Photos' },
  'sliding-door-repair': { 'What to send before an assessment': 'Sliding Door Type, Roller Symptoms and Track Photos' },
  'wall-patching-repair': { 'Agree the patch and finishing scope': 'Wall Patching, Sanding and Paint Finish', 'Prepare the wall repair request': 'Wall Damage, Existing Paint and Nearby Fittings' },
  'pressure-cleaning': { 'Confirm access, water and surrounding areas': 'Driveway Water Access, Drainage and Nearby Surfaces', 'Prepare a pressure cleaning enquiry': 'Driveway Size, Surface Material and Stain Details' },
  'flyscreen-repair': { 'Prepare a useful screen enquiry': 'Flyscreen Count, Frame Dimensions and Mesh Details', 'Scope, quote and operation check': 'Screen Door Parts, Remeshing and Closing Checks' },
  'door-repair': { 'Before the assessment': 'Door Type, Contact Points and Hinge Photos', 'Confirm the repair and its limits': 'Door Adjustment, Replacement Parts and Specialist Hardware' },
  'gutter-cleaning': { 'Cleaning starts with access and condition': 'Gutter Debris, Condition and Safe Access', 'Useful information without climbing': 'Gutter Overflow Observations from Ground Level' },
  'fence-gate-repair': { 'Separate the damaged part from its support': 'Fence Panels, Gate Hinges and Supporting Posts', 'Boundary, access and preparation': 'Fence Boundaries, Owner Approval and Gate Access' },
  'flat-pack-assembly': { 'Prepare the room and access': 'Furniture Assembly Space, Stairs and Room Access', 'Confirm assembly, anchoring and completion': 'Flat Pack Assembly, Securing and Packaging' },
};

export function applyKeywordLedContent(content, focusedServices) {
  applyEditorialCopy(content);
  for (const record of [...content.services, ...focusedServices]) {
    if (record.status && record.status !== 'approved') continue;
    const copy = serviceKeywordCopy[record.slug];
    if (!copy) throw new Error(`Missing approved keyword-led service: ${record.slug}`);
    record.title = copy.title;
    record.shortTitle = copy.shortTitle;
    record.seoTitle = copy.title;
    record.description = copy.description;
    record.seoDescription = copy.description;
    if (record.slug === 'maintenance-planning-inspection-support') {
      record.sections = copy.sections;
    } else {
      // Retain existing anchored sections, topic links and original evidence.
      record.sections = [...copy.sections, ...(record.sections || []).filter(s => !copy.sections.some(c => c.heading === (s.heading || s.title)))];
    }
    record.faqs = [...copy.faqs, ...(record.faqs || []).filter(q => !copy.faqs.some(c => c.question === (q.question || q.title)))];
    record.sections = record.sections.map(s => ({ ...s, heading: preparationHeadings[record.slug]?.[s.heading || s.title] || s.heading || s.title }));
  }
}

// Educational additions complement the retained practical guidance and case links.
export const editorialKeywordCopy = {
  'field-notes-doors-windows-screens-enquiry': {
    title: 'Door & Flyscreen Repairs Adelaide: Rollers, Mesh & Hardware',
    sections: [
      section('Sliding Screen Door Rollers, Guides and Frame Alignment', 'Mesh closes the insect barrier; rollers carry a moving screen and guides keep it on its intended path. A screen can have intact mesh and still drag because the running hardware, track or frame alignment needs attention. Conversely, replacing worn rollers will not mend a tear in the mesh.', 'Compare where the panel catches with any visible frame gaps. A whole-screen view helps distinguish these concerns. The Henley Beach screen record illustrates operating hardware, while the Norwood record illustrates remeshing; neither alone specifies the parts for another screen.'),
      section('Repair or Replace: Frame Condition and Compatible Parts', 'Repair is worth comparing when the frame remains sound and a suitable mesh, hinge or roller can be matched. A bent frame, damaged track or deteriorated mounting point can make a small component change insufficient. Ask which parts can be retained and what the replacement option would include.', 'Compare the same scope: hardware, frame work, finishing and any specialist glazing arrangements. Door dimensions and a visible model label help identify the system, but leave panels fitted for assessment. A quoted component repair and a whole-door replacement are different outcomes.')
    ],
    faqs: [question('Why can a screen door still drag after remeshing?', 'Remeshing renews the insect barrier. It does not correct worn rollers, damaged track or poor frame alignment. Those operating parts need separate assessment, so describe both torn mesh and difficult movement when comparing repair options.')]
  },
  'field-notes-wall-interior-repairs-job-list': {
    title: 'Plasterboard Repairs Adelaide: Wall Holes, Patches & Paint',
    sections: [
      section('Wall Patching, Sanding, Priming and Paint Finishing', 'Patching rebuilds a damaged area; painting supplies the final colour and surface appearance. A hole may need backing and replacement board before joint compound, drying and sanding. Primer prepares the repaired surface for paint. These stages have different materials and may need separate visits.', 'A small paint touch-up can remain visible beside an older finish, even when the patch is sound. Ask whether the quote covers the patch only, primer and touch-up, or a wider painted area. The Goodwood patch and CBD wall-and-skirting records show different repair boundaries.'),
      section('Wall Holes, Recurring Cracks and Damp Patches', 'An isolated impact hole raises a different question from a crack that keeps returning or a patch that feels damp. Covering the surface does not explain continuing movement or moisture. State what has changed, whether the area was repaired before and any known leak history.', 'For a mixed interior list, separate the wall from adjoining skirting and cupboard hardware. Each has a different base or fixing point. Leave unknown material undisturbed and agree any investigation needed before cosmetic finishing.')
    ],
    faqs: [question('Why might a wall patch need more than one visit?', 'Backing, joint compound, primer and paint are separate stages, and products need suitable drying conditions before the next stage. The size and finish affect the sequence. Confirm the included stages and timing instead of assuming a patch and final paint can always be completed together.')]
  },
  'field-notes-roof-gutter-exterior-observations': {
    title: 'Gutter Cleaning Adelaide: Overflow & Exterior Repair Checks',
    sections: [
      section('Gutter Overflow, Leaf Debris and Outlet Faults', 'Leaves and twigs can obstruct the water path to an outlet. Overflow can also involve a blocked outlet, damaged connection or another drainage fault. The place where water spills matters: at one corner, near a downpipe or along a whole length are different observations.', 'Describe what you have already seen during rain from ground level. The Prospect record documents debris clearing; it does not prove that cleaning resolves every leak. Ask whether the proposed scope is debris removal or includes a separately assessed repair.'),
      section('Repeat Gutter Cleaning and Leaf Build-Up', 'Nearby trees, visible leaf build-up and the history of overflow help discuss a cleaning interval. A fixed calendar alone cannot describe how quickly a particular gutter collects debris. Regular care should follow the observed site conditions and an agreed maintenance plan.', 'A gutter-cleaning request should identify accessible elevations and where removed debris will go. Roof access and outlet condition are assessed before the work is agreed. Do not climb to inspect a gutter or test it with water for an enquiry.')
    ],
    faqs: [question('How often should gutter cleaning be discussed?', 'Discuss the trees, past build-up and observed overflow at the property. These conditions help decide a suitable interval and whether a separate repair needs attention. MEL ONE confirms the assessed scope and repeat arrangements; one universal frequency does not suit every gutter.')]
  },
  'field-notes-garden-outdoor-seasonal-preparation': {
    title: 'Garden Maintenance Adelaide: Tidy Ups, Pruning & Timber Checks',
    sections: [
      section('Garden Tidy-Up Checklist: Retained Plants, Paths and Green Waste', 'A useful tidy-up list identifies the lawn, hedge, small plants and paths separately. Mark what should stay and the clearance wanted around gates or walkways. This makes a request to reduce overgrowth more precise than asking for everything to be cut back.', 'Mowing, edging, small-plant pruning and collecting green waste are distinct tasks. Compare quotes against the same areas and waste arrangement. The Modbury garden record shows pruning and tidying at one property; a new landscape or large-tree removal is a different scope.'),
      section('Deck Boards, Fence Palings and Gate Hinges Need Separate Checks', 'A split board, loose paling and gate that drags have different supporting parts. The visible timber may be damaged while the nearby rail, post or hinge fixing also needs attention. Replacing the visible piece alone may leave the original movement unresolved.', 'Keep outdoor repair items separate from the garden tidy-up. State which component is affected and describe movement already noticed from safe use. The Stirling timber record and Mile End fence record offer examples of distinct repair areas, not a diagnosis for another structure.')
    ],
    faqs: [question('What should I compare in garden tidy-up quotes?', 'Compare the same lawn or bed areas, pruning limits, retained plants and green-waste handling. Identify fence or deck repairs separately because their materials and supporting parts need assessment. A tidy-up quote does not automatically include every outdoor repair or specialist tree task.')]
  },
  'field-notes-rental-end-of-lease-maintenance-list': {
    title: 'End of Lease Repairs Adelaide: Rental Maintenance Checklist',
    sections: [
      section('Rental Repair List: Hook Holes, Torn Screens and Cupboard Doors', 'List an approved picture-hook hole separately from a torn flyscreen or loose cupboard hinge. Patching involves a wall finish; remeshing depends on the frame; a hinge needs sound mounting material. Keep the room, observed fault and desired finish alongside each item so the quote can be itemised.', 'Separate cleaning and presentation requests from repairs. Confirm the owner or property manager instructions and the person who approves the work before arranging it. A repair list describes proposed work; it does not decide tenancy responsibility or guarantee a bond outcome.'),
      section('Repair Handover: Approval Contact, Scope Changes and Completion Notes', 'For an owner living interstate, identify one person for access and one authorised person for the quote. Record whether each item is awaiting assessment, approved, completed or needs further attention. This prevents an assessment-only item being mistaken for a finished repair.', 'Ask in advance which invoice details and completion notes are required. Keep agreed scope changes with the same job record. Send sensitive access information directly after arrangements are confirmed, rather than putting keys, codes or tenancy documents into the first web enquiry.')
    ],
    faqs: [question('Can end-of-lease repairs guarantee my bond is returned?', 'No. The repair quote concerns agreed work, materials and finishing. A bond outcome depends on matters beyond that repair scope. Confirm the owner or manager instructions and any required records, then review the agreed tasks and remaining concerns at handover.')]
  },
  'field-notes-pre-sale-home-maintenance-list': {
    title: 'Pre-Sale Home Repairs Adelaide: Repair Checklist',
    sections: [
      section('Pre-Sale Repair Priorities: Everyday Use Before Cosmetic Touch-Ups', 'Start with items that interrupt ordinary use: a sticking door, loose handle, cupboard that will not close or gate that catches. Then list wall holes, skirting damage and optional paint touch-ups. A room-by-room list makes functional repairs and presentation choices easier to compare.', 'An inspection date is useful planning information, but parts, access and drying stages affect the schedule. Ask what can be completed within the agreed scope. The Unley cabinet and Goodwood wall records illustrate practical small repairs without establishing an effect on the sale price.'),
      section('Cosmetic Repairs and Defects Needing Further Assessment', 'A scuff or isolated hole differs from active moisture, repeated cracking or movement. Covering the surface can hide the symptom without resolving its cause. Report known changes and previous repairs so further assessment can be discussed before a finish is chosen.', 'The written quote and pre-sale scope should distinguish repair, preparation, materials and painting. Ask what remains excluded and what completion records are available. A handyman repair list is not a building report or a certification of the whole property.')
    ],
    faqs: [question('Which repairs should come first before an open inspection?', 'List items affecting normal use, such as sticking doors and loose cupboard fittings, then cosmetic patches and trim. Mention moisture or recurring cracks separately. MEL ONE assesses the list and confirms tasks, finishing stages and timing; no sale result or unconfirmed deadline is guaranteed.')]
  },
  'field-notes-grouping-multiple-household-jobs': {
    title: 'Small Jobs Handyman Adelaide: Planning Multiple Repairs',
    sections: [
      section('Combined Small Repair Lists and Assessment', 'A cupboard hinge, torn screen and loose internal handle can start in one room-by-room list. Each still needs its own description and suitable parts. Grouping makes the whole request visible, while keeping the individual items clear enough to assess and quote.', 'A delivered furniture kit adds model and instruction checks; a wall patch may add drying and paint stages. Shared access can help plan the work, but different parts, materials or specialist requirements may separate the visits. List the task affecting everyday use first.'),
      section('Compare a Multi-Job Quote by Task, Materials and Visits', 'Ask which labour, parts and preparation are included for each item. A quote covering adjustment only differs from one including replacement runners, remeshing or final paint. Check any assessment charge, minimum call-out, travel and disposal arrangements before approving the list.', 'For example, an owner can request a kitchen hinge, bedroom screen and hallway patch together, then approve the assessed scope for each. This is a planning example, not a customer project. Grouping jobs does not establish an automatic discount or a promise to finish everything in one visit.')
    ],
    faqs: [question('Why might several small jobs need separate visits?', 'Compatible parts may need sourcing, wall finishes may need drying stages and some tasks may require separate qualified arrangements. MEL ONE assesses each item and confirms the visit sequence and quote. A combined enquiry helps planning but does not guarantee one appointment for every task.')]
  },
  'field-notes-cleaning-removals-preparation': {
    title: 'Pressure Cleaning Adelaide: Driveway & Paver Guide',
    sections: [
      section('Paver Cleaning Pressure, Joints and Coatings', 'Pavers, joints and coatings form one surface system. Higher pressure may disturb loose joint material or an ageing coating without addressing the cause of a stain. The proposed method should follow assessment, not a preferred pressure setting.', 'Existing wear can limit the cleaning outcome. The method needs to account for the surface rather than promise that every stain will disappear.'),
      section('Surface Condition Before Pressure Cleaning', 'Identify the paving material and approximate area. Describe moss, staining, loose pavers, damaged joints and any existing coating. Surface condition matters as well as size.', 'Explain water supply, drainage and nearby planting. Leave damaged or unknown material undisturbed; a safe existing overview can show the affected area without testing it.')
    ],
    faqs: [question('Does driveway pressure cleaning include resealing the pavers?', 'Resealing, joint repairs and cleaning are separate work items. The surface and any existing coating need assessment before a method is agreed. Ask the quote to identify the included area, cleaning scope and any additional work rather than assuming sealing follows every clean.')]
  },
  'prepare-household-maintenance-enquiry': {
    title: 'Handyman Quotes Adelaide: Repair Details, Parts & Access',
    sections: [
      section('Handyman Quote Checklist: Labour, Parts and Assessment Charges', 'A useful quote identifies the actual tasks and the materials or components included. Compare labour, parts sourcing, travel, disposal and any assessment or minimum call-out charge on the same basis. Ask how GST is treated and which finishing stages are included.', 'A photograph of a loose hinge cannot establish whether the board behind it is sound or whether a matching part is available. MEL ONE assesses the condition before confirming the repair and written quote. No universal hourly rate is published on this page.'),
      section('Describe a Symptom Without Choosing the Repair Part', 'Write what happens in normal use: a drawer drops, a gate catches at the base or a door needs lifting to latch. Include the fitting location and when the symptom began. These details are useful even if the manufacturer or technical part name is unknown.', 'For family or rental arrangements, identify the resident, access contact and person approving the quote. Safe existing photos and visible product labels are optional. Leave hidden fittings and heavy panels in place; the enquiry begins the assessment process and does not reserve an appointment.')
    ],
    faqs: [question('How do I compare handyman quotes fairly?', 'Compare the same task list, included labour, compatible parts, finishing stages and visit arrangements. Clarify assessment charges, minimum call-out, travel, waste handling and GST treatment. A lower total covering fewer tasks is a different scope; ask for unclear items to be explained before approval.')]
  },
  'home-maintenance-walk-through-checklist': {
    title: 'Home Maintenance Adelaide: Room-by-Room Repair Checklist',
    sections: [
      section('Kitchen, Bedroom and Hallway Maintenance Checks', 'During ordinary use, note cupboard doors that sit unevenly, drawers that catch, loose handles and screen tears. In hallways, record doors rubbing at the floor and damaged skirting. Keep one line per fitting so a small hardware issue is not lost inside a general request for maintenance.', 'Observe the condition without testing unstable fittings or removing covers. A recurring crack, damp surface or sudden change needs its own note. The checklist helps explain symptoms; it cannot confirm hidden condition or replace a formal building inspection.'),
      section('Preventative Maintenance and One-Off Repairs', 'A worn drawer runner may need a defined repair, whereas garden growth and gutter leaf build-up may need repeat care. Distinguish recurring maintenance from a fault that keeps returning after repair. Repeating a cosmetic fix is not the same as resolving its cause.', 'For an Adelaide property managed from interstate, keep the repair list with access and approval contacts. Discuss which recurring tasks are suitable, their intervals and how findings will be reported. MEL ONE confirms the assessed scope and any ongoing arrangements directly.')
    ],
    faqs: [question('How is a maintenance checklist different from a building inspection?', 'A maintenance checklist records everyday symptoms and desired small repairs from normal access. It does not assess concealed structure or certify a property. Formal inspections and defect reports need their appropriate professional process; tell MEL ONE about concerns requiring that separate assessment.')]
  },
  'field-notes-one-household-job-list': {
    title: 'Adelaide Home Repairs: Grouping Small Handyman Jobs',
    sections: [section('A Kitchen Hinge, Screen Tear and Wall Patch in One List', 'These three small jobs can share an enquiry, but they use different materials. The hinge needs sound fixing points, the screen needs suitable mesh and frame fit, and the wall patch needs an agreed finish. Name the room and symptom for each so the assessment can separate the work.', 'A combined list makes priorities easier to discuss. Parts availability and drying stages still affect the visit plan. Keep the original list with the quote and mark which items have been approved.')],
    faqs: [question('Does one repair list mean all jobs will be finished together?', 'No. A shared list helps organise assessment, but each task has its own parts, materials and sequence. MEL ONE confirms which work can be combined and whether further visits or separate arrangements are needed before you approve the quote.')]
  },
  'field-notes-clear-maintenance-handover': {
    title: 'Rental Property Maintenance Adelaide: Repair Handover Records',
    sections: [section('Repair Status: Assessment, Approval and Completion', 'Keep these stages distinct in a rental handover. An assessed torn screen still needs an agreed repair; an approved quote does not mean the work is finished. Record the fitting, authorised contact and next action beside each item so another person can follow the same list.', 'After work, compare the completed items with the approved scope and note any remaining concern. The Modbury fence case is a useful reminder that an assessment record is evidence of observed damage, not evidence of a completed repair.')],
    faqs: [question('What belongs in a rental repair handover note?', 'Include the fitting and location, agreed scope, approval contact, current status and next action. Keep quote changes and any requested completion records with the same job. Arrange private access details directly after the visit is confirmed, rather than in the initial enquiry form.')]
  }
};

const editorialPreparationHeadings = {
  'field-notes-doors-windows-screens-enquiry': ['Door Catching, Loose Handles and Torn Mesh: Observations', 'Door Type, Visible Labels and Safe Photos', 'Door and Screen Assessment, Parts and Approval'],
  'field-notes-wall-interior-repairs-job-list': ['Wall Holes, Loose Trim and Cupboard Fittings', 'Wall Damage Photos, Product Instructions and Materials', 'Room-by-Room Wall and Interior Repair List'],
  'field-notes-roof-gutter-exterior-observations': ['Gutter Debris, Downpipes and Exterior Staining', 'Ground-Level Gutter Photos and Rainfall History', 'Gutter Access, Assessment and Exterior Repair Scope'],
  'field-notes-garden-outdoor-seasonal-preparation': ['Paths, Lawns, Garden Beds and Outdoor Fittings', 'Pruning Limits, Green Waste and Shared Access', 'Garden Task Priorities and the Agreed Work List'],
  'field-notes-rental-end-of-lease-maintenance-list': ['Room-by-Room Rental Repair Locations', 'Rental Repair Approval and Private Access Details', 'Rental Repair Status and the Next Agreed Action'],
  'field-notes-pre-sale-home-maintenance-list': ['Pre-Sale Room, Fitting and Garden Repair List', 'Presentation Work, Water Marks and Specialist Concerns', 'Pre-Sale Timing, Agent Access and Repair Approval'],
  'field-notes-grouping-multiple-household-jobs': ['Separate Kitchen, Bedroom and Outdoor Repair Items', 'Prioritise Fittings That Affect Everyday Use', 'Repair Parts, Property Access and Visit Planning'],
  'field-notes-cleaning-removals-preparation': ['Surface Condition Before Pressure Cleaning', 'Paver Cleaning Pressure, Joints and Coatings', 'Pressure Cleaning Quote Scope'],
  'prepare-household-maintenance-enquiry': ['Repair Symptoms, Fitting Location and Desired Result', 'Safe Repair Photos and Visible Product Details', 'Assessment Arrangements and the Written Repair Quote'],
  'home-maintenance-walk-through-checklist': ['Indoor Doors, Handles, Walls and Furniture Observations', 'Ground-Level Gates, Paths and Garden Observations', 'Turn the Room Checklist into an Assessed Repair List'],
  'field-notes-one-household-job-list': ['Cupboard Alignment, Furniture Kits and Small Wall Marks', 'Repair List Photos, Instructions and Fitting Symptoms', 'Multi-Job Assessment, Approval and Quote', 'Multi-Job Guide: Worked Checklist and Booking Questions'],
  'field-notes-clear-maintenance-handover': ['Identify the Door, Room and Repair Symptom', 'Tenant, Owner and Repair Approval Contacts', 'Agreed Repair Scope, Exclusions and Next Action', 'Rental Approval Records and Follow-Up Requests']
};

function applyEditorialCopy(content) {
  for (const record of [...content.guides, ...content.news]) {
    if (record.status !== 'approved') continue;
    const copy = editorialKeywordCopy[record.slug];
    if (!copy) continue; // Unmapped test/draft records must not inherit a revision or case photograph.
    record.seoTitle = record.title;
    record.seoDescription = record.description;
    record.answerSummary = copy.sections[0].paragraphs[0];
    record.sections = [...copy.sections, ...record.sections.map((s, i) => ({ ...s, heading: editorialPreparationHeadings[record.slug]?.[i] || s.heading }))];
    if (record.slug === 'field-notes-clear-maintenance-handover') record.sections[1].paragraphs[0] += ' Keep the fitting location consistent on the repair list, quote and follow-up note.';
    record.faqs = [...copy.faqs, ...(record.faqs || [])];
  }
  // Internal links use the revised title while keeping every established destination.
  for (const record of [...content.services, ...content.guides, ...content.news, ...content.caseStudies]) {
    for (const link of record.relatedReading || []) {
      const slug = link.url?.match(/^\/(?:guides|news)\/([^/]+)\/$/)?.[1];
      if (editorialKeywordCopy[slug]) link.label = editorialKeywordCopy[slug].title;
    }
  }
}
