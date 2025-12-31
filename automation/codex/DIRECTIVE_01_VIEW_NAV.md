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

## Implementation clarifications
1. Routing choice:
   - Prefer the simplest-to-remember, simplest-to-navigate approach (human-friendly URLs over aesthetics or duplication concerns).
2. Template integration:
   - The template has been added wholesale in `template-src`.
   - On the landing page, ignore everything after the “What Our Customers Say” header (layout retained, content replaced).
3. Content pages:
   - Separate pages for: Landing (featured cards), Browse (catalog + search), How To, and About.
   - Browse is the dynamic search page; Landing has no search.
   - About and How To are static decorated markdown with CSS.
4. Landing vs browse:
   - Landing shows only featured cards; full searchable catalog lives on Browse.

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

## Icon system note
- Icons must use the centralized SVG symbol system in `public/icons/icons.svg`.
- Add new icons by defining a `<symbol>` in the shared icon sprite.
