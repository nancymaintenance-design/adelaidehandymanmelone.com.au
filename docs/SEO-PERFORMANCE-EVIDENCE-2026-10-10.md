# Performance and public identity evidence — 10 October 2026

## Scope and measurement limits

Candidate inspected at http://127.0.0.1:5173/ using the existing bundled Playwright package and installed Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`. No installation, source edits, profile writes or login occurred. No existing performance cache was found (homepage schema cache existed). Only this report is written, per task ownership; the performance skill's normal cache writes are omitted to respect that scope.

Lighthouse was not present in project node_modules, bundled runtime modules, or the global npm module location checked. Bundled Playwright's expected Chromium executable was missing, but installed Chrome worked. Therefore **no Lighthouse score, throttled mobile Lighthouse run, TBT, field CWV or INP is available**. A bounded production-only PageSpeed request to Google's runPagespeed endpoint for `https://www.adelaidehandymanmelone.com.au/` failed with `fetch failed` within the 18-second request bound. This is a data-source failure, not evidence of bad production performance.

## Local browser diagnostic (not Lighthouse or field CWV)

Single fresh headless Chrome navigation; viewport 390×844, mobile context, device scale 1, no CPU/network throttling; observed through network idle plus 1.5 seconds. This is a localhost diagnostic and cannot predict production mobile performance or establish a CWV pass.

| Observation | Result |
|---|---|
| Last observed LCP | 940 ms, homepage H1, `Handyman servicesfor Adelaide homes.` |
| Layout shifts without recent input | None observed in this short navigation (sum 0) |
| Navigation responseStart | 797.1 ms |
| DOMContentLoaded | 908.3 ms |
| Load event | 1330.4 ms |
| INP | Not measured; no interaction sample or field data |

The mobile LCP element observed here was text. The prominent repair photos remain image LCP candidates on other viewports/loads; do not label either photo as measured LCP based solely on source markup.

## Logo and hero evidence

`src/assets/mel-one-logo-authorized.png` is **484,272 bytes**, PNG with alpha, **1402×1122**. HTML declares 112×64, while the measured mobile rendered box was 58×52 at y=46. No existing logo WebP/AVIF derivatives were found under src/assets. This unnecessarily transfers a large image for a small header mark. Generate transparent optimized derivatives sized for the actual desktop/mobile boxes and 2× density, preserve the logo's intended object-fit treatment, and retain appropriate intrinsic dimensions. Keep the authorized original as a source asset.

The final generated homepage replaces the original illustrative hero with a Burnside repair record (`homeRepairRecord()` in build.mjs). Its first/before photo has `fetchpriority="high"`, async decode and no lazy loading. The adjacent after photo has `loading="lazy"`. Both reserve intrinsic width and height and have responsive derivatives.

At 390×844, both photo boxes were **156×195**, y=566.72, visible in the first viewport. Chrome selected AVIF through picture sources:

| Photo | Selected candidate | Existing AVIF bytes | Existing WebP bytes | Priority/loading |
|---|---|---:|---:|---|
| Before | burnside-driveway-pressure-cleaning-01-357.avif | 30,115 | 47,252 | high / auto |
| After | burnside-driveway-pressure-cleaning-04-358.avif | 28,477 | 43,636 | auto / lazy |

Recommendation: make both visible repair-record photos eager while keeping only the likely primary image high priority. Verify on mobile and desktop after rebuilding; lazy loading an initially visible after photo can delay completion of the comparison. Avoid marking every content image high priority. Existing dimensions and responsive picture sources should remain.

The original home illustration is not the current homepage hero: its intake PNG is 2,607,563 bytes and JPG 302,582 bytes; existing responsive AVIF candidates are 22,652 / 74,202 / 136,122 bytes at 480/960/1440, and WebP 35,940 / 114,216 / 205,146 bytes. Do not base current homepage priorities on this unused illustration.

## Related domain and Google public identity

Read-only public sources: [carpentry homepage](https://www.adelaidecarpentryhub.com.au/), [carpentry about page](https://www.adelaidecarpentryhub.com.au/about/), [provided Google share URL](https://share.google/bnkU7OE83VYCSh44T).

The carpentry site publicly identifies as MEL ONE, uses phone **0403 202 949**, email **handymanfelix.au2026@outlook.com**, and **63 Pirie St, Adelaide, SA 5000**. An independent recheck of generated `public/index.html` confirms that the candidate instead uses **0416 614 281** (`tel:+61416614281`) and **admin@melonemaintenance.com.au**. `build.mjs` also explicitly validates those candidate contact values. **Phone and email differ; name and address match.** The initial comparison incorrectly relied on the older `src/content-pack/site-content.json` contact data rather than the enforced generated output; this paragraph corrects that error.

The carpentry about page identifies Mel One Property Maintenance Pty Ltd, ABN 39 666 325 408 and ACN 666 325 408, agreeing with the candidate business facts. The user has confirmed the company identity, independent Adelaide team and actual website premises; these are accepted facts.

External finding only: two domains publicly use the MEL ONE name, company identifiers and Adelaide address but publish different phone/email contacts and service ranges. The carpentry domain's ownership and relationship to this candidate are not confirmed. Distinct team contacts are one possible explanation, not an established fact. Do not copy its phone/email, add reciprocal links, declare common ownership or merge organization/GBP identities on this evidence alone. Any future relationship statement requires verified ownership and routing information; this report makes no change to the candidate's authorized contact details.

The carpentry homepage contains a founded-in-2011 claim and an affirmative South Australian contractor licence claim. Its about page instead emphasizes confirming qualified arrangements and responsible contracting parties. These are public claims requiring consistent documentary support if used on either site; the presence of a company ABN alone does not substantiate them. This observation does not challenge the confirmed Adelaide operation or premises.

The carpentry site's Maps link resolves to an **address-based Maps URL**, `https://www.google.com/maps/place/63%2BPirie%2BSt,%2BAdelaide%2BSA%2B5000,%2BAustralia/`, not an identified MEL ONE business listing. It should not be treated as a verified GBP identity URL.

The supplied share URL could not be resolved: the web reader reported it inaccessible; `curl.exe -I -L --max-time 20` timed out after 20,006 ms without redirect headers. **No stable GBP destination, Place ID, review total, rating or listing NAP was established.** Keep the user-supplied URL as supplied unless a successful public redirect or verified listing provides a replacement; do not invent a Place ID or substitute an address-search URL for a business profile.

## Next verification

After optimization, rerun the same local browser diagnostic for regression comparison, then obtain a real mobile Lighthouse run and production PageSpeed/CrUX evidence when available. Production field values must be labeled separately from candidate lab diagnostics. A valid INP value requires a data source that actually measures interactions; TBT must never be renamed INP.
