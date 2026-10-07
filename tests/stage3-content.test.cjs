const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const fixture = require('./build-fixture.cjs');

test('published door guide explains component-specific screen repair choices and matching', t => {
  const built = fixture(t);
  const html = built.read('guides/field-notes-doors-windows-screens-enquiry/index.html');
  const main = html.match(/<main[\s\S]*?<\/main>/)[0];
  for (const heading of ['Describe what happens in normal use', 'Collect a clear, safe record', 'Arrange assessment and agree the repair']) assert.ok(main.includes(`<h2>${heading}</h2>`), `retain customer preparation and repair topic: ${heading}`);
  for (const pattern of [/sliding screen door/i, /rollers? and guides?/i, /track/i, /frame/i, /mesh/i, /security screen/i, /replacement parts/i, /repair.*replacement/i]) assert.match(main, pattern);
  assert.match(main, /glass is broken/);
  assert.match(main, /frame is unstable/);
  assert.match(main, /stop using/);
  assert.match(main, /Do not remove the door/);
  assert.ok((main.match(/<details>/g) || []).length >= 3, 'visible repair questions');
});
test('screen guide links to live service, preparation, real case and contact while privacy remains complete', t => {
  const built = fixture(t);
  const html = built.read('guides/field-notes-doors-windows-screens-enquiry/index.html');
  for (const route of ['/services/doors-windows-screens/', '/guides/prepare-household-maintenance-enquiry/', '/case-studies/henley-beach-sliding-screen-door-repair/', '/how-it-works/', '/contact/']) {
    assert.ok(html.includes(`href="${route}"`), route);
    assert.ok(fs.existsSync(path.join(built.output, route, 'index.html')), route);
  }
  const privacy = built.read('privacy/index.html');
  assert.match(privacy, /MEL ONE/);
  assert.match(privacy, /not stored in browser storage/);
  assert.match(privacy, /not to Google Analytics/);
});
