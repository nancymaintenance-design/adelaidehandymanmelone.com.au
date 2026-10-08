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
  section: "76px"
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

1280px maximum content, existing 850px and 520px responsive breakpoints. Three-column case listing, two columns on tablets, one on phones. Covers are consistently 4:3. Case detail photographs use a compact 2×2 gallery on desktop and phones, capped at 240px photo height (140px on phones), preserving their full aspect ratio without upscaling small originals. Detail candidates use lossless WebP; listing photographs use responsive AVIF with WebP fallback. Decorative positioned textures remain direct images so media wrappers cannot consume grid cells. The four-stage journey changes to two columns, then a vertical list. Homepage sequence is services, work, journey, regions, FAQ, contact; field notes stay accessible from navigation.

## Elevation & Depth

New record components use borders and an annotation rule rather than shadows. Existing atlas styles remain; no global rebrand is introduced.

## Shapes

Quiet rectangular photography and existing small-radius controls. Gold rules identify the record and process stages.

## Components

Before/after records are ordinary links, not draggable sliders. Gold ring-and-rule annotations label visible problem or repair positions without changing the photographs. Labels remain visible on touch and never depend on hover. Case cards use a shared suburb/problem/result pattern and link to the full supplied sequence; assessment-only records are explicitly labelled Record rather than completed Result. Region hubs link to published suburbs and documented local cases. All 32 suburb pages have authored enquiry guidance and unique practical questions without inventing local job evidence. Eight detailed workflow steps use native details below the four-stage overview, with deep links opening the targeted step. Native menu button, links and details retain keyboard behaviour. Existing disabled/busy/error enquiry states are preserved. Local preview refuses actual enquiry sending and never claims success.

Motion is limited to existing short hover feedback; prefers-reduced-motion disables transitions. Media never moves on hover. No new overlay or modal.

## Do's and Don'ts

- Show genuine photo evidence and accurate stage labels.
- Keep HTML, feed routes, breadcrumb hierarchy and llms discovery consistent.
- Do not claim undocumented customer totals, response times or company history.
- Do not crop diagnostic detail photographs or deploy before user approval.
