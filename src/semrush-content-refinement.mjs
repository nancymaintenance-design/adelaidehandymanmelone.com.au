import fs from 'node:fs';
import { pageRevisions } from './page-revisions.mjs';

// Reviewed customer questions only. Exported query lists/metrics are private
// research; they do not establish services, coverage, pricing or capabilities.
export const semrushContent = JSON.parse(fs.readFileSync(new URL('./content-pack/semrush-content-refinement.json', import.meta.url), 'utf8'));
export function applySemrushContent(content, focusedServices) {
  for (const [collection, edits] of Object.entries({ services: semrushContent.services, guides: semrushContent.guides })) {
    const records = collection === 'services' ? [...content.services, ...focusedServices] : content.guides;
    for (const [slug, questions] of Object.entries(edits)) {
      const record = records.find(item => item.slug === slug);
      if (!Array.isArray(record?.faqs)) throw new Error(`Missing Semrush review target: ${collection}/${slug}`);
      for (const { replaces, question, answer } of questions) {
        if (record.faqs.some(item => item.question === question)) throw new Error(`Duplicate reviewed FAQ: ${question}`);
        if (replaces) {
          const matches = record.faqs.map((item,index) => item.question === replaces ? index : -1).filter(index => index >= 0);
          if (matches.length !== 1) throw new Error(`Semrush FAQ source drift: ${slug}: ${replaces}`);
          record.faqs[matches[0]] = { question, answer };
        } else record.faqs.push({ question, answer });
      }
      pageRevisions[`/${collection}/${slug}/`] = semrushContent.reviewDate;
      if (collection === 'guides') {
        record.contentReviewDate = semrushContent.reviewDate;
      }
    }
  }
}
