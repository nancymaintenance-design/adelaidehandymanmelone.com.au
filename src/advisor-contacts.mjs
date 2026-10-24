import fs from 'node:fs';
import path from 'node:path';
import {parse} from 'parse5';

// Contacts supplied by the user on 24 October 2026. Shared by home and About.
export const advisors = [
  { name: 'Ella', phone: '0416 614 281', tel: '+61416614281', email: 'admin@melonemaintenance.com.au', image: 'ella' },
  { name: 'Felix', phone: '0403 202 949', tel: '+61403202949', email: 'handymanfelix.au2026@outlook.com', image: 'felix' },
  { name: 'Riley', phone: '0482 422 607', tel: '+61482422607', email: 'riley@melonemaintenance.com.au', image: 'riley' },
];

export function advisorSection(about = false) {
  return `<section class="advisor-section" id="advisors" aria-labelledby="advisor-heading"><div class="wrap"><div class="section-heading"><div><p class="eyebrow">MEL ONE enquiry contacts</p><h2 id="advisor-heading">Talk with our advisers</h2><p class="advisor-intro">Contact Ella, Felix or Riley with your suburb and repair details. The work scope and written quote are confirmed after assessment.</p></div>${about ? '' : '<a class="text-link" href="/about/#advisors">Meet our advisers <span aria-hidden="true">↗</span></a>'}</div><div class="advisor-grid">${advisors.map(person => `<article class="advisor-card"><img src="/assets/images/advisors/${person.image}.webp" alt="${person.name}" width="800" height="1000" loading="lazy" decoding="async"><div class="advisor-card-body"><p class="eyebrow">Enquiry adviser</p><h3>${person.name}</h3><div class="advisor-contact"><span>Phone</span><a class="text-link advisor-phone" href="tel:${person.tel}">${person.phone}</a><span>Email</span><a class="text-link advisor-email" href="mailto:${person.email}">${person.email.replace('@', '<wbr>@')}</a></div></div></article>`).join('')}</div></div></section>`;
}

export function composeAdvisorContacts({ siteDir }) {
  for (const [filename, about] of [['index.html', false], ['about/index.html', true]]) {
    const file = path.join(siteDir, filename);
    let html = fs.readFileSync(file, 'utf8');
    let index = html.indexOf('<section class="section wrap office-location"');
    if (about) {
      const nodes = [];
      const visit = node => { nodes.push(node); for (const child of node.childNodes || []) visit(child); };
      visit(parse(html, {sourceCodeLocationInfo: true}));
      const company = nodes.find(node => node.attrs?.some(attr => attr.name === 'id' && attr.value === 'company-record'));
      index = company?.sourceCodeLocation?.endOffset ?? -1;
    }
    if (index < 0 || html.includes('id="advisors"')) throw Error('Advisor insertion boundary changed: ' + filename);
    html = html.slice(0, index) + advisorSection(about) + html.slice(index);
    html = html.replace('</head>', '<link rel="stylesheet" href="/assets/css/advisor-contacts.css"></head>');
    fs.writeFileSync(file, html);
  }
}
