# Google CLI evidence — 2026-10-10

Site: `adelaidehandymanmelone.com.au`. Read-only checks; no login, account/API configuration changes, sitemap submission, indexing submission, deployment or push. No credential values are included.

## Authentication and capabilities

- Default SEO helper configuration is absent (`google_auth.py --check --json` reported tier -1 in the parent investigation). This does **not** mean Google CLI access is absent.
- `gcloud auth list --format=json` found an active existing user account (email withheld here).
- Existing `%APPDATA%/gcloud/application_default_credentials.json` is an `authorized_user` credential with an existing quota project. Only its type, quota project and field names were inspected, never secret values printed.
- Existing gcloud user token scopes do not include Search Console or Analytics. Read-only site listing and GA Admin account listing both returned HTTP 403 `ACCESS_TOKEN_SCOPE_INSUFFICIENT`.
- Existing ADC scopes include `webmasters`, `business.manage` and `cloud-platform`, but lack `analytics.readonly`. ADC GA Admin account listing returned the same scope error.
- Initial ADC Search Console listing without a quota header returned HTTP 403 quota-project/API error. Supplying the **existing** ADC quota project as request header `x-goog-user-project` resolved it, without changing any configuration. Target property `sc-domain:adelaidehandymanmelone.com.au` is accessible as `siteOwner`.
- Relevant process environment variable-name search found none. The worktree `.env.local` contains the name `VERCEL_OIDC_TOKEN`, unrelated to Google access; its value was not disclosed. Filename-only searches in the worktree and MEL ONE workspace did not find an alternative Google/GSC/GA4/OAuth credential/config script. No `gog`, `google`, `ga4`, `gsc` or `gws` executable was found on PATH.

## Search performance

Source: live Search Console Search Analytics API, domain property, search type `web`, `dataState: final`, all countries/devices. Requested inclusive period: **2026-09-10–2026-10-07**; preceding 28 days: **2026-08-13–2026-09-09**. GSC dates use Pacific Time. Latest returned populated date is **2026-10-06**; no October 7 row was returned. Thus these are final rows available within the requested window, not a guarantee every requested day has finalized data.

| Metric | Current requested window | Prior requested window |
|---|---:|---|
| Clicks | 3 | No rows returned |
| Impressions | 89 | No rows returned |
| CTR | 3.37% | Unavailable |
| Average position | 17.48 | Unavailable |

No percentage growth is calculated from the empty prior-period response. Empty rows alone do not prove the site's historical launch date or an indexing problem.

Dimension requests were repeated with `rowLimit: 25000`, returning 31 query rows, 26 page rows, and 17 date rows; none hit the row cap. Query rows total 75 impressions and zero clicks, whereas property totals are 89 impressions and three clicks. Query privacy filtering means the clicked searches cannot be identified from these rows. Page rows total 111 impressions and three clicks; page aggregation differs from property aggregation and should not replace the 89 property impressions.

### Leading disclosed queries by impressions

| Query | Clicks | Impressions | CTR | Position |
|---|---:|---:|---:|---:|
| patio construction | 0 | 10 | 0% | 3.20 |
| home renovations malvern | 0 | 8 | 0% | 3.38 |
| shower screen repairs adelaide | 0 | 7 | 0% | 41.29 |
| adelaide waterproofing | 0 | 4 | 0% | 1.00 |
| waterproofing adelaide | 0 | 4 | 0% | 1.50 |
| roof waterproofing services | 0 | 4 | 0% | 3.25 |
| mel | 0 | 4 | 0% | 6.25 |
| shower screen replacement adelaide | 0 | 3 | 0% | 13.67 |
| home repairs adelaide | 0 | 3 | 0% | 17.67 |

### Leading pages by impressions

Paths below use `https://www.adelaidehandymanmelone.com.au`.

| Page | Clicks | Impressions | CTR | Position |
|---|---:|---:|---:|---:|
| `/` | 3 | 56 | 5.36% | 5.61 |
| `/case-studies/marion-shower-screen-repair/` | 0 | 9 | 0% | 35.78 |
| `/contact/` | 0 | 7 | 0% | 15.00 |
| `/services/doors-windows-screens/` | 0 | 4 | 0% | 61.00 |
| `/service-areas/inner-south/unley/` | 0 | 3 | 0% | 17.67 |
| `/faq/` | 0 | 3 | 0% | 8.33 |
| `/service-areas/eastern-suburbs/norwood/` | 0 | 2 | 0% | 11.00 |
| `/service-areas/eastern-suburbs/magill/` | 0 | 2 | 0% | 15.50 |
| `/service-areas/inner-south/parkside/` | 0 | 2 | 0% | 6.50 |

