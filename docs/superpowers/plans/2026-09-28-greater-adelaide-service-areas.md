# Greater Adelaide Service Areas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a searchable, data-driven Greater Adelaide service-area system with useful region and suburb pages, location-aware enquiries, validated search metadata and a public service directory.

**Architecture:** A new source data module describes eight regions and their approved suburbs. `build.mjs` validates that module, generates the service-area index, region and suburb pages, and derives sitemap, JSON feed, visible internal links and matching JSON-LD from the same records. Small browser-side code powers the index search and contact-page query prefills; generated HTML remains usable without JavaScript.

**Tech Stack:** Node.js 22 static-site generator, Node built-in test runner, vanilla JavaScript, HTML, CSS, JSON-LD.

**Spec:** `docs/superpowers/specs/2026-09-28-greater-adelaide-service-areas-design.md`

## Global Constraints

- Coverage is Greater Adelaide only; Canberra and Aranda must not appear in generated content, search data, feeds or routes.
- Use the confirmed business claims exactly as conditional public information: 10+ years in maintenance, standardised team, experienced maintenance professionals, diagnosis process, response in as little as 30 minutes subject to location/enquiry volume/availability, and 10,000+ customers served.
- Do not promise attendance, same-day completion, all-suburb availability, quotes, licences, insurance, regulated-trade work or outcomes that are not verified.
- All structured data must match visible page content; do not add hidden text, hidden keyword stuffing or invisible schema facts.
- Keep existing contact delivery behaviour intact; enhanced location context cannot add an external endpoint or browser storage.
- Production is built from `build.mjs`, not from ZIP archive contents.

## Review Focus

- A partial service-name search such as `shower screen` returns an actual published suburb result without creating an arbitrary URL; pin in Task 4.
- A query containing unsupported location `Aranda` produces no location page or fabricated result and offers the contact path; pin in Task 4.
- Duplicate suburb slugs, orphan records and duplicate canonicals fail the build before output is produced; pin in Task 1.
- JSON-LD can be parsed and only repeats visible title, FAQ, service and geographic facts; pin in Task 3.
- A direct visit to `/contact/?region=...&suburb=...` retains safe form values and a malformed query does not inject HTML; pin in Task 4.

---

## File structure

- `src/content-pack/service-areas.json` — approved Greater Adelaide region/suburb/service/FAQ records; the single source for generated location content.
- `build.mjs` — validates location data; produces area pages, feed, schemas, route inventory, contact form context and sitemap/LLMS references.
- `src/assets/js/site.js` — filters the visible service-area search index and safely pre-fills the contact form from allowed query data.
- `src/assets/css/site.css` — styles accessible search, region/suburb cards, service modules, FAQ blocks and location-aware contact panel.
- `tests/mel-one-service-areas.test.cjs` — tests content validation, generated routes, visible content, schema, feed, search source markup and negative geography cases.
- `tests/mel-one-routes.test.cjs` — updates expected public route and sitemap behavior where service-area pages are included.
- `tests/mel-one-seo.test.cjs` — verifies unique metadata/canonicals and production-safe structured data for generated location pages.
- `tests/mel-one-workflow-content.test.cjs` — adjusts the claim guard to permit only the confirmed, conditional business facts in the new location data while continuing to reject unsupported promises/trades.

## Tasks

### Task 1: Add validated Greater Adelaide content data

**Files:**
- Create: `src/content-pack/service-areas.json`
- Modify: `build.mjs:9-30`
- Create: `tests/mel-one-service-areas.test.cjs`
- Modify: `tests/build-fixture.cjs:10-19`
- Modify: `tests/mel-one-workflow-content.test.cjs`

**Interfaces:**
- Consumes: approved business/contact data from `src/content-pack/mel-one-site-content.json`.
- Produces: `serviceAreas: Area[]`, where `Area = { slug, name, description, context, suburbs: Suburb[] }` and `Suburb = { slug, name, primaryService, title, description, lead, localContext, services, faqs }`.
- Produces: `validateServiceAreas(serviceAreas: Area[]): void`, which throws for invalid area/suburb records.

- [ ] **Step 1: Write failing validation tests**

Add tests asserting eight named Greater Adelaide regions, unique region/suburb slugs, no `Aranda`/`Canberra`, required non-empty visible copy, and failures for duplicate suburb slugs, missing primary service, missing FAQ answer and an orphan/duplicate canonical input.

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `node --test tests/mel-one-service-areas.test.cjs`

Expected: FAIL because the location data module and validator do not exist.

- [ ] **Step 3: Create the approved location data and validator**

Create eight records: `cbd-north-adelaide`, `eastern-suburbs`, `inner-south`, `inner-west`, `western-suburbs`, `north-north-east`, `adelaide-hills-foothills`, and `southern-suburbs`. Add an initial curated coverage set of materially distinct suburb records within those regions, each with a unique core service phrase, 3–5 visible FAQs and the six approved service modules. Make `build.mjs` read the JSON and validate it before it creates output.

- [ ] **Step 4: Extend test fixtures to copy the new source module**

