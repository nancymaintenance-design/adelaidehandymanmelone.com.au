# Verified business refinement

## Specification and global constraints

User confirms business hours seven days per week, 09:00–21:00 (Adelaide local time), and confirms existing website ABN and social profile links belong to the business. Continue SEO refinement locally only. No push, deployment, external account writes, new claims, new suburbs or redesign. Preserve unrelated files and earlier SEO improvements.

## Task 1: Consistent verified business facts

Own build.mjs, a small source business facts configuration under src/content-pack, and directly related tests. Single-source confirmed hours, legal name MEL ONE PROPERTY MAINTENANCE PTY LTD, ABN 39666325408, ACN 666325408, existing registry URL and social URLs from current footer. Render hours visibly in shared footer and contact/about context, with Adelaide local time explicit. Emit truthful LocalBusiness legalName, ABN as PropertyValue identifier and seven-day openingHoursSpecification opens09:00 closes21:00. sameAs includes existing Instagram, YouTube and TikTok profiles; keep Google Reviews short URL as a visible link but exclude from sameAs pending resolution to stable business profile. Preserve existing entity @id, phone/email/address and service region coverage. No new claims re holidays, walk-in availability, insurance, ratings,24-hour support. llms.txt should match confirmed hours and business identity. Existing negative tests banning openingHours must now check exact confirmed hours while retaining safeguards on unconfirmed facts. Add regression tests before implementation, show RED/GREEN, run focused tests then full npm test once. Build/check final generated output. Commit only owned task changes; do not commit public, node_modules, review or unrelated .gitignore. Self-review and write report to this plan's scratch task-1-report.md.

## Task 2: Read-only Google evidence

Investigate existing CLI credentials without exposing secrets or changing authentication/account configuration. Gather correct-site GSC/GA4 data if permitted; otherwise document precise read-only checks and blocker. Report docs/GOOGLE-CLI-CHECK-2026-10-10.md. Data reports never imply zero traffic when authentication fails.

## Task 3: Review and local handoff

Independent spec/quality review of task1, then final integration review. Verify local HTTP preview and write Chinese phase3 report including data limitations. Leave running local preview for user approval; no deployment.
