// Approved local case paragraphs; original facts, photos, FAQs and links stay.
export function applyFrontDoorAssemblyConcision(content) {
  const edits = {
    'north-adelaide-door-repair': [
      [2, 0, 'For a front door, describe where it catches, whether it latches, and any visible gap or loose hardware. Safe existing photos of the edge, hinges, handle or strike can help prepare assessment.'],
      [3, 0, 'The photos show adjustment work at the latch and door-jamb area and the completed door seated in its frame. Use them to describe the edge or fitting you want assessed. Compare the repair scope: '],
    ],
    'kensington-furniture-assembly': [
      [2, 1, 'Give the brand and model, carton count, current assembly stage, intended room and parking or access limits. Mention other household tasks separately so each item can be discussed.'],
      [3, 0, 'The photos show KALLAX cartons and parts, assembly work and the completed shelving. Your kit, missing parts and securing needs require their own agreed scope. MEL ONE is independent of IKEA and is not an official IKEA service. Compare the repair scope: '],
    ],
  };
  for (const [slug, paragraphs] of Object.entries(edits)) {
    const record = content.caseStudies.find(x => x.slug === slug);
    if (!record || record.sections.length !== 4 || record.faqs.length !== 1) throw Error(`Case paragraph drift: ${slug}`);
    for (const [section, paragraph, text] of paragraphs) {
      const old = record.sections[section]?.paragraphs[paragraph];
      if (!old) throw Error(`Missing approved paragraph: ${slug}:${section}:${paragraph}`);
      const links = Array.isArray(old) ? old.filter(x => typeof x === 'object') : [];
      if (section === 3 && links.length !== 1) throw Error(`Case service link drift: ${slug}`);
      record.sections[section].paragraphs[paragraph] = links.length ? [text, links[0], '.'] : text;
    }
  }
}
