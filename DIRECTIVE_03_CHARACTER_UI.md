# DIRECTIVE_03_CHARACTER_UI — Character Page Layout, Toggles, and Metadata

Date: 2025-12-30

## Goal
Implement the character entry “store-like” view:
- left/main: character details and preview
- right/side: configuration panel with toggles and download controls
- toggles: module selection + transform mode selection

## Already decided
- Each character has variants/modules selectable by toggles.
- Each character has model transforms (schema-like vs natural language) and transforms may affect content and/or formatting.
- Download area replaces “add to cart” (user selects options and downloads).

## Clarify before implementation
1. Minimum module types at launch:
   - Provide a starter set (e.g., base persona, lore pack, constraints pack, example dialogue pack) even if final rules come later.
2. Toggle grouping behavior:
   - Need both multi-select and one-of groups? (e.g., radio groups for mutually exclusive variants).
3. Preview pane:
   - Should it show the assembled output live? If yes, which output type is previewed by default?
4. Source + attribution display:
   - Exact wording/placement and whether to display redistribution status.

## Tasks
- Build the layout skeleton and responsive behavior.
- Render:
  - metadata (name, description, tags, changelog/versions if present)
  - provenance links (source + optional backup)
- Render controls:
  - module toggles (checkbox/radio groups)
  - transform mode selector
  - output type selector (JSON/text/PNG)
- Provide a “current config summary” section (what is selected) to reduce user error.

## Acceptance criteria
- Fully keyboard operable controls.
- Selection state is reflected in the UI and can be serialized (for URL/permalink later).
- Works with a stub character JSON file.

## Integration points
- Uses schema from DIRECTIVE_06.
- Calls generation layer from DIRECTIVE_04.
- Calls download layer from DIRECTIVE_05.
