// Restore case-specific distinctions while keeping original facts and FAQs.
export function applyCaseComparisonContext(content) {
  const copy = {
    'unley-kitchen-cabinet-repair': 'This Unley job records adjustment of an uneven cupboard door. Hinge movement can affect how the door sits, while damage in the cabinet material changes the fixing options. A similar-looking gap therefore needs the hinge and its supporting edge assessed together. Compare the repair scope: ',
    'modbury-garden-pruning-tidy-up': 'This Modbury job concerns an overgrown garden bed, with pruning and tidying recorded around shrubs and the lawn edge. The agreed cut-back area needs to distinguish plants being retained from material to be removed; access and green-waste handling also affect the scope. Large-tree, chemical and specialist landscaping work remain separate.',
    'marion-wardrobe-sliding-door-repair': 'The Marion record concerns worn lower wardrobe-door rollers and panel alignment. Dragging can also involve a damaged track or guide, so identifying the door system and checking compatible parts matter before agreeing the repair. Describe visible track or guide damage alongside the roller symptoms. Compare the repair scope: ',
    'mile-end-fence-repair': 'This Mile End job records split timber palings and a repaired fence section. Replacing a damaged paling addresses a different component from a loose rail or post; connected supports affect whether a local board repair is suitable. Identify damaged boards and movement in adjoining supports separately. Compare the repair scope: ',
    'north-adelaide-timber-gate-repair': 'The North Adelaide record concerns the timber gate and latch area, with hinge and frame adjustment shown. Dragging through the swing and failing to latch at closing can involve different contact points. Hinges, supporting timber and latch contact need to be assessed together before a repair is agreed. Compare the repair scope: ',
    'north-adelaide-door-repair': 'The North Adelaide photos record work at the latch and door-jamb area and the completed closing position. A door rubbing on the frame and a latch missing its strike need different checks; loose hinges may also affect alignment. Describe when contact occurs so the door, frame and fittings can be assessed together. Compare the repair scope: ',
    'prospect-gutter-cleaning': 'The Prospect job records leaf and branch debris being cleared from the gutter. Clearing debris and repairing a damaged joint or downpipe involve different work; overflow alone does not establish which is needed. Describe any continuing water spill separately so cleaning, access and any further assessment can be scoped clearly. Compare the repair scope: ',
    'henley-beach-sliding-screen-door-repair': 'The Henley Beach record concerns lower rollers and alignment of an ordinary sliding screen door. Dragging or uneven travel calls for the roller, guide and track condition to be assessed; torn mesh is a separate repair item. Identify the movement fault and any mesh damage separately when comparing the work required. Compare the repair scope: ',
  };
  for (const [slug, text] of Object.entries(copy)) {
    const record = content.caseStudies.find(x => x.slug === slug);
    if (!record || record.sections.length !== 4 || record.faqs.length !== 1) throw Error(`Comparison record drift: ${slug}`);
    const old = record.sections[3].paragraphs[0];
    const links = Array.isArray(old) ? old.filter(x => typeof x === 'object') : [];
    if (links.length !== (slug === 'modbury-garden-pruning-tidy-up' ? 0 : 1)) throw Error(`Comparison link drift: ${slug}`);
    record.sections[3].paragraphs[0] = links.length ? [text, links[0], '.'] : text;
  }
}