There is also a parameterized contact URL (`/contact/?area=Northern%20Suburbs&street=Main%20North%20Road`) with two impressions, zero clicks and position 4.50. It merits checking canonical handling, but its appearance alone does not establish an indexing defect.

Potential content priorities: strengthen the shower screen case study/service relationship and home repair/Unley coverage; Norwood, Magill and the shower screen replacement query show early positions around 11–18. All volumes are tiny: treat them as relevance clues, not reliable conversion forecasts or demonstrated high-volume quick wins. Patio/renovation queries should first be checked for actual service fit.

## Live indexation evidence

Two URL Inspection API reads returned:

| URL path | Verdict / coverage | Last crawl (UTC) | Canonical |
|---|---|---|---|
| `/` | PASS; Submitted and indexed | 2026-10-06 20:54:33 | Google/user match the HTTPS www homepage |
| `/service-areas/` | PASS; Submitted and indexed | 2026-09-24 20:43:20 | Google/user match the HTTPS www service-areas URL |

Both report robots allowed, indexing allowed, successful fetch, and mobile crawler. These are two sampled URLs, not proof that every site URL is indexed.

Sitemaps GET returned `https://www.adelaidehandymanmelone.com.au/sitemap.xml`: last submitted 2026-09-24T09:34:35.21Z; last downloaded 2026-10-06T03:27:19.283Z; not pending; zero warnings; zero errors; 79 submitted web URLs. The legacy sitemap response's `indexed: 0` must not be interpreted as zero indexed URLs: both direct inspections confirm indexed pages.

## GA4 limitation and remedy

No GA4 sessions, organic landing pages or key-event numbers were retrieved. Existing credentials lack Analytics read scope, and Admin account discovery is blocked before property identification. `G-9KMWMVLZ3` is a measurement ID, not the numeric Data API property ID.

To enable a later read: authorize an identity with `analytics.readonly`, ensure at least Viewer access to the site's GA4 property, then use read-only Admin account/property/data-stream discovery to match measurement ID `G-9KMWMVLZ3` and obtain `properties/<numeric-id>`. Run Data API reports with Organic Search session-channel filtering for the same windows, including sessions and keyEvents by landingPagePlusQueryString. No interactive login or configuration mutation was attempted during this task.

## Reproduction checks

1. Run the existing Cloud SDK `gcloud.ps1 auth list --format=json`; inspect ADC metadata only; enumerate relevant environment **names** and configuration filenames only.
2. Obtain existing tokens into memory via `gcloud auth print-access-token` and `gcloud auth application-default print-access-token`; never print token output. Read tokeninfo scopes via POST and emit scopes only.
3. GET `/webmasters/v3/sites` and GA Admin `/v1beta/accountSummaries`; use ADC plus its existing `x-goog-user-project` header for successful GSC requests.
4. POST `/webmasters/v3/sites/sc-domain%3Aadelaidehandymanmelone.com.au/searchAnalytics/query` with explicit dates, `type:web`, `dataState:final`, no dimensions for totals and query/page/date dimensions separately. Sort returned rows by impressions for the tables above.
5. POST `/v1/urlInspection/index:inspect` for only homepage and service-areas; GET the target property's `/sitemaps`. All POST operations here are reporting/inspection reads.

Instructions consulted: local `seo-google/SKILL.md`, `references/auth-setup.md`, `references/search-console-api.md`, and `references/ga4-data-api.md`. No shared-cache changes made because this task owns only this report.

## Google Business Profile capability check

A bounded follow-up used the existing ADC `business.manage` scope and the same existing quota-project request header to GET `https://mybusinessaccountmanagement.googleapis.com/v1/accounts`. The API returned **HTTP 429 RESOURCE_EXHAUSTED**, reason `RATE_LIMIT_EXCEEDED`, with `DefaultRequestsPerMinutePerProject` quota limit explicitly **0**. No account or location data was returned. This is an API/project quota capability limitation, not evidence of a missing, unverified or ineligible business listing.

Because the returned project limit is zero, no retry or location request was made. Actual GBP hours, website, primary/additional categories and service area could not be checked through this CLI connection. No customer reviews were requested, no configuration/login changes were made, and GA4 scopes were not touched.

Remedy: the Google Cloud project needs approved nonzero Business Profile API access/quota before this existing connection can list accounts; alternatively, the listing owner can provide the current public profile URL and current profile settings for review. Once account listing works, use Business Information API locations GET/list with a limited read mask for website, categories, regularHours and serviceArea, restricted to this site's listing. The user's confirmed company, independent Adelaide team and real premises remain accepted business context.
