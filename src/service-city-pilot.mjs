import fs from 'node:fs';
import { parse } from 'parse5';
import { walk, attribute } from './i18n/html.mjs';

// Approved 2026-10-22: five routes, exact fields. The default label rule
// still cleans cards and internal links. Exact old values guard source drift.
export const serviceCityPilot = JSON.parse(fs.readFileSync(new URL('./content-pack/service-city-pilot.json', import.meta.url), 'utf8'));
const escape = value => value.replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[c]));
const text = node => node.nodeName === '#text' ? node.value : (node.childNodes || []).map(text).join('');

export function applyServiceCityPilot(html, route) {
  const approved = serviceCityPilot[route];
  if (!approved) return html;
  const { beforeTitle, title, h1, beforeDescription, description } = approved;
  const doc = parse(html, { sourceCodeLocationInfo: true }), edits = [], counts = {};
  const checked = (field, old, expected, next) => {
    if (old !== expected) throw new Error(`Service city pilot source drift on ${route} ${field}: ${old}`);
    counts[field] = (counts[field] || 0) + 1;
    return next;
  };
  const edit = (start, end, value) => edits.push({ start, end, value });
  walk(doc, node => {
    const loc = node.sourceCodeLocation;
    if (!loc) return;
    const field = node.tagName === 'title' ? 'title' : node.tagName === 'h1' ? 'h1'
      : node.tagName === 'p' && (attribute(node, 'class') || '').split(/\s+/).includes('lede') ? 'lead' : null;
    if (field) {
      const old = field === 'title' ? `${beforeTitle} | MEL ONE` : field === 'h1' ? beforeTitle : beforeDescription;
      const next = field === 'title' ? `${title} | MEL ONE` : field === 'h1' ? h1 : description;
      edit(loc.startTag.endOffset, loc.endTag.startOffset, escape(checked(field, text(node), old, next)));
    }
    if (node.tagName === 'meta') {
      const key = attribute(node, 'name') || attribute(node, 'property');
      if (['description','og:title','og:description','twitter:title','twitter:description'].includes(key)) {
        const isTitle = key.endsWith(':title'), at = loc.attrs.content;
        const next = checked(key, attribute(node, 'content'), isTitle ? `${beforeTitle} | MEL ONE` : beforeDescription, isTitle ? `${title} | MEL ONE` : description);
        edit(at.startOffset, at.endOffset, `content="${escape(next)}"`);
      }
    }
    if (node.tagName === 'script' && attribute(node, 'type') === 'application/ld+json') {
      const data = JSON.parse(text(node));
      for (const entity of data['@graph'] || []) {
        if (!['Service','WebPage'].includes(entity['@type']) || !entity.url?.endsWith(route)) continue;
        const webpage = entity['@type'] === 'WebPage';
        entity.name = checked(`${entity['@type']}.name`, entity.name, webpage ? `${beforeTitle} | MEL ONE` : beforeTitle, webpage ? `${title} | MEL ONE` : title);
        entity.description = checked(`${entity['@type']}.description`, entity.description, beforeDescription, description);
      }
      edit(loc.startTag.endOffset, loc.endTag.startOffset, JSON.stringify(data).replace(/</g, '\\u003c'));
    }
  });
  for (const field of ['title','h1','lead','description','og:title','og:description','Service.name','Service.description','WebPage.name','WebPage.description']) {
    if (counts[field] !== 1) throw new Error(`Service city pilot field count on ${route} ${field}: ${counts[field]}`);
  }
  for (const {start, end, value} of edits.sort((a,b) => b.start - a.start)) html = html.slice(0,start) + value + html.slice(end);
  return html;
}

// Apply the two approved paragraph reductions after desktop composition so a
// shorter paragraph cannot change the historical column-balancing decision.
// The original anchor markup is reused verbatim and the detailed FAQ is intact.
export function applyCaseCopyPilot(html, route) {
  const copy = {
    '/case-studies/norwood-flyscreen-repair/': {
      before: 'This record shows remeshing a window screen. For your screen, describe any frame or corner damage separately so the assessment can distinguish mesh work from frame repair. Compare the repair scope: Flyscreen & Screen Door Repairs.',
      service: '/services/flyscreen-repair/', prefix: 'For frame and hardware questions, see our ', suffix: ' scope.',
    },
    '/case-studies/burnside-driveway-pressure-cleaning/': {
      before: 'The photographed surface is paved driveway material. Identify coatings, loose pavers, damaged joints and drainage at your property before a cleaning method is agreed. Compare the repair scope: Pressure Cleaning.',
      service: '/services/pressure-cleaning/', prefix: 'Compare driveway and paver cleaning options on our ', suffix: ' page.',
    },
  }[route];
  if (!copy) return html;
  const doc = parse(html, { sourceCodeLocationInfo: true });
  let replacement;
  walk(doc, node => {
    if (node.tagName !== 'p' || text(node) !== copy.before) return;
    if (replacement) throw new Error(`Duplicate reviewed case paragraph: ${route}`);
    let anchor;
    walk(node, child => { if (child.tagName === 'a' && attribute(child, 'href') === copy.service) anchor = child; });
    if (!anchor) throw new Error(`Missing reviewed case link: ${route}`);
    const loc = node.sourceCodeLocation, link = anchor.sourceCodeLocation;
    replacement = { start: loc.startTag.endOffset, end: loc.endTag.startOffset, value: escape(copy.prefix) + html.slice(link.startOffset, link.endOffset) + escape(copy.suffix) };
  });
  if (!replacement) throw new Error(`Case copy pilot source drift: ${route}`);
  return html.slice(0, replacement.start) + replacement.value + html.slice(replacement.end);
}
