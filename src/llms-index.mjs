import fs from 'node:fs';
import path from 'node:path';
import {load} from 'cheerio';

const defaultSelection = JSON.parse(fs.readFileSync(new URL('./llms-selection.json', import.meta.url), 'utf8'));
const clean = text => text.replace(/\s+/g, ' ').trim();
const markdown = text => clean(text).replace(/[\\\[\]]/g, '\\$&').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const introductions = {
  en: 'MEL ONE provides handyman repairs and household maintenance across Greater Adelaide. This index links selected English and Simplified Chinese pages.',
  zh: 'MEL ONE 在大阿德莱德地区提供家居维修与家庭维护。本索引精选英文和简体中文页面。',
};

// Read final HTML, not stale pre-label titles or a second copy of page summaries.
// No network or model calls: the same pages and selection yield the same bytes.
export function generateLlmsIndex({siteDir, origin, selection = defaultSelection}) {
  const base = new URL(origin);
  if (!['http:', 'https:'].includes(base.protocol) || base.origin !== origin) throw new Error('llms: use the explicit configured origin');
  const sitemap = load(fs.readFileSync(path.join(siteDir, 'sitemap.xml'), 'utf8'), {xmlMode: true});
  const known = new Set(sitemap('loc').map((_, e) => sitemap(e).text()).get());
  const seen = new Set();
  const items = [];
  for (const {group, route} of selection) {
    if (!['company', 'services', 'evidence'].includes(group) || typeof route !== 'string' ||
        !/^\/(?:[a-z0-9-]+\/)*$/.test(route) ||
        !(route === '/' || /^\/(?:services|service-areas|about|contact|case-studies|guides)\//.test(route)) || seen.has(route)) {
      throw new Error(`llms: invalid or duplicate selected owner ${route}`);
    }
    seen.add(route);
    for (const locale of ['en', 'zh']) {
      const pathname = locale === 'en' ? route : `/zh${route}`;
      const url = origin + pathname;
      const counterpart = origin + (locale === 'en' ? `/zh${route}` : route);
      if (!known.has(url)) throw new Error(`llms: selected page absent from sitemap: ${url}`);
      const $ = load(fs.readFileSync(path.join(siteDir, pathname, 'index.html'), 'utf8'));
      const language = locale === 'en' ? 'en-AU' : 'zh-Hans';
      const otherLanguage = locale === 'en' ? 'zh-Hans' : 'en-AU';
      const robots = $('meta[name="robots"],meta[name="googlebot"]').map((_, e) => $(e).attr('content') || '').get().join(' ');
      const alternates = new Map($('link[rel="alternate"][hreflang]').toArray().map(e => [$(e).attr('hreflang'), $(e).attr('href')]));
      if ($('html').attr('lang') !== language || $('link[rel="canonical"]').length !== 1 ||
          $('link[rel="canonical"]').attr('href') !== url || /\b(?:noindex|none)\b/i.test(robots) ||
          alternates.get(language) !== url || alternates.get(otherLanguage) !== counterpart) {
        throw new Error(`llms: invalid language, canonical, robots or alternate: ${url}`);
      }
      const main = $('main').clone();
      main.find('script,style,nav,form,aside,[hidden],[aria-hidden="true"]').remove();
      const title = clean(main.find('h1').first().text());
      const summary = clean(main.find('p').not('.eyebrow,.small').first().text());
      if (main.find('h1').length !== 1 || !title || !summary || clean(main.text()).length < 100) {
        throw new Error(`llms: readable heading and body summary required: ${url}`);
      }
      items.push({group, locale, route: pathname, url, counterpart, language, title, summary});
    }
  }
  if (!items.length) throw new Error('llms: empty selection');
  const line = item => `- [${markdown(item.title)}](${item.url}): ${markdown(item.summary)}`;
  const section = (title, list) => list.length ? `\n## ${title}\n\n${list.map(line).join('\n')}\n` : '';
  const select = (group, locale) => items.filter(item => item.group === group && (!locale || item.locale === locale));
  const root = `# MEL ONE\n\n> ${introductions.en}\n> ${introductions.zh}\n` +
    section('Home, company, service areas and contact / 首页、公司、区域与联系', select('company')) +
    section('English services', select('services', 'en')) +
    section('中文服务', select('services', 'zh')) +
    section('Case studies and practical guides / 案例与实用指南', select('evidence'));
  const chinese = `# MEL ONE\n\n> ${introductions.zh}\n` +
    section('首页、公司、服务区域与联系', select('company', 'zh')) +
    section('中文服务', select('services', 'zh')) +
    section('案例与实用指南', select('evidence', 'zh'));
  // Validate every selected pair before replacing either public index.
  fs.writeFileSync(path.join(siteDir, 'llms.txt'), root, 'utf8');
  fs.writeFileSync(path.join(siteDir, 'zh/llms.txt'), chinese, 'utf8');
  return items;
}
