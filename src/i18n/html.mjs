import { parse, serialize } from 'parse5';

export const normalise = text => text.replace(/\s+/g, ' ').trim();
const humanAttributes = new Set(['alt', 'title', 'aria-label', 'placeholder']);
const humanSchema = new Set(['name', 'description', 'headline', 'text', 'articleBody', 'serviceType', 'keywords', 'caption', 'alternativeHeadline', 'articleSection']);
export function walk(node, visit) {
  visit(node);
  for (const child of node.childNodes || []) walk(child, visit);
  if (node.content) walk(node.content, visit);
}
export const attribute = (node, name) => node.attrs?.find(item => item.name === name)?.value;
export function setAttribute(node, name, value) {
  const item = node.attrs?.find(item => item.name === name);
  if (item) item.value = value;
  else (node.attrs ||= []).push({ name, value });
}

export function translateStructured(value, translate, localizeUrl = text => text, key = '') {
  if (Array.isArray(value)) return value.map(item => translateStructured(item, translate, localizeUrl, key));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, translateStructured(v, translate, localizeUrl, k)]));
  if (typeof value !== 'string') return value;
  if (key === 'inLanguage') return 'zh-Hans';
  if (humanSchema.has(key)) return translate(value);
  if (['@id', 'url', 'item', 'mainEntityOfPage', 'isBasedOn', 'contentUrl'].includes(key)) return localizeUrl(value);
  return value;
}

// Parse HTML rather than replacing words in markup: scripts, URLs, form names,
// IDs, schema types and business identifiers are never translated as prose.
export function translateHtml(html, translate, localizeUrl = text => text) {
  const document = parse(html);
  walk(document, node => {
    if (node.nodeName === '#text' && !['script', 'style'].includes(node.parentNode?.tagName)) {
      const text = normalise(node.value);
      if (text) node.value = node.value.replace(/\S[\s\S]*\S|\S/, () => text === '.' ? '。' : translate(text));
    }
    if (node.tagName === 'script' && attribute(node, 'type') === 'application/ld+json') {
      const original = node.childNodes.map(child => child.value || '').join('');
      node.childNodes = [{ nodeName: '#text', parentNode: node, value: JSON.stringify(translateStructured(JSON.parse(original), translate, localizeUrl)).replace(/</g, '\\u003c') }];
    }
    for (const attr of node.attrs || []) {
      if (humanAttributes.has(attr.name) && attr.value) attr.value = translate(attr.value);
      if (attr.name === 'href') attr.value = localizeUrl(attr.value);
    }
    if (node.tagName === 'meta') {
      const key = attribute(node, 'name') || attribute(node, 'property');
      if (['description', 'og:title', 'og:description', 'twitter:title', 'twitter:description'].includes(key)) setAttribute(node, 'content', translate(attribute(node, 'content')));
      if (key === 'og:url') setAttribute(node, 'content', localizeUrl(attribute(node, 'content')));
    }
    if (node.tagName === 'html') setAttribute(node, 'lang', 'zh-Hans');
  });
  return serialize(document);
}
