/** October 20 benchmark follow-through. Only existing MEL ONE repair records are evidence.
 * Replace a generic case-reference paragraph, not the H1, scope, layout or recorded outcome.
 * Mixed paragraph tokens use the existing escaped renderer and bilingual catalogue pipeline.
 */
const study = (slug, label) => ({ url: `/case-studies/${slug}/`, label });
const service = (slug, label) => ({ url: `/services/${slug}/`, label });
const reviews = [
  ['sliding-door-repair', 0, [
    'We assess dragging or noisy patio doors by checking the rollers, track and alignment. Our ',
    study('sliding-patio-door-roller-track-repair', 'patio door roller and track repair record'),
    ' shows lower-roller repair and track clearing. Tell us whether your panel is glass, wardrobe or insect screen so we can assess the right mechanism and parts.',
  ]],
  ['sliding-door-repair', 1, [
    'A wardrobe panel and a patio glass panel use different hardware and handling. The ',
    study('marion-wardrobe-sliding-door-repair', 'Marion wardrobe roller repair'),
    ' shows our lower-roller work and panel alignment. Tell us where your door catches and whether it closes fully; leave heavy panels in place. Glazing damage and safety-related hardware need separate assessment.',
  ]],
  ['door-repair', 0, [
    'We check hinges, fixings and clearances before proposing door adjustment or repair. Our ',
    study('north-adelaide-door-repair', 'North Adelaide closing-alignment repair'),
    ' shows closing-alignment work. Tell us where the door catches and about any recent flooring or hardware change. Paint and surface restoration are separate work items.',
  ]],
  ['door-repair', 1, [
    'The ', study('marion-wardrobe-sliding-door-repair', 'Marion wardrobe repair record'),
    ' shows lower-roller repair and panel alignment. For a heavier patio panel, see ',
    service('sliding-door-repair', 'Sliding Door Repairs'),
    '. Include the panel type and where it binds so compatible parts can be assessed. Fire-rated doors, glass and security hardware require separate arrangements.',
  ]],
  ['cabinet-drawer-repair', 0, [
    'We assess uneven cupboard fronts, loose hinges and damaged fixing points. Our ', study('unley-kitchen-cabinet-repair', 'Unley cupboard-door alignment repair'),
    ' shows alignment work. Tell us about the hinge plate and the board holding it so we can distinguish adjustment from fixing or compatible-parts work.',
  ]],
  ['cabinet-drawer-repair', 1, [
    'The ', study('kitchen-drawer-runner-repair', 'sagging kitchen drawer runner repair'),
    ' shows our work on damaged runners. Tell us whether your drawer drops, catches halfway or will not close squarely. We check runner size, mounting points and drawer-box condition before agreeing compatible parts; soft-close components need to suit the actual system.',
  ]],
  ['wall-patching-repair', 0, [
    'Our ', study('goodwood-wall-repair', 'Goodwood completed wall-patch record'),
    ' shows local patching work. Tell us the approximate damaged area and nearby corners or skirting. We assess the surrounding surface before agreeing the patch; dampness or recurring cracks need consideration before cosmetic work.',
  ]],
  ['wall-patching-repair', 1, [
    'The ', study('adelaide-cbd-wall-repair', 'Adelaide CBD wall and skirting repair'),
    ' shows our work to both surfaces. We agree patch preparation, drying stages, primer, painting and trim as separate quote items where relevant. Existing paint and lighting affect the finish; an invisible colour match is not promised.',
  ]],
  ['fence-gate-repair', 0, [
    'Our ', study('mile-end-fence-repair', 'Mile End fence-section repair'),
    ' shows completed repair work; our ', study('modbury-timber-fence-repair-assessment', 'Modbury fence assessment record'),
    ' is assessment-only, with no completed repair recorded. Tell us about broken palings, loose rails or moving posts so we can assess the supports as well as the visible damage.',
  ]],
  ['fence-gate-repair', 1, [
    'We assess gate hinges, supports and latch contact together. See our ',
    study('north-adelaide-timber-gate-repair', 'North Adelaide timber-gate repair'),
    ' for an example. Tell us whether your gate drags throughout its swing or only near closing. Boundary permission and access need agreement before work; pool barriers and security systems need a separate specialist scope.',
  ]],
  ['flyscreen-repair', 0, [
    'We assess torn mesh, loose retaining edges and frame fit. Our ', study('norwood-flyscreen-repair', 'Norwood flyscreen remeshing record'),
    ' shows mesh work. We check the spline and frame before agreeing materials; bent frames and worn moving hardware need separate repair items.',
  ]],
  ['flyscreen-repair', 1, [
    'The ', study('henley-beach-sliding-screen-door-repair', 'Henley Beach sliding-screen repair'),
    ' shows our lower-roller work and alignment. Tell us where your screen catches and whether it closes with a gap. We assess ordinary insect-screen hardware separately from security screens and glazed doors, which need their own scope.',
  ]],
  ['flat-pack-assembly', 0, [
    'We assemble flat-pack furniture using the supplied kit and product instructions. Our ', study('kensington-furniture-assembly', 'Kensington IKEA KALLAX assembly record'),
    ' shows one shelving assembly. Send your model, instructions, current stage and any missing or damaged parts so we can agree the work and visits needed.',
  ]],
  ['flat-pack-assembly', 1, [
    'Our ', study('stirling-flat-pack-wardrobe-assembly', 'Stirling wardrobe assembly record'),
    ' shows a wardrobe kit assembled on site. Tell us the available floor space, final position and manufacturer securing requirements. We agree assembly, suitable wall anchoring and packaging handling separately; the wall, concealed services and permission affect the fixing plan.',
  ]],
  ['pressure-cleaning', 0, [
    'Our ', study('burnside-driveway-pressure-cleaning', 'Burnside paved-driveway cleaning record'),
    ' shows the mossy surface and visible cleaning result. We assess your paving, coatings and joints before choosing a method. Cleaning, joint repairs and resealing are separate scope items, and some stains can remain.',
  ]],
  ['gutter-cleaning', 0, [
    'Our ', study('prospect-gutter-cleaning', 'Prospect gutter-debris clearing record'),
    ' shows leaves and branches being cleared. We assess safe access, gutter condition and the agreed cleaning scope. Tell us the affected side and approximate building height from ground level; leaks or drainage faults need separate repair assessment.',
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
