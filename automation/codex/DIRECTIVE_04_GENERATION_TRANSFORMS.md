# DIRECTIVE_04_GENERATION_TRANSFORMS — Canonical Model, Assembly, and Transform Pipeline

Date: 2025-12-30

## Goal
Define and implement the generation pipeline:
- canonical character model in JSON
- module assembly into a “compiled character” intermediate representation
- transform modes that change formatting only
- emitters for output types (JSON, text packs, PNG placeholder)

## Already decided
- Outputs include JSON + text packs + PNG (PNG may be phased).
- Transforms affect formatting only; content selection is driven by module toggles.
- Variant composition rules are deterministic and static; pipeline should be extensible.

## Implementation clarifications
1. Canonical representation:
   - Mandatory fields are those specified by `automation/schemas/character_card_spec_v2.md`.
2. Transform contract:
   - Transforms are deterministic, format-only renderings of an already-assembled character.
   - Module toggles control which static fragments are concatenated/replaced/injected and where.
3. Text pack targets:
   - Produce a single JSON in spec_v2 format with fields swapped/concatenated per user choices.
4. PNG:
   - PNGs are static uploads; metadata contains the same JSON chunk used for SillyTavern imports.
   - Users can right-click save to preserve embedded metadata.

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

## Clarification: Static Assembly (No LLM)
The assembly pipeline is **fully deterministic** and uses only static fragments defined per
character. There is **no live LLM use**, no inference, no summarization, and no rewriting. The
system only concatenates, replaces, and injects predefined text/JSON fragments based on module
toggles, then applies a transform that changes formatting without altering content.

## Integration points
- Inputs: selection state from DIRECTIVE_03.
- Outputs: file generation for DIRECTIVE_05.
- Schemas: DIRECTIVE_06.
