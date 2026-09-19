const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const content = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/content-pack/mel-one-site-content.json'), 'utf8'));

function methodContent() {
  assert.ok(content.site.method, 'How it works needs a dedicated content contract');
  return content.site.method;
}

test('workflow contract gives customers eight substantial steps from request to completion', () => {
  const method = methodContent();
  assert.ok(method.title && method.description);
  assert.deepEqual(method.steps.map(step => step.id), [
    'prepare-request', 'group-jobs', 'initial-discussion', 'specialist-boundary',
    'confirm-scope', 'prepare-visit', 'on-site-work', 'completion-next-steps',
  ]);
  for (const step of method.steps) {
    assert.ok(step.heading && step.paragraphs.length >= 2, `${step.id} needs a clear heading and detailed guidance`);
    assert.ok(step.paragraphs.join(' ').split(/\s+/).length >= 55, `${step.id} must explain the customer's next action`);
  }
  const stepText = id => method.steps.find(step => step.id === id).paragraphs.join(' ');
  assert.match(stepText('prepare-request'), /photos.*safe|safe.*photos/i);
  assert.match(stepText('group-jobs'), /room|outdoor area/i);
  assert.match(stepText('initial-discussion'), /access.*materials|materials.*access/i);
  assert.match(stepText('specialist-boundary'), /electrical.*structural.*formal approvals/i);
  assert.match(stepText('specialist-boundary'), /appropriately qualified external specialist/i);
  assert.match(stepText('confirm-scope'), /before.*schedul/i);
  assert.match(stepText('prepare-visit'), /pets|children/i);
  assert.match(stepText('on-site-work'), /change.*agree|agree.*change/i);
  assert.match(stepText('completion-next-steps'), /remaining|outstanding/i);
});

test('workflow includes practical preparation and conditional expectations', () => {
  const method = methodContent();
  for (const section of [method.preparation, method.expectations]) {
    assert.ok(section?.heading && section.items.length >= 6);
    assert.ok(section.items.every(item => typeof item === 'string' && item.split(/\s+/).length >= 10));
  }
  const checklist = method.preparation.items.join(' ');
  assert.match(checklist, /suburb|postcode/i);
  assert.match(checklist, /photos/i);
  assert.match(checklist, /parts|instructions/i);
  assert.match(checklist, /approve|permission/i);
  assert.match(checklist, /access/i);
  assert.match(method.expectations.items.join(' '), /enquiry.*not.*booking/i);
  assert.match(method.expectations.items.join(' '), /availability/i);
  assert.match(method.expectations.items.join(' '), /quote/i);
});

test('workflow resolves at least six approved FAQs covering practical customer questions', () => {
  const method = methodContent();
  assert.ok(method.faqSlugs.length >= 6);
  assert.equal(new Set(method.faqSlugs).size, method.faqSlugs.length);
  for (const slug of method.faqSlugs) {
    const faq = content.faqs.find(record => record.slug === slug);
    assert.ok(faq?.status === 'approved' && faq.question && faq.answer, `Missing approved FAQ ${slug}`);
    assert.ok(faq.answer.split(/\s+/).length >= 25, `${slug} needs a useful answer`);
  }
  for (const slug of ['multiple-home-jobs', 'specialist-work-enquiries', 'confirm-before-scheduling', 'materials-and-parts', 'prepare-for-visit', 'changes-during-work', 'completion-follow-up']) {
    assert.ok(method.faqSlugs.includes(slug), `Workflow needs guidance for ${slug}`);
  }
});

test('workflow and FAQs retain confirmed contacts and exclude unsupported promises and trades', () => {
  const method = methodContent();
  const text = JSON.stringify([method, ...content.faqs]);
  assert.doesNotMatch(text, /\b(?:plumb(?:ing|er)|gas|licen[cs]ed?|insured|guaranteed?|same.day|next.day|24\/7|rapid|instant|fixed.price|free.quote|customer reviews?|testimonials?|our (?:team|staff|technicians)|always available|all suburbs|all jobs)\b/i);
  assert.doesNotMatch(text, /\$\s*\d|\b\d+\s*(?:years|customers|projects|staff)\b/i);
  const emails = text.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi) || [];
  assert.ok(emails.every(email => email === 'admin@melonemaintenance.com.au'));
  const mobiles = text.match(/\b04\d{2}[ -]?\d{3}[ -]?\d{3}\b/g) || [];
  assert.ok(mobiles.every(phone => phone === '0416 614 281'));
  assert.deepEqual(content.site.contact, {
    phone: '0416 614 281', email: 'admin@melonemaintenance.com.au', address: '63 Pirie St Adelaide SA 5000',
  });
});
