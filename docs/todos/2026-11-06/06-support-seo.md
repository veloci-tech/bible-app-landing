# Static support and legal SEO

- Status: implemented; awaiting independent review
- Created/updated: 2026-11-06
- Owner: static-site worker; repository `bible-app-landing`; coordinator owns merge/deployment.
- Authorization: implement the workspace task `docs/todos/2026-11-06/06-support-seo.md` on an isolated branch. No push, merge, or deployment.

## Context and scope

Improve technical SEO and navigation for the static GitHub Pages site at `landing.aibiblebuddy.com`. Keep the homepage indexable as a support/download destination, describe its relationship to the main marketing site, and keep every page self-canonical. Preserve the privacy policy text and effective date exactly, the PDFs, CNAME, contact email, store destinations, scripts, and existing behavior.

## Non-goals

No redirects, `noindex`, policy edits, API changes, runtime changes, externally hosted new assets, fabricated ratings, or deployment.

## Owned files and layer assignments

- `index.html`, `support.html`, `privacy-policy.html`: static HTML metadata, page headings, and navigation.
- `robots.txt`, `sitemap.xml`, optional `404.html`: crawler and static error documents.
- `scripts/verify-static-seo.mjs`: bounded local static verification.
- This repository task document: implementation and verification record.

Presentation and crawler configuration only; no schema or API touchpoints.

## Implementation steps

1. Add distinct title/description, absolute self-canonical, Open Graph/Twitter metadata, and meaningful navigation.
2. Ensure each page has exactly one semantic H1 and retain current page content and external behavior.
3. Publish an accurate sitemap and permissive robots rules with the sitemap location.
4. Add a helpful local 404 page if compatible with the static hosting setup.
5. Verify metadata, internal links/assets, sitemap/robots, exact legal prose preservation, and diff whitespace.

## Testing and release

Run the local static verifier and `git diff --check`. No development deployment exists for this static content; the coordinator owns any production release and smoke check after independent review. Do not push, merge, or deploy in this task.

## Acceptance

All public HTML pages are indexable with unique titles/descriptions and correct self-canonicals; social metadata uses valid existing absolute assets; navigation links support and marketing destinations; sitemap/robots include only live public HTML routes; legal wording/date and existing store, PDF, support, and behavior contracts remain intact; all bounded checks pass.

## Results/blockers

- Added the coordinator-supplied Google Search Console verification tag to the homepage head.
- Added the coordinator-supplied Bing Webmaster verification tag to the homepage head.
- Created the public IndexNow key file b546ec7b950c7c99d18d6f8323ab253f.txt, which contains the matching 32-character key. The coordinator owns live submission.

- Added per-page title, description, canonical, Open Graph, and Twitter metadata; all use the existing app-logo asset by absolute URL.
- Added navigation between the homepage, support, privacy, and main-marketing pages. Each public HTML page now has exactly one H1.
- Added `robots.txt`, a sitemap containing only the three public HTML URLs, and a helpful `404.html` excluded from indexing.
- Replaced unsupported homepage capability guarantees with grounded AI-generated study copy and advice to review passages in context.
- Privacy-policy content from its existing H1 through its legal body matches `origin/main` exactly, including the May 10, 2024 date. CNAME and both PDFs are byte-identical to `origin/main`.
- `node scripts/verify-static-seo.mjs`: PASS (metadata, headings, local links/assets, sitemap/robots, legal text, preserved script tags, store URLs, contact email, CNAME, and PDFs).
- `git diff --check`: PASS.
- Parent browser QA found the Google Play button clipped at 375px despite no document-level horizontal overflow. The homepage download row now wraps as a flex row, uses available width, and has no floated store link; parent will recheck mobile.
- No deployment or browser smoke test performed; the coordinator owns release and live verification.
