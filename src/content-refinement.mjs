/** October 10 keyword-informed edits. Existing approved scope and case facts remain authoritative. */
const link = (url, label) => ({ url, label });
const service = (slug, label) => link(`/services/${slug}/`, label);
const guide = (slug, label) => link(`/guides/${slug}/`, label);
const standards = link('/service-standards/#quote-details', 'What to confirm in your written quote');
const section = (heading, paragraphs, links = []) => ({ heading, paragraphs, links });
const faq = (question, answer) => ({ question, answer });

const serviceEdits = {
  'doors-windows-screens': {
    section: section('Window hardware, frame condition and repair choices', [
      'A window that is hard to open can have worn moving parts, damaged timber or a problem at a fixing point. Tell us the opening type and whether the frame, handle or track is affected. The Burnside sliding-window record shows one hardware repair; a deteriorated timber frame needs its own assessment.',
      'For an older door or window, note any known heritage restrictions before changes are proposed. Broken glazing, fire doors and security-related hardware need the appropriate specialist scope rather than a routine adjustment.'
    ], [service('door-repair', 'Door hinges, latches and sliding-door assessment'), service('flyscreen-repair', 'Flyscreen mesh, frames and moving screens')]),
    quote: section('What affects a door or window repair quote?', ['The number and type of openings, accessible hardware, compatible parts and condition of the frame affect the proposed work. Identify which items rub, fail to latch or need new mesh. Ask the quote to distinguish adjustment, parts replacement, glazing or specialist work and any finishing.'], [standards]),
    question: faq('Can a timber window be repaired rather than replaced?', 'Sometimes, but the timber condition, joints, operating hardware and extent of damage must be assessed. Share any known heritage restrictions. The proposed repair and any specialist work are confirmed before you approve changes.'),
  },
  'interior-repairs-assembly': {
    section: section('Cupboard doors, drawer runners and wall-mounted fittings', [
      'A sagging kitchen cupboard door may need hinge adjustment, a compatible hinge or repair to the material holding it. A drawer that jams may involve its runners or the cabinet itself. Share the cabinet type and visible part markings; do not buy a similar-looking replacement before the mounting pattern is checked.',
      'For picture hooks, a mirror, shelving or a blind bracket, include the product size, weight if known and intended position. Wall construction, existing fixing points and concealed services affect the method. Corded blinds also need the applicable cord-safety arrangements; fixing the bracket alone is not the whole installation.'
    ], [link('https://www.productsafety.gov.au/business/search-mandatory-standards/blinds-curtains-and-window-fittings-mandatory-standard', 'ACCC guidance on blinds, curtains and cord safety'), service('flat-pack-assembly', 'Flat-pack furniture and wardrobe assembly')]),
    quote: section('What affects an interior repair quote?', ['Keep assembly, cabinet hardware, wall fixing and surface finishing as separate items. Quantity, parts availability, the supporting material and whether patching or painting is requested affect the scope. Confirm who supplies parts and whether packaging or waste handling is included.'], [standards]),
    question: faq('Can a drawer runner be replaced without changing the whole cabinet?', 'It may be possible if the cabinet and mounting points remain suitable and compatible runners can be sourced. MEL ONE checks the drawer, runner dimensions and supporting material before agreeing adjustment or replacement.'),
  },
  'home-repairs-renovation-support': {
    section: section('Plasterboard patches, paint touch-ups and trim matching', [
      'For a hole in a plasterboard wall, describe the approximate size, room and nearby corner, skirting or cornice. Note water marks, recurring cracks or movement. The repair plan should address the condition found before covering it with a cosmetic finish.',
      'A patch and a paint touch-up are separate parts of the finish. Existing colour, sheen, texture and light can make a local repair visible. Keep any paint tin details or spare trim available, but discuss the finish and material match before buying supplies. Unknown older wall or ceiling materials should not be drilled, sanded or removed for inspection photos.'
    ], [guide('field-notes-wall-interior-repairs-job-list', 'Prepare a wall, skirting or cabinet repair list'), link('https://www.safework.sa.gov.au/news-and-alerts/news/news/2025/deadly-asbestos-prompts-school-holiday-warning-for-diy-home-renovators', 'SafeWork SA advice on asbestos risks in home renovations')]),
    quote: section('What affects a wall and finishing repair quote?', ['The size and number of patches, surface condition, preparation, drying stages and agreed finish affect the work. Clarify whether sanding, priming, local paint touch-ups or a larger repaint area are included. Skirting, cornice and other trim should be listed separately, including any profile-matching needs.'], [standards]),
    question: faq('Does a wall patch automatically include repainting?', 'No. Patching, preparation and painting should be identified in the agreed scope. Discuss the finish and existing paint before approval; an exact local colour or texture match cannot be assumed.'),
  },
  'maintenance-planning-inspection-support': {
    section: section('One small repair, a longer list or ongoing maintenance', [
      'A single sticking fitting is enough to start a request. For a longer list, separate repairs that affect daily use from presentation work and note dependencies such as a furniture delivery or another trade. This helps agree an order without assuming every job can be finished in one visit.',
      'For recurring upkeep, tell us the tasks and preferred interval. An enquiry does not create a maintenance contract or reserve future visits. Frequency, responsibilities, access and pricing need agreement for the particular property.'
    ], [guide('field-notes-grouping-multiple-household-jobs', 'Build one list with separate repair items'), guide('field-notes-rental-end-of-lease-maintenance-list', 'Rental approvals, access and maintenance handover')]),
    quote: section('What should a maintenance-list quote explain?', ['Ask which tasks can be combined and which need parts, a return visit or a separate qualified provider. Confirm any assessment or minimum call-out charge, travel, labour, materials, disposal and GST treatment for your request. A longer list does not by itself establish a discount or fixed half-day price.'], [standards]),
    question: faq('Can I arrange repairs for a family member?', 'Yes. Identify who can arrange access, receive updates and approve the scope and quote. Agree the contact arrangements with the person living at the property. Any specialist or support-funded work needs its own checks.'),
  },
  'roof-gutter-exterior-care': {
    section: section('Gutter clearing, roof faults and exterior timber are different jobs', [
      'Describe gutter debris separately from a leaking joint, damaged fascia or roof concern. Clearing leaves may improve a blocked gutter, but it does not repair damaged drainage or establish that the roof is weatherproof.',
      'For eaves or fascia timber, note visible peeling, damaged edges or loose pieces from ground level. The supporting material, possible water entry and safe access need assessment before preparation, repair or repainting is agreed.'
    ], [service('gutter-cleaning', 'Gutter cleaning scope and safe preparation'), guide('field-notes-roof-gutter-exterior-observations', 'Record gutter overflow and roof concerns from the ground')]),
    quote: section('What affects an exterior maintenance quote?', ['Building height, access, the affected length or area, debris handling and the condition of the fitting influence the work plan. Ask whether cleaning, waste removal, drainage checks and repairs are separate items. Roof work and high-access equipment are confirmed for the site rather than assumed from a photograph.'], [standards]),
    question: faq('Will gutter cleaning fix every overflow or roof leak?', 'No. Debris, damaged fittings and roof defects can need different work. Describe where and when the water appears; MEL ONE assesses the concern and confirms cleaning, repair or specialist arrangements as appropriate.'),
  },
  'outdoor-structures-fences-pools': {
    section: section('Local timber repair or a wider structural concern?', [
      'A split paling, a worn gate hinge and decayed deck timber are different repair decisions. Include the affected component and adjoining connections in your description. A local replacement is considered against the condition of its supports, not just the visible board.',
      'Do not treat leaning supports, deteriorated load-bearing timber or a moving structure as a cosmetic job. Keep the area unused if it appears unstable and arrange the appropriate assessment. Pool barriers, automatic gates and structural changes need their own specialist scope.'
    ], [service('fence-gate-repair', 'Timber fence, hinge and gate-latch repairs'), guide('field-notes-garden-outdoor-seasonal-preparation', 'Separate outdoor timber concerns from garden upkeep')]),
    quote: section('What affects an outdoor timber repair quote?', ['Identify the damaged length or components, material, access and any shared-boundary approval. The quote should separate removal, replacement timber, hardware, finishing and waste handling where relevant. Structural findings or larger replacement work are discussed before they are added.'], [standards]),
    question: faq('Can a damaged deck board be replaced before cleaning or oiling?', 'The board and its accessible supports need assessment first. Repair, surface preparation and coating are separate work items. Wider decay or movement may require specialist assessment before a finishing plan is agreed.'),
  },
  'garden-landscape-care': {
    section: section('Agree what stays, what is trimmed and what leaves the site', [
      'For a garden tidy-up, mark the paths to clear and plants to retain. Pruning a shrub, mowing a lawn and removing green waste are distinct tasks. Note gates, parked vehicles and pets that affect entry rather than moving heavy objects to prepare photos.',
      'Describe tree, irrigation or excavation concerns separately. Large-tree work and work near services should not be assumed to form part of a routine tidy-up.'
    ], [guide('field-notes-garden-outdoor-seasonal-preparation', 'Prepare pruning boundaries and an outdoor work list'), service('cleaning-removals-specialist-care', 'Paved-surface cleaning and separate waste-handling enquiries')]),
    quote: section('What affects a garden tidy-up quote?', ['Area, vegetation type, pruning boundaries, entry width and green-waste quantity affect the agreed work. Confirm whether mowing, edging, weeding, collection and disposal are included. Tell us about a gate or fence concern as a separate item if you want it assessed during the same request.'], [standards]),
    question: faq('Can a garden tidy-up and gate repair go in the same enquiry?', 'Yes. List the garden tasks and gate symptoms separately. MEL ONE assesses both scopes and confirms whether they can be combined, which providers or parts are needed and the appointment arrangements.'),
  },
  'cleaning-removals-specialist-care': {
    section: section('Choose the surface before choosing the cleaning method', [
      'Paving, painted surfaces and coated concrete do not necessarily suit the same cleaning method. Describe the surface, stains and damaged joints, and note drainage and nearby planting. A pressure-cleaning enquiry is not a request to use maximum pressure on every finish.',
      'For a courtyard or driveway, identify the areas to keep dry or avoid and any shared drainage. For a household clear-out, list waste separately from items to retain. Suspected hazardous material is left untouched for specialist assessment.'
    ], [guide('field-notes-cleaning-removals-preparation', 'Prepare driveway cleaning and household removal details'), service('garden-landscape-care', 'Garden tidy-ups and green-waste planning')]),
    quote: section('What affects a cleaning or removal quote?', ['Surface area and condition, method, water access, parking and drainage affect cleaning. Item size, weight, stairs and waste type affect removal. Ask the quote to distinguish cleaning, handling, collection, disposal and any repairs rather than treating them as one unspecified service.'], [standards]),
    question: faq('Can pressure cleaning damage paving or joints?', 'An unsuitable method can affect the surface or joints. MEL ONE assesses the material and condition before agreeing the cleaning approach. Point out loose pavers, coatings and damaged joints when making the request.'),
  },
  'home-electrical-repairs': {
    section: section('Electrical work is not an ordinary handyman adjustment', [
      'MEL ONE can coordinate an electrical enquiry, but work requiring authorisation must be arranged through appropriately licensed people. Identify the fitting and symptom without opening covers or disconnecting equipment. A company ABN is not a substitute for the relevant trade authorisation.',
      'If your request also includes furniture, a loose cupboard door or wall finishing, list those separately. Agree who is responsible for each trade task and any completion documentation before approval.'
    ], [link('https://www.sa.gov.au/topics/business-and-trade/licensing/building-and-trades/licensing', 'South Australian electrical, plumbing and gas licensing information'), service('interior-repairs-assembly', 'Separate furniture and interior-fitting repairs')]),
    quote: section('What should an electrical-work quote confirm?', ['Confirm the responsible qualified provider, assessment or call-out charges, product compatibility and the included work. Replacement fittings, access, any required testing and documentation should be clear. An enquiry to this website does not confirm an emergency attendance or a reserved appointment.'], [standards]),
    question: faq('Can electrical work be included with other household repairs?', 'You can list the concerns together, but the electrical scope and responsible qualified provider are confirmed separately. Do not assume one appointment, one provider or a combined price until the arrangements are agreed.'),
  },
};

