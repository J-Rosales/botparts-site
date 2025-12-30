# Implementation Clarifications Questionnaire

## Global (from `automation/codex/AGENTS.md`)
1. **Output formats**
   - **Q:** What exact SillyTavern JSON spec/version should we target?
     **A:** _______________________________________________
   - **Q:** What is the expected PNG embedding format (if any), and which SillyTavern version defines it?
     **A:** _______________________________________________

2. **“Download everything” defaults**
   - **Q:** Which transform mode should be the default?
     **A:** _______________________________________________
   - **Q:** Which module set should be included by default?
     **A:** _______________________________________________
   - **Q:** Which output files (JSON, text packs, PNG) should be included by default?
     **A:** _______________________________________________

3. **Variant composition rules**
   - **Q:** What is the required ordering for module/variant application?
     **A:** _______________________________________________
   - **Q:** Are there any mutual exclusions or conditional rules?
     **A:** _______________________________________________
   - **Q:** Is there a minimal “contract” we must support at launch?
     **A:** _______________________________________________

4. **Transform contract**
   - **Q:** Which transforms are allowed to change **content** vs **presentation only**?
     **A:** _______________________________________________
   - **Q:** How should transforms be declared (template-based, rule-based, or another form)?
     **A:** _______________________________________________

5. **Licensing metadata**
   - **Q:** What are the minimum required metadata fields per character?
     **A:** _______________________________________________
   - **Q:** What exact UI wording should be used for “no redistribution” entries?
     **A:** _______________________________________________

6. **Scale expectations**
   - **Q:** Expected number of characters?
     **A:** _______________________________________________
   - **Q:** Any target performance constraints (load time, bundle size, memory limits)?
     **A:** _______________________________________________

---

## DIRECTIVE_01 — Views, Navigation, and Routing
1. **Routing choice**
   - **Q:** Do you prefer **multi-page HTML** (`/character/<slug>.html`) or **SPA-style routing** (`/#/character/<slug>` or querystring)?
     **A:** _______________________________________________
   - **Q:** What is the primary driver for this choice (URL aesthetics, simplicity, duplication, etc.)?
     **A:** _______________________________________________

2. **Template integration**
   - **Q:** Which third-party template (if any) is selected?
     **A:** _______________________________________________
   - **Q:** Which visual elements must be kept vs discarded?
     **A:** _______________________________________________

3. **Content pages**
   - **Q:** Should About / How-To / License / Changelog be **separate pages** or **modal panels**?
     **A:** _______________________________________________

---

## DIRECTIVE_02 — Catalogue, Tag Filtering, and Search
1. **Tag filtering scope**
   - **Q:** Should tri-state tag filtering appear on **landing only**, or also on a **dedicated Browse page**?
     **A:** _______________________________________________

2. **Text search**
   - **Q:** Is search required at launch or can it be deferred?
     **A:** _______________________________________________

3. **Tag UI scaling**
   - **Q:** How many unique tags are expected (tens vs hundreds)?
     **A:** _______________________________________________
   - **Q:** Any preferred UI (dropdown, chips, sidebar, collapsible list, etc.)?
     **A:** _______________________________________________

4. **Sorting**
   - **Q:** Any default ordering beyond “featured”?
     **A:** _______________________________________________
   - **Q:** If yes, should we prioritize alphabetical, updated date, popularity, or something else?
     **A:** _______________________________________________

---

## DIRECTIVE_03 — Character Page UI, Toggles, Metadata
1. **Minimum module types (launch scope)**
   - **Q:** Which module types must exist at launch (e.g., base persona, lore pack, constraints pack, example dialogue pack)?
     **A:** _______________________________________________

2. **Toggle grouping behavior**
   - **Q:** Should we support **multi-select**, **single-select**, or **both**?
     **A:** _______________________________________________
   - **Q:** If both, which modules are mutually exclusive (radio groups)?
     **A:** _______________________________________________

3. **Preview pane behavior**
   - **Q:** Should the preview show **assembled output live**?
     **A:** _______________________________________________
   - **Q:** If yes, which output type should be shown by default (JSON, text pack, etc.)?
     **A:** _______________________________________________

4. **Source + attribution display**
   - **Q:** Exact wording and placement?
     **A:** _______________________________________________
   - **Q:** Should redistribution status be displayed, and if so how?
     **A:** _______________________________________________

---

## DIRECTIVE_04 — Generation & Transforms
1. **Canonical character fields**
   - **Q:** Which fields are **mandatory** (e.g., name, persona, scenario, example dialogue, etc.)?
     **A:** _______________________________________________

2. **Transform contract (implementation detail)**
   - **Q:** Which transforms are **presentation-only** vs **content-altering**?
     **A:** _______________________________________________
   - **Q:** Should transforms be **template-based**, **rule-based**, or hybrid?
     **A:** _______________________________________________

3. **Text pack targets**
   - **Q:** What exact pack shapes should be produced (single combined prompt vs multi-file per role)?
     **A:** _______________________________________________

4. **PNG support**
   - **Q:** If/when PNG is supported, confirm exact embedding method and metadata format.
     **A:** _______________________________________________

---

## DIRECTIVE_05 — Downloads & Bundles
1. **Site-wide download defaults**
   - **Q:** Default transform mode?
     **A:** _______________________________________________
   - **Q:** Default module set?
     **A:** _______________________________________________
   - **Q:** Which outputs should be included?
     **A:** _______________________________________________

2. **Scale assumptions**
   - **Q:** Expected number of characters for site-wide bundling?
     **A:** _______________________________________________
   - **Q:** Browser memory constraints or limit thresholds?
     **A:** _______________________________________________

3. **ZIP naming/layout**
   - **Q:** Preferred directory layout inside ZIP (by slug, by category, etc.)?
     **A:** _______________________________________________
   - **Q:** Should each ZIP include a manifest? If yes, what fields?
     **A:** _______________________________________________

---

## DIRECTIVE_06 — Data Schema & Attribution
1. **Minimum metadata**
   - **Q:** Required fields per character (tags, description, featured, lastUpdated, author credit, etc.)?
     **A:** _______________________________________________

2. **Attribution phrasing rules**
   - **Q:** How to phrase “rewrite/update” vs “fork” vs “inspired by”?
     **A:** _______________________________________________

3. **Redistribution flag semantics**
   - **Q:** Should this be `redistributeAllowed: true/false/unknown`, or another scheme?
     **A:** _______________________________________________
   - **Q:** What is the default if unknown?
     **A:** _______________________________________________

4. **Versioning**
   - **Q:** Do we track internal revisions and changelog entries?
     **A:** _______________________________________________
   - **Q:** If yes, what structure should versioning take?
     **A:** _______________________________________________
