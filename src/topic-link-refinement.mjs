/** Editorial refinement, 13 October 2026. Existing scope and case facts govern these links. */
const service = (slug, label) => ({ url: `/services/${slug}/`, label });
const edits = {
  'field-notes-doors-windows-screens-enquiry': [
    'For a glass patio or wardrobe panel, use ', service('sliding-door-repair', 'sliding-door roller and track repair'),
    '. Describe where movement catches and identify the panel type. Ordinary hinged-door and flyscreen enquiries remain separate because the hardware and handling differ.',
  ],
  'field-notes-wall-interior-repairs-job-list': [
    'Separate ', service('cabinet-drawer-repair', 'cupboard hinge and drawer-runner repairs'), ' from ',
    service('wall-patching-repair', 'small wall patches and finishing'),
    '. Identify the affected fitting or patch size, then list painting and adjoining trim separately. These details help define each item in a mixed repair list.',
  ],
  'field-notes-cleaning-removals-preparation': [
    'For paving, see ', service('pressure-cleaning', 'driveway and paved-surface pressure cleaning'),
    ' and describe stains, coatings, loose pavers and damaged joints. The surface condition guides the method. Confirm the included area and expected outcome after assessment; leave damaged or unknown material undisturbed.',
  ],
  'field-notes-pre-sale-home-maintenance-list': [
    'List access windows, agent visits, deliveries and other booked work. Include ', service('pressure-cleaning', 'driveway pressure cleaning'),
    ' as a separate surface task, with coatings, joints and drainage noted. Wall patching and finishing can involve different stages; confirm the sequence and available timing after assessment.',
  ],
};

export function applyTopicLinkRefinement(content) {
  for (const [slug, paragraph] of Object.entries(edits)) {
    const record = content.guides.find(item => item.slug === slug);
    if (!record?.sections?.length) throw new Error(`Missing guide for topic-link refinement: ${slug}`);
    record.sections.at(-1).paragraphs = [paragraph];
    // The focused prose replaces obsolete parent-section shortcuts; useful broader navigation stays.
    const replaced = {
      'field-notes-doors-windows-screens-enquiry': ['/services/door-repair/#sliding-door-types'],
      'field-notes-wall-interior-repairs-job-list': ['/services/interior-repairs-assembly/#cabinet-door-drawer-repairs', '/services/home-repairs-renovation-support/#wall-patching'],
      'field-notes-cleaning-removals-preparation': ['/services/cleaning-removals-specialist-care/#pressure-cleaning'],
      'field-notes-pre-sale-home-maintenance-list': ['/services/cleaning-removals-specialist-care/#pressure-cleaning'],
    }[slug];
    record.relatedReading = record.relatedReading.filter(item => !replaced.includes(item.url));
  }
}