const focusedEdits = {
  'flyscreen-repair': {
    heading:'What affects the cost of flyscreen repairs?',
    text:'Screen count, mesh choice, frame condition and any roller or track work affect the quote. Describe each screen separately, including whether it is fixed, hinged or sliding. Ask which frames and fittings can be retained and whether remeshing, new hardware or frame work is included.',
    question:faq('Can I get a fixed flyscreen quote from photos?', 'Photos can help explain the screen type and damage, but dimensions, frame condition and compatible parts may need checking on site. MEL ONE confirms the assessed work and written quote before you approve repairs.'),
    links:[guide('field-notes-doors-windows-screens-enquiry','How to describe torn mesh and sticking screen rollers')],
  },
  'door-repair': {
    heading:'What affects the cost of a door repair?',
    text:'Door material, panel weight, the fault, compatible hardware and access affect the scope. A hinge adjustment, latch repair and sliding-roller replacement need different parts and time. Confirm any finishing separately, and identify glazing, security or fire-door features before changes are proposed.',
    question:faq('Can rollers be replaced instead of replacing a sliding door?', 'Sometimes. The panel, roller housing, track and available compatible parts must be assessed together. The Marion wardrobe case records a roller repair; a heavy glazed patio panel requires its own assessment and handling plan.'),
    links:[guide('field-notes-doors-windows-screens-enquiry','Door and sliding-panel repair preparation'),service('flyscreen-repair','Mesh and ordinary screen-door repair details')],
  },
  'gutter-cleaning': {
    heading:'What affects a gutter cleaning quote?',
    text:'The gutter length, building height, safe access, debris and disposal requirements affect the work. Mention nearby structures and restricted entry from ground-level observations. Ask whether accessible outlets are included and how any damaged gutter or downpipe fitting will be handled separately.',
    question:faq('Does gutter cleaning include downpipe outlets and repairs?', 'Confirm the included cleaning and accessible outlet checks in the quote. A blocked or damaged downpipe, leaking joint or roof defect may need separate assessment and work; clearing debris is not a roof repair.'),
    links:[guide('field-notes-roof-gutter-exterior-observations','Ground-level gutter and overflow checklist')],
  },
  'fence-gate-repair': {
    heading:'What affects a fence or gate repair quote?',
    text:'Affected boards, rails, posts, hinges and latches are assessed as connected parts. Material, access, waste handling and shared-boundary permissions can affect the plan. Ask which components will be repaired or replaced and whether finishing is included. Automatic gates and pool barriers require separate specialist arrangements.',
    question:faq('Can a leaning fence be repaired without replacing it all?', 'That depends on the posts, rails, connections and extent of deterioration. The Modbury record documents assessment only. MEL ONE checks the affected section and explains whether a local repair, wider replacement or specialist assessment is appropriate.'),
    links:[guide('field-notes-garden-outdoor-seasonal-preparation','Prepare outdoor timber and access details')],
  },
  'flat-pack-assembly': {
    heading:'What affects a flat-pack assembly quote?',
    text:'Product model, quantity, assembly stage, box delivery and working space affect the quote. List missing or damaged parts before booking. Ask whether wall anchoring, placement and packaging handling are included; a furniture assembly request does not automatically include every fixing or disposal task.',
    question:faq('Can you assemble IKEA furniture or several items together?', 'The Kensington record shows assembly of an IKEA KALLAX unit. Share the models and instructions for your furniture so MEL ONE can confirm the assessed scope and timing. This does not imply an official IKEA affiliation or cover every product automatically.'),
    links:[guide('field-notes-grouping-multiple-household-jobs','Group furniture assembly and other small jobs'),service('interior-repairs-assembly','Existing cabinet hinges and drawer repairs')],
  },
};

