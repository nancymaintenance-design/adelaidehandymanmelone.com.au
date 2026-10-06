const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const css = fs.readFileSync(path.join(process.cwd(), 'src/assets/css/site.css'), 'utf8');

test('published image components reserve or control their visible layout', () => {
  assert.match(css, /\.hero-figure img\s*\{[^}]*aspect-ratio:/);
  assert.match(css, /\.collection-section \.intake-visual\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*3/);
  assert.match(css, /\.service-visual-gallery \.service-visual img\s*\{[^}]*height:\s*100%[^}]*object-fit:\s*cover/);
  assert.match(css, /\.area-atlas-hero img\s*\{[^}]*height:/);
});
