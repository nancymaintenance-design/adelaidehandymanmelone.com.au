/** Approved guide consolidation, 14 October 2026. Existing facts and photographs only. */
const link = (url, label) => ({ url, label });
const service = (slug, label) => link(`/services/${slug}/`, label);
const guide = (slug, label) => link(`/guides/${slug}/`, label);
export const guideTopics = [
  { id: 'repair-choices', title: 'Repair choices', slugs: ['field-notes-doors-windows-screens-enquiry', 'field-notes-wall-interior-repairs-job-list'] },
  { id: 'outside-the-home', title: 'Outside the home', slugs: ['field-notes-cleaning-removals-preparation', 'field-notes-roof-gutter-exterior-observations', 'field-notes-garden-outdoor-seasonal-preparation'] },
  { id: 'planning-and-property', title: 'Planning and property', slugs: ['prepare-household-maintenance-enquiry', 'field-notes-grouping-multiple-household-jobs', 'home-maintenance-walk-through-checklist', 'field-notes-rental-end-of-lease-maintenance-list', 'field-notes-pre-sale-home-maintenance-list'] },
];
export const guideEditorial = {
 'field-notes-doors-windows-screens-enquiry': {
  label: 'Doors, rollers and flyscreens', summary: 'Separate torn mesh from roller, track and frame faults, then compare a component repair with replacement.',
  answer: 'A dragging screen and a torn mesh panel need different checks. Start with the fitting type and movement you have noticed; use the comparison below to decide which questions belong in your repair request.',
  sections: [
    {
      "heading": "Sliding Screen Door Rollers, Guides and Frame Alignment",
      "paragraphs": [
        "Mesh closes the insect barrier; rollers carry a moving screen and guides keep it on its path. Intact mesh does not rule out a running-hardware fault. Note whether dragging occurs throughout travel or at one point.",
        [
          "Compare visible frame gaps with the point where the panel catches. The ",
          {
            "url": "/case-studies/henley-beach-sliding-screen-door-repair/",
            "label": "Henley Beach screen record"
          },
          " illustrates operating hardware, while the Norwood photograph below illustrates remeshing. Neither specifies parts for another screen."
        ]
      ]
    },
    {
      "heading": "Repair or Replace: Frame Condition and Compatible Parts",
      "paragraphs": [
        "A sound frame and an available compatible component can support a repair option. A bent frame, damaged track or deteriorated mounting point may make a small component change insufficient. Ask which original parts can be retained.",
        "Compare hardware, frame work and finishing on the same basis. A component repair and whole-door replacement deliver different scopes; the lower price is not necessarily the same outcome."
      ]
    },
    {
      "heading": "Identify the Door or Screen System",
      "paragraphs": [
        [
          "An ordinary insect screen differs from a security screen. Mesh replacement does not establish a security rating; ",
          {
            "url": "/services/flyscreen-repair/",
            "label": "flyscreen remeshing and frame assessment"
          },
          " concerns the insect-screen system."
        ],
        [
          "Glass patio and wardrobe panels use different hardware. The ",
          {
            "url": "/services/sliding-door-repair/",
            "label": "sliding-door roller and track service"
          },
          " covers these heavier systems; the broader ",
          {
            "url": "/services/doors-windows-screens/",
            "label": "door, window and screen scope"
          },
          " identifies specialist boundaries. If glass is broken or a frame is unstable, stop using the fitting and keep people clear. Do not remove the door to obtain replacement parts or measurements."
        ]
      ]
    },
    {
      "heading": "Door and Screen Preparation Checklist",
      "paragraphs": [
        [
          "Use the ",
          {
            "url": "/guides/prepare-household-maintenance-enquiry/",
            "label": "quote preparation guide"
          },
          " to assemble your request and check ",
          {
            "url": "/how-it-works/",
            "label": "assessment and approval arrangements"
          },
          ". Existing photos are optional."
        ]
      ],
      "items": [
        "Name the room and fitting type alongside each symptom.",
        "Include visible product markings without dismantling hardware.",
        "Provide the suburb, access contact and person who can approve work."
      ]
    }
  ], aliases: [[1,6,9],[2,7],[8,10,11],[3,4,5]], caseContext: 'The Norwood record shows a mesh repair. It illustrates the insect barrier, not a roller replacement or a security-rating test.', next: service('door-repair','Hinged-door and hardware assessment')
 },
 'field-notes-wall-interior-repairs-job-list': {
  label: 'Wall holes, patches and paint', summary: 'Understand backing, drying, sanding and paint stages, and flag recurring cracks or moisture before cosmetic work.',
  answer: 'Define the wall damage and the finish you want before comparing quotes. A sound patch, a local paint touch-up and a wider painted wall are distinct outcomes; existing moisture or movement can change the order of work.',
  sections: [
    {
      "heading": "Wall Patching, Sanding, Priming and Paint Finishing",
      "paragraphs": [
        "A hole may need backing and replacement board before joint compound, drying and sanding. Primer prepares the repaired surface for paint. These stages use different materials and may require separate visits.",
        [
          "A sound patch can still show through an older finish. For ",
          {
            "url": "/services/wall-patching-repair/",
            "label": "small wall patches and finishing"
          },
          ", choose the intended endpoint in the quote: patch only, primer and paint touch-up, or a wider painted area. A perfect colour match should not be assumed."
        ]
      ]
    },
    {
      "heading": "Wall Holes, Recurring Cracks and Damp Patches",
      "paragraphs": [
        "An isolated impact hole differs from a recurring crack or damp patch. Covering the surface does not resolve continuing movement or moisture. Record when the change appeared, previous repairs and any known leak history.",
        "Leave unknown materials undisturbed. Do not sand or open the wall to make a clearer photograph; further assessment may need to come before cosmetic work."
      ]
    },
    {
      "heading": "Separate Wall, Trim and Fitting Tasks",
      "paragraphs": [
        [
          "List adjoining skirting as its own item. A loose cupboard front belongs with ",
          {
            "url": "/services/cabinet-drawer-repair/",
            "label": "cupboard hinge and drawer-runner repairs"
          },
          ", because its supporting material and fixings differ from plasterboard."
        ],
        "A new furniture kit needs its model, instructions and missing-part list. These tasks may share an enquiry, but they are not stages of a wall patch."
      ]
    },
    {
      "heading": "Wall Repair Preparation Checklist",
      "paragraphs": [
        "Give each affected area a simple room-and-position reference so the assessor can connect your notes to the correct location."
      ],
      "items": [
        "Estimate the visible size and distance from nearby edges without disturbing the surface.",
        "Attach safe existing wide and closer views if useful, with private documents out of frame.",
        "Note room availability, belongings restricting access and who can agree the work."
      ]
    }
  ], aliases: [[1],[2],[5,6,7],[3,4]], caseContext: 'The Goodwood record concerns a plasterboard wall patch. Compare the documented surface work with the finishing stages in your own quote; it does not promise an invisible colour match.', next: guide('field-notes-grouping-multiple-household-jobs','Plan a mixed interior repair list')
 },
 'field-notes-roof-gutter-exterior-observations': {
  label: 'Gutter overflow and exterior checks', summary: 'Record where water overflows, distinguish debris from drainage faults and prepare access details without climbing.',
  answer: 'The position and timing of gutter overflow are useful observations. They do not establish whether debris, an outlet or another defect caused it. Keep the enquiry grounded in what you can already see from a safe position.',
  sections: [
    {
      "heading": "Gutter Overflow, Leaf Debris and Outlet Faults",
      "paragraphs": [
        "Leaves and twigs can obstruct the water path to an outlet. Overflow may also involve a blocked outlet, damaged connection or another drainage fault. A spill at one corner differs from overflow along a whole length.",
        "Record where and when water escaped during rain and any known earlier repair. These observations help distinguish possibilities; they do not establish a diagnosis."
      ]
    },
    {
      "heading": "Repeat Gutter Cleaning and Leaf Build-Up",
      "paragraphs": [
        "Nearby trees and the history of leaf build-up help discuss a cleaning interval. A fixed calendar alone cannot describe how quickly an individual gutter collects debris.",
        "Keep dates of previously observed build-up with the maintenance record. Review repeat arrangements against those conditions instead of treating one clean as a permanent solution."
      ]
    },
    {
      "heading": "Cleaning Scope and Exterior Repair Boundaries",
      "paragraphs": [
        [
          "A ",
          {
            "url": "/services/gutter-cleaning/",
            "label": "gutter-cleaning assessment"
          },
          " establishes the accessible elevations, outlet scope and where removed debris will go. Ask whether the quote is for cleaning alone or includes a separately assessed repair."
        ],
        [
          "Damaged trim, roof concerns or persistent staining may need ",
          {
            "url": "/services/roof-gutter-exterior-care/",
            "label": "exterior maintenance assessment"
          },
          ". A debris-clearing example does not prove that cleaning will resolve every leak."
        ]
      ]
    },
    {
      "heading": "Ground-Level Preparation Checklist",
      "paragraphs": [
        "Do not climb, enter the roof space or run a hose to reproduce a leak for an enquiry. Existing ground-level views are enough to start a discussion."
      ],
      "items": [
        "Identify the affected side using a room, boundary or entrance as a reference.",
        "Mention locked gates, narrow passages, shared entry and the access contact.",
        "Give timing constraints and the person who can approve the assessed work."
      ]
    }
  ], aliases: [[1],[2],[5,6],[3,4]], caseContext: 'The Prospect record documents gutter debris clearing. It supports a cleaning example, not a diagnosis that every overflow or leak can be resolved by cleaning.', next: guide('home-maintenance-walk-through-checklist','Make an indoor and outdoor maintenance list')
 },
 'field-notes-garden-outdoor-seasonal-preparation': {
  label: 'Garden tidy-ups and outdoor timber', summary: 'Mark retained plants, path clearance and green waste; keep deck, fence and gate repairs as separately assessed items.',
  answer: 'A garden request works best when pruning boundaries and retained plants are clear. Add damaged timber or gate hardware as separate repair items so the required access, materials and waste arrangements can be agreed for each task.',
  sections: [
    {
      "heading": "Garden Tidy-Up Checklist: Retained Plants, Paths and Green Waste",
      "paragraphs": [
        [
          "For ",
          {
            "url": "/services/garden-landscape-care/",
            "label": "garden pruning and tidy-ups"
          },
          ", identify the lawn, beds and paths separately. Mark plants to retain and the clearance wanted around walkways; “cut everything back” leaves too much open to interpretation."
        ],
        "Mowing, edging, small-plant pruning and green-waste handling are distinct quoted items. Compare the same areas and waste arrangement. New landscaping and large-tree work are different scopes."
      ]
    },
    {
      "heading": "Deck Boards, Fence Palings and Gate Hinges Need Separate Checks",
      "paragraphs": [
        [
          "A split board, loose paling and gate that drags have different supporting parts. Describe the affected board, hinge or latch for ",
          {
            "url": "/services/fence-gate-repair/",
            "label": "fence and gate repairs"
          },
          "; ",
          {
            "url": "/services/outdoor-structures-fences-pools/",
            "label": "deck and pergola timber concerns"
          },
          " need their own condition assessment."
        ],
        "Leave unstable areas unused. Do not walk on deteriorated timber or force a gate to demonstrate movement; report only what normal use has already revealed."
      ]
    },
    {
      "heading": "Outdoor Access and Shared Boundaries",
      "paragraphs": [
        "Record the entry route, locked gates, pets and space available for the work. Tell the assessor about adjoining property or shared-boundary restrictions before scheduling.",
        "Name the person who can provide entry and settle any permission needed. Access arrangements are separate from deciding how much vegetation or timber work belongs in the quote."
      ]
    },
    {
      "heading": "Outdoor Work Preparation Checklist",
      "paragraphs": [
        "Use a ground-level overview to number the areas in your request. This lets the agreed list identify a precise location without requiring close inspection of a damaged fitting."
      ],
      "items": [
        "Label each area on a safe existing photograph or simple sketch if helpful.",
        "Put the task affecting normal household use first.",
        "Keep the agreed area references with the quote and note any unresolved item for follow-up."
      ]
    }
  ], aliases: [[1],[2],[4,6,7],[3,5]], caseContext: 'The Modbury garden record shows pruning and a tidy-up. It illustrates plant clearance; it is not evidence of a deck repair or structural assessment.', next: guide('home-maintenance-walk-through-checklist','Record recurring outdoor maintenance')
 },
 'field-notes-rental-end-of-lease-maintenance-list': {
  label: 'Rental repairs and handover', summary: 'Keep damage, approval, access and completion status together without confusing repair work with a bond guarantee.',
  answer: 'Build a repair list that the resident, owner and property manager can follow. Each item needs a location, approval contact and current status; an assessment or accepted quote is not evidence that the repair has been completed.',
  sections: [
    {
      "heading": "Rental Repair List: Hook Holes, Torn Screens and Cupboard Doors",
      "paragraphs": [
        "List a picture-hook hole separately from torn mesh or a loose cupboard hinge. Patching involves a wall finish; remeshing depends on the screen frame; a hinge needs sound mounting material. Keep the room and observed fault beside each item.",
        [
          "Separate cleaning instructions from repairs. ",
          {
            "url": "/services/home-repairs-renovation-support/",
            "label": "Wall and finishing repairs"
          },
          " concern an agreed physical scope; the list does not decide tenancy responsibility or guarantee a bond outcome."
        ]
      ]
    },
    {
      "heading": "Rental Repair Handover: Status, Invoices and Completion Notes",
      "paragraphs": [
        "Keep the job record usable for a resident or owner living interstate. Mark each item awaiting assessment, approved, completed or needing further attention. An accepted quote is not evidence that a repair is finished.",
        "Agree required invoice details and completion notes before the visit. At handover, compare completed items with the quoted scope and record the next action for any outstanding work."
      ]
    },
    {
      "heading": "Confirm Approval Before Arranging Repairs",
      "paragraphs": [
        [
          "Identify the authorised decision-maker and who can approve changes if assessment reveals different work. Route revised scope and costs through that person before proceeding; approaching handover dates do not replace permission."
        ],
        "Record who arranges entry separately from who accepts costs. Send keys, codes and private tenancy documents directly after arrangements are confirmed, not in the first web enquiry."
      ]
    },
    {
      "heading": "Rental Handover Preparation Checklist",
      "paragraphs": [
        [
          "Check ",
          {
            "url": "/service-standards/#quote-details",
            "label": "written-quote inclusions"
          },
          " while assembling the request. Use a stable room-and-fitting reference so everyone is discussing the same item."
        ]
      ],
      "items": [
        "State the proposed handover date and any building work-hour restrictions.",
        "Include safe existing photos or known product information if available.",
        "Keep cleaning instructions and unrelated tenancy correspondence outside the repair list."
      ]
    }
  ], aliases: [[1],[2],[4,6],[3,5]], dropFaqs: ['Will repairs guarantee the return of my rental bond?'], caseContext: 'The Adelaide CBD wall-and-skirting record shows a particular repair scope. It is an example of documented work, not a statement about a tenant’s liability or bond.', next: guide('prepare-household-maintenance-enquiry','Prepare the repair quote request')
 },
 'field-notes-pre-sale-home-maintenance-list': {
  label: 'Pre-sale repair priorities', summary: 'Prioritise everyday faults, separate optional presentation work and plan access around finishing stages and inspection dates.',
  answer: 'A pre-sale list should make priorities visible: fittings that interrupt normal use, damage needing assessment and optional presentation work. Set out the desired finish and inspection date, then confirm the scope and sequence before booking.',
  sections: [
    {
      "heading": "Pre-Sale Repair Priorities: Everyday Use Before Cosmetic Touch-Ups",
      "paragraphs": [
        [
          "Start with ",
          {
            "url": "/services/door-repair/",
            "label": "sticking doors and loose handles"
          },
          ", a cupboard that will not close or a gate that catches. Then list wall holes, skirting damage and optional paint touch-ups. Functional problems and presentation choices serve different purposes."
        ],
        "Set a desired result beside each item so optional work can be separated if the scope changes. A small repair record does not establish an effect on a property’s sale price."
      ]
    },
    {
      "heading": "Cosmetic Repairs and Defects Needing Further Assessment",
      "paragraphs": [
        "A scuff or isolated hole differs from active moisture, a recurring crack or movement. Covering a symptom does not resolve its cause. Report known changes and earlier repairs before choosing a finish.",
        "The quote should distinguish repair, preparation, materials and painting, including exclusions. A handyman repair list is not a building report or certification of the whole property."
      ]
    },
    {
      "heading": "Plan Access Around Repair Stages",
      "paragraphs": [
        [
          "List agent visits, deliveries and rooms that need to remain usable. ",
          {
            "url": "/services/home-repairs-renovation-support/",
            "label": "Pre-sale wall and trim repairs"
          },
          " may involve drying stages. Give the inspection date as a planning constraint; it does not reserve an appointment or guarantee completion."
        ],
        [
          "Treat ",
          {
            "url": "/services/pressure-cleaning/",
            "label": "driveway pressure cleaning"
          },
          " as a separate surface task with its own condition assessment. The ",
          {
            "url": "/guides/field-notes-grouping-multiple-household-jobs/",
            "label": "multi-job repair list"
          },
          " helps coordinate unrelated work."
        ]
      ]
    },
    {
      "heading": "Pre-Sale Preparation Checklist",
      "paragraphs": [
        "Keep a single version of the agreed list available to the owner, agent and access contact. This avoids competing instructions as the property is prepared."
      ],
      "items": [
        "Identify the person who can accept costs and revised scope.",
        "Record which spaces need clearing after the work arrangements are confirmed.",
        "At handover, mark outstanding items and the next agreed action beside the original task."
      ]
    }
  ], aliases: [[1],[2],[4,6],[3,5]], dropFaqs: ['Which repairs should I list before an open inspection?'], caseContext: 'The Goodwood record illustrates a wall patch. It helps compare the repair boundary; it does not establish a sale-price effect or a guaranteed finish date.', next: link('/service-standards/#quote-details','Check repair scope and quote inclusions')
 },
 'field-notes-grouping-multiple-household-jobs': {
  label: 'Combine several small repairs', summary: 'Use a worked room-by-room list, identify parts and dependencies, and compare quotes without assuming a single visit or discount.',
  answer: 'Several small repairs can begin in one enquiry while remaining separate quoted items. Keep the room, symptom and desired result beside each task so parts, access and finishing stages can be planned together.',
  sections: [
    {
      "heading": "Combined Small Repair Lists and Assessment",
      "paragraphs": [
        "A cupboard hinge, torn screen and loose internal handle can start in one room-by-room enquiry. Each still needs its own description; a broad request to “fix a few things” can hide the task affecting daily use most.",
        "Group the list for assessment but distinguish independent tasks from work that depends on another repair. A wall finish may need to follow its underlying repair, while an unrelated handle can be assessed separately."
      ]
    },
    {
      "heading": "Compare a Multi-Job Quote by Task, Materials and Visits",
      "paragraphs": [
        "Compare labour, parts and preparation for each item. Adjustment alone differs from replacement runners, remeshing or final paint. Confirm assessment, minimum call-out, travel and disposal charges on the same basis.",
        "Shared preparation does not establish an automatic discount or saving. Compatible components, finishing stages and specialist arrangements can require more than one visit; ask for the proposed sequence alongside the itemised scope."
      ]
    },
    {
      "heading": "A Worked Household Repair List",
      "paragraphs": [
        "This is a preparation example, not a customer project. It distinguishes observations from a chosen technical solution."
      ],
      "items": [
        "Kitchen — cupboard front hangs unevenly — assess the fixing and supporting material.",
        "Bedroom — new wardrobe kit ready — assembly requested.",
        "Window — torn mesh — frame condition also needs checking.",
        "Side access — gate catches at the latch — note whether it drags during ordinary use."
      ]
    },
    {
      "heading": "Parts, Access and Approval Checklist",
      "paragraphs": [
        [
          "For the ",
          {
            "url": "/services/maintenance-planning-inspection-support/",
            "label": "maintenance work-list assessment"
          },
          ", collect product models, instructions and existing parts without dismantling fittings. Note expected deliveries and room access; leave unstable or unknown material undisturbed."
        ],
        [
          "Name the access contact and authorised decision-maker. Use the ",
          {
            "url": "/guides/prepare-household-maintenance-enquiry/",
            "label": "enquiry preparation guide"
          },
          " for the initial submission and private-detail boundaries."
        ]
      ]
    }
  ], aliases: [[1],[2],[3,6],[4,5]], caseContext: 'The Kensington record documents assembly of one IKEA KALLAX unit. It shows why the product and available kit matter; it does not prove that an unrelated mixed list will fit into one visit.', next: link('/service-standards/#quote-details','Confirm charges and included work')
 },
 'field-notes-cleaning-removals-preparation': {
  title: 'Pressure Cleaning Adelaide: Driveway & Paver Guide', label: 'Driveway and paver cleaning', summary: 'Assess paving, joints, coatings and drainage before choosing a cleaning method; check quote boundaries and prepare the area.',
  answer: 'Start with the paved surface and its condition, not a preferred pressure setting. Loose joints, coatings, stains and drainage affect the cleaning method and the result that can reasonably be agreed.',
  sections: [
    {
      "heading": "Surface Condition Before Pressure Cleaning",
      "paragraphs": [
        "Identify the paving material and approximate area. Describe moss, staining, loose pavers, damaged joints and any existing coating. Surface condition matters as well as size.",
        "Explain water supply, drainage and nearby planting. Leave damaged or unknown material undisturbed; a safe existing overview can show the affected area without testing it."
      ]
    },
    {
      "heading": "Paver Cleaning Pressure, Joints and Coatings",
      "paragraphs": [
        "Pavers, joints and coatings form one surface system. Higher pressure may disturb loose joint material or an ageing coating without addressing the cause of a stain. The proposed method should follow assessment, not a preferred pressure setting.",
        "The most forceful treatment is not necessarily suitable. Existing wear can limit the cleaning outcome, so the method needs to account for the surface rather than promise a uniform appearance."
      ]
    },
    {
      "heading": "Pressure Cleaning Quote Scope",
      "paragraphs": [
        [
          "The ",
          {
            "url": "/services/pressure-cleaning/",
            "label": "driveway and paved-surface cleaning service"
          },
          " explains the assessment scope. Confirm the included area and method before booking. Ask what result is reasonable for existing marks."
        ],
        "Cleaning, joint repairs and resealing are separate work items. The quote should state any additional treatment and exclusions; do not assume every finishing stage follows a clean."
      ]
    },
    {
      "heading": "Pressure Cleaning Preparation Checklist",
      "paragraphs": [
        "Agree preparation after assessment. Keep the work area accessible without moving heavy or unstable objects yourself."
      ],
      "items": [
        "Confirm which vehicles and objects need moving, when and who will arrange it.",
        "Coordinate parking, gates and shared access with the people using the property.",
        "State the access contact and any times the driveway or path must remain available."
      ]
    }
  ], aliases: [[6],[1],[2,7],[3,4,5]], caseContext: 'Before cleaning: moss is visible on this Burnside paved driveway. Follow the linked case sequence for the documented finished result. This image records the initial condition, not a completed clean.', next: link('/service-standards/#quote-details','Confirm the cleaning scope and written quote')
 },
 'prepare-household-maintenance-enquiry': {
  label: 'Request and compare repair quotes', summary: 'Describe symptoms without choosing parts, clarify labour and charges, and name the people arranging access and approval.',
  answer: 'A useful first enquiry explains the task, location and desired result. You do not need to diagnose the fault or identify a replacement part; the assessment establishes the condition and work needed before a written quote is agreed.',
  sections: [
    {
      "heading": "Handyman Quote Checklist: Labour, Parts and Assessment Charges",
      "paragraphs": [
        "Compare the same tasks, labour, parts sourcing and finishing stages. Clarify travel, disposal, assessment or minimum call-out charges and GST treatment. A lower total covering fewer tasks is a different scope.",
        "A photograph cannot establish hidden supporting condition or the availability of a matching component. MEL ONE assesses the work before confirming the written quote; this page does not publish a universal hourly rate."
      ]
    },
    {
      "heading": "Describe a Symptom Without Choosing the Repair Part",
      "paragraphs": [
        "Write what happens in normal use: a drawer drops, a gate catches at the base or a door needs lifting to latch. Give the fitting location, when the symptom began and desired result. Technical part names are not required.",
        "Add visible product labels or known model information if available. Avoid choosing a replacement component before assessment; similar symptoms can arise from different hardware or mounting conditions."
      ]
    },
    {
      "heading": "Safe Photos and Private Access Details",
      "paragraphs": [
        "Photos are optional. A wider view and closer image can help if already available safely. Leave electrical fittings, roof access, broken glass, hidden hardware and heavy panels untouched.",
        [
          "Share codes and private tenancy documents directly after arrangements are confirmed. The ",
          {
            "url": "/privacy/",
            "label": "enquiry privacy information"
          },
          " explains how initial details are used; an image should not expose unrelated private records."
        ]
      ]
    },
    {
      "heading": "Before Sending Your Enquiry",
      "paragraphs": [
        [
          "Give the exact suburb as well as the task when checking local availability. Norwood, Unley and Prospect are among the ",
          {
            "url": "/service-areas/",
            "label": "listed service areas"
          },
          "; a listed location does not confirm an appointment."
        ],
        [
          "Use the ",
          {
            "url": "/contact/",
            "label": "assessment enquiry form"
          },
          " and preferred reply method. MEL ONE follows up about access and timing; submission does not reserve a visit."
        ]
      ],
      "items": [
        "Name the access contact and person accepting the quote.",
        "State timing constraints and whether someone else must coordinate the visit.",
        "Check that each task has a clear room or fitting reference."
      ]
    }
  ], aliases: [[1],[2,3],[4],[5,6]], caseContext: 'The North Adelaide door record illustrates closing alignment and hardware work. Similar symptoms at another property still need their own assessment and compatible-parts check.', next: service('maintenance-planning-inspection-support','Arrange assessment of a household repair list')
 },
 'home-maintenance-walk-through-checklist': {
  label: 'Room-by-room maintenance checklist', summary: 'Turn normal-use observations into an indoor and outdoor work list, distinguishing repeat upkeep from recurring faults.',
  answer: 'Use a walk-through to record what you already notice during normal household use. One line per room or fitting keeps the list actionable; it does not certify concealed condition or replace a building inspection.',
  sections: [
    {
      "heading": "Kitchen, Bedroom and Hallway Maintenance Checks",
      "paragraphs": [
        "During normal use, note cupboard doors sitting unevenly, drawers catching, loose handles and screen tears. In hallways, record doors rubbing at the floor and damaged skirting. Keep one line per fitting.",
        "Record when a change began and any previous repair. Do not test unstable fittings or remove covers; everyday observations cannot confirm concealed condition or replace a formal building inspection."
      ]
    },
    {
      "heading": "Preventative Maintenance and One-Off Repairs",
      "paragraphs": [
        "A worn drawer runner may need a defined repair, whereas garden growth and gutter leaf build-up may need recurring care. Distinguish scheduled upkeep from a fault that returns after repair; repeating a cosmetic fix is not resolving its cause.",
        "Discuss suitable intervals and how future findings will be recorded. An ongoing arrangement needs an assessed scope rather than an assumption that all items belong on the same schedule."
      ]
    },
    {
      "heading": "Outdoor Observations from Ground Level",
      "paragraphs": [
        [
          "Note gate movement, obstructed paths and garden growth from an accessible position. The ",
          {
            "url": "/guides/field-notes-roof-gutter-exterior-observations/",
            "label": "ground-level gutter checklist"
          },
          " covers visible overflow without climbing."
        ],
        "Leave roof access, unstable timber, pool-barrier concerns and structural movement for the appropriate assessment. Do not load or force a suspect fitting to add detail."
      ]
    },
    {
      "heading": "Turn Observations into a Work List",
      "paragraphs": [
        [
          "The ",
          {
            "url": "/services/maintenance-planning-inspection-support/",
            "label": "maintenance planning assessment"
          },
          " helps turn the notes into an agreed work scope. Prioritise items affecting normal use and identify dependencies between tasks."
        ]
      ],
      "items": [
        "Give each item a stable location reference and desired result.",
        "Name the access contact and person approving costs, including remote owner arrangements.",
        "Keep the agreed list and record each next action so another person can follow the work."
      ]
    }
  ], aliases: [[1,3],[2],[4],[5,6]], dropFaqs: ['Does this checklist replace a building inspection or defect report?'], caseContext: 'The Prospect record shows debris cleared from a gutter. It is an example of an individual maintenance task, not a whole-property inspection or a universal cleaning interval.', next: guide('field-notes-grouping-multiple-household-jobs','Prioritise several small repairs')
 }
};