const guideEdits = {
  'field-notes-doors-windows-screens-enquiry': {
    answer:'For a door, window or flyscreen repair, start with the fitting type and what happens during normal use. Describe mesh damage separately from roller, track or frame problems. MEL ONE checks the condition and compatible parts before confirming repair or replacement.',
    section:section('Choose the right repair enquiry', ['Use the door page for hinges, handles, closing alignment and sliding panels. Use the flyscreen page for insect mesh, frames and ordinary moving screens. If glass, a security rating or a fire-door function is involved, identify it in the request so the appropriate specialist scope can be confirmed.'], [service('door-repair','Door repair and sliding-panel assessment'),service('flyscreen-repair','Flyscreen remeshing and frame assessment')]),
    faqs:[faq('Do I need the replacement part number before enquiring?', 'No. Share any visible product markings already available and describe the symptom. MEL ONE checks compatibility during assessment; leave heavy panels and concealed fittings in place.'),faq('Is an insect screen the same as a security screen?', 'No. Ordinary insect mesh and security-rated products have different purposes and components. Identify the product before repairs are agreed; new mesh or rollers do not establish a security rating.')],
  },
  'field-notes-wall-interior-repairs-job-list': {
    answer:'For wall and interior repairs, list the affected surface or fitting, the visible damage and the finish you want. Keep plasterboard patching, paint touch-ups, skirting and cabinet hardware as separate items so the written quote can explain what each repair includes.',
    section:section('Separate repair, preparation and the finished appearance', ['A useful work list distinguishes the damaged item from the finish you want included. For example, a wall patch beside skirting can involve two surfaces and different materials; it should not be described only as a room touch-up.'], [service('home-repairs-renovation-support','Wall patches, paint touch-ups and skirting repairs'),service('interior-repairs-assembly','Cupboard hinges, drawer runners and interior fittings'),standards]),
    items:['Wall: approximate patch size, nearby edges and any known water marks.','Finish: existing paint details and whether a local touch-up or wider area is requested.','Trim: material, profile and length where safely observable.','Cabinet: affected door or drawer, visible hardware and damaged mounting material.'],
    faqs:[faq('Does patching a hole include sanding and repainting?', 'Only if those stages are included in the agreed scope. Ask which preparation and finish are quoted. Local paint or texture matching depends on the existing surface and is not assumed to be exact.'),faq('Should I sand or open the damaged wall before assessment?', 'No. Leave the area visible and unchanged. Unknown older materials, continuing cracks or moisture may need appropriate assessment before surface work is proposed.')],
  },
  'field-notes-roof-gutter-exterior-observations': {
    answer:'Record gutter and roof concerns from an accessible ground-level position. Note the affected side, visible debris and where overflow happens. Cleaning, damaged drainage, exterior timber and roof defects are different work scopes; MEL ONE confirms access and the appropriate assessment.',
    section:section('Describe the water path without testing it yourself', ['Say whether overflow appears at a corner, along a length or near an outlet, and whether you noticed it during rain. These observations help locate the concern; they do not establish the cause. Do not climb, enter the roof space or run a hose to reproduce a problem for the enquiry.'], [service('gutter-cleaning','Gutter cleaning and included outlet checks'),service('roof-gutter-exterior-care','Roof, fascia and exterior maintenance assessment')]),
    faqs:[faq('Can I request gutter cleaning without roof-level photographs?', 'Yes. A description and ground-level observations are enough to start. MEL ONE assesses safe access and the work required; photos are optional.'),faq('Does gutter debris explain every overflow?', 'No. Debris, damaged joints, outlets and other drainage or roof conditions can need different work. Describe what you observed and let the assessment establish the appropriate scope.')],
  },
  'field-notes-garden-outdoor-seasonal-preparation': {
    answer:'Make separate lists for garden upkeep and outdoor repairs. Mark plants to retain, the clearance you want and green-waste arrangements. For gates, decks or pergolas, describe the damaged part from a safe location and leave unstable areas unused for assessment.',
    section:section('Keep a tidy-up separate from repair and structural work', ['Pruning boundaries and waste removal define a garden request. Timber condition, hinges and supporting connections define a repair request. Combining them in one message is useful, but does not establish one provider, one visit or a fixed combined price.'], [service('garden-landscape-care','Garden pruning, tidy-ups and green waste'),service('fence-gate-repair','Fence and gate repair assessment'),service('outdoor-structures-fences-pools','Deck and pergola timber concerns')]),
    faqs:[faq('Does a garden tidy-up automatically include green-waste removal?', 'No. Agree the retained plants, tasks, waste quantity and disposal arrangements in the work scope and quote.'),faq('Should I walk on a damaged deck to show which boards move?', 'No. Describe movement already noticed during normal use and provide only safely available information. Keep apparently unstable areas unused and arrange the appropriate assessment.')],
  },
  'field-notes-rental-end-of-lease-maintenance-list': {
    answer:'For rental or end-of-lease repairs, identify the exact damage, authorised decision-maker, access contact and handover date. Agree the repair scope and quote before work. Repair responsibility, permissions and bond decisions follow the applicable tenancy process, not a handyman guarantee.',
    section:section('Agree approval, records and the handover contact', ['Separate cleaning from repair work and identify any owner or property-manager instructions. Before booking, ask who approves changes and what written quote, invoice details or completion records are needed. Raise these requirements early rather than assuming every document or photo set is included.'], [service('home-repairs-renovation-support','Wall and finishing repairs for an approved work list'),link('https://cbs.sa.gov.au/sections/renting/renting/modifications-and-minimum-standards','CBS guidance on rental modifications and minimum standards'),standards]),
    faqs:[faq('Will repairs guarantee the return of my rental bond?', 'No. MEL ONE can assess an authorised repair list and agree the work, but does not determine tenancy liability or guarantee a bond outcome.'),faq('Can a property manager arrange access and receive the quote?', 'Identify the authorised contact, access arrangements and who approves the cost. Tell MEL ONE any work-order, invoice or handover requirements so these can be confirmed for the request.')],
  },
  'field-notes-pre-sale-home-maintenance-list': {
    answer:'A pre-sale repair list should separate everyday faults from presentation tasks. Start with doors, fittings and visible damage, then discuss the finish and inspection date. Persistent moisture, movement or safety concerns need assessment before cosmetic work; repairs do not guarantee a sale-price increase.',
    section:section('Plan repair stages around the rooms you need to use', ['List access windows, agent visits, deliveries and other work already booked. Patching and finishing can involve different stages; furniture assembly needs space and the complete kit. Confirm the sequence after assessment instead of assuming all items fit a single visit.'], [service('home-repairs-renovation-support','Pre-sale wall, skirting and finishing repairs'),service('flat-pack-assembly','Furniture assembly before or after moving in'),guide('field-notes-grouping-multiple-household-jobs','Order a mixed household repair list')]),
    faqs:[faq('Which repairs should I list before an open inspection?', 'Describe fittings that do not work as intended, visible damage and the presentation finish you want. Identify known water, movement or safety concerns separately for assessment. MEL ONE agrees the included tasks and timing with you.'),faq('Can you guarantee completion before my inspection date?', 'Share the date when you enquire. Appointment timing, parts and any separate finishing stages must be confirmed before the work is booked; sending a deadline does not reserve a visit.')],
  },
  'field-notes-grouping-multiple-household-jobs': {
    answer:'You can send several small repairs in one enquiry. Use one line per task with its location, symptom and desired outcome. MEL ONE assesses which items can be combined and confirms parts, access, any separate visits and the written quote; grouping jobs does not automatically mean a discount.',
    section:section('A simple work-list example', ['Use a list like the example below, replacing the details with your own observations. It is a preparation example, not a record of work at a customer property.'], [service('maintenance-planning-inspection-support','Maintenance assessment and work-list planning'),standards]),
    items:['Kitchen — cupboard front hangs unevenly — check the door and hinge mounting.','Bedroom — flat-pack wardrobe kit delivered — model and instructions available.','Window — mesh torn — identify the screen and any frame damage.','Side access — gate catches at the latch — describe whether it also drags.'],
    faqs:[faq('Is it cheaper to book several small repairs together?', 'Some tasks may share access or preparation, but costs depend on the assessed work, parts and visit arrangements. Ask which items can be combined and how charges are set out; no automatic saving or half-day rate is assumed.'),faq('Can a family member approve the repair list remotely?', 'Identify the resident, access contact and authorised decision-maker in advance. Agree who receives the quote and approves changes before the work is scheduled.')],
  },
  'field-notes-cleaning-removals-preparation': {
    answer:'For cleaning or a household clear-out, identify the surface or items, what should stay and the access route. Cleaning method, drainage, item handling and disposal are separate planning questions. Leave heavy items and suspected hazardous materials in place while MEL ONE assesses the request.',
    section:section('State the result, not a pressure setting or disposal assumption', ['For paving, describe the marks, coatings and damaged joints, then let the condition guide the cleaning method. For removals, name the items and waste type without moving or dismantling them for a photograph. Confirm handling and disposal in the quote.'], [service('cleaning-removals-specialist-care','Surface cleaning and household removal scope'),service('garden-landscape-care','Separate pruning and green-waste requests')]),
    faqs:[faq('Can a paved courtyard be cleaned without damaging the joints?', 'The material, joint condition, coatings and drainage need assessment before the method is agreed. Flag loose or damaged areas rather than assuming pressure cleaning is suitable everywhere.'),faq('Should I move large furniture before requesting a clear-out quote?', 'No. List the items and describe stairs, doorways and parking. Handling, any dismantling and disposal arrangements are confirmed before collection is agreed.')],
  },
  'prepare-household-maintenance-enquiry': {
    answer:'To request an Adelaide handyman assessment, send the job description, suburb and preferred reply method. Include timing or approval constraints and available product details. Photos are optional; you do not need to identify the fault or choose replacement parts before contacting MEL ONE.',
    section:section('Questions to settle before you approve work', ['A useful enquiry also identifies what still needs agreement. Ask about the assessment purpose, any charges, the repair scope and who will carry out specialist work. Keep access codes and sensitive documents out of the initial form.'], [link('/contact/','Request an Adelaide assessment and written quote'),standards,link('/privacy/','How enquiry details are used')]),
    items:['Who can arrange access and approve the work?','Which labour, parts, travel and disposal items are included?','Is an assessment or minimum call-out charge applicable?','What timing, exclusions and follow-up arrangements are agreed?'],
    faqs:[faq('Can I enquire without photos or technical part names?', 'Yes. Describe what needs attention and where it is. Safe existing photos and product details can help, but MEL ONE assesses the condition and required parts.'),faq('Is sending the form the same as booking a visit?', 'No. MEL ONE follows up to confirm the assessment, access and appointment. Repair work and the written quote need approval before work begins.')],
  },
  'home-maintenance-walk-through-checklist': {
    answer:'A room-by-room maintenance checklist records what you notice during normal use, not a formal building inspection. List doors, cabinet fittings, screens, surfaces and outdoor observations without dismantling them. MEL ONE assesses the resulting work list and confirms the appropriate repair or specialist scope.',
    section:section('Use one observation per room or outdoor zone', ['Keep the list non-invasive. The examples below help organise observations; they do not certify that a fitting, structure or service is safe. Note when an issue first appeared and whether it is changing.'], [service('maintenance-planning-inspection-support','Turn observations into an assessed maintenance list'),guide('field-notes-roof-gutter-exterior-observations','Safe ground-level exterior observations')]),
    items:['Kitchen and laundry: cupboard alignment, handles and drawers during normal use.','Bedrooms and living areas: door closing, screen condition and unfinished furniture assembly.','Walls and trims: visible holes, cracks, water marks and loose skirting.','Outside from the ground: gate movement, path obstruction, garden growth and observed gutter overflow.'],
    faqs:[faq('Does this checklist replace a building inspection or defect report?', 'No. Formal inspections, reports and certification follow their appropriate professional process. This checklist only helps describe maintenance observations for assessment.'),faq('Should I test an unstable fitting to add more detail?', 'No. Report what you have already observed, leave it undisturbed and explain any loss of normal use. MEL ONE confirms the appropriate assessment and qualified arrangements.')],
  },
};

