// Evidence matching guards an authored semantic review; it does not infer intent from token presence.
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const normal = value => String(value || '').replace(/\s+/g, ' ').trim();
const statuses = ['answered-existing', 'answered-revised', 'qualified-education-only', 'withheld-pending-business-confirmation', 'out-of-confirmed-scope'];
const digest = row => crypto.createHash('sha256').update(JSON.stringify({ id: row.id, text: row.text, type: row.type, owner: row.owner, proposedOwnerRoute: row.proposedOwnerRoute, finalDisposition: row.finalDisposition, rationale: row.rationale, factsNeeded: row.factsNeeded, evidence: row.evidence, supportingSources: row.supportingSources })).digest('hex');

function verifySemanticReview({ rows, sourceRows, priorRows, pages, baseline }) {
  const issues = [];
  const original = new Map(sourceRows.map(r => [r.id, r]));
  const prior = new Map(priorRows.map(r => [r.id, r]));
  const expected = new Set(priorRows.filter(r => r.status === 'unverified').map(r => r.id));
  const current = new Map(pages.map(p => [p.route, p]));
  if (sourceRows.length !== 548 || original.size !== 548 || priorRows.length !== 548 || prior.size !== 548 || [...prior.keys()].some(id => !original.has(id))) issues.push('Original 548-row source/prior accounting mismatch');
  if (expected.size !== 319 || rows.length !== 319) issues.push('Expected exactly 319 reviewed IDs');
  const seen = new Set();
  const counts = Object.fromEntries(statuses.map(s => [s, 0]));
  for (const row of rows) {
    if (seen.has(row.id)) issues.push(`${row.id}: duplicate reviewed ID`);
    seen.add(row.id);
    if (!expected.has(row.id)) issues.push(`${row.id}: outside original unverified cohort`);
    const src = original.get(row.id), old = prior.get(row.id);
    if (!src || row.text !== (src.text || src.keyword) || row.type !== src.type || row.proposedOwnerRoute !== src.proposedOwnerRoute || old?.text !== row.text || (old?.owner && old.owner !== row.owner)) issues.push(`${row.id}: source identity mismatch`);
    if (!row.owner || !normal(row.rationale) || normal(row.rationale).length < 40) issues.push(`${row.id}: missing individual owner/rationale`);
    if (!statuses.includes(row.finalDisposition)) issues.push(`${row.id}: unsupported final disposition/status`);
    else counts[row.finalDisposition]++;
    if (row.reviewDigest !== digest(row)) issues.push(`${row.id}: reviewed identity/answer/rationale digest changed; requires semantic re-review`);
    if (!Array.isArray(row.supportingSources) || !row.supportingSources.length) issues.push(`${row.id}: missing evidence references`);
    const positive = ['answered-existing', 'answered-revised', 'qualified-education-only'].includes(row.finalDisposition);
    if (positive) {
      if (!row.evidence?.length) issues.push(`${row.id}: no reviewed answer evidence`);
      for (const evidence of row.evidence || []) {
        const page = current.get(evidence.route);
        const heading = page?.headings.find(h => h.text === evidence.headingOrQuestion);
        const faq = page?.faq.find(q => q.question === evidence.headingOrQuestion);
        const body = normal(evidence.surface === 'faq' ? faq?.answer : heading?.body);
        if (!body) issues.push(`${row.id}: current heading/FAQ answer missing: ${evidence.headingOrQuestion}`);
        if (normal(evidence.quote).length < 60 || !body.includes(normal(evidence.quote))) issues.push(`${row.id}: reviewed quote/excerpt is absent under its own heading/FAQ`);
        if (evidence.surface === 'faq' && !page?.schemaFaq.some(q => q.question === faq?.question && normal(q.answer) === normal(faq?.answer))) issues.push(`${row.id}: FAQ schema differs from visible answer`);
      }
    } else {
      if (!Array.isArray(row.factsNeeded) || !row.factsNeeded.length || row.factsNeeded.some(f => normal(f).length < 20)) issues.push(`${row.id}: missing precise pending fact/scope reason`);
      if (row.evidence?.length) issues.push(`${row.id}: pending claim must not carry positive answer evidence`);
    }
  }
  for (const id of expected) if (!seen.has(id)) issues.push(`${id}: missing reviewed ID`);
  for (const [route, h1] of Object.entries(baseline.h1)) {
    if (JSON.stringify(current.get(route)?.headings.filter(h => h.level === 1).map(h => h.text)) !== JSON.stringify(h1)) issues.push(`${route}: immutable H1 changed or missing`);
  }
  if (Object.keys(baseline.h1).length !== 102 || current.size !== 102) issues.push('Immutable H1 baseline/current route count must be 102');
  const reviewed = new Map(rows.map(r => [r.id, r]));
  const rollup = priorRows.map(old => {
    const row = reviewed.get(old.id);
    if (row) return { ...row, previousStatus: old.status, reviewCohort: 'previously-unverified' };
    return { ...old, finalDisposition: old.status, reviewCohort: old.status === 'heldServiceClaim' ? 'previously-held' : 'previously-observed' };
  });
  const observed = rollup.filter(r => r.reviewCohort === 'previously-observed').length;
  const held = rollup.filter(r => r.reviewCohort === 'previously-held').length;
  if (observed !== 135 || held !== 94 || rollup.length !== 548) issues.push('548 accounting must preserve separate prior 135 observed and 94 held outcomes');
  return { issues, reviewedCount: rows.length, counts, rollup, priorCohorts: { observed, held } };
}

