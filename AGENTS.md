# AGENTS.md — botparts-site

Date: 2025-12-30

## Repository role (authoritative)
This repository is a **static frontend consumer** of pre-generated data.

It implements the Neocities-hosted catalogue UI and client-side downloads.

Architecture: **Pattern A — committed build output**.

## Scope boundaries (non-negotiable)
This repository:
- consumes generated data from the generator
- renders UI from static JSON
- performs client-side assembly and downloads only

It MUST NOT:
- generate or modify data
- contain generator logic
- alter schemas beyond vendoring

## Responsibilities
Agents working here implement:
- navigation and routing
- catalogue browsing and filtering
- character detail UI
- deterministic client-side assembly
- client-side downloads (JSON / text / PNG / ZIP)

All behavior is **static and deterministic**.

## Data contract
- Data lives under `src/data/`
- Structure mirrors generator output exactly.
- `src/data/` is treated as **read-only**.
- Changes to data come only from copying generator output.

## Directive mapping (historical → current)
The following directives remain applicable here, **but only as consumers**:
- DIRECTIVE_01 — View + Navigation
- DIRECTIVE_02 — Catalogue + Filters
- DIRECTIVE_03 — Character UI
- DIRECTIVE_04 — Generation/Transforms (client-side assembly only)
- DIRECTIVE_05 — Downloads/Bundles

Schema authority has moved fully to `botparts-schemas`.

## What agents may do here
- Implement UI logic in HTML/CSS/JS
- Implement client-side deterministic assembly
- Implement download and ZIP logic
- Add accessibility and UX improvements
- Add read-only validation tests

## What agents must not do here
- Do not generate or rewrite content.
- Do not add build pipelines that mutate data.
- Do not add server assumptions.
- Do not edit `src/data/` except by copying generator output.

## Directory contract
Expected structure:
- /src/pages/        (HTML)
- /src/js/           (UI + assembly logic)
- /src/css/          (styles)
- /src/data/         (committed generator output)
- /automation/       (vendored schemas, samples, docs)

## Testing expectations
Agents may generate:
- pytest tests validating data presence
- schema validation using vendored schemas
- static integrity checks

Tests must not modify files or assume network access.

## Mental model
Think of this repo as a **static renderer and exporter**, not a build system.