const extraFaqs = [
  ['repair-charges',faq('How much does a handyman repair cost in Adelaide?', 'The cost depends on the assessed tasks, condition, parts and access. Ask about any assessment or minimum call-out charge, labour, materials, travel, waste handling and GST treatment. MEL ONE confirms the written quote before you approve repair work; no fixed hourly rate is published here.')],
  ['minimum-call-out',faq('Is there a minimum call-out or assessment charge?', 'Confirm any applicable charge and what the visit includes directly with MEL ONE before booking. A small job is not automatically free to assess, and this website does not publish a universal minimum fee.')],
  ['photos-and-quote',faq('Can I get a fixed quote from photos?', 'Photos can help explain the job, but measurements, access, damaged material and compatible parts may need checking on site. MEL ONE confirms the assessed scope and written quote before work is approved. Photos are optional.')],
  ['weekend-hours',faq('Are you open on weekends or after work?', 'Business hours are 09:00–21:00, seven days a week, in Adelaide local time. Tell us your preferred visit window. Appointment timing and any out-of-hours arrangements are confirmed for the request; opening hours do not guarantee same-day attendance.')],
  ['family-booking',faq('Can I arrange repairs for a parent or family member?', 'Yes. Identify the resident, access contact and person authorised to approve the work and quote. Agree how updates will be shared. Do not send sensitive access information in the initial form.')],
  ['choosing-provider',faq('What should I check before hiring a handyman?', 'Check the company identity, relevant licence or qualification for the actual work, applicable insurance documents, repair scope and written quote. An ABN identifies a business but does not establish every trade authorisation. MEL ONE confirms qualified service arrangements before work begins.')],
];

