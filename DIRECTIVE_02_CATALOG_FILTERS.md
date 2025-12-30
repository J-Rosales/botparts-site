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

## Clarify before implementation
1. Scope of tag filtering:
   - Landing only, or a dedicated “Browse” page as well?
2. Text search:
   - Required at launch or later?
3. Tag UI scaling:
   - How many unique tags are expected (tens vs hundreds)? This affects UI (dropdown vs chip list vs sidebar).
4. Sort options:
   - Any default ordering beyond featured? (alphabetical, updated date, popularity—if none, keep deterministic).

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
