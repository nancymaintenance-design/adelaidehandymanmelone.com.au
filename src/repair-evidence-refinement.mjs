/** October 20 benchmark follow-through. Only existing MEL ONE repair records are evidence.
 * Replace a generic case-reference paragraph, not the H1, scope, layout or recorded outcome.
 * Mixed paragraph tokens use the existing escaped renderer and bilingual catalogue pipeline.
 */
const study = (slug, label) => ({ url: `/case-studies/${slug}/`, label });
const service = (slug, label) => ({ url: `/services/${slug}/`, label });
const reviews = [
  ['sliding-door-repair', 0, [
    'For a patio panel that drags and makes noise, compare the ',
    study('sliding-patio-door-roller-track-repair', 'patio door roller and track repair record'),
    '. It records damaged lower rollers and dust in the channel. The photographs show the work stages, not a measured opening force or a roller brand. Identify whether your panel is glass, wardrobe or insect screen before discussing parts.',
  ]],
  ['sliding-door-repair', 1, [
    'A wardrobe panel and a patio glass panel use different hardware and handling. The ',
    study('marion-wardrobe-sliding-door-repair', 'Marion wardrobe roller repair'),
    ' records lower-roller work and panel alignment. For your door, describe where travel catches and whether it closes fully; leave heavy panels in place. Glazing damage and safety-related hardware need separate assessment.',
  ]],
  ['door-repair', 0, [
    'A latch missing its opening does not automatically mean the door needs trimming. Compare the ',
    study('north-adelaide-door-repair', 'North Adelaide closing-alignment repair'),
    '. Report the contact point and any recent flooring or hardware change. MEL ONE checks hinges, fixings and clearances before agreeing an adjustment or repair; paint and surface restoration are separate work items.',
  ]],
  ['door-repair', 1, [
    'The ', study('marion-wardrobe-sliding-door-repair', 'Marion wardrobe repair record'),
    ' concerns lower rollers and aligned panels, not a hinged-door latch. For a heavier patio panel, use ',
    service('sliding-door-repair', 'Sliding Door Repairs'),
    '. Include the panel type and where it binds so compatible parts can be assessed. Fire-rated doors, glass and security hardware require separate arrangements.',
  ]],
  ['cabinet-drawer-repair', 0, [
    'Compare the ', study('unley-kitchen-cabinet-repair', 'Unley cupboard-door alignment repair'),
    ' when describing uneven fronts. Show the hinge plate and the board holding it, not only the gap outside. MEL ONE checks whether adjustment, refixing or compatible hardware is appropriate; a damaged mounting edge is different from an adjustment screw needing attention.',
  ]],
  ['cabinet-drawer-repair', 1, [
    'The ', study('kitchen-drawer-runner-repair', 'sagging kitchen drawer runner repair'),
    ' records damaged runners and the visible repair sequence. Describe whether your drawer drops, catches halfway or will not close squarely. Runner size, mounting points and drawer-box condition need checking together; the photos do not establish a part brand, load rating or interchangeable soft-close mechanism.',
  ]],
  ['wall-patching-repair', 0, [
    'Use the ', study('goodwood-wall-repair', 'Goodwood completed wall-patch record'),
    ' to compare local surface damage and the recorded patching stages. Send an approximate size and a wider view showing nearby corners or skirting. Report dampness or recurring cracks separately: a completed cosmetic patch at Goodwood does not establish the cause of damage at another home.',
  ]],
  ['wall-patching-repair', 1, [
    'The ', study('adelaide-cbd-wall-repair', 'Adelaide CBD wall and skirting repair'),
    ' shows why adjoining trim should be listed separately. Confirm patch preparation, drying stages, primer, painting and trim in the quote rather than treating them as one automatic inclusion. Existing paint and lighting affect the finish; an invisible colour match is not promised.',
  ]],
  ['fence-gate-repair', 0, [
    'The ', study('mile-end-fence-repair', 'Mile End fence-section repair'),
    ' documents repair work; the ', study('modbury-timber-fence-repair-assessment', 'Modbury fence assessment record'),
    ' is assessment-only, not a completed repair. Describe broken palings separately from loose rails or posts so the proposed work addresses the support as well as the visible damage.',
  ]],
  ['fence-gate-repair', 1, [
    'Compare the hinge and latch area in the ',
    study('north-adelaide-timber-gate-repair', 'North Adelaide timber-gate repair'),
    '. For your gate, describe whether it drags throughout its swing or only near closing. Confirm boundary permission and access on either side before work is agreed; pool barriers and security systems need their own requirements checked.',
  ]],
  ['flyscreen-repair', 0, [
    'For torn window mesh, compare the ', study('norwood-flyscreen-repair', 'Norwood flyscreen remeshing record'),
    '. Identify the loose or torn edge and whether the frame fits its opening. MEL ONE checks mesh retention, spline and frame condition before agreeing materials. Remeshing will not correct a bent frame or repair worn moving hardware.',
  ]],
  ['flyscreen-repair', 1, [
    'The ', study('henley-beach-sliding-screen-door-repair', 'Henley Beach sliding-screen repair'),
    ' records lower-roller work and alignment rather than mesh replacement alone. Say where the screen catches and whether it closes with a gap. Ordinary insect screens, security screens and glazed doors are separate systems; one repair example does not establish a suitable method for all three.',
  ]],
  ['flat-pack-assembly', 0, [
    'The ', study('kensington-furniture-assembly', 'Kensington IKEA KALLAX assembly record'),
    ' shows one identified shelving product. Send your own model, instructions and current assembly stage, with missing fittings or damaged panels noted. MEL ONE reviews the kit before agreeing the work; neither box count nor another completed unit guarantees completion of an incomplete kit in one visit.',
  ]],
  ['flat-pack-assembly', 1, [
    'Compare the ', study('stirling-flat-pack-wardrobe-assembly', 'Stirling wardrobe assembly record'),
    ' for a different type of furniture kit. Identify floor space, the final position and manufacturer securing instructions. Confirm assembly, any suitable wall anchoring and packaging handling separately. Wall construction, concealed services and permission affect the fixing plan.',
  ]],
  ['pressure-cleaning', 0, [
    'The ', study('burnside-driveway-pressure-cleaning', 'Burnside paved-driveway cleaning record'),
    ' shows mossy pavers and the visible result of that cleaning job. Identify your surface, coatings and damaged joints before requesting a similar result. The photographs do not establish universal stain removal, resealing or a pressure setting suitable for another surface.',
  ]],
  ['gutter-cleaning', 0, [
    'The ', study('prospect-gutter-cleaning', 'Prospect gutter-debris clearing record'),
    ' documents leaves and branches being cleared. For overflow at your home, note the affected side and approximate building height from the ground. Safe access, outlet condition and any separate repair need assessment; cleaning debris does not by itself establish that a leak or drainage fault has been repaired.',
  ]],
];