const caseNotes = {
  'norwood-flyscreen-repair':'This record shows remeshing a window screen. For your screen, describe any frame or corner damage separately so the assessment can distinguish mesh work from frame repair.',
  'north-adelaide-door-repair':'This record concerns latch and closing alignment. Report whether your door rubs, fails to latch or has loose hardware; those symptoms do not necessarily need the same adjustment.',
  'burnside-window-repair':'This record concerns sliding-window operation and lower hardware. Identify your window type and where movement catches so the assessment can distinguish roller, track and frame work.',
  'kensington-furniture-assembly':'The photographed product is an IKEA KALLAX shelving unit. Provide your own product model and instructions; this record does not imply an official IKEA affiliation or establish the assembly needs of every model.',
  'unley-kitchen-cabinet-repair':'The recorded result is adjusted cabinet-door alignment. A loose hinge in damaged cabinet material can need different fixing work; describe the hinge and its supporting edge together.',
  'goodwood-wall-repair':'The recorded wall patch is a specific repair area. For another wall, identify the patch size, nearby corner and desired finish, with any known moisture or changing cracks noted separately.',
  'mile-end-fence-repair':'The photographed repair concerns a timber fence section. Describe damaged palings and any loose rails or posts separately so the assessed quote can identify the connected components.',
  'prospect-gutter-cleaning':'The record shows gutter debris being cleared. Overflow, a damaged joint or a downpipe concern needs its own assessment rather than being assumed to have the same cause.',
  'adelaide-cbd-wall-repair':'The record includes both lower wall and skirting work. For a similar request, identify the two surfaces and the finish required, plus building access or work-hour restrictions.',
  'modbury-timber-fence-repair-assessment':'This is an assessment record: damaged palings and the visible fence condition were documented. It does not record a completed repair. Supporting posts, connections and the next work scope must be assessed separately.',
  'marion-shower-screen-repair':'The record concerns shower-door movement and adjustment. Identify your screen type and where it catches; glazing, compatible hardware and safe handling need assessment for the actual enclosure.',
  'henley-beach-sliding-screen-door-repair':'The recorded work concerns lower rollers and door alignment. Distinguish a moving-screen problem from torn mesh, and describe where the screen catches along its travel.',
  'stirling-deck-pergola-timber-repair':'This record shows work to deck and pergola timber. For another structure, identify visible damage from a safe place; the condition of supports and any structural or approval requirements need their own assessment.',
  'modbury-garden-pruning-tidy-up':'The photographed work concerns pruning and tidying a garden bed. Mark retained plants, the desired clearance and green-waste arrangements rather than leaving the pruning boundary unspecified.',
  'north-adelaide-timber-gate-repair':'The record concerns the gate and latch area. Describe whether your gate drags, needs lifting or will not latch; hinges, supporting timber and closing contact are assessed together.',
  'burnside-driveway-pressure-cleaning':'The photographed surface is paved driveway material. Identify coatings, loose pavers, damaged joints and drainage at your property before a cleaning method is agreed.',
  'stirling-flat-pack-wardrobe-assembly':'This record shows a wardrobe assembled from supplied components. Provide your kit model, instructions and any missing-part details; assembly, anchoring and packaging handling are confirmed as separate scope items.',
  'marion-wardrobe-sliding-door-repair':'The record concerns lower rollers and panel alignment. Identify your wardrobe system and any damaged track or guide; compatible replacement parts are checked before the repair is agreed.',
};

