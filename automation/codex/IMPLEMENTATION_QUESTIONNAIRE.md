# Implementation Clarifications Questionnaire

## General Commentary
The following is a natural language narrative of the usage and view of the site:
The user starts in a landing page with the other links at the top, based on the template. The user only sees featured character cards and must enter the Browser page to see the full searchable catalog. Each character card contains image, and minimal information as defined by `DIRECTIVE_06` in this repository, as well as relevant tags in UI chips format. Follow best practices for aesthetics and minimal visual feedback when hovering and clicking cards. Clicking the card opens a more detailed view, mainly a header and two columns. The header maintains the navigation links, while the left column has a larger version of the same image, without changing aspect ratio. The right column has foldable elements with toggles indicating the different modules to be combined. Some elements will have a small (?) button to the right that show a tooltip when hovered explaining the control. At the bottom of the right column are buttons with different download options.

## Global (from `automation/codex/AGENTS.md`)
1. **Output formats**
   - **Q:** What exact SillyTavern JSON spec/version should we target?
     **A:** chara_card_v2
   - **Q:** What is the expected PNG embedding format (if any), and which SillyTavern version defines it?
     **A:** carry the same json chunk you would use to directly import into SillyTavern into metadata for the image

2. **“Download everything” defaults**
   - **Q:** Which transform mode should be the default?
     **A:** the "download everything" buttton should download the default (original settings) of every character in the website and put them in a zip file, one file per character.
   - **Q:** Which module set should be included by default?
     **A:** WIll be based on the defaults set by the implementation as defined by `DIRECTIVE_06`in this repository
   - **Q:** Which output files (JSON, text packs, PNG) should be included by default?
     **A:** 1 JSON, 1 PNG (with the same JSON as metadata) per character in a zip file

3. **Variant composition rules**
   - **Q:** What is the required ordering for module/variant application?
     **A:** Always the same order, as defined by `automation/schemas/character_card_spec_v2.md`
   - **Q:** Are there any mutual exclusions or conditional rules?
     **A:** Different variants provide different values for fields, as defined by `DIRECTIVE_06`in this repository, but the fields are the same every time

4. **Transform contract**
   - **Q:** Which transforms are allowed to change **content** vs **presentation only**?
     **A:** In general, the transforms will be made at design time and uploaded as variants of the same spec_v2 field. IMPORTANT: No LLM usage or dynamic json editing will occur in real time or at download time, it is only concatenation, composition and export.
   - **Q:** How should transforms be declared (template-based, rule-based, or another form)?
     **A:** Hybrid.

5. **Licensing metadata**
   - **Q:** What are the minimum required metadata fields per character?
     **A:** You decide, find minimum best practices online.
   - **Q:** What exact UI wording should be used for “no redistribution” entries?
     **A:** Whatever best practices require. Remember I will not be redistributing unless allowed by license. If I cannot redistribute, I will link to source without a local backup.

6. **Scale expectations**
   - **Q:** Expected number of characters?
     **A:** Around 100 maximum. Will start with 12.
   - **Q:** Any target performance constraints (load time, bundle size, memory limits)?
     **A:** Keep it on the fast side, but make it an editable variable so changes can be made later.

---

## DIRECTIVE01 — Views, Navigation, and Routing
1. **Routing choice**
   - **Q:** Do you prefer **multi-page HTML** (`/character/<slug>.html`) or **SPA-style routing** (`/#/character/<slug>` or querystring)?
     **A:** Whichever is simpler for humans to remember to type and to navigate
   - **Q:** What is the primary driver for this choice (URL aesthetics, simplicity, duplication, etc.)?
     **A:** Simplicity

2. **Template integration**
   - **Q:** Which third-party template (if any) is selected?
     **A:** Added wholesale to `template-src`
   - **Q:** Which visual elements must be kept vs discarded?
     **A:** In the landing page, Ignore everything after the "What Our Customers Say" header. The layout is what matters, the content of the cards will be different.

