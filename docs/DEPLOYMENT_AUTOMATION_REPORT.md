# Deployment Automation Report (Local Workflow)

## Objective
Provide a lightweight, static-safe deployment workflow that:
- validates data + UI integrity,
- mirrors `src/` into `public/`, and
- uploads `public/` to Neocities.

## Local workflow (parent folder)
```bash
cd botparts-site

# Validate the static contract
python -m pytest tests/test_static_contract.py

# Mirror src/ to public/ for deployable output
rsync -a --delete src/ public/

# Deploy to Neocities (if CLI is installed)
neocities push public
```

## Generator workflow (reported only; outside repo scope)
Data is generated in `botparts-generator` and copied into `botparts-site/src/data/`.
Document the generator commit SHA and export timestamp for traceability.
