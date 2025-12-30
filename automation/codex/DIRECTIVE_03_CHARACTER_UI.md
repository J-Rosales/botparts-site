# DIRECTIVE_03_CHARACTER_UI — Character Page Layout, Toggles, and Metadata

Date: 2025-12-30

## Goal
Implement the character entry “store-like” view:
- left/main: character details and preview
- right/side: configuration panel with toggles and download controls
- toggles: module selection + transform mode selection

## Already decided
- Each character has variants/modules selectable by toggles.
- Each character has model transforms (schema-like vs natural language) and transforms affect **formatting only**.
- Download area replaces “add to cart” (user selects options and downloads).

## Implementation clarifications
1. Minimum module types at launch:
   - Base Persona, First Message, Alternate Greetings, Post History Instructions, and System Prompt.
   - Post History Instructions and System Prompt are seldom used.
   - Each element maps to a spec_v2 field for the character.
2. Toggle grouping behavior:
   - Support both multi-select and single-select; all options within the same category are mutually exclusive.
3. Preview pane:
   - Each JSON text field snippet has a preview in an uneditable text box within a foldout element.
   - The foldout contains the toggle for its selection.
4. Source + attribution display:
   - Short-form indicator stub at the bottom left of the card.
   - Clicking opens a modal with more information.
   - Redistribution status is shown in the same modal.
5. Layout and affordances:
   - Header retains navigation links.
   - Two-column layout: left shows a larger image preserving aspect ratio; right contains foldable controls.
   - Toggles live in foldout sections with uneditable previews; include small “?” tooltip buttons for explanations.
   - Download options sit at the bottom of the right column.

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

## Clarification: Static Assembly (No LLM)
All toggles select **predefined, static modules** for inclusion in the output. The UI must present
module choices as deterministic content selections. Transforms are separate controls that only
change rendering/format for the selected content; they do **not** choose or rewrite content.

## Acceptance criteria
- Fully keyboard operable controls.
- Selection state is reflected in the UI and can be serialized (for URL/permalink later).
- Works with a stub character JSON file.

## Integration points
- Uses schema from DIRECTIVE_06.
- Calls generation layer from DIRECTIVE_04.
- Calls download layer from DIRECTIVE_05.