export function applyGuideEditorial(content) {
 for (const record of content.guides.filter(g => g.status === 'approved' && !g.noindex)) {
  const edit = guideEditorial[record.slug];
  if (!edit) continue;
  if (edit.title) record.title = record.seoTitle = edit.title;
  record.shortTitle = edit.label;
  record.description = record.seoDescription = edit.summary;
  record.answerSummary = edit.answer;
  record.sections = edit.sections.map((s, i) => ({ ...s, id: `guide-topic-${i + 1}`, aliases: edit.aliases[i].map(n => `guide-section-${n}`) }));
  record.faqs = record.faqs.filter(q => !edit.dropFaqs?.includes(q.question));
  record.guideCaseContext = edit.caseContext;
  record.guideNext = edit.next;
 }
 applyAuditGuideAmendments(content);
 // Shorten discovery labels, but preserve contextual wording authored in complete guide paragraphs.
 for (const record of [...content.services, ...content.guides, ...content.news, ...content.caseStudies]) {
  const discoverySections = guideEditorial[record.slug] ? [] : (record.sections || []);
  for (const l of [...(record.relatedReading || []), ...discoverySections.flatMap(s => [...(s.links || []), ...(s.paragraphs || []).filter(Array.isArray).flat().filter(p => typeof p === 'object')])]) {
   const slug = l.url?.match(/^\/guides\/([^/]+)\/$/)?.[1];
   if (guideEditorial[slug]) l.label = guideEditorial[slug].label;
  }
 }
}

