const test = require('node:test');
const assert = require('node:assert/strict');
const buildFixture = require('../tests/build-fixture.cjs');

const { validateContact, createEmailPayload } = require('../api/contact.js');

test('validateContact accepts a complete enquiry', () => {
  const result = validateContact({
    name: 'Alex Builder',
    phone: '0400 000 000',
    email: 'alex@example.com',
    message: 'I need a quote for custom storage.',
    website: '',
  });

  assert.deepEqual(result, {
    value: {
      name: 'Alex Builder',
      phone: '0400 000 000',
      email: 'alex@example.com',
      message: 'I need a quote for custom storage.',
    },
  });
});

test('validateContact rejects incomplete and bot submissions', () => {
  assert.match(validateContact({ name: '', phone: '', email: '', message: '', website: '' }).error, /name/i);
  assert.match(validateContact({ name: 'Alex', phone: '0400', email: 'alex@example.com', message: 'Hello', website: 'bot' }).error, /valid/i);
});

test('createEmailPayload routes a MEL ONE enquiry to the owner with reply-to set', () => {
  const payload = createEmailPayload({
    name: 'Alex Builder',
    phone: '0400 000 000',
    email: 'alex@example.com',
    message: 'I need a quote for custom storage.',
  }, 'MEL ONE <enquiries@adelaidecarpentryhub.com.au>');

  assert.deepEqual(payload.to, ['handymanfelix.au2026@outlook.com']);
  assert.equal(payload.reply_to, 'alex@example.com');
  assert.match(payload.subject, /Alex Builder/);
  assert.match(payload.html, /custom storage/);
});

test('local candidate remains free from analytics and external form submission', () => {
  const fixture = buildFixture(test, {
    GA4_MEASUREMENT_ID: 'G-TEST123456',
    GSC_VERIFICATION_TOKEN: 'token-123',
  });
  assert.doesNotMatch(fixture.read('index.html'), /googletagmanager\.com|google-site-verification/);
  assert.doesNotMatch(fixture.read('contact/index.html'), /action="(?:https?:|\/api\/)/);
  assert.doesNotMatch(fixture.read('assets/js/site.js'), /fetch\s*\(|XMLHttpRequest|sendBeacon|\/api\/contact/);
});