export function applyContentRefinement(content, focused) {
  for (const record of content.services.filter(r=>r.status==='approved' && !r.noindex)) {
    const edit=serviceEdits[record.slug];
    if (!edit) continue;
    record.sections.push(edit.section,edit.quote);
    record.faqs.push(edit.question);
  }
  for (const record of focused) {
    const edit=focusedEdits[record.slug];
    if (!edit) continue;
    record.sections.push(section(edit.heading,[edit.text],[standards,...edit.links]));
    record.faqs.push(edit.question);
  }
  for (const record of content.guides.filter(r=>r.status==='approved' && !r.noindex)) {
    const edit=guideEdits[record.slug];
    if (!edit) continue;
    record.answerSummary=edit.answer;
    record.sections.push({...edit.section,...(edit.items?{items:edit.items}:{})});
    record.faqs=[...(record.faqs||[]),...edit.faqs];
  }
  for (const [slug,question] of extraFaqs) content.faqs.push({slug,title:question.question,description:question.answer,scope:[question.answer],exclusions:[],status:'approved'});
  for (const record of content.caseStudies) {
    if (caseNotes[record.slug]) record.sections.push(section('What to compare for a similar repair',[caseNotes[record.slug]],[link('/service-standards/','Assessment, scope and repair follow-up')]));
  }
  for (const record of content.news) {
    if(record.slug==='field-notes-one-household-job-list') record.sections.push(section('Keep the note short; use the guide for a full checklist',['A room, an observed problem and the intended result are enough for each line. The companion guide gives a worked list and questions about combining jobs, parts and approval.'],[guide('field-notes-grouping-multiple-household-jobs','Multi-job repair list example and booking questions')]));
    if(record.slug==='field-notes-clear-maintenance-handover') record.sections.push(section('Make the approval handover explicit',['Name the person arranging access and the person approving the work. Keep any quotation, scope changes and follow-up request connected to the same job. Use the rental guide for approval and handover questions rather than sending private tenancy documents in the initial message.'],[guide('field-notes-rental-end-of-lease-maintenance-list','Rental repair approval, access and handover guide')]));
  }
}

