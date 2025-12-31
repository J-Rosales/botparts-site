# Diagnostic Report: Runtime Evidence

## Modified files
- `src/js/site-data.js`
- `public/js/site-data.js`
- `src/js/landing.js`
- `src/js/browse.js`
- `public/js/index.js`
- `docs/DIAGNOSTIC_REPORT_RUNTIME_EVIDENCE.md`

## Debug strings
- `[CARD-WIRING] landing.js loaded`
- `[CARD-WIRING] browse.js loaded`
- `[CARD-WIRING] public/js/index.js loaded`
- `[CARD-WIRING] built card tag=`

## How to capture
1. Open DevTools → Console and copy every line that starts with `[CARD-WIRING]`.
2. Inspect a rendered card in the Elements panel and copy its `outerHTML`, ensuring it includes the `data-built-by` attribute.
