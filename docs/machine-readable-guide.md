# JSON-LD / Feed maintenance

`src/machine-readable.mjs` runs after city-label policy and reviewed bilingual rendering. It reads final public HTML rather than an independent marketing-copy catalogue. English and Chinese headings, summaries, topic labels, service/provider/page references, company introduction and Feed contents therefore follow the same maintained pages.

- Original `#business`, `#website`, `#webpage`, `#service` and `#article` IDs remain stable. Do not create a second Organization for the same LocalBusiness.
- Topic eligibility is in `src/machine-keywords.json`, selected from the user's keyword map. A label is emitted only when present on that language's page; each page has at most eight. Headings also supply actual page topics. These are descriptive labels, not promises to supply every mentioned service.
- Company introduction is copied from the existing About paragraph; the service catalogue lists only linked, existing service pages. Never invent qualifications, prices, review scores, staffing or availability.
- New public endpoints, for each language: `/feed.json` (JSON Feed 1.1), `/feed.xml` (RSS 2.0 with content:encoded), `/schema-feed.json` (Schema.org DataFeed).
- Each feed covers the 102 canonical language pages, excludes 404, carries original page URLs as stable item IDs, and publishes existing editorial content without forms, navigation or tracking. Unknown full timestamps are omitted, not synthesized from the build date. Do not equate the legacy custom-catalogue generatedAt with a publication date.
- Existing `/case-studies/feed.json` and `/service-areas/feed.json` remain version-1 custom catalogues at the same paths, with existing IDs/fields; topic labels and page relationships are added. They are not mislabelled as JSON Feed 1.1.
- Discovery uses non-visible head links only. Build asserts all other HTML bytes unchanged. Public CSS/JS, H1, meta, body, visible links and sitemap page inventory are not altered by this stage.
- `pnpm build`; `node --test test/machine-readable.test.mjs`; `pnpm check:bilingual`; `pnpm test`. Historical English-only fixtures isolate pre-bilingual rendering; real bilingual/machine-data tests must keep covering production output.

These formats improve explicit machine-readable relationships and content delivery. They do not guarantee indexing, rankings, AI citations or rich results. Do not hide unrelated keyword lists, insert private AI instructions, claim universal bot subscription, or copy template example domains. Source input records, prompts and validation reports are not public endpoints. Publication still needs the user's separate approval.