function applyAuditGuideAmendments(content) {
 const get = slug => content.guides.find(g => g.slug === slug && g.status === 'approved' && !g.noindex);
 const grouped = get('field-notes-grouping-multiple-household-jobs');
 if (grouped) grouped.sections.push({ id: 'move-in-repair-list', aliases: [], heading: 'Move-In Repairs Before Furniture Delivery', paragraphs: [
  'Prepare a move-in list by room with the keys or access contact, fitting and observed task, product delivery dates, instructions and the person approving changes. For new curtain rods and shelving, include product dimensions, intended position and wall-fixing permission. Keep finishing stages and any licensed work separate.',
  'Tell MEL ONE when furniture is due and which rooms will remain accessible. Empty rooms can help access, but the requested date does not reserve an appointment. MEL ONE assesses each task and confirms accepted work, sequence and visits; completion before delivery must be agreed directly.'
 ] });
 const rental = get('field-notes-rental-end-of-lease-maintenance-list');
 if (rental) {
  rental.sections.push({ id: 'short-stay-maintenance', aliases: [], heading: 'Short-Stay Repairs, Guest-Free Access and Records', paragraphs: [
   'For an Airbnb or other holiday rental, list the actual minor repair and room: a torn flyscreen, sticking cupboard or approved wall patch. Give the suburb, check-out and next check-in dates, available guest-free entry window and authorised owner or manager. MEL ONE assesses the requested tasks and confirms whether scope and timing can be agreed; a preferred changeover window is not a booking or an emergency attendance promise.',
   'Keep repairs separate from cleaning, guest messages and accommodation management. A short-stay checklist should record the reported fault and date, location, priority, parts or model details, approval contact, agreed scope and quote, vacant access and completion or outstanding status. Keep approved changes, any agreed invoice or completion notes and follow-up actions with the same record. Requested photographs and itemised invoices need direct confirmation; case images do not establish a standard customer deliverable.',
   'An immediate threat to guests needs the appropriate emergency response and owner or manager notification. Keep affected equipment or areas out of use where appropriate while suitable help is arranged. Routine non-urgent repairs can go into the assessed maintenance list; MEL ONE availability is confirmed for the request.'
  ] });
  rental.faqs.push({ question: 'Do tenants need permission for alterations or fixed fittings in South Australia?', answer: 'Unless the tenancy agreement permits it, section 70 of the Residential Tenancies Act 1995 requires the landlord\'s written consent for alterations or additions. Consent cannot be unreasonably withheld for specified categories, including minor changes, subject to the Act\'s qualifications. Confirm the exact work, permission and restoration requirements before booking; a repair contractor cannot grant the landlord\'s consent. Seek tenancy advice for a disputed request.' });
  rental.sections.find(s => s.heading === 'Confirm Approval Before Arranging Repairs').paragraphs.push(['For the applicable rules, read ', { url: 'https://www.legislation.sa.gov.au/_legislation-documents/lz/c/a/residential-tenancies-act-1995/current/1995.63.auth.pdf', label: 'South Australian Residential Tenancies Act, section 70' }, '.']);
 }
 const preparation = get('prepare-household-maintenance-enquiry');
 if (preparation) preparation.sections.push({ id: 'work-specific-licences', aliases: [], heading: 'Work-Specific Licence and Provider Checks', paragraphs: [
  'A handyman label does not remove South Australian licensing requirements. Match the actual work to the proposed contractor and licence conditions. For building work, check the building contractor licence and registered supervision arrangements. For plumbing, gas fitting or electrical work, check the relevant contractor licence and the registration of the person doing the physical trade work. Confirm the task with Consumer and Business Services if unsure; this guidance does not establish any MEL ONE trade authorisation.',
  'For example, repairing or replacing a fixed power point, or repairing fixed wiring, is electrical-installation work for an appropriately licensed electrical contractor and registered electrical worker. Repairing a water pipe connected to the public water supply, or sanitary plumbing or sanitary drainage pipework, belongs with an appropriately licensed plumbing contractor and registered plumbing worker. ',
  'A loose cupboard hinge or new furniture-kit assembly does not itself involve those systems; adding a power point or moving a water pipe is a separate trade task, even within the same repair list. Check the exact work against licence and registration conditions and any applicable exemption with CBS; these examples do not establish MEL ONE authorisation for either trade.',
  ['For those task descriptions, read ', { url: 'https://www.cbs.sa.gov.au/documents/licence_categories_guide_plumbers.pdf', label: 'CBS plumbing work categories' }, ' and ', { url: 'https://www.safework.sa.gov.au/workplaces/electrical/safe-electrical-practices', label: 'SafeWork SA electrical-work boundaries' }, '.'],
  ['Use ', { url: 'https://www.sa.gov.au/topics/business-and-trade/licensing/building-and-trades/building-work-contractor-s-licence', label: 'SA building contractor guidance' }, ', ', { url: 'https://www.sa.gov.au/topics/business-and-trade/licensing/building-and-trades/licensing', label: 'SA plumbing, gas fitting and electrical guidance' }, ' and ', { url: 'https://www.cbs.sa.gov.au/find-a-licence-holder', label: 'CBS licence-holder checks' }, ' when comparing the proposed arrangements.']
 ] });
}
