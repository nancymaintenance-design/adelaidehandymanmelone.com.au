import fs from 'node:fs';
import path from 'node:path';
import {parse} from 'parse5';

// Final homepage composition, before translation and machine-readable feeds.
// Source offsets preserve every unrelated section byte-for-byte.
export function composeHomeOffice({siteDir}) {
  const file = path.join(siteDir, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  const document = parse(html, {sourceCodeLocationInfo: true});
  const nodes = [];
  function visit(node) { nodes.push(node); for (const child of node.childNodes || []) visit(child); }
  visit(document);
  const attr = (node, name) => node.attrs?.find(a => a.name === name)?.value || '';
  const hasClass = (node, name) => attr(node, 'class').split(/\s+/).includes(name);
  const wrapper = nodes.find(n => hasClass(n, 'desktop-layout'));
  if (!wrapper) throw new Error('Homepage desktop layout boundary missing');
  const redundant = (wrapper.childNodes || []).filter(n => n.tagName === 'section' &&
    ['region-overview', 'faq-section', 'desktop-reading', 'contact-band'].some(c => hasClass(n, c)));
  if (redundant.length !== 5) throw new Error(`Homepage section boundary changed: expected 5, found ${redundant.length}`);
  const edits = redundant.map(n => ({start: n.sourceCodeLocation.startOffset, end: n.sourceCodeLocation.endOffset, text: ''}));
  const facts = JSON.parse(fs.readFileSync(new URL('./content-pack/business-facts.json', import.meta.url), 'utf8'));
  if (facts.officeMapsUrl !== 'https://maps.app.goo.gl/rtHK3cyEqyp7kiea8') throw new Error('Review the confirmed office Maps destination before changing it');
  const card = `<section class="section wrap office-location" aria-labelledby="office-heading"><div class="office-location-card"><div class="office-location-copy"><h2 id="office-heading">Visit our office</h2><p class="office-address">63 Pirie St, Adelaide SA 5000</p><p>Office visits are by appointment. Please contact us before visiting.</p><div class="office-actions"><a class="button primary" href="${facts.officeMapsUrl}" target="_blank" rel="noopener noreferrer">Open in Google Maps <span aria-hidden="true">↗</span></a><a class="button outline" href="/contact/">Contact us first</a></div><nav class="office-shortcuts" aria-label="Helpful information"><a href="/service-areas/">Service areas</a><a href="/faq/">Repair FAQs</a></nav></div><iframe src="https://www.google.com/maps/embed?origin=mfe&amp;pb=!1m3!2m1!1s63%20Pirie%20St%2C%20Adelaide%20SA%205000!6i16" title="Map showing 63 Pirie St, Adelaide." width="720" height="300" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div></section>`;
  edits.push({start: wrapper.sourceCodeLocation.endTag.startOffset, end: wrapper.sourceCodeLocation.endTag.startOffset, text: card});
  for (const node of nodes.filter(n => n.tagName === 'script' && attr(n, 'type') === 'application/ld+json')) {
    const data = JSON.parse(node.childNodes.map(n => n.value || '').join(''));
    if (!data['@graph']?.some(n => n['@type'] === 'FAQPage')) continue;
    data['@graph'] = data['@graph'].filter(n => n['@type'] !== 'FAQPage');
    edits.push({start: node.sourceCodeLocation.startTag.endOffset, end: node.sourceCodeLocation.endTag.startOffset, text: JSON.stringify(data).replace(/</g, '\\u003c')});
  }
  for (const edit of edits.sort((a,b) => b.start - a.start)) html = html.slice(0,edit.start) + edit.text + html.slice(edit.end);
  html = html.replace('</head>', '<link rel="stylesheet" href="/assets/css/home-office.css"></head>');
  fs.writeFileSync(file, html);
}
