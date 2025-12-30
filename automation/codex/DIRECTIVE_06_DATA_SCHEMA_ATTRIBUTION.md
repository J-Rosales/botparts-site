# DIRECTIVE_06_DATA_SCHEMA_ATTRIBUTION — Data Model, JSON Schemas, and Licensing Rules

Date: 2025-12-30

## Goal
Specify the JSON data format for:
- catalogue index
- individual character definitions
- module definitions and transform definitions
- provenance/attribution fields with redistribution constraints

## Already decided
- Data-driven site: `/src/data/index.json` plus `/src/data/characters/<slug>.json`.
- Each character includes original source link.
- If redistribution “as-is” is not allowed, do not host a backup (only link).
 - Each character is a self-contained data package:
   - base definition
   - manifest describing toggles + assembly rules
   - fragment files (system prompt variants, greetings, lore blocks, etc.)

## Implementation clarifications
1. Minimum metadata required per character:
   - tags, description, featured, lastUpdated, author credit, number of tokens.
2. Attribution display rules:
   - Use phrasing: “rewriten or inspired by {author name} ({source website})”.
3. Redistribution flag semantics:
   - Use a best-practice scheme; default to “unknown” when status is unclear.
4. Versioning:
   - Track internal revisions and changelog entries using best practices.
   - Do not create a new log entry unless requested by the user.
5. Modules vs transforms:
   - Modules are the **content selection** mechanism driven by toggles.
   - Transforms are **format-only renderings** for model preferences.

## Tasks
- Draft JSON Schemas:
  - `index.schema.json`
  - `character.schema.json`
  - `output-manifest.schema.json`
- Provide sample files in `/automation/samples/`.
- Ensure the schemas support:
  - freeform tags array
  - provenance objects (source, optional backup, license notes)
  - module lists and transform lists (even if rules are placeholders)
  - per-character manifest fields that point to fragment files and define deterministic assembly

## Acceptance criteria
- A character file validates against `character.schema.json`.
- Index file validates against `index.schema.json`.
- Required fields cover attribution and source link.
- Schema is extensible for future variant composition rules.

## Clarification: Static Assembly (No LLM)
Character content is assembled by **deterministic composition** of predefined fragments listed in
each character’s manifest. There is no LLM usage, inference, or rewriting. Schema definitions must
model modules (content selection) separately from transforms (format-only rendering).

## Integration points
- Consumed by DIRECTIVE_02 (index) and DIRECTIVE_03/04 (character content).
