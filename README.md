# MEL ONE — Website

Local source package for the MEL ONE Adelaide household-maintenance website.

## Quick Start

```bash
# Install dependencies (Node.js 22.13+)
pnpm install

# Build local preview (outputs to ./public)
pnpm build

# Preview locally
pnpm serve
# → http://127.0.0.1:5173

# Run checks
pnpm test
```

## Project Structure

```
mel-one-website/
├── build.mjs          ← Static site generator
├── serve.cjs          ← Local static server
├── check.cjs          ← Local enquiry validator
├── package.json       ← pnpm scripts
├── pnpm-lock.yaml     ← Reproducible install lockfile
├── vercel.json        ← Optional deployment configuration
├── .gitignore
├── src/               ← Source files (commit these)
│   ├── content-pack/
│   │   └── mel-one-site-content.json   ← Site text and Field Notes
│   └── assets/
│       ├── css/site.css        ← Visual system
│       ├── js/site.js          ← Navigation and local form demo
│       ├── images/intake/      ← Authorized MEL ONE photography
│       └── mel-one-logo-authorized.png
├── test/ and tests/    ← Automated checks
├── public/            ← Local preview build (git-ignored)
└── docs/              ← Not included in the source release ZIP
```

## Upload to GitHub

1. Create a new empty GitHub repository.
2. Extract the release ZIP and upload its contents to the repository root.
3. In GitHub Actions, Vercel, Netlify or another static host, use:
   - Build command: `pnpm build`
   - Publish directory: `public`
   - Node.js: `22.13` or later
4. Set `SITE_ORIGIN` to the final public HTTPS domain during hosting setup so canonical URLs, sitemap and JSON-LD use that domain.

## Customising Content

English content is composed from `src/content-pack/`, the refinement modules in `src/`, and shared templates in `build.mjs`. Chinese counterparts are generated at `/zh/` from the same page structure using `src/i18n/en.json` and `src/i18n/zh-*.json`.

After a content change, run `pnpm i18n:extract`. It appends stable source IDs and writes the missing-translation list to `../reports/2026-10-16-bilingual/pending-translations.json`. Add faithful Chinese values for those IDs and review each pair for matching meaning, contact details and factual limits. Then record only those reviewed IDs, for example:

```bash
node scripts/record-translation-sources.mjs t3326 t3327
pnpm build
pnpm check:bilingual
pnpm test
```

`src/i18n/source-lock.json` stores the SHA256 of each reviewed, whitespace-normalized English source. The normal build fails if a translation is missing, its English text changed under the same ID, or its source binding has not been recorded. There is no English fallback on Chinese pages. The recording command updates only the explicit IDs, not other stale entries. It records review, not proof of translation correctness: update and review the Chinese meaning before approving a changed English source. Do not delete or manually refresh the lock, rerun the one-off initial inventory script, or renumber IDs. `--initial` is only for the first complete reviewed catalogue and refuses to overwrite an existing lock; there is deliberately no `--all` update option.

Dynamic form/search messages are paired in `src/i18n/interface.json`. Keep both languages and placeholders synchronized. Review English and Chinese locally before requesting deployment approval. Language entry points are `/` and `/zh/`; Contact / 联系我们 is followed by the counterpart language link.

The legacy English fixture tests isolate the original generation stage to preserve its existing 102-page content assertions. The bilingual and local-label tests exercise the actual final output, all 204 sitemap entries, language links, translation completeness and the user-approved city-only heading reduction. The October 16 copy rule keeps the homepage city-led H1, uses each service card heading as its CTA text and accessible name, and reduces generic Adelaide modifiers elsewhere. Actual suburbs, geographic coverage, addresses and local time remain factual. The shared editorial stage in `src/local-label-policy.mjs` applies this rule before Chinese generation.

## Image Slots

Authorized images are stored in `src/assets/images/intake/`. Update an image reference in `build.mjs`, retain factual ALT text, and run `pnpm build && pnpm test`.
