import fs from 'node:fs';
import { pageRevisions } from './page-revisions.mjs';
import { keywordPageCopy } from './keyword-led-content.mjs';

// Intent research informs the questions, not MEL ONE's capabilities or coverage.
// Applied after existing editorial stages so reviewed examples remain intact.
const reviewed = JSON.parse(fs.readFileSync(new URL('./content-pack/post-rain-content.json', import.meta.url), 'utf8'));
export const postRainRoutes = reviewed.news.map(item => `/news/${item.slug}/`);
export function applyPostRainContent(content, focusedServices) {
  keywordPageCopy['/faq/'].description = reviewed.faqDescription;
  const records = [...content.services, ...focusedServices];
  for (const [slug, edit] of Object.entries(reviewed.edits)) {
    const record = records.find(item => item.slug === slug);
    if (!record?.sections?.[1]?.paragraphs?.length || !record.sections[0]?.paragraphs?.length) {
      throw new Error(`Missing service introduction for reviewed edit: ${slug}`);
    }
    // Change only the repeated opening explanations; keep the second paragraphs
    // containing photographed evidence, links and the rest of the service scope.
    edit.introductions.forEach((paragraph, index) => { record.sections[index].paragraphs[0] = paragraph; });
    pageRevisions[`/services/${slug}/`] = reviewed.reviewDate;
  }
  for (const item of reviewed.faqs) content.faqs.push({ ...item, status: 'approved', title: item.question, description: item.answer, scope: [item.answer], exclusions: [] });
  for (const item of reviewed.news) {
    if (content.news.some(record => record.slug === item.slug)) throw new Error(`Duplicate post-rain article: ${item.slug}`);
    content.news.push(structuredClone(item));
  }
  for (const route of ['/', '/faq/', '/news/']) pageRevisions[route] = reviewed.reviewDate;
  const connections = {
    'gutter-cleaning': [0, 1], 'roof-gutter-exterior-care': [0, 1],
    'wall-patching-repair': [1, 0], 'home-repairs-renovation-support': [1, 0],
    'doors-windows-screens': [2, 0], 'fence-gate-repair': [4, 1],
    'cleaning-removals-specialist-care': [3, 0],
  };
  for (const [slug, [faqIndex, newsIndex]] of Object.entries(connections)) {
    const record = records.find(item => item.slug === slug);
    record.faqs.push({ question: reviewed.faqs[faqIndex].question, answer: reviewed.faqs[faqIndex].answer });
    record.sections.at(-1).links ||= [];
    record.sections.at(-1).links.push({ url: postRainRoutes[newsIndex], label: reviewed.news[newsIndex].title });
  }
}
