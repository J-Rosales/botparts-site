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

## UX vs Visual task discipline (enforced)
Before performing any task, **explicitly classify the request** as one of:
- **UX TASK** (structure, interaction, semantics, behavior)
- **VISUAL TASK** (appearance only: CSS, tokens, spacing, color, emphasis)
- **MIXED TASK** (rare; must be justified)

### Mandatory behavior
- If a task is not clearly labeled, **pause and ask for classification**.
- If a task is labeled **UX TASK**:
  - You may modify HTML structure and JS behavior.
  - You must not perform visual styling beyond minimal defaults needed for usability.
- If a task is labeled **VISUAL TASK**:
  - You may modify CSS (preferably via design tokens).
  - You must not modify HTML structure or JS logic.
- If a task is labeled **MIXED TASK**:
  - Explain why separation is not possible before proceeding.

### Enforcement
- Treat this instruction as part of `AGENTS.md`.
- Reject or flag changes that cross task boundaries.
- Keep diffs minimal and scoped to the allowed surfaces.

## Design Tokens
See `public/css/DESIGN_TOKENS.md` for the token system and usage rules.

- For **VISUAL TASK** work, prefer edits in `public/css/design-tokens.css`.
- Do not introduce new styling systems (Bootstrap/Tailwind/Sass) without explicit user approval.

## Icons
- All icons must come from `public/icons/icons.svg`.
- When a task mentions “add an icon” or “give it an X icon,” use the centralized SVG symbol system.
- External icon libraries (Font Awesome, icon fonts, CDNs) are forbidden unless explicitly approved.
- Do not inline raw SVG `<path>` elements in page HTML.
- Usage pattern:
  ```html
  <button class="icon-button" aria-label="Close">
    <svg class="icon" aria-hidden="true">
      <use href="#icon-x"></use>
    </svg>
  </button>
  ```
- **UX TASKS** may add icon markup using the standard pattern.
- **VISUAL TASKS** may only adjust icon appearance via CSS (prefer tokens).
