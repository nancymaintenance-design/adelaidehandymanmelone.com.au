#!/usr/bin/env node
/** MEL ONE local candidate. Public facts originate only in the approved content contract. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.join(projectDir, process.argv.includes('--docs') ? 'docs' : 'public');
const content = JSON.parse(fs.readFileSync(path.join(projectDir, 'src/content-pack/mel-one-site-content.json'), 'utf8'));
const serviceAreas = JSON.parse(fs.readFileSync(path.join(projectDir, 'src/content-pack/service-areas.json'), 'utf8'));
const collections = ['services', 'news', 'guides', 'faqs'];
const escapeHtml = (value = '') => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
const json = value => JSON.stringify(value).replaceAll('<', '\\u003c');

function validateContent(candidate) {
  if (candidate.site?.status !== 'approved') throw new Error('An approved site record is required.');
  for (const key of collections) if (!Array.isArray(candidate[key])) throw new Error(`Missing ${key} collection.`);
  const records = [candidate.site, ...collections.flatMap(key => candidate[key])];
  for (const item of records) {
    if (!['approved', 'draft'].includes(item.status) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) throw new Error('Invalid content status or slug.');
    if (!item.title?.trim() || !item.description?.trim() || !Array.isArray(item.scope) || !Array.isArray(item.exclusions)) throw new Error(`Incomplete content: ${item.slug}`);
    if (item.status === 'draft' && item.noindex !== true) throw new Error(`Draft requires noindex: ${item.slug}`);
  }
  const approved = records.filter(item => item.status === 'approved');
  if (new Set(approved.map(item => item.slug)).size !== approved.length) throw new Error('Approved slugs must be unique.');
  const approvedText = JSON.stringify(approved);
  if (/"(?:review|reviews|rating|aggregateRating)"\s*:/i.test(approvedText) || /"@type"\s*:\s*"(?:Review|AggregateRating)"/i.test(approvedText)) throw new Error('Review and rating content is not permitted.');
  const expected = { phone: '0416 614 281', email: 'admin@melonemaintenance.com.au', address: '63 Pirie St Adelaide SA 5000' };
  for (const [key, value] of Object.entries(expected)) if (candidate.site.contact?.[key] !== value) throw new Error(`Unconfirmed ${key}.`);
}
function validateServiceAreas(areas) {
  if (!Array.isArray(areas) || areas.length !== 8) throw new Error('Eight Greater Adelaide service areas are required.');
  const names = JSON.stringify(areas);
  if (/\b(?:Aranda|Canberra)\b/i.test(names)) throw new Error('Canberra and Aranda are outside the Greater Adelaide service-area scope.');
  const regionSlugs = areas.map(area => area.slug);
  if (new Set(regionSlugs).size !== regionSlugs.length) throw new Error('Duplicate service-area slug.');
  const suburbSlugs = areas.flatMap(area => {
    if (!area.slug || !area.name || !area.description || !area.context || !Array.isArray(area.suburbs) || !area.suburbs.length) throw new Error('Incomplete service-area record.');
    return area.suburbs.map(suburb => {
      if (!suburb.slug || !suburb.name || !suburb.primaryService || !suburb.title || !suburb.description || !suburb.lead || !suburb.localContext || !Array.isArray(suburb.services) || suburb.services.length !== 6 || !Array.isArray(suburb.faqs) || suburb.faqs.length < 3 || suburb.faqs.length > 5 || !suburb.faqs.every(faq => faq.question && faq.answer)) throw new Error(`Incomplete suburb record: ${suburb.slug || 'unknown'}`);
      return suburb.slug;
    });
  });
  if (new Set(suburbSlugs).size !== suburbSlugs.length) throw new Error('Duplicate suburb slug.');
}
validateContent(content);
validateServiceAreas(serviceAreas);
const published = Object.fromEntries(collections.map(key => [key, content[key].filter(item => item.status === 'approved' && item.noindex !== true)]));
const { site } = content;
const contact = site.contact;
const phoneLink = `+61${contact.phone.replace(/\D/g, '').slice(1)}`;
const originUrl = new URL(process.env.SITE_ORIGIN || 'https://www.adelaidehandymanmelone.com.au');
if (!['http:', 'https:'].includes(originUrl.protocol) || originUrl.username || originUrl.password) throw new Error('SITE_ORIGIN must be an HTTP(S) origin without credentials.');
const origin = originUrl.origin;
const canonical = route => `${origin}${route}`;
const logo = '/assets/mel-one-logo-authorized.png';
const gaMeasurementId = 'G-9KMWMVLZ3';
const gaTag = `<script async src="https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config', '${gaMeasurementId}');</script>`;
const intakeAssets = {
  hero: '/assets/images/mel-one-adelaide-home-hero.png',
  taskWall: '/assets/images/mel-one-maintenance-task-wall.png',
  roof: '/assets/images/mel-one-roof-gutter-exterior.png',
  outdoor: '/assets/images/mel-one-outdoor-structures-fences.png',
  repairs: '/assets/images/mel-one-home-repairs-renovation.png',
  electrical: '/assets/images/mel-one-household-electrical-work.png',
  interior: '/assets/images/mel-one-interior-repair-assembly.png',
  doors: '/assets/images/mel-one-door-window-maintenance.png',
  garden: '/assets/images/mel-one-garden-landscape-care.png',
  gutterCare: '/assets/images/mel-one-gutter-care.png',
  cleaning: '/assets/images/mel-one-household-removals-cleaning.png',
  workflow: [
    '/assets/images/mel-one-workflow-request-details.png',
    '/assets/images/mel-one-workflow-scope-discussion.png',
    '/assets/images/mel-one-workflow-contact-next-step.png',
  ],
  about: '/assets/images/mel-one-about-home-maintenance.png',
  areas: '/assets/images/mel-one-adelaide-service-area.png',
};
const hero = intakeAssets.hero;
const navigation = [['Home', '/'], ['Services', '/services/'], ['How it works', '/how-it-works/'], ['Service areas', '/service-areas/'], ['Field notes', '/guides/'], ['About', '/about/']];
const routes = [];

// Remove stale generated HTML, including routes that have returned to draft.
// Keep authored docs, source files and other workspace material intact.
fs.mkdirSync(siteDir, { recursive: true });
for (const name of fs.readdirSync(siteDir, { recursive: true })) {
  if (name.endsWith('.html')) fs.unlinkSync(path.join(siteDir, name));
}
// Assets are generated output. Replace the entire directory so stale files
// cannot remain publicly served after source assets are retired or renamed.
fs.rmSync(path.join(siteDir, 'assets'), { recursive: true, force: true });
for (const asset of [
  'css/site.css', 'js/site.js', 'mel-one-logo-authorized.png',
]) {
  const target = path.join(siteDir, 'assets', asset);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(projectDir, 'src/assets', asset), target);
}
for (const asset of ['favicon-32.png', 'favicon-192.png', 'apple-touch-icon.png', 'site.webmanifest']) {
  fs.copyFileSync(path.join(projectDir, 'src/assets', asset), path.join(siteDir, asset));
}
for (const asset of Object.values(intakeAssets).flat()) {
  const target = path.join(siteDir, asset);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(projectDir, 'src/assets/images/intake', path.basename(asset)), target);
}

const call = (className = 'button secondary') => `<a class="${className}" href="tel:${phoneLink}">Call ${escapeHtml(contact.phone)}</a>`;
const enquire = (label = 'Start an enquiry') => `<a class="button primary" href="/contact/">${label}<span aria-hidden="true"> ↗</span></a>`;
const actions = () => `<div class="actions">${enquire()}${call()}</div>`;
const contactDetails = () => `<address><a href="tel:${phoneLink}">${escapeHtml(contact.phone)}</a><a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a><span>${escapeHtml(contact.address)}</span></address>`;
const list = items => `<ul class="plain-list">${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
const faqList = (records = published.faqs) => `<div class="faq-list">${records.map(item => `<details><summary>${escapeHtml(item.question || item.title)}</summary><p>${escapeHtml(item.answer || item.description)}</p></details>`).join('')}</div>`;
const faqSchema = (records = published.faqs) => ({ '@type': 'FAQPage', mainEntity: records.map(item => ({ '@type': 'Question', name: item.question || item.title, acceptedAnswer: { '@type': 'Answer', text: item.answer || item.description } })) });
const business = { '@type': 'LocalBusiness', '@id': canonical('/#business'), name: site.title, description: site.description, url: canonical('/'), logo: canonical(logo), telephone: contact.phone, email: contact.email, address: { '@type': 'PostalAddress', streetAddress: '63 Pirie St', addressLocality: 'Adelaide', addressRegion: 'SA', postalCode: '5000', addressCountry: 'AU' } };
const website = { '@type': 'WebSite', '@id': canonical('/#website'), name: site.title, url: canonical('/'), inLanguage: 'en-AU', publisher: { '@id': business['@id'] } };
const breadcrumbSchema = crumbs => ({ '@type': 'BreadcrumbList', itemListElement: crumbs.map(([name, route], index) => ({ '@type': 'ListItem', position: index + 1, name, item: canonical(route) })) });
const breadcrumbHtml = crumbs => `<nav class="breadcrumbs" aria-label="Breadcrumb">${crumbs.map(([name, route], index) => index === crumbs.length - 1 ? `<span aria-current="page">${escapeHtml(name)}</span>` : `<a href="${route}">${escapeHtml(name)}</a><span aria-hidden="true">/</span>`).join('')}</nav>`;
const intro = (eyebrow, title, description) => `<header class="page-intro wrap"><p class="eyebrow">${escapeHtml(eyebrow)}</p><h1>${escapeHtml(title)}</h1><p class="lede">${escapeHtml(description)}</p></header>`;
const cta = () => `<section class="contact-band"><div class="wrap contact-band-inner"><div><p class="eyebrow">Your next step</p><h2>Start with what<br>needs attention.</h2></div><div><p>A short description and your suburb are a useful place to begin.</p>${actions()}</div></div></section>`;

function page({ route, title, description, body, schema = [], crumbs = [], noindex = false }) {
  const fullTitle = `${title} | ${site.title}`;
  const webpage = { '@type': 'WebPage', '@id': canonical(`${route}#webpage`), url: canonical(route), name: fullTitle, description, inLanguage: 'en-AU', isPartOf: { '@id': website['@id'] }, about: { '@id': business['@id'] } };
  const graph = [business, website, webpage, ...schema.filter(item => item['@type'] !== 'WebSite'), ...(crumbs.length ? [breadcrumbSchema(crumbs)] : [])];
  const nav = navigation.map(([label, href]) => `<a href="${href}"${(href === '/' ? route === '/' : route.startsWith(href)) ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  const html = `<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(fullTitle)}</title><meta name="description" content="${escapeHtml(description)}"><meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow'}"><link rel="canonical" href="${escapeHtml(canonical(route))}"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png"><link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest"><meta property="og:title" content="${escapeHtml(fullTitle)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${escapeHtml(canonical(route))}"><meta property="og:type" content="${schema.some(item => item['@type'] === 'Article') ? 'article' : 'website'}"><meta property="og:image" content="${escapeHtml(canonical(hero))}"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="/assets/css/site.css">${gaTag}<script type="application/ld+json">${json({ '@context': 'https://schema.org', '@graph': graph })}</script><script src="/assets/js/site.js" defer></script></head><body><a class="skip-link" href="#main">Skip to content</a><div class="topline"><div class="wrap">Adelaide home field notes <span>Household-maintenance enquiries</span></div></div><header class="site-header"><div class="wrap header-inner"><a class="brand" href="/" aria-label="${escapeHtml(site.title)} home"><img src="${logo}" alt="${escapeHtml(site.title)}" width="112" height="64"><span>${escapeHtml(site.title)}</span></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-nav" hidden>Menu <span aria-hidden="true">+</span></button><nav id="primary-nav" class="primary-nav" aria-label="Main navigation">${nav}<a class="header-enquiry" href="/contact/">Start an enquiry <span aria-hidden="true">↗</span></a></nav></div></header><main id="main">${crumbs.length ? `<div class="wrap">${breadcrumbHtml(crumbs)}</div>` : ''}${body}</main><footer class="site-footer"><div class="wrap footer-grid"><div><a class="footer-brand" href="/">${escapeHtml(site.title)}<span aria-hidden="true">.</span></a><p>${escapeHtml(site.description)}</p></div><div><p class="eyebrow">Explore</p><a href="/services/">Services</a><a href="/how-it-works/">How it works</a><a href="/service-areas/">Service areas</a><a href="/about/">About</a></div><div><p class="eyebrow">Field notes</p><a href="/news/">News</a><a href="/guides/">Guides</a><a href="/faq/">FAQ</a><a href="/privacy/">Privacy</a></div><div><p class="eyebrow">Contact</p>${contactDetails()}</div></div><div class="wrap footer-bottom"><span>${escapeHtml(site.title)} · Adelaide, South Australia</span></div></footer></body></html>`;
  const destination = path.join(siteDir, route === '/404.html' ? '404.html' : `${route}/index.html`);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const mobileActions = `<nav class="mobile-actions" aria-label="Quick contact"><a href="tel:${phoneLink}">Call ${escapeHtml(contact.phone)}</a><a href="/contact/">Start an enquiry <span aria-hidden="true">↗</span></a></nav>`;
  fs.writeFileSync(destination, html.replace('</body>', `${mobileActions}</body>`));
  if (!noindex) routes.push({ route, title, description });
}

// Original local line drawings are decorative cues only; all public service copy
// and destinations come from the approved records passed to this component.
function serviceTaskWall(records) {
  const iconPaths = {
    'home-electrical-repairs': 'M21 4 9 21h11l-3 15 14-20H20l1-12Z',
    'interior-repairs-assembly': 'M7 17h26v16H7Z M7 17l13-9 13 9 M20 17v16 M13 24h2 M25 24h2 M11 33v4 M29 33v4',
    'doors-windows-screens': 'M9 35V5h22v30 M14 35V9h12v26 M22 22h1 M6 35h28',
    'roof-gutter-exterior-care': 'M4 20 20 7l16 13 M9 18v15h22V18 M4 24h5 M31 24h5v12 M14 33V22h12v11',
    'garden-landscape-care': 'M20 35V18 M20 25C7 25 6 18 6 10c9 0 14 5 14 15Z M20 19C20 9 26 5 34 5c0 8-4 14-14 14Z M10 35h20',
    'outdoor-structures-fences-pools': 'M7 35V12l4-5 4 5v23 M25 35V12l4-5 4 5v23 M3 19h34 M3 28h34 M15 16h10',
    'home-repairs-renovation-support': 'M7 34V17L20 6l13 11v17 M13 34V23h8v11 M24 14h10v6H24Z M29 20v7h-3v8',
    'maintenance-planning-inspection-support': 'M14 8H8v28h24V8h-6 M14 5h12v7H14Z M13 20l2 2 4-5 M23 20h4 M13 29l2 2 4-5 M23 29h4',
    'cleaning-removals-specialist-care': 'M26 5 16 23 M12 21l10 6-7 10-11-6 8-10Z M10 27l-4 6 M15 30l-3 6 M28 19v8 M24 23h8 M34 9v6 M31 12h6',
  };
  return `<section class="task-wall" aria-label="Maintenance enquiries"><img class="task-wall-texture" src="${intakeAssets.taskWall}" alt="Household-maintenance tools" width="1619" height="971" loading="lazy" decoding="async">${records.map((record, index) => `<article class="task-card task-card--${index + 1}"><div class="task-card-heading"><svg class="task-icon" aria-hidden="true" focusable="false" viewBox="0 0 40 40"><path d="${iconPaths[record.slug] || 'M6 20 20 7l14 13 M11 18v17h18V18'}"/></svg><p class="eyebrow">Maintenance enquiry</p></div><h3><a href="/services/${escapeHtml(record.slug)}/">${escapeHtml(record.title)}</a></h3><p class="task-description">${escapeHtml(record.description)}</p><ul class="task-scope">${record.scope.slice(0, 3).map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul><a class="text-link" href="/services/${escapeHtml(record.slug)}/" aria-label="Read ${escapeHtml(record.title)}">Read more <span aria-hidden="true">↗</span></a></article>`).join('')}</section>`;
}

function cards(collection, records, empty) {
  if (!records.length) return `<div class="empty-note"><p>${escapeHtml(empty)}</p><a class="text-link" href="/contact/">Tell us what you have in mind <span aria-hidden="true">↗</span></a></div>`;
  if (collection === 'services') return serviceTaskWall(records);
  return `<div class="card-grid">${records.map(record => `<article class="note-card"><p class="eyebrow">${collection === 'services' ? 'Maintenance enquiry' : collection === 'news' ? 'News' : 'Field guide'}${record.date ? ` · <time datetime="${escapeHtml(record.date)}">${escapeHtml(record.date)}</time>` : ''}</p><h3><a href="/${collection}/${record.slug}/">${escapeHtml(record.title)}</a></h3><p>${escapeHtml(record.description)}</p><a class="text-link" href="/${collection}/${record.slug}/" aria-label="Read ${escapeHtml(record.title)}">Read more <span aria-hidden="true">↗</span></a></article>`).join('')}</div>`;
}
const processSteps = `<ol class="process-steps"><li><span class="step-number">01</span><h3>Describe the need</h3><p>Note what needs attention and where it is in your home.</p></li><li><span class="step-number">02</span><h3>Add the useful details</h3><p>Include your suburb, preferred timing and any questions about scope.</p></li><li><span class="step-number">03</span><h3>Get in touch</h3><p>Call or email to discuss your request and check availability.</p></li></ol>`;
const serviceImages = {
  'home-electrical-repairs': [[intakeAssets.electrical, 'Household electrical work']],
  'interior-repairs-assembly': [[intakeAssets.interior, 'Home repair work']],
  'doors-windows-screens': [[intakeAssets.doors, 'Door and window maintenance details']],
  'roof-gutter-exterior-care': [[intakeAssets.roof, 'Roof and gutter exterior'], [intakeAssets.gutterCare, 'Gutter care']],
  'garden-landscape-care': [[intakeAssets.garden, 'Garden care']],
  'outdoor-structures-fences-pools': [[intakeAssets.outdoor, 'Outdoor fence and structure']],
  'home-repairs-renovation-support': [[intakeAssets.repairs, 'Home repair and renovation interior']],
  'cleaning-removals-specialist-care': [[intakeAssets.cleaning, 'Household removals and cleaning']],
};
const serviceVisual = slug => serviceImages[slug] ? `<div class="service-visual-gallery">${serviceImages[slug].map(([src, alt]) => `<figure class="intake-visual service-visual"><img src="${src}" alt="${alt}" loading="lazy" decoding="async"></figure>`).join('')}</div>` : '';

page({ route: '/', title: 'Adelaide household-maintenance enquiries', description: site.description, schema: [{ '@type': 'WebSite', name: site.title, url: canonical('/'), description: site.description }, ...(published.faqs.length ? [faqSchema()] : [])], body: `<section class="hero-stage"><svg class="gold-route" aria-hidden="true" focusable="false" viewBox="0 0 900 720" preserveAspectRatio="none"><path d="M 20 250 L 390 28 L 800 276 L 744 276 L 744 614 L 120 614 L 120 720" pathLength="1"/></svg><div class="hero-grid wrap"><div class="hero-copy"><p class="eyebrow"><span class="marker" aria-hidden="true"></span> Adelaide · South Australia</p><h1>A little attention.<br><em>A better home.</em></h1><p class="lede">${escapeHtml(site.description)} Tell us what needs attention, and start a conversation.</p>${actions()}<p class="hero-footnote">Your home. Your notes. A clear place to start.</p></div><figure class="hero-figure"><img src="${hero}" alt="Adelaide home exterior and household-maintenance tools" width="1536" height="1024" fetchpriority="high"><figcaption><span>Adelaide home field notes</span></figcaption></figure></div></section><section class="section wrap"><div class="section-heading"><div><p class="eyebrow">Around the home</p><h2>What needs<br>your attention?</h2></div><p>Home maintenance starts with understanding the job. Share your request to discuss scope and availability.</p></div>${cards('services', published.services, 'Have a household-maintenance question? Start with a description of the work you have in mind.')}<a class="text-link section-link" href="/services/">Explore maintenance enquiries <span aria-hidden="true">↗</span></a></section><section class="process-section"><div class="wrap"><div class="section-heading"><div><p class="eyebrow">From a note to an enquiry</p><h2>Start simple.</h2></div><a class="text-link" href="/how-it-works/">How it works <span aria-hidden="true">↗</span></a></div>${processSteps}</div></section><section class="section wrap"><div class="section-heading"><div><p class="eyebrow">The notebook</p><h2>Good questions.<br>Useful reading.</h2></div><a class="text-link" href="/guides/">Open the field notes <span aria-hidden="true">↗</span></a></div>${cards('guides', published.guides.slice(0, 3), 'Field guides are being prepared. Our enquiry questions can help you gather the details for now.')}<a class="text-link section-link" href="/news/">View news <span aria-hidden="true">↗</span></a></section><section class="section faq-section wrap"><div><p class="eyebrow">Before you get in touch</p><h2>A few helpful<br>answers.</h2><a class="text-link" href="/faq/">All questions <span aria-hidden="true">↗</span></a></div>${faqList()}</section>${cta()}` });

const landing = {
  services: ['Maintenance enquiries', 'Home maintenance coordination in Adelaide', 'Describe your household-maintenance request and ask about scope and availability.', 'No individual service details are published yet. Contact MEL ONE with the work you have in mind.'],
  news: ['MEL ONE notebook', 'News & updates', 'Updates from the MEL ONE local website notebook.', 'There are no published updates yet. You can explore the enquiry questions or contact MEL ONE.'],
  guides: ['Adelaide home field notes', 'A useful place to start.', 'Practical reading to help you prepare a household-maintenance enquiry.', 'Field guides are being prepared. Visit the FAQ for useful enquiry details.'],
};
for (const [collection, [eyebrow, title, description, empty]] of Object.entries(landing)) {
  const route = `/${collection}/`;
  page({ route, title, description, crumbs: [['Home', '/'], [collection === 'services' ? 'Services' : collection === 'news' ? 'News' : 'Guides', route]], body: `${intro(eyebrow, title, description)}<section class="section wrap collection-section">${cards(collection, published[collection], empty)}</section>${cta()}` });
  for (const record of published[collection]) {
    const detailRoute = `${route}${record.slug}/`;
    const relatedServices = (record.relatedServices || []).filter(slug => published.services.some(item => item.slug === slug));
    const sections = (record.sections || []).map(section => `<section><h2>${escapeHtml(section.heading || section.title)}</h2>${(section.paragraphs || (section.body ? [section.body] : [])).map(text => `<p>${escapeHtml(text)}</p>`).join('')}${section.items ? list(section.items) : ''}</section>`).join('');
    const schema = collection === 'services' ? { '@type': 'Service', '@id': canonical(`${detailRoute}#service`), name: record.title, description: record.description, provider: { '@id': canonical('/#business') }, url: canonical(detailRoute) } : { '@type': 'Article', '@id': canonical(`${detailRoute}#article`), headline: record.title, description: record.description, mainEntityOfPage: canonical(detailRoute), inLanguage: 'en-AU', ...(record.date ? { datePublished: record.date } : {}), author: { '@id': canonical('/#business') }, publisher: { '@id': canonical('/#business') } };
    page({ route: detailRoute, title: record.title, description: record.description, schema: [schema], crumbs: [['Home', '/'], [collection === 'services' ? 'Services' : collection === 'news' ? 'News' : 'Guides', route], [record.title, detailRoute]], body: `<article>${intro(collection === 'services' ? 'Maintenance enquiry' : 'Adelaide home field notes', record.title, record.description)}${collection === 'services' ? `<div class="wrap">${serviceVisual(record.slug)}</div>` : ''}<div class="wrap article-layout"><div class="reading">${record.date ? `<p class="article-date">Published <time datetime="${escapeHtml(record.date)}">${escapeHtml(record.date)}</time></p>` : ''}${sections}<section><h2>${collection === 'services' ? 'What to discuss' : 'Key notes'}</h2>${list(record.scope)}</section>${record.exclusions.length ? `<section><h2>${collection === 'services' ? 'Scope boundaries' : 'Keep in mind'}</h2>${list(record.exclusions)}</section>` : ''}${relatedServices.length ? `<section><h2>Related maintenance enquiries</h2>${list(relatedServices.map(slug => published.services.find(item => item.slug === slug).title))}${relatedServices.map(slug => `<a class="text-link" href="/services/${slug}/">${escapeHtml(published.services.find(item => item.slug === slug).title)} ↗</a>`).join('')}</section>` : ''}</div><aside class="article-aside"><p class="eyebrow">Your next step</p><h2>Have a question?</h2><p>Include your suburb and a short description of the work.</p>${enquire()}</aside></div></article>${cta()}` });
  }
}

const method = site.method;
const methodFaqs = method.faqSlugs.map(slug => published.faqs.find(record => record.slug === slug)).filter(Boolean);
const workflowAlts = ['Home-maintenance request details', 'Home-maintenance scope discussion notes', 'Home-maintenance contact details'];
const methodSteps = `<ol class="method-steps">${method.steps.map((step, index) => `<li><article id="${escapeHtml(step.id)}" aria-labelledby="${escapeHtml(step.id)}-heading"><header><span class="step-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><h2 id="${escapeHtml(step.id)}-heading">${escapeHtml(step.heading)}</h2></header><div class="method-step-copy">${index < intakeAssets.workflow.length ? `<figure class="intake-visual workflow-visual"><img src="${intakeAssets.workflow[index]}" alt="${workflowAlts[index]}" loading="lazy" decoding="async"></figure>` : ''}${step.paragraphs.map(text => `<p>${escapeHtml(text)}</p>`).join('')}${step.id === 'confirm-scope' ? site.exclusions.map(text => `<p class="scope-note">${escapeHtml(text)}</p>`).join('') : ''}</div></article></li>`).join('')}</ol>`;
page({
  route: '/how-it-works/', title: method.title, description: method.description,
  crumbs: [['Home', '/'], [method.title, '/how-it-works/']],
  schema: methodFaqs.length ? [faqSchema(methodFaqs)] : [],
  body: `${intro('A clear starting point', method.title, method.description)}<div class="wrap method-start">${actions()}<nav class="method-nav" aria-label="On this page"><a href="#method-steps">The eight steps</a><a href="#method-preparation">Preparation checklist</a><a href="#method-expectations">What to expect</a>${methodFaqs.length ? '<a href="#method-faq-heading">Related questions</a>' : ''}</nav></div><section id="method-steps" class="section wrap method-section" aria-label="Household-maintenance enquiry steps">${methodSteps}</section><div class="method-notes"><div class="wrap method-notes-grid"><section id="method-preparation" aria-labelledby="method-preparation-heading"><h2 id="method-preparation-heading">${escapeHtml(method.preparation.heading)}</h2>${list(method.preparation.items)}</section><section id="method-expectations" aria-labelledby="method-expectations-heading"><h2 id="method-expectations-heading">${escapeHtml(method.expectations.heading)}</h2>${list(method.expectations.items)}</section></div></div>${methodFaqs.length ? `<section class="section faq-section wrap" aria-labelledby="method-faq-heading"><div><p class="eyebrow">Along the way</p><h2 id="method-faq-heading">Related questions</h2><a class="text-link" href="/faq/">All questions <span aria-hidden="true">↗</span></a></div>${faqList(methodFaqs)}</section>` : ''}${cta()}`,
});
const areaRoute = area => `/service-areas/${area.slug}/`;
const suburbRoute = (area, suburb) => `${areaRoute(area)}${suburb.slug}/`;
const slugify = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const areaSuburbs = area => {
  const known = new Map(area.suburbs.map(suburb => [suburb.name, suburb]));
  return area.popularSuburbs.map(name => known.get(name) || { slug: slugify(name), name, primaryService: 'handyman services', title: `Handyman Services in ${name}, Adelaide`, description: `Local handyman and home maintenance enquiries for ${name}, Adelaide.`, lead: `MEL ONE helps ${name} households organise practical home maintenance enquiries.`, localContext: area.context, services: ['Shower screen repairs and adjustments', 'Door, window and flyscreen repairs', 'Roof, gutter and exterior maintenance', 'Garden and property care', 'Fence and gate repairs', 'Cleaning and general handyman support'], faqs: [{ question: `Do you provide handyman services in ${name}?`, answer: `Yes. Tell us what needs attention, your address and preferred timing so availability can be discussed.` }, { question: `Can I include several ${name} maintenance jobs?`, answer: `Yes. Group indoor and outdoor tasks by area and explain which items are most important.` }, { question: 'How quickly can MEL ONE respond?', answer: 'Eligible enquiries may receive a response in as little as 30 minutes, subject to location, enquiry volume and availability.' }] });
};
const areaCards = areas => `<div class="card-grid">${areas.map(area => `<article class="note-card"><p class="eyebrow">Greater Adelaide</p><h2>${escapeHtml(area.name)}</h2><p>${escapeHtml(area.description)}</p><p class="eyebrow">Popular suburbs</p><ul class="plain-list">${areaSuburbs(area).map(suburb => `<li><a class="text-link" href="${suburbRoute(area, suburb)}">${escapeHtml(suburb.name)} — ${escapeHtml(suburb.primaryService)} <span aria-hidden="true">↗</span></a></li>`).join('')}</ul></article>`).join('')}</div>`;
const claimBlock = `<section><h2>Experienced local maintenance support</h2><p>MEL ONE has worked in the maintenance industry for more than ten years, with a standardised team process and experienced maintenance professionals. We assess visible issues carefully and explain practical next steps.</p><p>Eligible enquiries may receive a response in as little as 30 minutes, subject to location, enquiry volume and availability. More than 10,000 customers have trusted MEL ONE for practical maintenance support.</p></section>`;
const relatedServiceLinks = `<section><h2>Related maintenance services</h2><p><a class="text-link" href="/services/doors-windows-screens/">Doors, windows &amp; screens <span aria-hidden="true">↗</span></a></p><p><a class="text-link" href="/services/roof-gutter-exterior-care/">Roof, gutter &amp; exterior care <span aria-hidden="true">↗</span></a></p><p><a class="text-link" href="/services/home-repairs-renovation-support/">Home repairs &amp; renovation support <span aria-hidden="true">↗</span></a></p></section>`;
page({ route: '/service-areas/', title: 'Greater Adelaide handyman service areas', description: 'Find a Greater Adelaide area and suburb for handyman, home repair and maintenance enquiries.', body: `<section class="area-atlas"><div class="wrap"><figure class="area-atlas-hero"><img src="${intakeAssets.areas}" alt="Adelaide home maintenance service area" loading="eager" decoding="async"><figcaption>Greater Adelaide · local maintenance support</figcaption></figure>${intro('Greater Adelaide service atlas', 'Find your local maintenance area.', 'Choose a region, then go straight to a popular local suburb for practical handyman support.')}<label class="area-atlas-search" for="area-search"><span>Find a suburb</span><input id="area-search" type="search" placeholder="Try Norwood, Thebarton or Brighton" autocomplete="off"></label>${areaCards(serviceAreas)}</div></section>${cta()}` });
for (const area of serviceAreas) {
  for (const suburb of areaSuburbs(area)) {
    const route = suburbRoute(area, suburb);
    const modules = suburb.services.map(service => `<section><h2>${escapeHtml(service)} in ${escapeHtml(suburb.name)}</h2><p>${escapeHtml(suburb.localContext)} MEL ONE discusses scope, access and availability before work is arranged.</p></section>`).join('');
    const faqs = `<section class="section wrap faq-section"><div><p class="eyebrow">Local questions</p><h2>Helpful answers</h2></div>${faqList(suburb.faqs)}</section>`;
    const nearby = areaSuburbs(area).filter(item => item.slug !== suburb.slug).map(item => `<li><a class="text-link" href="${suburbRoute(area, item)}">${escapeHtml(item.name)} handyman services <span aria-hidden="true">↗</span></a></li>`).join('');
    const relatedSuburbs = nearby ? `<section><h2>Related popular suburbs</h2><ul class="plain-list">${nearby}</ul></section>` : '';
    const contactUrl = `/contact/?region=${encodeURIComponent(area.slug)}&suburb=${encodeURIComponent(suburb.slug)}`;
    const serviceSchema = { '@type': 'Service', '@id': canonical(`${route}#service`), name: suburb.title, description: suburb.description, provider: { '@id': business['@id'] }, areaServed: { '@type': 'City', name: `${suburb.name}, Adelaide` }, url: canonical(route) };
    page({ route, title: suburb.title, description: suburb.description, schema: [serviceSchema, faqSchema(suburb.faqs)], crumbs: [['Home', '/'], ['Service areas', '/service-areas/'], [area.name, '/service-areas/'], [suburb.name, route]], body: `${intro('Greater Adelaide handyman services', suburb.title, suburb.description)}<article class="section wrap reading"><p>${escapeHtml(suburb.lead)}</p><p>${escapeHtml(suburb.localContext)}</p>${claimBlock}${modules}${relatedServiceLinks}${relatedSuburbs}</article>${faqs}<section class="contact-band"><div class="wrap contact-band-inner"><div><p class="eyebrow">Book local maintenance</p><h2>Tell us about<br>your ${escapeHtml(suburb.name)} job.</h2></div><div><p>Share the work details and your preferred timing.</p><a class="button primary" href="${escapeHtml(contactUrl)}">Start an enquiry <span aria-hidden="true">↗</span></a></div></div></section>` });
  }
}
page({ route: '/faq/', title: 'Household-maintenance enquiry FAQ', description: 'Contact details and useful information for preparing a MEL ONE enquiry.', schema: published.faqs.length ? [faqSchema()] : [], body: `${intro('A few helpful answers', 'Before you get in touch.', 'Start with the details below, or contact MEL ONE with your question.')}<section class="section wrap reading">${faqList()}</section>${cta()}` });
const companyRecord = `<section class="section wrap split-section" id="company-record"><div><p class="eyebrow">Company and official record</p><h2>Company details<br>you can check.</h2></div><div class="reading"><p>The Australian Business Register is the official public source for MEL ONE company registration details. The records below are shown so customers can check the legal entity before arranging work.</p><dl class="company-record-grid"><div><dt>Legal entity</dt><dd>MEL ONE PROPERTY MAINTENANCE PTY LTD</dd></div><div><dt>Entity type</dt><dd>Australian Private Company</dd></div><div><dt>ABN</dt><dd>39 666 325 408</dd></div><div><dt>ACN</dt><dd>666 325 408</dd></div><div><dt>GST status</dt><dd>Registered</dd></div><div><dt>Official record</dt><dd><a class="text-link" href="https://abr.business.gov.au/ABN/View?abn=39666325408" target="_blank" rel="noopener noreferrer">Official ABN record <span aria-hidden="true">↗</span></a></dd></div></dl><p>The ABN record is a company-registration lookup, not a trade-licence or insurance policy. For job-specific questions about scope, contractor responsibilities or insurance evidence, contact MEL ONE before accepting a quote or booking work.</p></div></section>`;
page({ route: '/about/', title: site.about.title, description: site.about.description, body: `<article>${intro(site.title, site.about.title, site.about.description)}<div class="wrap"><figure class="intake-visual about-visual"><img src="${intakeAssets.about}" alt="Adelaide home-maintenance setting" loading="lazy" decoding="async"></figure></div>${site.about.sections.map(section => `<section class="section wrap split-section" id="${escapeHtml(section.id)}"><div><h2>${escapeHtml(section.heading)}</h2></div><div class="reading">${section.paragraphs.map(text => `<p>${escapeHtml(text)}</p>`).join('')}${section.id === 'contact' ? contactDetails() : ''}</div></section>`).join('')}${companyRecord}</article>${cta()}` });

const field = (name, label, type = 'text', extra = '') => `<label for="${name}">${label}<input id="${name}" name="${name}" type="${type}" ${extra}></label>`;
page({ route: '/contact/', title: 'Contact MEL ONE', description: `Discuss your Adelaide household-maintenance request with MEL ONE. Call ${contact.phone}.`, body: `${intro('Your next step', 'What needs attention?', 'A short description and your suburb are a useful place to begin.')}<section class="section wrap contact-layout"><div><p class="eyebrow">Contact MEL ONE</p><h2>Let’s talk<br>about your home.</h2>${contactDetails()}<div class="local-note"><h3>Send an enquiry</h3><p>Complete the form and MEL ONE will receive the details by email. If your request is urgent, please call.</p></div></div><form class="enquiry-form" data-enquiry-form novalidate><h2>Tell us about the job</h2><p>Share the useful details and the best way to get back to you.</p><label class="honeypot" aria-hidden="true" for="website">Leave this field empty<input id="website" name="website" type="text" tabindex="-1" autocomplete="off"></label>${field('name', 'Your name (optional)', 'text', 'autocomplete="name"')}<label for="message">What needs attention?<textarea id="message" name="message" rows="5" required aria-describedby="message-error"></textarea></label><p class="field-error" id="message-error"></p><div class="form-row">${field('suburb', 'Suburb or postcode', 'text', 'autocomplete="address-level2" required aria-describedby="suburb-error"')}${field('timing', 'Preferred timing (optional)')}</div><p class="field-error" id="suburb-error"></p><fieldset><legend>Preferred reply</legend><label class="radio-label"><input type="radio" name="contactPreference" value="phone" checked> Phone</label><label class="radio-label"><input type="radio" name="contactPreference" value="email"> Email</label></fieldset><div class="form-row">${field('phone', 'Phone', 'tel', 'autocomplete="tel" aria-describedby="phone-error"')}${field('email', 'Email', 'email', 'autocomplete="email" aria-describedby="email-error"')}</div><p class="field-error" id="phone-error"></p><p class="field-error" id="email-error"></p><button class="button primary" type="submit" data-enquiry-submit>Send enquiry <span aria-hidden="true">↗</span></button><noscript><p>Please call or email MEL ONE to send your enquiry.</p></noscript><p class="form-status" data-enquiry-status role="status" aria-live="polite"></p><p class="small">See <a href="/privacy/">how we use enquiry details</a>.</p></form></section>` });
page({ route: '/privacy/', title: 'Privacy for enquiries', description: 'How MEL ONE uses information submitted through the website enquiry form.', body: `${intro('Your enquiry details', 'A plain explanation.', 'How information submitted through the MEL ONE website is used.')}<article class="section wrap reading"><section><h2>Enquiry form</h2><p>When you submit the enquiry form, the information you provide is sent to MEL ONE by email so your request can be considered and a response can be provided. Your details are not stored in browser storage by this website.</p></section><section><h2>Contact details</h2><p>Your name, preferred contact method, suburb or postcode, timing and work description are used to respond to your enquiry. Please do not include sensitive financial, identity or access information in the form.</p></section><section><h2>Phone and email links</h2><p>These links open your chosen phone or email application. Any message you send through those applications is handled by that application and email provider.</p></section><section><h2>Analytics</h2><p>This website does not load third-party analytics or advertising scripts.</p></section><section><h2>Contact</h2>${contactDetails()}</section></article>` });
page({ route: '/404.html', title: 'Page not found', description: 'Return to the MEL ONE home page or contact MEL ONE with your enquiry.', noindex: true, body: `${intro('404 · A missing page', 'Let’s get you back home.', 'The page you requested is not available.')}<section class="section wrap"><a class="button primary" href="/">Back to home</a></section>` });

fs.writeFileSync(path.join(siteDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(({ route }) => `<url><loc>${escapeHtml(canonical(route))}</loc></url>`).join('')}</urlset>`);
fs.mkdirSync(path.join(siteDir, 'service-areas'), { recursive: true });
fs.writeFileSync(path.join(siteDir, 'service-areas', 'feed.json'), JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), regions: serviceAreas.map(area => ({ slug: area.slug, name: area.name, url: canonical(areaRoute(area)), suburbs: areaSuburbs(area).map(suburb => ({ slug: suburb.slug, name: suburb.name, primaryService: suburb.primaryService, url: canonical(suburbRoute(area, suburb)) })) })) }, null, 2));
fs.writeFileSync(path.join(siteDir, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${canonical('/sitemap.xml')}\n`);
fs.writeFileSync(path.join(siteDir, 'llms.txt'), `# ${site.title}\n\n> ${site.description}\n\n## Company contact\n\n- Phone: ${contact.phone}\n- Email: ${contact.email}\n- Contact address: ${contact.address}\n\n## Content context\n\nThis is MEL ONE’s Adelaide website. Service pages describe practical household-maintenance support. Availability, timing and specialist coordination are confirmed for each request. Field notes are original general guidance that helps customers prepare useful household-maintenance enquiries.\n\n## Pages\n\n${routes.map(({ route, title, description }) => `- [${title}](${canonical(route)}): ${description}`).join('\n')}\n`);
console.log(`MEL ONE website: ${routes.length + 1} pages generated in ${siteDir}`);
