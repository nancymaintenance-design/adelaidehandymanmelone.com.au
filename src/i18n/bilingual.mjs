import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { translateHtml, normalise } from './html.mjs';
import { validateSecurityPolicy, securityPolicy } from '../security-policy.mjs';

export function createTranslator(directory = import.meta.dirname) {
  const source = JSON.parse(fs.readFileSync(path.join(directory, 'en.json'), 'utf8'));
  const chinese = {};
  for (const file of fs.readdirSync(directory).filter(file => /^zh-.*\.json$/.test(file))) {
    for (const [id, text] of Object.entries(JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8')))) {
      if (Object.hasOwn(chinese, id)) throw new Error(`Duplicate Chinese translation: ${id}`);
      if (!Object.hasOwn(source, id)) throw new Error(`Unknown translation ID: ${id}`);
      if (typeof text !== 'string' || !text.trim()) throw new Error(`Empty Chinese translation: ${id}`);
      chinese[id] = text;
    }
  }
  const lockPath = path.join(directory, 'source-lock.json');
  const sourceLock = fs.existsSync(lockPath) ? JSON.parse(fs.readFileSync(lockPath, 'utf8')) : {};
  if (!sourceLock || Array.isArray(sourceLock) || typeof sourceLock !== 'object') throw new Error('Invalid translation source-lock.json: expected an ID-to-SHA256 object.');
  for (const [id, hash] of Object.entries(sourceLock)) {
    if (!Object.hasOwn(source, id) || typeof hash !== 'string' || !/^[a-f0-9]{64}$/.test(hash)) throw new Error(`Invalid translation source binding: ${id}`);
  }
  const stale = [];
  const unreviewed = [];
  for (const id of Object.keys(chinese)) {
    const hash = createHash('sha256').update(normalise(source[id])).digest('hex');
    if (!Object.hasOwn(sourceLock, id)) unreviewed.push(id);
    else if (sourceLock[id] !== hash) stale.push(id);
  }
  const byEnglish = new Map(Object.entries(source).map(([id, en]) => [normalise(en), id]));
  const missing = new Set();
  const used = new Set();
  const translate = value => {
    const en = normalise(value);
    if (!/[A-Za-z]/.test(en)) return value;
    if (en.endsWith(' | MEL ONE')) return `${translate(en.slice(0, -10))} | MEL ONE`;
    const id = byEnglish.get(en);
    if (!id || !chinese[id]) { missing.add(en); return value; }
    used.add(id);
    return chinese[id];
  };
  const assertComplete = () => {
    const problems = [];
    if (missing.size) problems.push(`${missing.size} English strings lack Chinese translations.\n${[...missing].slice(0, 12).join('\n')}\nRun npm run i18n:extract and translate the missing entries.`);
    if (stale.length) problems.push(`Stale Chinese translation source bindings (${stale.length}): ${stale.slice(0, 12).join(', ')}. The English source changed after the Chinese translation was reviewed.`);
    if (unreviewed.length) problems.push(`Unreviewed Chinese translation source bindings (${unreviewed.length}): ${unreviewed.slice(0, 12).join(', ')}.`);
    if (problems.length) throw new Error(`Bilingual sync required:\n${problems.join('\n')}\nAfter reviewing each affected English/Chinese pair, record only its explicit IDs with node scripts/record-translation-sources.mjs tNNNN [tNNNN ...], then rebuild. Do not bypass review by replacing the lock.`);
  };
  return { translate, missing, used, assertComplete };
}

export const chineseRoute = route => `/zh${route}`;
export function languageUrl(value, origin, routes) {
  if (!value || value.startsWith('#')) return value;
  let url;
  try { url = new URL(value, origin); } catch { return value; }
  if (url.origin !== origin || !routes.has(url.pathname)) return value;
  const localized = chineseRoute(url.pathname) + url.search + url.hash;
  return value.startsWith('/') ? localized : origin + localized;
}

function languageControls(html, route, origin, chinese, noindex) {
  html = html.replace(/(<a class="header-enquiry"[^>]*>)[^<]+/, `$1${chinese ? '联系我们' : 'Contact'} `);
  const target = chinese ? route : chineseRoute(route);
  const control = `<a class="language-switch" data-language-switch href="${target}" lang="${chinese ? 'en-AU' : 'zh-Hans'}" hreflang="${chinese ? 'en-AU' : 'zh-Hans'}" aria-label="${chinese ? 'Switch to English' : '切换到中文服务'}">${chinese ? 'English' : '中文服务'}</a>`;
  html = html.replace(/(<nav id="primary-nav"[\s\S]*?)(<\/nav>)/, `$1${control}$2`);
  const alternates = noindex ? '' : `<link rel="alternate" hreflang="en-AU" href="${origin}${route}"><link rel="alternate" hreflang="zh-Hans" href="${origin}${chineseRoute(route)}"><link rel="alternate" hreflang="x-default" href="${origin}${route}">`;
  return html.replace('<script src="/assets/js/site.js"', `<script src="/assets/js/messages.${chinese ? 'zh' : 'en'}.js" defer></script><script src="/assets/js/site.js"`).replace('</head>', `${alternates}<meta property="og:locale" content="${chinese ? 'zh_CN' : 'en_AU'}"><meta property="og:locale:alternate" content="${chinese ? 'en_AU' : 'zh_CN'}"><link rel="stylesheet" href="/assets/css/bilingual.css"></head>`);
}

export function renderBilingual({ siteDir, routes, origin, extract = false }) {
  const translator = createTranslator();
  const allRoutes = [...routes.map(item => item.route), '/404.html'];
  const localizedPaths = new Set([...allRoutes, '/case-studies/feed.json', '/service-areas/feed.json']);
  const localizeUrl = url => languageUrl(url, origin, localizedPaths);
  const outputs = [];
  const messages = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'interface.json'), 'utf8'));
  const pageFile = route => route.endsWith('.html') ? route.slice(1) : `${route.slice(1)}index.html`;
  for (const route of allRoutes) {
    const filename = pageFile(route);
    // Keep the approved English main content byte-for-byte; only the header
    // contact label, language control and head language metadata are added.
    const english = fs.readFileSync(path.join(siteDir, filename), 'utf8')
      .replace(/(<a class="header-enquiry" href="\/contact\/">)Start an enquiry/, '$1Contact');
    const chinese = translateHtml(english, translator.translate, localizeUrl);
    let englishPage = languageControls(english, route, origin, false, route === '/404.html');
    if (route === '/404.html') {
      // Static hosting can select the root 404 for an unknown /zh/ URL. Keep
      // Chinese recovery links available there without JavaScript or a soft 404.
      const escape = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
      const zh = key => escape(messages[key].zh);
      const help = `<aside class="wrap bilingual-error-help" lang="zh-Hans" aria-labelledby="chinese-error-heading"><h2 id="chinese-error-heading">${zh('notFoundTitle')}</h2><p>${zh('notFoundHelp')}</p><p><a href="/zh/">${zh('chineseHome')}</a> · <a href="/zh/contact/">${zh('contactLabel')}</a></p></aside>`;
      englishPage = englishPage.replace('</main>', `</main>${help}`);
    }
    outputs.push([filename, englishPage]);
    outputs.push([`zh/${filename}`, languageControls(chinese, route, origin, true, route === '/404.html')]);
  }
  // Localize the existing public data catalogues too. Slugs, image URLs, dates,
  // structured field names and geographic identifiers remain stable.
  for (const feed of ['case-studies/feed.json', 'service-areas/feed.json']) {
    const source = JSON.parse(fs.readFileSync(path.join(siteDir, feed), 'utf8'));
    const transform = (value, key = '') => {
      if (Array.isArray(value)) return value.map(item => transform(item, key));
      if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, transform(v, k)]));
      if (typeof value !== 'string') return value;
      if (/url$/i.test(key) || /urls$/i.test(key) || key === 'id') return localizeUrl(value);
      if (['name', 'title', 'summary', 'enquiryFocus', 'preparation', 'question', 'answer', 'problem', 'result', 'keywords', 'primaryService'].includes(key)) return translator.translate(value);
      return value;
    };
    outputs.push([`zh/${feed}`, JSON.stringify({ ...transform(source), language: 'zh-Hans' }, null, 2)]);
  }
  const zhIndex = `# MEL ONE 中文服务\n\n> 家居维修、服务区域、维修案例及实用指南的简体中文版本。\n\n- 电话：0416 614 281\n- 邮箱：admin@melonemaintenance.com.au\n- 地址：63 Pirie St Adelaide SA 5000\n\n## 页面\n\n${routes.map(({ route, title, description }) => `- [${translator.translate(title)}](${origin}${chineseRoute(route)}): ${translator.translate(description)}`).join('\n')}\n`;
  if (extract) {
    const manifestPath = path.join(import.meta.dirname, 'en.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const existing = new Map(Object.entries(manifest).map(([id, en]) => [en, id]));
    let next = Math.max(0, ...Object.keys(manifest).map(id => Number(id.slice(1))));
    const pending = [...translator.missing].map(en => {
      const isNew = !existing.has(en);
      const id = existing.get(en) || `t${String(++next).padStart(4, '0')}`;
      manifest[id] = en;
      return { id, en, isNew };
    });
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    const report = path.resolve(import.meta.dirname, '../../../reports/2026-10-16-bilingual');
    fs.mkdirSync(report, { recursive: true });
    fs.writeFileSync(path.join(report, 'pending-translations.json'), JSON.stringify(pending, null, 2));
    console.log(`Translation inventory: ${pending.length} pending, ${pending.filter(item => item.isNew).length} newly discovered strings. IDs retained.`);
    return;
  }
  translator.assertComplete();
  for (const locale of ['en', 'zh']) {
    for (const [key, pair] of Object.entries(messages)) {
      if (!pair.en?.trim() || !pair.zh?.trim()) throw new Error(`Missing paired interface translation: ${key}`);
      const placeholders = value => [...value.matchAll(/\{(\w+)\}/g)].map(m => m[1]).filter(k => k !== 'suffix').sort();
      if (JSON.stringify(placeholders(pair.en)) !== JSON.stringify(placeholders(pair.zh))) throw new Error(`Interface placeholder mismatch: ${key}`);
    }
    outputs.push([`assets/js/messages.${locale}.js`, `window.MEL_ONE_MESSAGES=${JSON.stringify(Object.fromEntries(Object.entries(messages).map(([key, pair]) => [key, pair[locale]]))).replace(/</g, '\\u003c')};\n`]);
  }
  for (const [filename, content] of outputs) {
    if (filename.endsWith('.html')) validateSecurityPolicy(content, securityPolicy);
    const destination = path.join(siteDir, filename);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, content);
  }
  fs.copyFileSync(path.join(import.meta.dirname, '../assets/css/bilingual.css'), path.join(siteDir, 'assets/css/bilingual.css'));
  const sitemap = fs.readFileSync(path.join(siteDir, 'sitemap.xml'), 'utf8');
  const chineseEntries = routes.map(({ route, lastmod }) => `<url><loc>${origin}${chineseRoute(route)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`).join('');
  fs.writeFileSync(path.join(siteDir, 'sitemap.xml'), sitemap.replace('</urlset>', `${chineseEntries}</urlset>`));
  fs.writeFileSync(path.join(siteDir, 'zh/llms.txt'), zhIndex);
  fs.appendFileSync(path.join(siteDir, 'llms.txt'), `\n## Chinese language version\n\n- [中文服务](${origin}/zh/): Simplified Chinese counterparts for every page.\n- [中文页面索引](${origin}/zh/llms.txt)\n`);
  console.log(`Bilingual check passed: ${routes.length} English + ${routes.length} Chinese indexable pages, paired 404 pages, ${translator.used.size} translated strings.`);
}
