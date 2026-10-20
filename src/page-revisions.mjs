// Editorial provenance: task-2-report.md (2026-10-13); Oct12 release receipt.
// These are content dates, never dates of construction or a build-clock refresh.
export const pageRevisions = Object.fromEntries([
  ['/contact/', '2026-10-13'], // Approved suburb-query form prefill, final-fix-report.md.
  ...['cabinet-drawer-repair','sliding-door-repair','wall-patching-repair','pressure-cleaning'].map(slug => [`/services/${slug}/`, '2026-10-13']),
  ...['cbd-north-adelaide/adelaide-cbd','cbd-north-adelaide/bowden','eastern-suburbs/burnside','inner-south/unley','inner-south/goodwood','inner-south/parkside','inner-west/brompton','western-suburbs/glenelg','southern-suburbs/marion'].map(slug => [`/service-areas/${slug}/`, '2026-10-13']),
  ...['kitchen-drawer-runner-repair','sliding-patio-door-roller-track-repair'].map(slug => [`/case-studies/${slug}/`, '2026-10-12']),
  // Reviewed text and contextual links only; these are not job completion dates.
  ...['sliding-door-repair','door-repair','cabinet-drawer-repair','wall-patching-repair','fence-gate-repair','flyscreen-repair','flat-pack-assembly','pressure-cleaning','gutter-cleaning'].map(slug => [`/services/${slug}/`, '2026-10-20']),
  ...['sliding-patio-door-roller-track-repair','marion-wardrobe-sliding-door-repair','north-adelaide-door-repair','unley-kitchen-cabinet-repair','kitchen-drawer-runner-repair','goodwood-wall-repair','adelaide-cbd-wall-repair','mile-end-fence-repair','modbury-timber-fence-repair-assessment','north-adelaide-timber-gate-repair','norwood-flyscreen-repair','henley-beach-sliding-screen-door-repair','kensington-furniture-assembly','stirling-flat-pack-wardrobe-assembly','burnside-driveway-pressure-cleaning','prospect-gutter-cleaning'].map(slug => [`/case-studies/${slug}/`, '2026-10-20']),
  ['/service-areas/north-north-east/modbury/', '2026-10-20']
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
