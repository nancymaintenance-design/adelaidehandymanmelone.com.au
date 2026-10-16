import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'parse5';
import { walk, attribute } from './i18n/html.mjs';

// User copy rule, 2026-10-16: the homepage keeps its city-led H1. Other
// headings and internal labels use the repair topic or actual suburb instead.
// These are real locality identifiers, not generic search modifiers.
const locations = /North Adelaide|Adelaide CBD|Adelaide Hills|Greater Adelaide|Adelaide local time|Adelaide, South Australia|Adelaide SA 5000|北阿德莱德|阿德莱德\s*CBD|阿德莱德中央商务区|阿德莱德山(?:区|丘)?|大阿德莱德|阿德莱德当地时间/g;
const escaped = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
const text = node => node.nodeName === '#text' ? node.value : (node.childNodes || []).map(text).join('');
const hasClass = (node, name) => (attribute(node, 'class') || '').split(/\s+/).includes(name);
const find = (node, predicate) => { let result; walk(node, child => { if (!result && predicate(child)) result = child; }); return result; };

export function localLabelText(value) {
  if (typeof value !== 'string' || !/\bAdelaide\b|阿德莱德/.test(value) || value.trim() === 'Adelaide') return value;
  const saved = [];
  let copy = value.replace(locations, match => `\uE000${saved.push(match) - 1}\uE001`);
  copy = copy
    .replace(/\b(Central) Adelaide\b/g, 'City-centre')
    .replace(/\b(northern and north-eastern|Northern and North-Eastern) Adelaide\b/g, '$1 suburbs')
    .replace(/\b(northern|southern|eastern|western|Northern|Southern|Eastern|Western) Adelaide\b/g, '$1 suburbs')
    .replace(/\ban Adelaide\b/g, 'a')
    .replace(/\bAdelaide['’]s\s*/g, '')
    .replace(/\s+or Adelaide\b/g, '')
    .replace(/\b(?:in|across|throughout|around|within|of) Adelaide\b\s*/g, '')
    .replace(/,\s*Adelaide\b/g, '')
    .replace(/\bAdelaide\b\s*/g, '')
    .replace(/在阿德莱德(?=\s*[A-Z])/g, '在')
    .replace(/(?:或|及|和)阿德莱德/g, '')
    .replace(/在阿德莱德|阿德莱德的|阿德莱德/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/ +([,:.;!?])/g, '$1');
  copy = copy.replace(/\uE000(\d+)\uE001/g, (_, index) => saved[Number(index)]);
  if (!/^\s/.test(value)) copy = copy.trimStart();
  if (!/\s$/.test(value)) copy = copy.trimEnd();
  if (/^[A-Z]/.test(value) && /^[a-z]/.test(copy)) copy = copy[0].toUpperCase() + copy.slice(1);
  return copy;
}

const humanFields = new Set(['name', 'title', 'shortTitle', 'seoTitle', 'description', 'summary', 'headline', 'text', 'articleBody', 'serviceType', 'keywords', 'caption', 'alternativeHeadline', 'articleSection', 'question', 'answer', 'problem', 'result', 'enquiryFocus', 'preparation', 'primaryService', 'label']);
function structuredCopy(value, key = '', route = '') {
  if (Array.isArray(value)) return value.map(item => structuredCopy(item, key, route));
  if (value && typeof value === 'object') {
    // Company identification and address records are factual location context.
    if ((value.telephone && value.address) || value['@type'] === 'WebSite') return value;
    return Object.fromEntries(Object.entries(value).map(([name, item]) => [name,
      route === '/' && value['@type'] === 'WebPage' && ['name', 'description'].includes(name) ? item : structuredCopy(item, name, route)]));
  }
  return typeof value === 'string' && humanFields.has(key) ? localLabelText(value) : value;
}

// Source locations let us edit just the reviewed human copy. We do not
// reserialize English HTML, URLs, form identifiers, scripts or CSS.
export function applyLocalLabelsToHtml(html, route) {
  const doc = parse(html, { sourceCodeLocationInfo: true });
  const edits = new Map();
  const put = (start, end, value) => edits.set(start, { start, end, value });
  const setAttr = (node, name, value) => {
    const location = node.sourceCodeLocation?.attrs?.[name];
    if (location) put(location.startOffset, location.endOffset, `${name}="${escaped(value)}"`);
  };
  walk(doc, node => {
    const location = node.sourceCodeLocation;
    if (node.nodeName === '#text' && location && !['script', 'style'].includes(node.parentNode?.tagName)) {
      if (route === '/' && ['title', 'h1'].includes(node.parentNode?.tagName)) return;
      const copy = hasClass(node.parentNode?.parentNode, 'footer-bottom')
        ? localLabelText(node.value.replace('Adelaide, South Australia', 'South Australia'))
        : localLabelText(node.value);
      if (copy !== node.value) put(location.startOffset, location.endOffset, escaped(copy));
    }
    for (const name of ['alt', 'title', 'aria-label', 'placeholder']) {
      const original = attribute(node, name);
      if (original) { const copy = localLabelText(original); if (copy !== original) setAttr(node, name, copy); }
    }
    if (node.tagName === 'meta' && route !== '/') {
      const field = attribute(node, 'name') || attribute(node, 'property');
      if (['description', 'og:title', 'og:description', 'twitter:title', 'twitter:description'].includes(field)) {
        const original = attribute(node, 'content');
        const copy = localLabelText(original);
        if (copy !== original) setAttr(node, 'content', copy);
      }
    }
    if (node.tagName === 'script' && attribute(node, 'type') === 'application/ld+json') {
      const original = JSON.parse(text(node));
      const copy = structuredCopy(original, '', route);
      if (JSON.stringify(copy) !== JSON.stringify(original)) put(location.startTag.endOffset, location.endTag.startOffset, JSON.stringify(copy).replace(/</g, '\\u003c'));
    }
  });
  walk(doc, node => {
    if (node.tagName !== 'article' || !hasClass(node, 'task-card')) return;
    const heading = find(node, child => child.tagName === 'h3');
    const cta = find(node, child => child.tagName === 'a' && hasClass(child, 'text-link'));
    if (!heading || !cta) throw new Error(`Incomplete service card on ${route}`);
    const label = localLabelText(text(heading).trim());
    setAttr(cta, 'aria-label', label);
    put(cta.sourceCodeLocation.startTag.endOffset, cta.sourceCodeLocation.endTag.startOffset, `${escaped(label)} <span aria-hidden="true">↗</span>`);
  });
  for (const edit of [...edits.values()].sort((a, b) => b.start - a.start)) html = html.slice(0, edit.start) + edit.value + html.slice(edit.end);
  return html;
}

export function applyLocalLabels({ siteDir, routes }) {
  for (const route of [...routes.map(item => item.route), '/404.html']) {
    const file = path.join(siteDir, route.endsWith('.html') ? route.slice(1) : `${route.slice(1)}index.html`);
    fs.writeFileSync(file, applyLocalLabelsToHtml(fs.readFileSync(file, 'utf8'), route));
  }
  let index = fs.readFileSync(path.join(siteDir, 'llms.txt'), 'utf8');
  for (const record of routes) {
    if (record.route === '/') continue;
    const title = localLabelText(record.title), description = localLabelText(record.description);
    index = index.replace(`[${record.title}]`, `[${title}]`).replace(`: ${record.description}\n`, `: ${description}\n`);
    record.title = title;
    record.description = description;
  }
  fs.writeFileSync(path.join(siteDir, 'llms.txt'), index);
  for (const feed of ['case-studies/feed.json', 'service-areas/feed.json']) {
    const file = path.join(siteDir, feed);
    fs.writeFileSync(file, JSON.stringify(structuredCopy(JSON.parse(fs.readFileSync(file, 'utf8'))), null, 2));
  }
}
