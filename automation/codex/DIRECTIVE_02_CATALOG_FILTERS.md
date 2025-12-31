# DIRECTIVE_02_CATALOG_FILTERS — Catalogue Grid, Tag Filtering, and Search

Date: 2025-12-30

## Goal
Deliver a modern catalogue grid on landing (featured) and/or a browse page with:
- card grid rendering from `index.json`
- tag filtering with per-tag OFF/INCLUDE/EXCLUDE
- optional text search (name/description/tags)

## Already decided
- Tags are **freeform**.
- Filter semantics: per tag is OFF / INCLUDE / EXCLUDE.
- Landing shows a featured grid (subset of catalogue).

## Implementation clarifications
1. Scope of tag filtering:
   - Only on the Browse page.
2. Text search:
   - Required at launch.
3. Tag UI scaling:
   - Expect low hundreds of unique tags; implement deduplication.
   - Use toggleable chips for tag UI.
4. Sort options:
   - Add a dropdown to sort by token count, alternative greetings, or upload date (descending).
   - Default ordering is upload date (descending).
   - Token count and alternative greetings are sourced from the base spec_v2 character JSON.

## Tasks
- Implement tag extraction from catalogue entries.
- Implement a tri-state UI per tag:
  - OFF → INCLUDE → EXCLUDE → OFF (or other explicit control).
- Implement filtering logic:
  - Result must contain all INCLUDE tags; must contain none of EXCLUDE tags.
- Render filtered results in responsive grid.
- Persist filters in URL (querystring or hash) **if routing choice supports it**.

## Acceptance criteria
- Filtering behaves deterministically and matches tri-state logic.
- UI remains usable on mobile widths.
- Filtering does not require server calls.

## Integration points
- Consumes `src/data/index.json` and outputs to DOM.
- Card click navigates according to DIRECTIVE_01.

## Icon system note
- Icons must use the centralized SVG symbol system in `public/icons/icons.svg`.
- Add new icons by defining a `<symbol>` in the shared icon sprite.
