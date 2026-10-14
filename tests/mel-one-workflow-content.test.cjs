const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const content = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/content-pack/mel-one-site-content.json'), 'utf8'));

function methodContent() {
  assert.ok(content.site.method, 'How it works needs a dedicated content contract');
  return content.site.method;
}

test('answer hub has five focused categories and a short four-step booking process', () => {
  const method = methodContent();
  assert.deepEqual(method.categories.map(c => c.id), ['fees-quotes','repair-replacement','parts-materials','booking-access','service-scope']);
  const questions = method.categories.flatMap(c => c.questions);
  assert.equal(questions.length, 22);
  assert.equal(new Set(questions.map(q => q.id)).size, 22);
  assert.ok(questions.every(q => q.answer.split(/\s+/).length >= 25 && q.sourceIds.length));
  assert.deepEqual(method.steps.map(s => s.id), ['prepare-request','confirm-scope','on-site-work','completion-next-steps']);
  const process = method.steps.flatMap(s => s.paragraphs).join(' ');
  assert.match(process, /safe existing photos/);
  assert.match(process, /assessment appointment.*checks the work on site.*written quote/);
  assert.match(process, /children and pets/);
  assert.match(process, /discuss and agree the change/);
  assert.match(process, /remaining concern/);
  assert.ok(process.split(/\s+/).length < 160);
});

test('workflow and FAQs retain confirmed contacts and exclude unsupported promises and trades', () => {
  const method = methodContent();
  const text = JSON.stringify([method, ...content.faqs]);
  assert.doesNotMatch(text, /\b(?:our licensed (?:team|staff|technicians)|insured|guaranteed?|same.day|next.day|24\/7|rapid|instant|fixed.price|free.quote|customer reviews?|testimonials?|always available|all suburbs|all jobs)\b/i);
  assert.doesNotMatch(text, /\$\s*\d|\b\d+\s*(?:years|customers|projects|staff)\b/i);
  const emails = text.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi) || [];
  assert.ok(emails.every(email => email === 'admin@melonemaintenance.com.au'));
  const mobiles = text.match(/\b04\d{2}[ -]?\d{3}[ -]?\d{3}\b/g) || [];
  assert.ok(mobiles.every(phone => phone === '0416 614 281'));
  assert.deepEqual(content.site.contact, {
    phone: '0416 614 281', email: 'admin@melonemaintenance.com.au', address: '63 Pirie St Adelaide SA 5000',
  });
});