function exportSemanticReview(result, reportDir) {
  fs.mkdirSync(reportDir, { recursive: true });
  const rows = result.rollup.filter(r => r.reviewCohort === 'previously-unverified');
  fs.writeFileSync(path.join(reportDir, 'semantic-review-319.json'), JSON.stringify(rows, null, 2));
  fs.writeFileSync(path.join(reportDir, 'semantic-rollup-548.json'), JSON.stringify({ counts: result.counts, priorCohorts: result.priorCohorts, issues: result.issues, rows: result.rollup }, null, 2));
  const md = ['# Individual semantic review — local candidate', '', 'Evidence is a manually adjudicated intent answer, checked against the current rendered heading/FAQ. Educational answers never authorise a service. Previous 135 observed and 94 held records remain separate in the 548 rollup.', '', ...rows.flatMap(r => [`## ${r.id} — ${r.text}`, '', `Type: ${r.type}; research owner: ${r.owner}; planned route: ${r.proposedOwnerRoute}; outcome: ${r.finalDisposition}.`, '', r.rationale, '', ...r.evidence.map(e => `- ${e.route} → ${e.headingOrQuestion} (${e.surface}): ${e.quote}`), ...r.factsNeeded.map(f => `- Missing fact / boundary: ${f}`), ...r.supportingSources.map(s => `- Reference: ${typeof s === 'string' ? s : s.url}`), ''])].join('\n');
  fs.writeFileSync(path.join(reportDir, 'semantic-review-319.md'), md);
  const pending = rows.filter(r => r.finalDisposition === 'withheld-pending-business-confirmation' || r.finalDisposition === 'out-of-confirmed-scope');
  const previouslyHeld = result.rollup.filter(r => r.reviewCohort === 'previously-held');
  fs.writeFileSync(path.join(reportDir, 'pending-business-facts.md'), ['# Pending business facts', '', `There are ${pending.length} newly reviewed pending claims plus ${previouslyHeld.length} previously held claims, separately traced below. Educational answers do not approve a related service.`, '', '## Newly adjudicated pending claims', '', ...pending.flatMap(r => [`### ${r.id} — ${r.text}`, '', r.rationale, '', ...r.factsNeeded.map(f => `- ${f}`), '']), '## Previously held cohort — original scope still withheld', '', ...previouslyHeld.flatMap(r => [`### ${r.id} — ${r.text || r.keyword}`, '', `Original owner: ${r.owner || '(see source map)'}. Confirm whether this service is actually accepted before publishing a provider claim.`, `- Required source evidence: ${r.evidenceNeeded || r.reason || 'Original held scope requires verified business acceptance and a named competent provider.'}`, `- Original boundary: ${r.boundary || r.note || 'No service promise from a research candidate.'}`, ''])].join('\n'));
}
module.exports = { verifySemanticReview, exportSemanticReview, digest, statuses };
