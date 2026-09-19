const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('contact-form email validator accepts a standard customer email address', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'assets', 'js', 'site.js'), 'utf8');
  const match = source.match(/!\/(.+?)\/\.test\(String\(values\.get\('email'\)\)\.trim\(\)\)/);
  assert.ok(match, 'the contact form must contain an email validator');

  const validator = new RegExp(match[1]);
  assert.equal(validator.test('nancy.maintenance@gmail.com'), true);
  assert.equal(validator.test('not-an-email'), false);
  assert.equal(validator.test('person@'), false);
});
