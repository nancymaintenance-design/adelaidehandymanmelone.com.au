// Editorial provenance: task-2-report.md (2026-10-13); Oct12 release receipt.
// These are content dates, never dates of construction or a build-clock refresh.
export const pageRevisions = Object.fromEntries([
  ...['cabinet-drawer-repair','sliding-door-repair','wall-patching-repair','pressure-cleaning'].map(slug => [`/services/${slug}/`, '2026-10-13']),
  ...['cbd-north-adelaide/adelaide-cbd','cbd-north-adelaide/bowden','eastern-suburbs/burnside','inner-south/unley','inner-south/goodwood','inner-south/parkside','inner-west/brompton','western-suburbs/glenelg','southern-suburbs/marion'].map(slug => [`/service-areas/${slug}/`, '2026-10-13']),
  ...['kitchen-drawer-runner-repair','sliding-patio-door-roller-track-repair'].map(slug => [`/case-studies/${slug}/`, '2026-10-12'])
]);
export function validateEditorialDate(date, published, today = new Date().toISOString().slice(0,10)) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,10) !== date) throw new Error(`Invalid editorial date: ${date}`);
  if (date > today) throw new Error(`Future editorial date: ${date}`);
  if (published) {
    validateEditorialDate(published, undefined, today);
    if (date < published) throw new Error('Modification precedes publication');
  }
  return date;
}
