# Release Pipeline (Neocities Deployment)

## Scope
Deployment uploads the **static** contents of `public/` to Neocities.
No transforms or builds are performed during release.

## Local commands (run from the parent folder)
```bash
cd botparts-site

# Optional sanity checks before deployment
python -m pytest tests/test_static_contract.py

# Deploy via Neocities CLI (if installed and authenticated)
neocities push public
```

## Manual fallback
If the Neocities CLI is unavailable, upload the contents of `public/`
through the Neocities web UI, preserving directory structure.