Modify `tests/build-fixture.cjs` so isolated builds copy all `src` content and permit location fixtures to be adjusted safely.

- [ ] **Step 5: Update claim-safety tests**

Update the guard in `tests/mel-one-workflow-content.test.cjs` to permit the exact confirmed claims in this location dataset while preserving rejections for unverified licences, insurance, prices, guarantees, same-day claims, regulated trades and reviews.

- [ ] **Step 6: Run the targeted tests to verify they pass**

Run: `node --test tests/mel-one-service-areas.test.cjs tests/mel-one-workflow-content.test.cjs`

Expected: PASS; invalid fixtures produce the intended validation error and approved data contains no out-of-scope geography.

- [ ] **Step 7: Commit**

```bash
git add src/content-pack/service-areas.json build.mjs tests/build-fixture.cjs tests/mel-one-service-areas.test.cjs tests/mel-one-workflow-content.test.cjs
git commit -m "feat: add validated Greater Adelaide area data"
```

### Task 2: Generate region, suburb and contact-context pages

**Files:**
- Modify: `build.mjs:91-116, service-area generation section, contact-page generation section`
- Modify: `tests/mel-one-service-areas.test.cjs`
- Modify: `tests/mel-one-routes.test.cjs`

**Interfaces:**
- Consumes: `serviceAreas: Area[]` and `validateServiceAreas()` from Task 1.
- Produces: generated `/service-areas/`, `/service-areas/{region}/`, `/service-areas/{region}/{suburb}/` HTML and `contactForm({ region?: string, suburb?: string }): string`.
- Produces: visible region/suburb cards, breadcrumbs, six service modules, business-method block, FAQ block and a contact link/form context.

- [ ] **Step 1: Write failing generated-page tests**

Assert that the index lists all eight regions, each region links only to its approved suburbs, every suburb route exists, every suburb page has one location-specific H1, six service-module headings, visible confirmed-claim caveats, 3–5 visible FAQ entries, breadcrumbs and a bottom enquiry route containing encoded region/suburb values.

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `node --test tests/mel-one-service-areas.test.cjs tests/mel-one-routes.test.cjs`

Expected: FAIL because only the legacy single service-areas page exists.

- [ ] **Step 3: Implement reusable location render helpers**

In `build.mjs`, add small helpers for location breadcrumbs, region cards, suburb cards, location service modules, visible FAQ details, confirmed-claims disclosure and a context-aware contact action/form. Use escaped text in every source-derived HTML insertion.

- [ ] **Step 4: Generate the three-level information architecture**

Replace the legacy service-area page with the index, then iterate approved area records to create region and suburb pages. Preserve no-JavaScript access to every region and suburb via links. Update the contact page so allowed `region`/`suburb` query values are represented safely and the existing form fields/delivery behavior remain intact.

- [ ] **Step 5: Run the targeted tests to verify they pass**

Run: `node --test tests/mel-one-service-areas.test.cjs tests/mel-one-routes.test.cjs`

Expected: PASS; all only-approved routes are generated and form context is present without any external form action.

- [ ] **Step 6: Commit**

```bash
git add build.mjs tests/mel-one-service-areas.test.cjs tests/mel-one-routes.test.cjs
git commit -m "feat: generate Adelaide region and suburb pages"
```

### Task 3: Add matching metadata, JSON-LD and service directory

**Files:**
- Modify: `build.mjs:97-108, sitemap/llms output section`
- Modify: `tests/mel-one-seo.test.cjs`
- Modify: `tests/mel-one-service-areas.test.cjs`

**Interfaces:**
- Consumes: generated area/suburb route data from Task 2.
- Produces: `locationSchemas({ area, suburb, route }): object[]`, `/service-areas/feed.json`, and sitemap/LLMS entries derived from published routes.

- [ ] **Step 1: Write failing schema/feed tests**

Add tests that parse a representative suburb page JSON-LD and assert one each of `LocalBusiness`, `WebPage`, `Service`, `FAQPage` and `BreadcrumbList`; assert service/FAQ names equal visible page text. Assert feed JSON contains published canonical routes once, excludes `Aranda`/`Canberra`, and sitemap/LLMS contain every generated location route once.

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `node --test tests/mel-one-seo.test.cjs tests/mel-one-service-areas.test.cjs`

Expected: FAIL because location pages have no derived structured data or feed.

- [ ] **Step 3: Implement location metadata and schemas**

Create each page title, meta description and canonical from the relevant suburb record. Add `Service`, `FAQPage` and `BreadcrumbList` entries only from visible content, reusing the existing business and webpage schema. Ensure each title and description is unique before calling `page()`.

- [ ] **Step 4: Generate the public service directory and crawler indexes**

Write `/service-areas/feed.json` from the same approved records, with `version`, generated canonical origin, regions, suburbs, supported services and canonical URLs. Add every indexable location route to sitemap and LLMS output through the existing route collection rather than a second list.

- [ ] **Step 5: Run the targeted tests to verify they pass**

