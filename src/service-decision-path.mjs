// Local customer-path refinement, 24 October 2026. Existing scope and records
// govern every link; no service capability is inferred from another business.
export function applyServiceDecisionPath(content) {
  const find = slug => {
    const record = content.services.find(item => item.slug === slug);
    if (!record?.sections?.[0]?.paragraphs?.[1] || !record.faqs) throw Error('Service decision target changed: ' + slug);
    return record;
  };
  const interior = find('interior-repairs-assembly');
  const doors = find('doors-windows-screens');
  const linkNames = (record, names) => {
    const original = record.sections[0].paragraphs[1];
    if (typeof original !== 'string') throw Error('Review existing evidence links: ' + record.slug);
    let rest = original;
    const parts = [];
    for (const [label, url] of names) {
      const index = rest.indexOf(label);
      if (index < 0) throw Error('Evidence phrase changed: ' + label);
      parts.push(rest.slice(0, index), { label, url });
      rest = rest.slice(index + label.length);
    }
    parts.push(rest);
    record.sections[0].paragraphs[1] = parts;
  };
  linkNames(interior, [
    ['The Kensington assembly', '/case-studies/kensington-furniture-assembly/'],
    ['Unley cupboard', '/case-studies/unley-kitchen-cabinet-repair/'],
    ['supplied drawer-runner records', '/case-studies/kitchen-drawer-runner-repair/'],
  ]);
  linkNames(doors, [['The Burnside sliding-window record', '/case-studies/burnside-window-repair/']]);
  const improveAnswer = (record, question, answer) => {
    const matches = record.faqs.filter(item => item.question === question);
    if (matches.length !== 1) throw Error('Decision FAQ changed: ' + question);
    matches[0].answer = answer;
  };
  improveAnswer(interior, 'Can I combine furniture assembly with cupboard and shelf repairs?',
    'Yes. List each item by room, identify the product or damaged fitting and mark any access or approval restrictions. Separate assembly from repairs, wall fixing and finishing, and tell us which items matter most. We assess instructions, hardware and supporting surfaces, then confirm the included tasks, materials and appointment arrangements in the written quote. One enquiry does not confirm that every task can be completed in one visit; agree any changes to the scope before additional work.');
  improveAnswer(doors, 'Should I buy replacement rollers before the assessment?',
    'Wait until the roller housing, dimensions, fixing points, panel and track have been assessed. We confirm compatible parts and the agreed work in the written quote; ask which hardware work, frame repairs or finishing it includes. Glazing damage, fire-rated doors and security systems need separate specialist arrangements. Where licensed work is required, confirm the appropriately licensed person and their scope before approving it. Leave heavy panels in place and do not order a similar-looking part just to prepare an enquiry.');
}
