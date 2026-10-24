// A scoped visual addition: existing case photographs, original header copy intact.
export const titlePhotoSelection = {
  '/guides/': ['unley-kitchen-cabinet-repair', 2],
  '/news/': ['prospect-gutter-cleaning', 1],
  '/services/': ['goodwood-wall-repair', 2],
  '/case-studies/': ['unley-kitchen-cabinet-repair', 2],
  '/contact/': ['unley-kitchen-cabinet-repair', 2],
  '/faq/': ['goodwood-wall-repair', 2],
  '/service-standards/': ['goodwood-wall-repair', 2],
  '/how-it-works/': ['unley-kitchen-cabinet-repair', 2],
};

export function addTitlePhoto(html, route, cases, manifest, escapeHtml) {
  const selection = titlePhotoSelection[route];
  if (!selection) return html;
  const image = cases.find(record => record.slug === selection[0])?.images[selection[1]];
  const meta = image && manifest[image.src];
  if (!meta) throw new Error('Missing title photograph for ' + route);
  let matched = false;
  const result = html.replace(/(<header class="(?:page-intro wrap|wrap answer-hero)">)([^]*?)(<\/header>)/, (_, open, content, close) => {
    matched = true;
    return `${open}<div class="title-photo-copy">${content}</div><figure class="title-theme-photo"><img data-image-layout="title-theme" src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" width="${meta.width}" height="${meta.height}" loading="eager" decoding="async"></figure>${close}`;
  });
  if (!matched) throw new Error('Missing title header for ' + route);
  return result;
}