3. **Content pages**
   - **Q:** Should About / How-To / License / Changelog be **separate pages** or **modal panels**?
     **A:** Separate pages. The pages should be `Landing`(or main, if that's the best practice), `Browse`, `How To`, and `About`. `Browse` is the dynamic search page with grid view. `Landing` does not have a search function, it merely shows the featured cards. `About` and `How To` are static decorated markdown with css.

---

## DIRECTIVE02 — Catalogue, Tag Filtering, and Search
1. **Tag filtering scope**
   - **Q:** Should tri-state tag filtering appear on **landing only**, or also on a **dedicated Browse page**?
     **A:** Only in `Browse` page

2. **Text search**
   - **Q:** Is search required at launch or can it be deferred?
     **A:**It is required.

3. **Tag UI scaling**
   - **Q:** How many unique tags are expected (tens vs hundreds)?
     **A:** In the low hundrds. deduplication methods are to be implemented.
   - **Q:** Any preferred UI (dropdown, chips, sidebar, collapsible list, etc.)?
     **A:** For tags specifically, toggleable chips.

4. **Sorting**
   - **Q:** Any default ordering beyond “featured”?
     **A:** Add a drop down menu field to sort by token count, by alternative greetings, or by upload date (descending) as well. The first two elements are also indicated in the card's associated base spec_v2 character json file 
   - **Q:** If yes, should we prioritize alphabetical, updated date, popularity, or something else?
     **A:** Upload date by default.

---

## DIRECTIVE03 — Character Page UI, Toggles, Metadata
1. **Minimum module types (launch scope)**
   - **Q:** Which module types must exist at launch (e.g., base persona, lore pack, constraints pack, example dialogue pack)?
     **A:** Base Persona, First Message, Alternate Greetings, Post History Instructions and System Prompt come in the same bundle, to create variants in the knowledge and personality of the character at the start. Each of these elements is associated with a field in the spec_v2 of the character.The `Post History Instructions and System Prompt` module is seldom used.

2. **Toggle grouping behavior**
   - **Q:** Should we support **multi-select**, **single-select**, or **both**?
     **A:** both
   - **Q:** If both, which modules are mutually exclusive (radio groups)?
     **A:** all from same category, i.e.: First Message can only be one at a time

3. **Preview pane behavior**
   - **Q:** Should the preview show **assembled output live**?
     **A:** Each element associated with a json text field snippet will have a preview in an uneditable text box that is shown in a foldout element. This foldout element also has the toggle to show your selection.

4. **Source + attribution display**
   - **Q:** Exact wording and placement?
     **A:** short-form indicator stub on the bottom left of the card, can be clicked for a modal with more information.
   - **Q:** Should redistribution status be displayed, and if so how?
     **A:** Yes, as above.

---

## DIRECTIVE04 — Generation & Transforms
1. **Canonical character fields**
   - **Q:** Which fields are **mandatory** (e.g., name, persona, scenario, example dialogue, etc.)?
     **A:** Those indicated by `automation\schemas\character_card_spec_v2.md`

2. **Transform contract (implementation detail)**
   - **Q:** Which transforms are **presentation-only** vs **content-altering**?
     **A:** It's all concatenation of statically uploaded elements. The toggles only choose which elements to concatenate and where to inject them.

3. **Text pack targets**
   - **Q:** What exact pack shapes should be produced (single combined prompt vs multi-file per role)?
     **A:** A single JSON with the spec as defined by `automation\schemas\character_card_spec_v2.md` where fields are swapped or concatenated based on user choices.

4. **PNG support**
   - **Q:** If/when PNG is supported, confirm exact embedding method and metadata format.
     **A:** As an image on the card, users can simply right click -> save image, to get the image with embedded metadata (statically uploaded)

---

## DIRECTIVE05 — Downloads & Bundles
1. **Site-wide download defaults**
   - **Q:** Default transform mode?
     **A:** As defined by directive.
   - **Q:** Which outputs should be included?
     **A:** The first available for each associated characters.

2. **Scale assumptions**
   - **Q:** Expected number of characters for site-wide bundling?
     **A:** Up to a hundred
   - **Q:** Browser memory constraints or limit thresholds?
     **A:** None

3. **ZIP naming/layout**
   - **Q:** Preferred directory layout inside ZIP (by slug, by category, etc.)?
     **A:** by slug, alphabetically
   - **Q:** Should each ZIP include a manifest? If yes, what fields?
     **A:** one line per character with a link. Full manifest schema to be defined later.

---

## DIRECTIVE06 — Data Schema & Attribution
1. **Minimum metadata**
   - **Q:** Required fields per character (tags, description, featured, lastUpdated, author credit, etc.)?
     **A:** tags, description, featured, lastUpdated, author credit, number of tokens

2. **Attribution phrasing rules**
   - **Q:** How to phrase “rewrite/update” vs “fork” vs “inspired by”?
     **A:** "rewriten or inspired by {author name} ({source website})"

3. **Redistribution flag semantics**
   - **Q:** Should this be `redistributeAllowed: true/false/unknown`, or another scheme?
     **A:** Rely on best practices
   - **Q:** What is the default if unknown?
     **A:** Simply declare as "unknown"

4. **Versioning**
   - **Q:** Do we track internal revisions and changelog entries?
     **A:** Yes.
   - **Q:** If yes, what structure should versioning take?
     **A:** Rely on best practices, do not create a new entry in the log unless requested by user.
