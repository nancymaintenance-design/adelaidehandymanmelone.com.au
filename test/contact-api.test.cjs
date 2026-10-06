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
    suburb: 'Norwood',
    timing: 'Weekdays',
    contactPreference: 'email',
    website: '',
  });

  assert.deepEqual(result, {
    value: {
      name: 'Alex Builder',
      phone: '0400 000 000',
      email: 'alex@example.com',
      message: 'I need a quote for custom storage.',
      suburb: 'Norwood',
      timing: 'Weekdays',
      contactPreference: 'email',
    },
  });
});

test('validateContact rejects incomplete, mismatched preference and bot submissions', () => {
  assert.match(validateContact({ name: '', phone: '', email: '', message: '', suburb: '', contactPreference: '', website: '' }).error, /project details|question/i);
  assert.match(validateContact({ name: 'Alex', phone: '', email: 'alex@example.com', message: 'Hello', suburb: 'Norwood', contactPreference: 'phone', website: '' }).error, /phone/i);
  assert.match(validateContact({ name: 'Alex', phone: '0400', email: 'alex@example.com', message: 'Hello', website: 'bot' }).error, /valid/i);
});

test('createEmailPayload routes a MEL ONE enquiry to the owner with reply-to set', () => {
  const payload = createEmailPayload({
    name: 'Alex Builder',
    phone: '0400 000 000',
    email: 'alex@example.com',
    message: 'I need a quote for custom storage.',
    suburb: 'Norwood',
    timing: 'Weekdays',
    contactPreference: 'email',
  }, 'MEL ONE <enquiries@adelaidecarpentryhub.com.au>');

  assert.deepEqual(payload.to, ['admin@melonemaintenance.com.au']);
  assert.equal(payload.reply_to, 'alex@example.com');
  assert.match(payload.subject, /Alex Builder/);
  assert.match(payload.html, /custom storage/);
});

test('published site uses its declared analytics and first-party enquiry endpoint', () => {
  const fixture = buildFixture(test, {
    GA4_MEASUREMENT_ID: 'G-TEST123456',
    GSC_VERIFICATION_TOKEN: 'token-123',
  });
  assert.match(fixture.read('index.html'), /googletagmanager\.com/);
  assert.match(fixture.read('index.html'), /G-9KMWMVLZ3/);
  assert.doesNotMatch(fixture.read('contact/index.html'), /action="(?:https?:|\/api\/)/);
  assert.match(fixture.read('assets/js/site.js'), /fetch\('\/api\/contact'/);
});
