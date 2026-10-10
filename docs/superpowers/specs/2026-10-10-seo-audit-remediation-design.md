# MEL ONE SEO Audit Remediation Design

## Goal

Improve the static MEL ONE site from the 2026-10-10 audit without inventing business facts, changing the approved visual language, or deploying anything before local approval.

## Confirmed scope

- Work only in the isolated `codex/adelaide-service-areas` worktree at commit `520b349`, which matches `origin/main`.
- Keep the existing server-rendered static-site generator, content model, sitemap, `llms.txt`, case-study architecture, responsive image pipeline and visual identity.
- Add deterministic technical and semantic improvements that can be proved from the approved content already in the repository.
- Add automated checks first for each changed behavior, then implement the smallest compatible change.
- Build and serve `public/` locally for review. Do not push, deploy, alter Vercel project settings, or submit any third-party listing.

## Explicitly out of scope pending verified business inputs

- Google Business Profile ownership, category, service area, address visibility, reviews and citations.
- `sameAs` URLs, public opening hours, latitude/longitude, price range, licences, insurance, warranty, named staff, ratings and testimonials.
- New claims about availability, response time, service guarantees or regulated-work capability.
- A logo redesign or replacement asset without an approved brand source file.

## Chosen approach

Use the current generator (`build.mjs`) as the single source of rendered metadata and schema. The changes are intentionally data-led:

1. Add only the verified Greater Adelaide service regions to the shared `LocalBusiness` entity as `areaServed`.
2. Add a factual shared business `image` reference using the existing approved Greater Adelaide service-area illustration. WebPage and social metadata use the first meaningful image in the final page body when present; pages without one omit `primaryImageOfPage` and use the shared illustration only as a social fallback.
3. Ensure every Article schema has a representative image only when a visible page hero/case image exists, while leaving `dateModified` absent unless a content record supplies a real modification date.
4. Add Vercel response hardening headers and direct canonical host redirects, testing that static-site routing and the contact endpoint remain compatible.
5. Improve high-intent on-page content only where it can be sourced from existing approved service scopes, photographed cases and visible assessment process. Do not mass-expand suburb pages or perform place-name swaps.

## Architecture and file boundaries

| File | Responsibility |
|---|---|
| `build.mjs` | Generates page metadata, global JSON-LD graph, Articles and content-led service/case output. |
| `src/content-pack/mel-one-site-content.json` | Holds approved copy and factual, page-specific SEO metadata. |
| `vercel.json` | Holds deploy-time redirects and safe HTTP response headers. |
| `tests/mel-one-seo.test.cjs` | Verifies rendered metadata, entity schema, Article properties, crawlers and content constraints. |
| `tests/mel-one-routes.test.cjs` or focused new test | Verifies redirect/header configuration is syntactically stable without calling Vercel. |

## Data flow

Approved JSON content and asset routes feed `build.mjs`; it produces static HTML, sitemap, `llms.txt` and JSON feeds in `public/`. Tests build a fixture with `SITE_ORIGIN=https://example.test`, parse the generated JSON-LD and assert the visible output matches the schema. Vercel then serves `public/` with only declarative redirects/headers.

## Error handling and safety

- Schema generation must omit optional properties that lack a verified value; it must never insert placeholders.
- Existing self-canonicals, `index,follow` and visible FAQ/schema consistency must remain unchanged.
- Security policy must be staged to avoid breaking inline JSON-LD, analytics or the contact API; start with non-breaking headers and test local routes.
- Redirects must retain query strings and avoid loops; all live-site verification remains local until user authorizes deployment.

## Success criteria

1. Full test suite and `pnpm check` pass after a clean build.
2. Generated homepage and relevant templates expose verified `areaServed` and approved visible images in JSON-LD.
3. Article image markup is emitted only for a visible approved image, and no synthetic `dateModified` values appear.
4. `vercel.json` provides direct canonical-host redirects and baseline protective headers without touching production.
5. A local preview opens successfully on the documented server port for user inspection.
