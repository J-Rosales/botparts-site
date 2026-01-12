# Build Pipeline (Static Sync)

## Scope
This repository is a static consumer. The "build" process **must not** generate data.
It only validates and mirrors `src/` into `public/` for deployment.

## Preconditions
- Generator output has already been copied into `src/data/` (outside this repo).
- `src/` is the canonical UI source.

## Local commands (run from the parent folder)
### 1) Sync generator output into src/data
```bash
rsync -a --delete \
  botparts-generator/output/ \
  botparts-site/src/data/
```

### 2) Validate + mirror src → public
```bash
cd botparts-site

python -m pytest tests/test_static_contract.py
rsync -a --delete src/ public/
```

## Generator steps (reported only, not implemented here)
From the parent folder (outside this repo), run generator tooling to refresh
the data export, then copy it into `botparts-site/src/data/`.

Example (informational only):
```bash
cd botparts-generator
# ... generator-specific build/export commands ...
```