export const regionNotes = {
  'cbd-north-adelaide': { text:'Start with the room or fitting and any building-access restrictions. The CBD wall-and-skirting record and North Adelaide door and gate records show different scopes: surface finishing, closing alignment and external hardware should remain separate work items.', guide:'field-notes-grouping-multiple-household-jobs', label:'Organise several repairs and approval contacts' },
  'eastern-suburbs': { text:'Use the existing Norwood screen, Kensington assembly and Burnside window or driveway records to identify the closest task type. A mesh tear, furniture kit and paved surface need different information; choose the service for the actual concern, not just the suburb.', guide:'field-notes-wall-interior-repairs-job-list', label:'Prepare interior repairs, hardware and finishing details' },
  'inner-west': { text:'Describe damaged fence palings separately from gate movement or loose cabinet hardware. The Mile End fence record illustrates work to a fence section; adjoining rails, posts and shared-boundary access still need assessment for another property.', guide:'field-notes-garden-outdoor-seasonal-preparation', label:'Prepare fence, gate and outdoor access observations' },
  'western-suburbs': { text:'Identify whether the problem concerns mesh, a moving screen panel, a glazed door or gate hardware. The Henley Beach record shows ordinary sliding-screen roller work; other panels and security fittings need their own scope and handling arrangements.', guide:'field-notes-doors-windows-screens-enquiry', label:'Distinguish mesh, screen rollers and door hardware' },
  'north-north-east': { text:'Keep gutter debris, garden pruning and fence condition as separate items. The Prospect gutter and Modbury garden records show completed tasks, while the Modbury fence record is assessment-only. State which area needs attention and the access available.', guide:'field-notes-roof-gutter-exterior-observations', label:'Record gutters and exterior concerns safely from the ground' },
  'adelaide-hills-foothills': { text:'For outdoor timber, describe visible deterioration from a safe position; do not use unstable boards or steps to investigate. The Stirling timber and wardrobe records concern different jobs. Include the exact suburb, site entry and product details so travel, access and scope can be confirmed.', guide:'home-maintenance-walk-through-checklist', label:'Build a non-invasive indoor and outdoor maintenance list' },
  'southern-suburbs': { text:'Wardrobe panels and shower doors use different hardware. The Marion records separate lower wardrobe rollers from shower-screen movement; identify the affected system before parts are proposed. For a gate or furniture kit, include that item as its own line.', guide:'field-notes-doors-windows-screens-enquiry', label:'Prepare door, wardrobe and screen repair details' },
  'inner-south': { text:'The Unley cabinet and Goodwood wall records concern different interior repairs. Describe the hinge or drawer separately from wall preparation and painting. Parkside and Millswood pages give their own fitting guidance; a regional example is labelled by the actual project suburb.', guide:'field-notes-wall-interior-repairs-job-list', label:'Prepare cabinet, wall and interior-fitting details' },
};

