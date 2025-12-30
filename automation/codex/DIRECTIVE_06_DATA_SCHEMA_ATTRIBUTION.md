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

## Clarify before implementation
1. Minimum metadata required per character:
   - tags, description, featured, lastUpdated, authorship credit, etc.
2. Attribution display rules:
   - how to phrase “rewrite/update” vs “fork” vs “inspired by”.
3. Redistribution flag semantics:
   - `redistributeAllowed: true/false/unknown` and default handling.
4. Versioning:
   - do we track internal revision versions and changelog entries?

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

## Acceptance criteria
- A character file validates against `character.schema.json`.
- Index file validates against `index.schema.json`.
- Required fields cover attribution and source link.
- Schema is extensible for future variant composition rules.

## Integration points
- Consumed by DIRECTIVE_02 (index) and DIRECTIVE_03/04 (character content).
