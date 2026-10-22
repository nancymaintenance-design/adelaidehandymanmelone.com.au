// Approved case paragraphs only. Original facts, photos, FAQs and links remain.
export function applyScreenWardrobeConcision(content) {
  const copy = {
    'henley-beach-sliding-screen-door-repair': [
      'For an ordinary sliding screen door, describe dragging, catching, uneven movement or a closing gap. Roller, guide, frame and track condition, dirt build-up, part availability and property access affect the assessed scope.',
      'Give your suburb, when the screen catches, whether it opens, closes or locks, and any pets, access or tenancy arrangements. Do not force it, remove an unsupported panel or work around glass or security hardware yourself. A description is enough; safe existing photos are optional and can be emailed to admin@melonemaintenance.com.au.',
      'The photos record the lower roller and track, accessible repair work and the completed door position. Use this sequence to describe the affected part of your ordinary sliding screen door. Compare the repair scope: ',
    ],
    'stirling-flat-pack-wardrobe-assembly': [
      'For a flat-pack wardrobe, identify the model, supplied instructions and intended storage use. Panel size, floor finish, working space and the drawers, doors and shelves affect the assembly sequence.',
      'Give your suburb, stairs, parking, floor-protection needs and entry route, noting furniture that must stay in place. Keep pets, loose items and valuables clear where practical. A description is enough; safe existing photos are optional and can be emailed to admin@melonemaintenance.com.au.',
      'The photos record supplied wardrobe components, assembly work and the completed wardrobe. Use these stages to describe your kit, current assembly stage and any missing parts; anchoring and packaging handling remain separately agreed items. Compare the repair scope: ',
    ],
  };
  for (const [slug, paragraphs] of Object.entries(copy)) {
    const record = content.caseStudies.find(x => x.slug === slug);
    if (!record || record.sections.length !== 4 || record.faqs.length !== 1) throw Error(`Case concision drift: ${slug}`);
    const original = record.sections[3].paragraphs[0];
    const links = Array.isArray(original) ? original.filter(x => typeof x === 'object') : [];
    if (links.length !== 1) throw Error(`Case concision service link drift: ${slug}`);
    record.sections[2].paragraphs[0] = paragraphs[0];
    record.sections[2].paragraphs[1] = paragraphs[1];
    record.sections[3].paragraphs[0] = [paragraphs[2], links[0], '.'];
  }
}
