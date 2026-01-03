# PROJECT.md — botparts-site

## Role
`botparts-site` is the **static frontend** for the Botparts project.  
It hosts a Neocities-compatible website that lets users browse, configure, and download SillyTavern character bots.

This repository **does not generate content**. It only **consumes static exports** produced by `botparts-generator`.

## Architecture Constraints (Non‑Negotiable)
- Static hosting only (Neocities).
- No server-side code.
- No live LLM usage.
- All character assembly is **deterministic** (concatenation / replacement / injection).
- UI toggles select **predefined fragments** only.

## Repository Topology (Botparts)
- `botparts-schemas` → source of truth for all JSON Schemas.
- `botparts-generator` → produces static character packages and index files.
- `botparts-site` → consumes those packages and presents UI + downloads.

## Schemas
Schemas are vendored from `botparts-schemas` via **git subtree**.

- Local path: `automation/schemas/`
- Do **not** edit schema files in this repo.
- Schema changes must be made in `botparts-schemas` and pulled in.

## Data Contract (Consumed)
The site expects generated data under `src/data/` (or equivalent deploy root):

- `index.json`
- `data/characters/<slug>/manifest.json`
- `data/characters/<slug>/fragments/**`

All files must validate against the vendored schemas.

## Assembly Model
- **Modules / toggles** select static fragments.
- **Transforms** affect only rendering/format (schema vs prose, etc.).
- Transforms must not select content.

## Codex Rules
When working in this repo:
- Modify UI, JS, CSS, routing, and download logic only.
- If a change requires schema modification, **stop** and list required schema diffs instead.
- Read `PROJECT.md` and `automation/codex/AGENTS.md` before implementing changes.

## Theme system
Theme tokens live in `src/css/themes.css`, and component overrides are applied in
`src/css/theme-bridge.css`. The theme switcher logic is in `src/js/theme.js` and
is wired on every page via the `<select id="themeSelect">` control.

### Add a new theme
1. Add a new `html[data-theme=\"your-theme\"]` block in `src/css/themes.css`.
2. Define the token values (backgrounds, text, links, accent, border, etc.).
3. Add a matching `<option value=\"your-theme\">` entry in each page header.

### Set the default theme
Update `DEFAULT_THEME` in `src/js/theme.js` and the inline theme bootstrap
script in each HTML `<head>` to the same theme name.
