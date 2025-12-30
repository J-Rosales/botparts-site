# DIRECTIVE_04_GENERATION_TRANSFORMS — Canonical Model, Assembly, and Transform Pipeline

Date: 2025-12-30

## Goal
Define and implement the generation pipeline:
- canonical character model in JSON
- module assembly into a “compiled character” intermediate representation
- transform modes that change formatting and/or content
- emitters for output types (JSON, text packs, PNG placeholder)

## Already decided
- Outputs include JSON + text packs + PNG (PNG may be phased).
- Transforms can affect both content and formatting (“both” confirmed).
- Variant composition rules will be designed later, but pipeline should be extensible.

## Clarify before implementation
1. Canonical representation:
   - What fields are mandatory for a character (name, persona, scenario, example dialogue, etc.)?
2. Transform contract:
   - Which transforms are “presentation only” vs “content altering”?
   - Should transforms be template-based (string templates) or rule-based (field mapping + renderers)?
3. Text pack targets:
   - What are the exact pack shapes? (single combined prompt vs multi-file per role).
4. PNG:
   - If supported later, confirm exact embedding method and metadata format used by SillyTavern.

## Tasks
- Define an intermediate “CompiledCharacter” object.
- Implement module application:
  - base + enabled modules merged with predictable ordering.
- Implement transforms:
  - at least two modes: `natural` and `schema` (names may change).
- Implement emitters:
  - `emitSillyTavernJson(compiled, transform)`
  - `emitTextPacks(compiled, transform)`
  - `emitPngPlaceholder(...)` (stub until spec confirmed)

## Acceptance criteria
- Deterministic output given same inputs.
- No DOM dependency inside generation functions (pure functions).
- Unit-testable functions (even if tests are deferred).

## Integration points
- Inputs: selection state from DIRECTIVE_03.
- Outputs: file generation for DIRECTIVE_05.
- Schemas: DIRECTIVE_06.
