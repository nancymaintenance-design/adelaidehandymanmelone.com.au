---
version: alpha
name: MEL ONE repair records
description: An Adelaide maintenance field notebook grounded in photographed work.
colors:
  primary: "#202823"
  background: "#F3EFE5"
  text: "#111714"
  accent: "#F7B733"
  muted: "#4D5D52"
  border: "#BFC5BB"
typography:
  display:
    fontFamily: "Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif"
  body:
    fontFamily: "Aptos, Avenir Next, Segoe UI, Helvetica Neue, sans-serif"
rounded:
  DEFAULT: "2px"
spacing:
  page-max: "1280px"
  section: "48px"
components:
  record:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text}"
  cover:
    rounded: "{rounded.DEFAULT}"
---

# MEL ONE design context

## Overview

Brand marketing for Greater Adelaide homeowners and property managers arranging a repair assessment. English (en-AU); desktop and mobile. Business facts and workflow come from src/content-pack; contact information and qualified-work boundaries remain authoritative there.

North star: an annotated repair notebook, not a generic contractor brochure. The memorable signature is a real before/after pair with a gold annotation rule and a suburb label. Keep enquiry forms and navigation familiar. Avoid invented testimonials, stock-proof badges and animated decoration. This is the user's approved direction, implemented locally for review only.

Runtime token owner: src/assets/css/site.css. This file records intent, not generated tokens. The frontmatter maps primary to --workbench-black, background to --limestone, text to --obsidian, accent to --crown-gold, muted to --muted and border to --line. The existing palette and typography are preserved.

## Colors

Limestone reading surfaces, dark workbench text and gold for annotation and primary actions. Existing focus styles combine gold with a dark outline; forced colors retain system operability. No new theme.

## Typography

Serif headlines carry the editorial identity. System sans-serif body text prioritises legibility and avoids remote font downloads. Short uppercase utility labels identify record, stage and suburb.

## Layout

The seven service pages with a single intake photograph now combine the existing H1, introductory paragraph and original media in one shared introduction, rather than adding a separate full-width image band. The copy retains its paragraph line-length limit; the image sits in a 320px desktop side column and follows the copy on tablets/phones. The existing two-image roof/gutter gallery stays a separate gallery. No caption or new service claim is added by this layout.

Audit media/card repair (2026-10-15): service-intake photographs use intrinsic, transparent frames capped at 280px tall (240px at 650px and below), following the existing compact guide-photo language. Frames shrink to the whole original photograph; never stretch, crop or enlarge diagnostic images to fill a reading band. Keep the case-detail 2×2 gallery unchanged. Shared `src/desktop-layout.mjs` annotates card counts without changing order or content. One work record remains a horizontal record; two and four cards use pairs; seven uses two three-card rows plus a horizontal final record; eight and twenty keep three-card rows with a two-card final row. The final pair shares the row equally and its cover remains capped at 410px. Tablet grids use two columns with an odd final card across the row; phones stack. No empty columns beside a card taller than 320px. The implementation is appended inside the separately accepted `.desktop-layout` CSS block; historical prefix, decision-hub and guide blocks retain their original byte hashes. Runtime palette, typography, focus, scrollbar and reduced-motion tokens are unchanged. Regression command: `node --test tests/local-audit-layout.test.cjs`; its immutable pre-remediation fixture protects all 102 H1 and 865 original image files.

Approved whole-site desktop composition (2026-10-14): `src/desktop-layout.mjs` composes existing escaped content into whole-topic rows; the separately hashed `.desktop-layout` append in `src/assets/css/site.css` owns their runtime dimensions. Keep the existing 1280px page maximum and 48px desktop margins. Reading containers fill this frame; a 780px limit belongs to individual prose paragraphs, never to an entire FAQ, card/list collection, photo, topic grid or enquiry form. Neighboring similarly sized topics use two columns with a 36px gutter; FAQ disclosures and linked task lists also use two columns. Longer topics keep their H2 and all content in one section, with paragraph/list boundaries or complete H3 groups defining a two-column body. No CSS newspaper columns or reordering. Unmatched brief topics may occupy their own row. No fixed height, filler, overflow masking or giant grid rows: visible topic-height differences are checked against 320px.

At 850px and below, topic rows, topic bodies, reading lists and FAQs stack into one column. Desktop section headings use the existing serif identity at 1.65–2rem; paragraph and photo ratios remain unchanged. Article enquiry forms follow all article topics in a full-width lower band, with two columns of fields on desktop and one on phones; each label retains its adjacent validation error. The original 2×2 case photo thumbnails remain the mobile image exception. Privacy retains continuous legal prose with a local 780px line length. The separately approved How it works 1080px frame is unchanged. Already-wide home, directory, atlas, contact and about compositions remain; supplemental reading modules now align with the common wide frame. `scripts/check-desktop-layout.cjs` verifies all 102 routes at 1280/1440/1920/850/768/390/320, exact before/after semantics, columns, utilization and form placement.