export const localPreparation = {
  'Adelaide CBD':'Describe the lower-wall damage and adjoining skirting. Include any known finish or paint details and building work-hour restrictions; close and wider existing photos are optional.',
  'North Adelaide':'Say where the door or gate catches and whether the latch engages. Existing photos of hinges and closing contact can help, but do not force the mechanism or lift a heavy panel.',
  'Kent Town':'Include the blind width or model and describe which bracket is loose. Note restricted window access and any cord-safety concern. Safe existing bracket photos are optional.',
  'Bowden':'Identify the drawer and any furniture model or instructions. Describe how it behaved empty or loaded during normal use; do not remove a heavy drawer or expose its runners for photos.',
  'Norwood':'Identify a window or door flyscreen, the tear and any frame or corner damage. Approximate dimensions and safe existing images are useful; leave removal and final measurements for assessment.',
  'Burnside':'For paving, note the surface, joints, stains and water access. For a window, describe where movement catches. List the two requests separately; existing photos are optional.',
  'Kensington':'Send the shelving model, box count and available instructions. Note the intended position and working space. Confirm unpacking and any wall securing before the visit.',
  'Magill':'Describe the point where the door rubs and any recent flooring change. Safe existing views of the bottom gap or hinges can help; do not plane or dismantle the door before assessment.',
  'Unley':'Identify the affected cupboard doors together and note any visible hinge marking or damaged mounting edge. Discuss access to stored items; existing closed-door and hinge photos are optional.',
  'Goodwood':'Describe the wall damage, approximate size and nearby corner. Mention any known water issue or changing crack. Do not open or sand the surface to prepare an image.',
  'Parkside':'Describe the vanity door, hinge and any swollen cabinet edge. Note access around stored toiletries. Existing photos can help distinguish hardware from supporting-material concerns.',
  'Millswood':'Describe the shelf size, intended load and where it pulls away. Keep the area unused if unstable; do not handle a loose fitting merely to photograph its fixings.',
  'Mile End':'Estimate affected palings from a safe position and mention loose rails or posts. Explain entry to the fence and any shared-boundary approval. Existing photos are optional.',
  'Thebarton':'Say whether the gate drags, swings freely or needs lifting to latch. Describe normal-use symptoms without forcing it; existing hinge and latch images can help.',
  'Torrensville':'Describe whether the screen rattles, falls out or no longer fits. Identify visible corner or retaining-clip damage without removing a high or awkward screen.',
  'Brompton':'Mention the hinge plate, any screw that no longer holds and access around appliances. Provide visible product details if available; do not move an appliance for a photo.',
  'Henley Beach':'Say where the screen catches along its track and whether it closes fully. Existing lower-hardware photos are optional; leave panel removal for assessment.',
  'West Beach':'Describe whether the handle sticks during normal use with the door open or only while closed. Include visible product details without opening the lock or forcing the handle.',
  'Glenelg':'Identify a glass or screen panel and where it catches. Approximate width and safe existing images help plan assessment; do not lift a heavy patio panel out of its track.',
  'Semaphore':'Describe the hinge connection, surrounding timber and any post movement already noticed. Note whether the gate closes. Stay clear of unstable supports when gathering information.',
  'Modbury':'Keep the fence condition and garden tasks on separate lines. Mark retained plants, priority areas and waste access. Safe existing photos are optional; the fence scope follows assessment.',
  'Prospect':'Record visible debris or overflow and the affected side from ground level. Mention restricted access; no roof-level photos or ladder inspection are needed for the request.',
  'Campbelltown':'Note when overflow occurs and whether it is at a corner, outlet or gutter length. Ground-level images are optional. Do not climb or run water to reproduce the issue.',
  'Golden Grove':'Describe visible loose or deteriorated timber at the joint and the wider structure. Use only existing safe views; avoid the area if pieces are loose or falling.',
  'Stirling':'For timber, identify the damaged position from a safe place. For a wardrobe, include model, kit stage and instructions. Keep outdoor repair and assembly as separate scope items.',
  'Crafers':'Locate the damaged deck edge and describe movement already noticed during normal use. Do not load or dismantle the board to test it; surrounding safe views are optional.',
  'Aldgate':'Identify the path clearance and plants to retain. Describe access and green-waste arrangements. You can mark safe existing photos or point out pruning boundaries during assessment.',
  'Blackwood':'Identify the affected tread and whether another entry route is available. A safe existing wider view can locate it; do not use or dismantle an unstable step to inspect the supports.',
  'Marion':'Identify a wardrobe panel or shower door, then describe its movement and contact point. Existing hardware images are optional; leave heavy panels and glazing undisturbed.',
  'Brighton':'Describe sagging, edge contact or a gap around the shower door. Include visible product details if known. Do not force the enclosure or handle glass to obtain close-up images.',
  'Hallett Cove':'Describe where the gate drags, how the latch behaves and any need to lift it already noticed. Existing hinge and base-clearance photos are optional; avoid forcing the gate.',
  'Morphett Vale':'Include the furniture model, instructions, current assembly stage and missing parts. Keep unused hardware together. Existing images of assembled sections are optional.',
};
