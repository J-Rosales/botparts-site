# DIRECTIVE_01_VIEW_NAV — Views, Navigation, and Routing

Date: 2025-12-30

## Goal
Define the site’s page structure and navigation behavior for a static Neocities deployment:
- Landing page with static links + featured grid
- Catalogue browsing behavior
- Character “detail view” behavior (per-character view)

## Already decided
- Static hosting (Neocities).
- Data-driven pages from JSON.
- Landing includes static links: About, How to use, License/Attribution, Changelog.
- Character view exists per entry (either separate HTML pages or SPA route).

## Clarify before implementation
1. Routing choice:
   - **Option A:** Multi-page (`/character/<slug>.html`) generated manually (simple, no routing JS).
   - **Option B:** SPA-ish routing (`/#/character/<slug>` or querystring) with a single `character.html` view.
   Ask: which preference and why? (URL aesthetics vs deployment simplicity vs duplication).
2. Template integration:
   - Which third-party template is chosen, and what are the required visual elements to keep vs discard?
3. Content pages:
   - Are About/HowTo/License/Changelog separate pages or modal panels?

## Tasks
- Implement primary nav component used on all pages.
- Implement either:
  - A) `src/pages/character.html` + link mapping from index cards to that page with query param, or
  - B) route handling in `src/js/app.js` for hash routes.
- Ensure browser back/forward works correctly for character navigation.

## Acceptance criteria
- Direct link to a character opens the correct character view.
- Landing loads with featured cards and nav links visible.
- No server config assumptions (works from plain static hosting).

## Integration points
- Data: `src/data/index.json` (provides slug + display fields).
- Character data: `src/data/characters/<slug>.json`.
- Catalogue and filter behavior is handled by DIRECTIVE_02.
