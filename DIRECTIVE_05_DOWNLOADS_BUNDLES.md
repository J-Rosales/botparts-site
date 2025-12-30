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

## Clarify before implementation
1. Default selections for site-wide download:
   - default transform mode
   - default module set
   - which outputs to include
2. Scale:
   - number of characters expected; large counts may exceed browser memory for full ZIP.
3. Naming convention:
   - directory layout inside the ZIP (by slug; include manifest?)

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

## Acceptance criteria
- Downloads work in modern Chromium/Firefox.
- ZIPs include deterministic paths and filenames.
- Manifest contains sufficient provenance and configuration info.

## Integration points
- Consumes generated outputs from DIRECTIVE_04.
- Triggered from UI in DIRECTIVE_03.
