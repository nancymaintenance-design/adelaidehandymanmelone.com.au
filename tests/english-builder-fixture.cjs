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
  // Historical generator fixtures precede the homepage office composition.
  // Actual English/Chinese output is covered by test/home-office.test.mjs.
  source = source.replace("import { composeHomeOffice } from './src/home-office.mjs';", '').replace('composeHomeOffice({ siteDir });', '');
  // The new machine-data stage consumes final bilingual pages. These legacy
  // fixtures intentionally have no Chinese output or installed parser packages;
  // test/machine-readable.test.mjs covers the real post-bilingual build instead.
  const machineBlock = /if \(!process\.argv\.includes\('--i18n-extract'\)\) \{\r?\n  const machinePages = enhanceMachineData\([\s\S]*?\r?\n\}/;
  if (!machineBlock.test(source)) throw new Error('Machine-data fixture boundary changed; review the final-stage integration.');
  source = source.replace("import { enhanceMachineData } from './src/machine-readable.mjs';", '').replace(machineBlock, '');
  // Curated indexes consume final bilingual HTML; test/llms-*.test.mjs exercises
  // that real production stage, including invalid language/canonical inputs.
  source = source.replace("import { generateLlmsIndex } from './src/llms-index.mjs';", '');
  // Keep historical English link-order fixtures at their original stage. The
  // real 204-page service hierarchy is checked by service-navigation.test.mjs.
  source = source.replace("import { applyServiceNavigation } from './src/service-navigation.mjs';", '').replace(/^applyServiceNavigation\([^\r\n]+\);\r?\n/m, '');
  // Public citation removal is a final bilingual presentation policy. Keep the
  // historical source/evidence fixtures unchanged; actual output has its own test.
  source = source.replace("import { applyPublicReferencePolicy } from './src/public-reference-policy.mjs';", '').replace('applyPublicReferencePolicy({siteDir, routes});', '');
  // Historical English fixtures retain the pre-October-16 city-label contract.
  // The actual 204-page output is checked by test/local-labels.test.mjs.
  source = source.replace("import { applyLocalLabels } from './src/local-label-policy.mjs';", '').replace('applyLocalLabels({ siteDir, routes });', '');
  // Historical 102-page fixtures predate the October 21 rain-intent edit.
  // Actual new pages and edited services are covered by post-rain-content.test.mjs.
  source = source.replace("import { applyPostRainContent } from './src/post-rain-content.mjs';", '').replace('applyPostRainContent(content, focusedServices);', '');
  // Historical generator contracts predate this reviewed FAQ-only refinement.
  // Actual paired output and all 210 baseline page fields/layouts are protected
  // by test/semrush-content.test.mjs; there is no production bypass switch.
  source = source.replace("import { applySemrushContent } from './src/semrush-content-refinement.mjs';", '').replace('applySemrushContent(content, focusedServices);', '');
  // Original case preparation prose belongs to historical isolated fixtures.
  // The actual six paired P1 pages and unchanged 204 pages have dedicated checks.
  source = source.replace("import { applyP1LocalEntries } from './src/p1-local-entry.mjs';", '').replace('applyP1LocalEntries(content, localKeywordCopy);', '');
  // Historical isolated fixtures predate the P2 paragraph-only edit. Real output
  // is compared with all 210 released pages in p2-copy-concision.test.mjs.
  source = source.replace("import { applyP2CopyConcision } from './src/p2-copy-concision.mjs';", '').replace('applyP2CopyConcision(focusedServices);', '');
  // Actual eight follow-up pages have independent paragraph-only checks.
  source = source.replace("import { applyP1FollowupCopy } from './src/p1-followup-copy.mjs';", '').replace('applyP1FollowupCopy(content, focusedServices);', '');
  source = source.replace("import { applySeasonalCopyConcision } from './src/seasonal-copy-concision.mjs';", '').replace('applySeasonalCopyConcision(content, focusedServices);', '');
  source = source.replace("import { applyScreenWardrobeConcision } from './src/screen-wardrobe-concision.mjs';", '').replace('applyScreenWardrobeConcision(content);', '');
  source = source.replace("import { applyFrontDoorAssemblyConcision } from './src/front-door-assembly-concision.mjs';", '').replace('applyFrontDoorAssemblyConcision(content);', '');
  source = source.replace("import { applyCabinetGardenConcision } from './src/cabinet-garden-concision.mjs';", '').replace('applyCabinetGardenConcision(content);', '');
  source = source.replace("import { applyCaseComparisonContext } from './src/case-comparison-context.mjs';", '').replace('applyCaseComparisonContext(content);', '');
  fs.writeFileSync(path.join(fixture, 'build.mjs'), source);
};
