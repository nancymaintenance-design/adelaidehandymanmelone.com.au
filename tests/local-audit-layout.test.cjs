const test = require('node:test');
const assert = require('node:assert/strict');
const { run, mediaFailure, gridFailure } = require('../scripts/check-audit-media-grid.cjs');
let result;
test.before(async () => { result = await run(); });
test('service originals occupy at least 75% of their compact frame without crop or upscale', () => {
  assert.deepEqual(result.failures.media, []);
});
test('audited card counts have no tall unused final-row columns at desktop and narrow widths', () => {
  assert.deepEqual(result.failures.grids, []);
});
test('shared card composition retains responsive-image slot hints', () => {
  assert.deepEqual(result.failures.responsive, []);
});
test('all 102 approved H1 and original image bytes match the independent pre-remediation snapshot', () => {
  assert.deepEqual(result.failures.immutable, []);
});
test('shared media and cards create zero horizontal overflow down to 320px', () => {
  assert.deepEqual(result.failures.overflow, []);
});
test('geometry predicates reject letterboxing, upscaling, cropping and tall empty card columns', () => {
  const image = { loaded: true, width: 300, height: 225, naturalWidth: 600, naturalHeight: 450, blankRatio: 0, fit: 'contain' };
  assert.equal(mediaFailure(image), null);
  assert.match(mediaFailure({ ...image, blankRatio: .63 }), /blank area/);
  assert.match(mediaFailure({ ...image, width: 800, height: 600 }), /upscaled/);
  assert.match(mediaFailure({ ...image, fit: 'cover' }), /cropped/);
  const grid = { width: 1200, gap: 24, cards: [{ x: 0, y: 0, width: 1200, height: 700 }] };
  assert.equal(gridFailure(grid), null);
  assert.match(gridFailure({ ...grid, cards: [{ x: 0, y: 0, width: 384, height: 700 }] }), /unused/);
});
