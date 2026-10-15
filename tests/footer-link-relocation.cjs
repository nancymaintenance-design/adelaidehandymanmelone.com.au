const assert = require('node:assert/strict');
const { digest } = require('../scripts/local-audit-semantic-deltas.cjs');

const socialLinks = [
  ['https://share.google/bnkU7OE83VYCSh44T', 'Google Reviews'],
  ['https://www.instagram.com/melone.maintenance1/', 'Instagram'],
  ['https://www.youtube.com/@MelOneMaintenance', 'YouTube'],
  ['https://www.tiktok.com/@melonemaintenance5', 'TikTok'],
];
const brandLink = ['/', 'MEL ONE.'];
const caseDataLink = ['/case-studies/feed.json', 'Case data (JSON)'];
const matches = (left, right) => left[0] === right[0] && left[1] === right[1];

function uniqueIndex(links, expected) {
  const indexes = links.flatMap((link, index) => matches(link, expected) ? [index] : []);
  assert.equal(indexes.length, 1, `Expected exactly one unchanged link: ${expected.join(' | ')}`);
  return indexes[0];
}

// Restore only the four approved links to their earlier position. The caller
// compares the complete result with an independently locked earlier snapshot.
function restoreFooterLinkOrder(current) {
  const links = current.map(link => [...link]);
  for (const link of socialLinks) {
    uniqueIndex(links, link);
    assert.equal(links.filter(([href]) => href === link[0]).length, 1, `Duplicate social URL: ${link[0]}`);
  }
  const brandIndex = uniqueIndex(links, brandLink);
  assert.deepEqual(links.slice(brandIndex + 1, brandIndex + 5), socialLinks, 'Social links must remain one ordered block immediately after the footer brand');
  links.splice(brandIndex + 1, socialLinks.length);
  const feedIndex = uniqueIndex(links, caseDataLink);
  assert.ok(feedIndex > brandIndex, 'Footer feed links must follow the brand');
  links.splice(feedIndex, 0, ...socialLinks.map(link => [...link]));
  return links;
}

function verifyFooterLinkRelocation(current, previousHash) {
  const restored = restoreFooterLinkOrder(current);
  assert.equal(digest(restored), previousHash, 'Only the exact four-link footer relocation is approved; all other links and ordering must stay unchanged');
  return restored;
}

module.exports = { socialLinks, brandLink, caseDataLink, restoreFooterLinkOrder, verifyFooterLinkRelocation };