Content-density repair (2026-10-13): runtime `--section-space` owns shared section, process and contact-band vertical padding: 48px on desktop, 36px at 850px and below. `--section-content-gap` owns heading-to-content spacing: 28px / 24px. FAQ and split introduction sections place their heading above the content rather than keeping an empty title column beside long content. FAQ disclosures fill two columns on desktop and one on narrow screens, preserving source/keyboard order and every answer. Do not reintroduce tall empty columns, fixed section heights, or filler copy to compensate for unequal content. Core SEO headings, URLs and business wording are unchanged by this layout repair. Browser regression command: `node --test scripts/check-content-layout.cjs` after building the local candidate; it checks every sitemap URL at desktop and phone widths, plus keyboard disclosure behavior.

1280px maximum content, existing 850px and 520px responsive breakpoints. Three-column case listing, two columns on tablets, one on phones. Covers are consistently 4:3. Case detail photographs use a compact 2×2 gallery on desktop and phones, capped at 240px photo height (140px on phones), preserving their full aspect ratio without upscaling small originals. Detail candidates use lossless WebP; listing photographs use responsive AVIF with WebP fallback. Decorative positioned textures remain direct images so media wrappers cannot consume grid cells. The four-stage journey changes to two columns, then a vertical list. Homepage sequence is services, work, journey, regions, FAQ, contact; field notes stay accessible from navigation.

## Elevation & Depth

Approved decision hub (2026-10-14): the How it works header uses a compact 3rem maximum serif H1 with a restrained topic index, followed by full-width answer rows and gold rules on open answers. Category headings sit above answers; no empty side columns or duplicate process/checklist stack. All new CSS lives in the marked .decision-hub block in the runtime stylesheet. Shared tokens, other page layouts and original CSS bytes remain protected. The acceptance profile hashes the approved addition separately from the historical stylesheet prefix. Native Enter/Space interaction, direct answer links, eight old workflow anchors and first-answer visibility are verified at 1440, 390 and 320px. This is a marketing/content register; no application UX contract or new dependency is introduced.

New record components use borders and an annotation rule rather than shadows. Existing atlas styles remain; no global rebrand is introduced.

## Shapes

Quiet rectangular photography and existing small-radius controls. Gold rules identify the record and process stages.

## Components

Each guide is authored as a complete four-section reading outline, not a concatenation of earlier editorial layers. Condition, method, quote boundaries and preparation have distinct homes. The pressure guide's upstream records also use the paving topic; removal inventory remains on its existing service. Photo captions distinguish the displayed stage from the linked case sequence.

Guide reading repair (2026-10-14): the topic directory groups all ten guides into repair choices, outside the home, and planning/property. Cards have short labels and distinct practical summaries. Guides retain a compact hero, four-part contents list and four coherent topic sections; the subsequent approved desktop composition above replaces the former 900px single-column frame with whole-topic pairs. An original-ratio photograph (300px wide / 280px tall maximum; 240px tall on phones) sits beside useful, attributed case context and never upscales its original. At 650px it becomes a single column. The enquiry form follows the article. The separately marked `.guide-page` / `.guide-directory` stylesheet block is independently hashed; historical CSS and decision-hub bytes remain protected. Former numerical section IDs map to relevant consolidated sections. The pressure guide's old clear-out anchors map to quote/preparation context, while useful inventory details live in the existing cleaning/removals service.

Before/after records are ordinary links, not draggable sliders. Gold ring-and-rule annotations label visible problem or repair positions without changing the photographs. Labels remain visible on touch and never depend on hover. Case cards use a shared suburb/problem/result pattern and link to the full supplied sequence; assessment-only records are explicitly labelled Record rather than completed Result. Region hubs link to published suburbs and documented local cases. All 32 suburb pages have authored enquiry guidance and unique practical questions without inventing local job evidence. How it works is a five-category decision hub with 22 authored questions, native details and the first answer in each group open. A single four-step booking list follows the answers. The eight earlier workflow anchors remain on the relevant category or booking step; direct question links open the target answer. Native menu button, links and details retain keyboard behaviour. Existing disabled/busy/error enquiry states are preserved. Local preview refuses actual enquiry sending and never claims success.

Motion is limited to existing short hover feedback; prefers-reduced-motion disables transitions. Media never moves on hover. No new overlay or modal.

Service navigation (2026-10-20): one reviewed relationship map owns the visible ordered breadcrumb and its structured data. Core service pages return directly to Home; task-specific cases and guides return to their actual service. Mixed-service guides and area pages keep their natural collection hierarchy. Breadcrumb ancestors are ordinary canonical links, current-page text wraps, and link targets are at least 44px tall. A compact list inside the existing homepage service section exposes the nine focused repair pages without replacing the map or adding another large band. Parent pages list any missing related records/guides; enquiry links reuse the confirmed contact route. Styling belongs to `service-navigation.css`, extending existing tokens rather than changing the historical layout stylesheet.

## Do's and Don'ts

- Show genuine photo evidence and accurate stage labels.
- Keep HTML, feed routes, breadcrumb hierarchy and llms discovery consistent.
- Do not claim undocumented customer totals, response times or company history.
- Do not crop diagnostic detail photographs or deploy before user approval.
