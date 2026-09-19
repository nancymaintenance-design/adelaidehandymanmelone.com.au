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

All text lives in `src/content-pack/mel-one-site-content.json`. Edit and re-run `pnpm build`.

## Image Slots

Authorized images are stored in `src/assets/images/intake/`. Update an image reference in `build.mjs`, retain factual ALT text, and run `pnpm build && pnpm test`.