const caseOwners = {
  'sliding-patio-door-roller-track-repair': ['sliding-door-repair', 'Sliding Door Repairs'],
  'marion-wardrobe-sliding-door-repair': ['door-repair', 'Door Repairs'],
  'north-adelaide-door-repair': ['door-repair', 'Door Repairs'],
  'unley-kitchen-cabinet-repair': ['cabinet-drawer-repair', 'Cabinet & Drawer Repairs'],
  'kitchen-drawer-runner-repair': ['cabinet-drawer-repair', 'Cabinet & Drawer Repairs'],
  'goodwood-wall-repair': ['wall-patching-repair', 'Plasterboard Repairs & Wall Patching'],
  'adelaide-cbd-wall-repair': ['wall-patching-repair', 'Plasterboard Repairs & Wall Patching'],
  'mile-end-fence-repair': ['fence-gate-repair', 'Fence & Gate Repairs'],
  'modbury-timber-fence-repair-assessment': ['fence-gate-repair', 'Fence & Gate Repairs'],
  'north-adelaide-timber-gate-repair': ['fence-gate-repair', 'Fence & Gate Repairs'],
  'norwood-flyscreen-repair': ['flyscreen-repair', 'Flyscreen & Screen Door Repairs'],
  'henley-beach-sliding-screen-door-repair': ['flyscreen-repair', 'Flyscreen & Screen Door Repairs'],
  'kensington-furniture-assembly': ['flat-pack-assembly', 'Flat Pack & Furniture Assembly'],
  'stirling-flat-pack-wardrobe-assembly': ['flat-pack-assembly', 'Flat Pack & Furniture Assembly'],
  'burnside-driveway-pressure-cleaning': ['pressure-cleaning', 'Pressure Cleaning'],
  'prospect-gutter-cleaning': ['gutter-cleaning', 'Gutter Cleaning'],
};

export function applyRepairEvidenceRefinement(content, focused) {
  for (const [slug, index, paragraph] of reviews) {
    const record = focused.find(item => item.slug === slug);
    // Historical isolated fixtures may contain only their selected records.
    if (!record) continue;
    const section = record.sections[index];
    if (!section || section.paragraphs.length < 2) throw new Error(`Missing reviewed repair introduction: ${slug}`);
    section.paragraphs[1] = paragraph;
  }
  for (const record of content.caseStudies) {
    const owner = caseOwners[record.slug];
    if (!owner) continue;
    const section = record.sections.at(-1);
    const previous = section.paragraphs.at(-1);
    section.paragraphs[section.paragraphs.length - 1] = [
      ...(Array.isArray(previous) ? previous : [previous]),
      ' Compare the repair scope: ', service(...owner), '.',
    ];
  }
}