Run: `node --test tests/mel-one-seo.test.cjs tests/mel-one-service-areas.test.cjs`

Expected: PASS; all structured data parses and agrees with visible copy, and derived directory/indexes are complete and unique.

- [ ] **Step 6: Commit**

```bash
git add build.mjs tests/mel-one-seo.test.cjs tests/mel-one-service-areas.test.cjs
git commit -m "feat: add location schemas and service feed"
```

### Task 4: Build accessible location search and query prefilling

**Files:**
- Modify: `build.mjs:service-area index and contact-page generation section`
- Modify: `src/assets/js/site.js`
- Modify: `src/assets/css/site.css`
- Modify: `tests/mel-one-service-areas.test.cjs`
- Modify: `test/form-validation.test.cjs`

**Interfaces:**
- Consumes: server-rendered search records with `data-area-search-item`, canonical href and normalised keyword text; location query parameters `region` and `suburb`.
- Produces: keyboard-accessible filtered area/suburb results, no-result contact guidance, and safe client-side form prefill.

- [ ] **Step 1: Write failing search and prefill tests**

Add static-output tests for a labelled search input, live result summary, published search records and a no-result contact route. Add unit/browserless tests for normalisation and matching of a suburb name, region name and `shower screen`; assert `Aranda` yields no area result. Add form tests asserting only an allowed, URL-decoded published region/suburb prefills the respective form values and HTML-like query strings render as text, not markup.

- [ ] **Step 2: Run targeted tests to verify they fail**

Run: `node --test tests/mel-one-service-areas.test.cjs test/form-validation.test.cjs`

Expected: FAIL because the page has no search controls or safe location prefill.

- [ ] **Step 3: Add progressive-enhancement search markup and styles**

Render a clearly labelled input and a linked server-rendered region/suburb inventory. Style it in `site.css` for keyboard focus, reduced motion, responsive cards and readable no-result guidance. Links must stay usable when JavaScript is unavailable.

- [ ] **Step 4: Implement safe client-side filtering and form context**

In `site.js`, normalise query text, filter only server-rendered approved records, update the live result summary and leave no matching record hidden as a fabricated route. Parse query values with `URLSearchParams`, compare against the approved DOM options, and assign accepted values with `.value` rather than HTML insertion.

- [ ] **Step 5: Run targeted tests to verify they pass**

Run: `node --test tests/mel-one-service-areas.test.cjs test/form-validation.test.cjs`

Expected: PASS; location searches resolve only approved destinations and contact prefill is safe.

- [ ] **Step 6: Commit**

```bash
git add build.mjs src/assets/js/site.js src/assets/css/site.css tests/mel-one-service-areas.test.cjs test/form-validation.test.cjs
git commit -m "feat: add searchable Adelaide service areas"
```

### Task 5: Run full regression checks and production verification

**Files:**
- Modify only if test failures identify an implementation defect in the files from Tasks 1–4.

**Interfaces:**
- Consumes: the complete generated site and test suite.
- Produces: verified local build and production verification record.

- [ ] **Step 1: Run the full local test suite**

Run: `npm test`

Expected: PASS with no regressions in contact API, forms, approved assets, routes, SEO or workflow content.

- [ ] **Step 2: Build production output and inspect representative artefacts**

Run: `npm run build`

Expected: successful build with region/suburb pages, sitemap, `service-areas/feed.json` and no stale generated files.

Inspect: a service-area index, one region, one suburb, `/contact/?region=eastern-suburbs&suburb=norwood`, `sitemap.xml`, `llms.txt`, and `service-areas/feed.json`.

- [ ] **Step 3: Commit any regression fixes**

```bash
git add build.mjs src/content-pack/service-areas.json src/assets/js/site.js src/assets/css/site.css tests test
git commit -m "test: verify Greater Adelaide service areas"
```

- [ ] **Step 4: Deploy through the existing GitHub-to-Vercel path**

Push the verified source changes to the configured `main` branch using the repository's established update mechanism. Do not rely on `mel-one-site-core.zip` as the production build source.

- [ ] **Step 5: Verify the completed production deployment**

Inspect Vercel deployment logs, then fetch the live canonical domain for the index, a region and a suburb page. Verify 200 responses, canonical URLs, visible local content, structured data, search assets, contact context, sitemap and feed. Record failures before claiming release completion.

## Plan self-review

- **Spec coverage:** Tasks 1–2 cover hierarchy, source data, unique useful content, contact context and error constraints. Task 3 covers matching schema, sitemap and feed. Task 4 covers user search, no-match and query-safety behavior. Task 5 covers build, regression and production verification.
- **Step scan:** Every task begins with an executable failing test, implements defined interfaces, verifies the passing result and commits a coherent unit.
- **Type consistency:** `Area`, `Suburb`, `validateServiceAreas`, location render helpers, `locationSchemas`, search records and contact query keys are defined before later consumers.
- **Review focus:** Each listed failure mode is assigned to Task 1, 3 or 4 test work.
- **Proportion:** The plan specifies boundaries, interfaces and checks without transcribing implementation code.
