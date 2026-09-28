const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

test('Vercel deploys the current generated public site', () => {
  const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'vercel.json'), 'utf8'));
  assert.equal(config.buildCommand, 'node build.mjs');
  assert.equal(config.outputDirectory, 'public');
});
