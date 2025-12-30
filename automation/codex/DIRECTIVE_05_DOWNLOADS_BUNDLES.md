# DIRECTIVE_05_DOWNLOADS_BUNDLES — Downloads, ZIP Bundles, and “Download Everything”

Date: 2025-12-30

## Goal
Provide reliable client-side downloads:
- individual file downloads (JSON, text, PNG if present)
- per-character “Download everything” bundle (ZIP)
- site-wide “Download everything” bundle (ZIP) with defined defaults

## Already decided
- “Download everything” exists both per character and site-wide.
- Static site constraints (no server bundling).

## Implementation clarifications
1. Default selections for site-wide download:
   - Use the default/original settings of each character.
   - Module defaults follow `DIRECTIVE_06`.
   - Include one JSON and one PNG (with embedded JSON metadata) per character.
2. Scale:
   - Up to 100 characters; no explicit browser memory constraints.
3. Naming convention:
   - Organize by slug, alphabetically.
   - Include a manifest with one line per character and a link (full schema TBD).

## Tasks
- Implement `downloadBlob(filename, mime, bytes)` utility.
- Add ZIP support (recommended: JSZip).
- Per-character bundling:
  - generate selected outputs
  - create ZIP with a manifest (selected modules + transform + version + source link)
- Site-wide bundling:
  - iterate all characters
  - apply defaults (or prompt user once)
  - build ZIP with top-level manifest

## Clarification: Static Assembly (No LLM)
All downloads must be produced from **static, pre-authored fragments** assembled deterministically
based on selected modules. The download pipeline must not invoke any LLM, inference, or rewriting;
it only exports the composed spec_v2 JSON/text/PNG using the chosen format transform.

## Acceptance criteria
- Downloads work in modern Chromium/Firefox.
- ZIPs include deterministic paths and filenames.
- Manifest contains sufficient provenance and configuration info.

## Integration points
- Consumes generated outputs from DIRECTIVE_04.
- Triggered from UI in DIRECTIVE_03.
