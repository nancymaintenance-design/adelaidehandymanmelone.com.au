// Case facts, photos, original links and FAQs remain in their approved records.
export function applyCabinetGardenConcision(content) {
  const edits = {
    'unley-kitchen-cabinet-repair': [
      [2, 0, 'For kitchen cabinet repairs, describe whether the cupboard door drops, catches, sits proud, has a loose handle or will not close. Safe existing photos of the kitchen and the affected hinge, door edge or handle can help prepare assessment.'],
      [2, 1, 'For cabinet hinge replacement or adjustment, give your suburb, preferred contact method and access details. For a managed or tenanted property, identify who can approve the work. Safe existing photos are optional; email them to admin@melonemaintenance.com.au. A description is enough to request assessment.'],
      [3, 0, 'Compare the photographed cabinet-door adjustment with your own door and fitting. The linked service page explains the wider cabinet and drawer repair scope: '],
    ],
    'modbury-garden-pruning-tidy-up': [
      [2, 1, 'Give your suburb, pruning task, approximate height and whether an on-site green bin is available. Note side-path access, pets or locked gates, and irrigation, ornaments, outdoor lighting or fragile plants to protect. Safe existing photos are optional; email them to admin@melonemaintenance.com.au. A description is enough to request assessment.'],
      [3, 0, 'Use the photographed garden bed as a reference when agreeing the extent of your own tidy-up. Confirm the work boundary and waste arrangements before work.'],
    ],
  };
  for (const [slug, paragraphs] of Object.entries(edits)) {
    const record = content.caseStudies.find(x => x.slug === slug);
    if (!record || record.sections.length !== 4 || record.faqs.length !== 1) throw Error(`Case paragraph drift: ${slug}`);
    for (const [section, paragraph, text] of paragraphs) {
      const old = record.sections[section]?.paragraphs[paragraph];
      if (!old) throw Error(`Missing approved paragraph: ${slug}:${section}:${paragraph}`);
      const links = Array.isArray(old) ? old.filter(x => typeof x === 'object') : [];
      const expectedLinks = slug === 'unley-kitchen-cabinet-repair' && section === 3 ? 1 : 0;
      if (links.length !== expectedLinks) throw Error(`Case service link drift: ${slug}`);
      record.sections[section].paragraphs[paragraph] = links.length ? [text, links[0], '.'] : text;
    }
  }
}
