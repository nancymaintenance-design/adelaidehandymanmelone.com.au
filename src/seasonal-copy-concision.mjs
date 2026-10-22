// Approved local paragraph edits; facts, media, links and FAQs remain unchanged.
export function applySeasonalCopyConcision(content, focused) {
  const links = value => Array.isArray(value) ? value.filter(x => typeof x === 'object') : [];
  const replace = (record, section, paragraph, text) => {
    const old = record?.sections[section]?.paragraphs[paragraph];
    if (!old || JSON.stringify(links(old)) !== JSON.stringify(links(text))) {
      throw Error(`Seasonal paragraph/link drift: ${record?.slug}:${section}:${paragraph}`);
    }
    record.sections[section].paragraphs[paragraph] = text;
  };
  const gutter = focused.find(x => x.slug === 'gutter-cleaning');
  const outdoor = content.services.find(x => x.slug === 'outdoor-structures-fences-pools');
  const gutterLinks = links(gutter?.sections[0]?.paragraphs[1]);
  if (gutterLinks.length !== 1) throw Error('Seasonal gutter case link drift');
  for (const [s, p, text] of [
    [0, 1, ['Our ', gutterLinks[0], ' shows leaves and branches being cleared at that property. Your gutter condition and safe access need their own assessment.']],
    [1, 1, 'Each repeat clean is arranged directly according to leaf fall and observed build-up. Confirm any access equipment separately.'],
    [2, 0, 'Describe where water spills, whether it occurs during rain, and debris or damage visible from the ground. Overflow alone does not establish the cause.'],
    [2, 1, 'Mention narrow passages, extensions and roof-edge obstacles. These details help plan assessment; safe access and the installation condition determine what can be undertaken.'],
    [3, 0, 'Give your suburb and the affected side. Existing ground-level photos can help; do not climb onto a roof or ladder for an enquiry. Describe an active indoor leak separately from routine debris clearing.'],
    [4, 0, 'The quote should identify safely accessible gutter sections, debris handling and any included outlet checks. Downpipe blockage removal, damaged joints, resealing and roof repairs are not automatically included.'],
    [4, 1, 'The Prospect photos document that property. Ask what was observed after clearing and which concerns need separate repair or qualified assessment; leaf removal is not a weatherproofing guarantee.'],
    [5, 0, 'Ask for the assessed cleaning area and disposal requirements in writing. Any damaged gutter or downpipe fitting needs a separately agreed scope.'],
  ]) replace(gutter, s, p, text);
  for (const [s, p, text] of [
    [0, 1, 'The Stirling record shows local timber work. MEL ONE assesses your reported area and agrees the repair and finish; widespread movement or deterioration may need specialist assessment.'],
    [1, 1, 'Stirling, Mile End and North Adelaide document local timber, fence and gate work. New structural work and pool barriers need qualified arrangements; ordinary timber repair does not certify compliance.'],
    [2, 0, 'For a gate, describe lifting to close, catching through the swing or latch contact. For fencing, identify split palings or loose panels. Accessible timber, fixing points and hinges are assessed together.'],
    [2, 1, 'The condition of supporting timber helps determine whether a fixing or hardware repair is appropriate and what replacement is needed.'],
    [3, 0, 'Locate the affected board from a safe position, including adjoining posts or connections in the wider view. Avoid using an unstable section.'],
    [3, 1, 'MEL ONE proposes a targeted repair after assessing accessible timber and fixings. Structural changes or wider movement require appropriate assessment first.'],
    [5, 0, 'Describe pets, stairs, furniture, shared boundaries and the entry route. Confirm relevant owner or neighbour permission and the included preparation or finishing.'],
    [5, 1, 'Review the completed repair with MEL ONE and raise remaining concerns. The quote defines the included work; a local repair does not include an entire fence or structure replacement.'],
    [6, 0, 'Describe the damaged component and adjoining connections. A local replacement depends on its supports, not just the visible board.'],
    [7, 0, 'Separate removal, replacement timber, hardware, finishing and waste handling in the quote where relevant. Confirm the affected length, access and boundary approval; discuss structural findings or wider replacement before adding work.'],
  ]) replace(outdoor, s, p, text);
  const cases = {
    'prospect-gutter-cleaning': [
      'Report leaf build-up, nearby plants and overflow from ground level. Weather, roof design, gutter condition and working-at-height requirements affect safe access; do not climb, reach over a roof edge or investigate at height for an enquiry.',
      'Give your suburb and a short description, noting trees, gates, pets or property-manager access arrangements. A description is enough; safe existing exterior photos are optional and can be emailed to admin@melonemaintenance.com.au.',
      'The photos show leaf build-up, debris being collected during work and the cleared gutter line. Use this sequence to describe the section you want assessed. Compare the repair scope: ',
    ],
    'stirling-deck-pergola-timber-repair': [
      'Describe a split board, soft edge, weathered beam end or loose component from a safe position. Weather, moisture, movement and use affect timber; assessment considers accessible boards, posts, fixings and supports.',
      'Give your suburb and note stairs, pets, furniture and the entry route. Avoid unsafe areas or removing boards without suitable support. A description is enough; safe existing photos are optional and can be emailed to admin@melonemaintenance.com.au.',
      'The photos record deteriorated boards and beam ends, accessible board removal and the finished deck area. Use this sequence to identify your reported component; the condition of supports and any structural or approval requirements need separate assessment.',
    ],
  };
  for (const [slug, text] of Object.entries(cases)) {
    const record = content.caseStudies.find(x => x.slug === slug);
    if (!record || record.sections.length !== 4 || record.faqs.length !== 1) throw Error(`Seasonal case drift: ${slug}`);
    replace(record, 2, 0, text[0]);
    replace(record, 2, 1, text[1]);
    const entries = links(record.sections[3].paragraphs[0]);
    if (slug === 'prospect-gutter-cleaning' && entries.length !== 1) throw Error('Seasonal Prospect service link drift');
    replace(record, 3, 0, entries.length ? [text[2], entries[0], '.'] : text[2]);
  }
}
