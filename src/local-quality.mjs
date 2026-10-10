/** Manually reviewed enquiry contexts; no claim that a task occurred in an unphotographed suburb. */
const service = {
  F: 'flyscreen-repair', D: 'door-repair', G: 'gutter-cleaning', T: 'fence-gate-repair', A: 'flat-pack-assembly',
  I: 'interior-repairs-assembly', W: 'doors-windows-screens', R: 'roof-gutter-exterior-care',
  O: 'outdoor-structures-fences-pools', H: 'home-repairs-renovation-support',
  P: 'maintenance-planning-inspection-support', C: 'cleaning-removals-specialist-care', L: 'garden-landscape-care',
};
const row = (links, background, regionalCase) => ({ services: links.split('').map(key => service[key]), background, regionalCase });
export const suburbQuality = {
  'Adelaide CBD': row('HI', 'Wall and skirting damage can affect the surface finish, the underlying fixing or the junction between them. Include a close view and a full-room description; tell us if building access or work-hour restrictions apply.'),
  'North Adelaide': row('DTW', 'A sticking household door and a loose timber gate need separate hinge, alignment and latch checks. Note whether each catches while opening or closing, so the assessment can address the two mechanisms separately.'),
  'Kent Town': row('IH', 'A blind bracket can be loose at the fitting or at the mounting surface. Include the blind width or model and describe the opposite bracket; the supporting material helps determine a suitable fixing approach.'),
  Bowden: row('IA', 'A wardrobe drawer can bind at the runner, its fixing or the cabinet alignment. Explain whether it behaves differently empty and loaded, and keep the model or instructions available if assembly may be involved.'),
  Norwood: row('FW', 'Torn screen mesh, a bent frame and worn spline are different repair concerns. Identify whether the flyscreen belongs to a window or door and whether the frame is normally removable; leave dismantling for the assessment.'),
  Burnside: row('CW', 'Driveway paver cleaning and a stiff sliding window need separate preparation. Describe stains and damaged paver joints for cleaning, or the lower-track symptoms for window work; note available water and access for the relevant task.'),
  Kensington: row('AI', 'Flat-pack shelving depends on the correct panels, hardware and instructions being present. Check the box count and intended position before booking, and allow floor space for laying out panels and agreeing any specified securing work.'),
  Magill: row('DW', 'A door rubbing on the floor needs hinge and clearance checks before material is removed. Mention any recent flooring change and the point in the swing where it catches; the inspection determines whether adjustment or another repair is appropriate.'),
  Unley: row('IH', 'Uneven kitchen cabinet fronts can involve the concealed hinge or its mounting points. Identify affected doors together in a wider view and clear the fixing area; this helps separate alignment work from damaged supporting material.'),
  Goodwood: row('HI', 'Internal wall patching needs the surrounding finish and any corner junction assessed with the damaged area. Say if a crack is changing or a water issue is known, rather than assuming the surface repair alone resolves the cause.'),
  Parkside: row('IH', 'A bathroom cabinet hinge and the material holding it can deteriorate separately. Describe any swollen or damaged edge and clear access inside the cupboard, so adjustment and mounting repairs can be considered together.', 'unley-kitchen-cabinet-repair'),
  Millswood: row('IH', 'A shelf pulling away calls for a check of the wall and existing fixings, rather than tightening alone. Keep it unloaded and describe its size and intended use; the support needed depends on the fitting and mounting surface.'),
  'Mile End': row('TO', 'Split fence palings may sit beside loose rails or weakened supporting timber. Count the affected boards and show both sides where accessible, so a small replacement request does not overlook the connections in that section.'),
  Thebarton: row('TO', 'A gate that latches only when lifted may need hinge or post checks as well as latch alignment. Describe whether it drags or swings freely; changing the latch position alone may not address the movement.', 'mile-end-fence-repair'),
  Torrensville: row('FW', 'A rattling or falling window screen may have a frame-fit, retaining-clip or corner issue rather than torn mesh. Explain whether it can be refitted and show the retention points from a safe accessible position.'),
  Brompton: row('IH', 'A laundry hinge screw that turns without tightening can indicate a mounting-material issue. Include the plate and nearby cabinet surface in the request, and mention appliance access constraints if they affect inspection.'),
  'Henley Beach': row('FDW', 'Sliding screen rollers and track contact need checking together. Note whether catching happens at one point or across the whole track and identify the lower hardware; this helps define operation repairs separately from mesh replacement.'),
  'West Beach': row('DW', 'An outdoor handle or latch that sticks with the door open has a different symptom from one that sticks only when closed. Report that comparison without forcing the mechanism, so hardware and closing alignment can be assessed.', 'henley-beach-sliding-screen-door-repair'),
  Glenelg: row('DWF', 'A patio sliding panel needs its rollers, track and clearances considered together. Identify glass versus screen panels, approximate width and the point of catching; flyscreen guidance applies to a screen panel, while other panels need their own assessment.', 'henley-beach-sliding-screen-door-repair'),
  Semaphore: row('TO', 'Loose external gate connections can concern hinge fasteners, surrounding timber or movement at the post. Include a wider view of the support as well as accessible screw details; the repair scope depends on which connection moves.'),
  Modbury: row('TOL', 'Fence damage and a garden tidy-up are separate work scopes even when requested together. Mark affected fence sections and list pruning, clearing and waste needs separately; the photographed fence record documents assessment, not a completed repair.'),
  Prospect: row('GR', 'Leaf and branch build-up can be reported with the location of observed gutter overflow. Use ground-level observations and identify the affected side; roof access and the appropriate cleaning scope are assessed separately.'),
  Campbelltown: row('GR', 'Overflow at a corner, outlet or along a gutter length gives different clues for assessment. Record where and when it happens from ground level; debris and connection condition need checking before a cleaning or repair scope is agreed.', 'prospect-gutter-cleaning'),
  'Golden Grove': row('OP', 'Deterioration at a pergola joint requires the timber and connections to be assessed together. Describe loose or fallen pieces and provide a wider view from an accessible position; the next step may include specialist assessment.'),
  Stirling: row('OAI', 'Deck timber repair and flat-pack wardrobe assembly need separate work lists. Identify damaged boards and any adjoining pergola items for outdoor assessment; keep the wardrobe instructions and kit details ready and clear indoor assembly space.'),
  Crafers: row('OP', 'A split deck edge board may also have deterioration around its supporting fixings. Show the adjoining boards from a safe position and describe movement noticed during normal use; inspection determines the board and connection work needed.', 'stirling-deck-pergola-timber-repair'),
  Aldgate: row('LP', 'Pruning near a path needs a clear boundary between growth to remove and plants to retain. Mark the desired clearance and discuss access and green-waste arrangements, so the agreed tidy-up preserves the planting you want to keep.'),
  Blackwood: row('OH', 'Timber step repairs need the affected tread and accessible supports considered together. Show the whole flight to locate the damage and say whether another access route is available; do not load or dismantle a loose tread to investigate.', 'stirling-deck-pergola-timber-repair'),
  Marion: row('DWI', 'Wardrobe panels and shower screen doors use different roller, hinge and clearance arrangements. Identify each mechanism separately and include the full door and accessible lower hardware; the repair plan must match the affected system.'),
  Brighton: row('WP', 'A shower screen catching at an edge needs hinge alignment and clearance assessed together. Describe sagging, contact or a gap when closed and identify the contact point; adjustment and compatible parts are confirmed on site.', 'marion-shower-screen-repair'),
  'Hallett Cove': row('TO', 'A gate dragging at its base may involve hinge movement, post alignment or an obstruction along the swing. Report any need to lift it closed; the assessment checks supporting points before deciding whether clearance work is appropriate.'),
  'Morphett Vale': row('AI', 'Partly assembled furniture with uneven drawers needs its assembly stage, runners and remaining hardware reviewed together. Keep unused fittings and instructions available, identify missing parts and describe what has already been assembled.'),
};

/** An editorial record can authorize a date only when its mapped case is actually present. */
export function guideRevision(guide, cases, revisions) {
  const revision = revisions[guide.slug];
  if (!revision?.date || !revision.reason || !revision.caseSlug) return undefined;
  const study = cases.find(item => item.slug === revision.caseSlug && guide.relatedReading?.some(link => link.url === `/case-studies/${item.slug}/`));
  if (!study?.images?.[0]) return undefined;
  return { ...revision, study, image: study.images[0] };
}
