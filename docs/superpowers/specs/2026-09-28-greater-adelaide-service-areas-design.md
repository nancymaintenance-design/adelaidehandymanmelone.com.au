# Greater Adelaide service areas design

**Date:** 2026-09-28  
**Status:** Approved for specification review  
**Site:** https://www.adelaidehandymanmelone.com.au/

## Purpose

Help Greater Adelaide customers find the service area and suburb that matches their address, understand the relevant handyman services, and submit a pre-filled contact enquiry. The public information must be useful to people, accurately represent MEL ONE, and be readable by search engines and AI systems without hidden or misleading content.

## Confirmed constraints

- Coverage is **Greater Adelaide only**. Canberra and Aranda are explicitly out of scope.
- The service-area hierarchy covers: CBD & North Adelaide; Eastern Suburbs; Inner South; Inner West; Western Suburbs; North & North-East; Adelaide Hills & Foothills; Southern Suburbs.
- Public company claims are confirmed by the business: more than ten years in the maintenance industry; a standardised maintenance team; maintenance professionals with ten years' experience; issue diagnosis; eligible enquiries may receive a response in as little as 30 minutes; more than 10,000 customers served.
- The 30-minute statement is a response target, not an unconditional attendance or completion promise. It is subject to location, enquiry volume and availability.
- The official company record is MEL ONE PROPERTY MAINTENANCE PTY LTD, ABN 39 666 325 408, with the public lookup at https://abr.business.gov.au/ABN/View?abn=39666325408.
- The build source is the repository's `build.mjs` generator. Production must be verified from generated output and the live domain; static ZIP archives are not the production source of truth.

## Information architecture

### Pages

1. **Service-area index** — `/service-areas/`
   - Greater Adelaide overview, region cards, suburb/service search, company trust information, and quick contact action.
2. **Region pages** — `/service-areas/{region}/`
   - Region overview, list of contained suburbs, region-specific repair contexts, related service links, and a contact form.
3. **Suburb pages** — `/service-areas/{region}/{suburb}/`
   - Local intent title such as `Shower Screen Repairs in Norwood, Adelaide | Local Handyman Services`.
   - Suburb-specific service overview, repair-method explanation, six service modules, FAQs, related internal links, company information, and a suburb-pre-filled contact form.
4. **Machine-readable directory** — `/service-areas/feed.json`
   - A public, versioned directory containing only published regions, suburbs, services and canonical URLs.

### Navigation and discovery

- Main navigation links to `/service-areas/`.
- The index search matches region names, suburb names and service terms and takes a customer to the best matching published page.
- Region pages link to their published suburb pages. Suburb pages link upward using visible breadcrumbs and sideways to relevant service pages.
- Unknown searches suggest available matches and provide a contact route; they never create empty or fabricated location pages.
- Unknown URLs return a useful 404 page that links to the service-area index.

## Content model

One source data module holds the region, suburb, service, SEO and FAQ content. The generator uses it to create all location pages and derived artefacts (search index, sitemap additions, feed, canonical metadata and JSON-LD). This prevents content, links and schema from drifting apart.

### Region record

Each record contains:

- unique slug and display name;
- short coverage description;
- approved suburb records;
- region-specific repair context;
- related service-page links;
- canonical metadata.

### Suburb record

Each record contains:

- parent region, canonical slug and display name;
- one primary keyword/service pairing and several natural secondary phrases;
- unique lead paragraph and local repair context;
- service modules for shower screens; doors, windows and flyscreens; roof/gutter/exterior care; gardens/property care; fences/gates; cleaning/general maintenance;
- visible FAQs and answers;
- metadata and contact-form prefill values.

All copy must be materially useful and differentiated. A suburb name must not be mechanically substituted into the same article. Region-specific factors (for example, apartments in the CBD, older homes in the east, coastal exposure in the west or slope/trees in the Hills) may be used only when relevant and written cautiously.

## Page content requirements

Every suburb page includes:

1. One descriptive H1 with a local core query.
2. An opening answer to the customer's local service need.
3. A short list of services that can be requested.
4. Local maintenance issues and practical diagnostic approach.
5. A transparent company-method section covering the confirmed experience, team process, response conditions and customer history.
6. Six useful service modules:
   - shower screen repairs and adjustment;
   - doors, windows and flyscreens;
   - roof, gutter and exterior maintenance;
   - garden and property care;
   - fence and gate repairs;
   - cleaning and general handyman support.
7. Three to five visible FAQs with direct, non-promissory answers.
8. Relevant links to parent region, related services and contact.
9. A bottom-of-page contact form prefilled with the region and suburb.

Content must state when a task requires an appropriately qualified specialist trade. It must not imply that MEL ONE is licensed for a regulated trade unless that specific licence is verified and published.

## Structured data and search quality

Each generated page publishes structured data that mirrors visible content:

- `LocalBusiness` for the organisation and verified business details;
- `Service` for the page's actual service and service area;
- `FAQPage` only for visible FAQs;
- `BreadcrumbList` for the visible hierarchy;
- `WebPage` for page identity and canonical relationship.

The implementation updates the sitemap with published location URLs and provides `feed.json` for the same content inventory. It does not use hidden text, hidden keywords, off-screen content, misleading schema or information that differs from the human-visible page.

## Contact flow

Contact forms on the index, region and suburb pages include context fields for origin, region and suburb. Location values are prefilled from the landing page but remain clear to the customer. The user supplies name, contact details, property address, issue description and preferred booking time. The submitted information must continue through the existing contact handling path; the location enhancement cannot break the current form behaviour.

## Error handling

- No match: show the closest relevant published result and contact option.
- Invalid area path: serve the project 404 experience, with a link back to `/service-areas/`.
- Data validation failure during build: fail the build with a clear error for duplicate slugs, missing parent regions, invalid URLs, duplicate canonicals or empty required content.
- No artificial availability, response-time or outcome guarantees.

## Testing and acceptance criteria

### Build-level checks

- The generator completes successfully.
- Every region and suburb page has a unique canonical URL, H1, title and description.
- All generated internal URLs resolve in the output.
- Sitemap and `feed.json` contain every published location URL exactly once.
- Search index values point only to published pages.
- JSON-LD parses as JSON and matches visible page facts.

### Functional checks

- Region cards and suburb links navigate to the correct page.
- Search finds a region, suburb and service phrase and navigates to the right published URL.
- Contact forms carry the expected region/suburb context.
- Missing locations and malformed paths are handled gracefully.

### Production checks

- Validate the deployment logs and generated-page count.
- Fetch the live canonical domain for representative index, region and suburb pages.
- Verify page title, canonical, visible heading, schema, feed, sitemap and contact-form context on the live site.
- Perform desktop and mobile checks for navigation, search, cards and form usability.

## Scope boundary

This project delivers the Greater Adelaide service-area system. It does not add Canberra locations, invent licences/insurance, claim trade qualifications not supplied by the business, build a separate CRM, or create hundreds of thin service-by-suburb pages.
