# Provenance Notes (Data + UI)

## Data provenance (external)
All character data is produced by `botparts-generator` and copied into
`botparts-site/src/data/`. This repository must not generate or mutate data.

Capture the following metadata alongside each data refresh:
- Generator repository commit SHA.
- Generator export timestamp.
- Schema version (from `botparts-schemas`).

## UI provenance (internal)
UI changes are tracked via this repository's Git history.
Ensure `public/` mirrors `src/` at release time.
