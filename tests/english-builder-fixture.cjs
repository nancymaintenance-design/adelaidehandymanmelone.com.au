const fs = require('node:fs');
const path = require('node:path');

// Legacy tests deliberately mutate English prose and assert the original
// 102-page generator contract. Isolate that stage in temporary test copies;
// test/bilingual*.test.mjs verifies the actual production bilingual build.
// No production flag or environment variable can bypass translation validation.
module.exports = function copyEnglishBuilder(root, fixture) {
  let source = fs.readFileSync(path.join(root, 'build.mjs'), 'utf8');
  const declaration = "import { renderBilingual } from './src/i18n/bilingual.mjs';";
  const call = "renderBilingual({ siteDir, routes, origin, extract: process.argv.includes('--i18n-extract') });";
  if (!source.includes(declaration) || !source.includes(call)) throw new Error('English fixture boundary changed; review the bilingual build integration.');
  source = source.replace(declaration, '').replace(call, '');
  // Historical English fixtures retain the pre-October-16 city-label contract.
  // The actual 204-page output is checked by test/local-labels.test.mjs.
  source = source.replace("import { applyLocalLabels } from './src/local-label-policy.mjs';", '').replace('applyLocalLabels({ siteDir, routes });', '');
  fs.writeFileSync(path.join(fixture, 'build.mjs'), source);
};
