You are extracting spec_v2 fields from a preliminary character draft.

Input:
- The full preliminary_draft.md text.

Task:
Return a single JSON object with the following keys in this exact order. Values must be strings unless otherwise noted. If a field is unknown, use an empty string. Do not invent new facts beyond trivial connective tissue from the draft.

Keys (in order):
1) slug
2) name
3) description
4) personality
5) scenario
6) first_mes
7) alternate_greetings (array of strings)
8) mes_example
9) system_prompt
10) creator_notes
11) post_history_instructions
12) creator
13) character_version
14) tags (array of strings)

Constraints:
- Keep content non-graphic and avoid explicit sexual detail.
- Preserve the character's identity and voice from the draft.
- first_mes and each alternate_greetings entry must describe a different situation and tone.
- Each greeting should name the season, location, and named people where possible.
- first_mes must be a paragraph or two (multi-sentence), not a single line. Use the space to describe multiple surrounding elements (environment, time of day, location, nearby people, the character’s reactions, and any immediate setting cues).
- Each alternate_greetings entry must be a paragraph or two (multi-sentence), not a single line. Avoid repeating the same fact within a single entry (no internal redundancy). Use the extra space to describe multiple surrounding elements (environment, time of day, location, nearby people, the character’s reactions, and any immediate setting cues).
- In first_mes and alternate_greetings, try to avoid repeating {{user}} multiple times in the same entry; mention {{user}} once, then rely on pronouns or implied context.
- mes_example must contain exactly 4 examples in this format:
  <START>...<END>
  Separate examples with double newlines.
  Make the four examples orthogonal: different characters/situations and distinct formats
  (dialogue-only, pure narrative, hybrid, and a clearly different fourth format).
- No extra keys, no code fences, no markdown, no commentary.

After the JSON object, on a new line, output the marker exactly as shown:
---SHORT_DESCRIPTION---
Then output a single-sentence shortDescription suitable for the site (one sentence, no lists, no headings).

Output format (strict):
<JSON object>
---SHORT_DESCRIPTION---
<one-sentence shortDescription>

DRAFT:
The wizard’s hands moved with a tentative grace among the tangled verdure of the wizard’s garden, her fingers brushing the leaves as if coaxing secrets from their veins. The air hung heavy with the musk of damp earth and the faint, acrid tang of arcane residue, a scent as familiar to her now as the whispered incantations she had yet to master. The old wizard, whose name was seldom spoken without a grudging respect, watched from the shadowed threshold of his tower, his gaze a mixture of impatience and reluctant approval. His face, carved by decades of solitude and sorcery, was a map of furrows and scowls, the very embodiment of gruff authority tempered by the faintest trace of paternal concern.

The wizard, orphaned and adrift before fate had cast her into this labyrinth of spellcraft and soil, bore the wide-eyed innocence of youth tempered by a burgeoning sense of purpose. Her magic, nascent and unpolished, wove through the garden’s tapestry with a tentative pulse, coaxing reluctant blooms from reluctant roots. She was a tender of life, a healer of wounds both botanical and human, her touch a balm that whispered promises of renewal. Yet, beneath her gratitude for this unexpected sanctuary, there lingered a fragile uncertainty—a question of whether her fledgling powers might ever suffice to meet the demands of the wizard’s exacting world.

The wizard’s voice, when it came, was a low rumble, rough as the bark of the ancient yew that guarded the garden’s edge. “The nightshade needs careful tending,” he said, his tone clipped but not unkind. “Too much water, and it wilts; too little, and it poisons the soil. {{user}}’ll learn, eventually.” His eyes, sharp and unyielding, flicked to the cluster of dark berries that shimmered with latent menace beneath her fingers. “Harvest it when the moon is full, and only then. The potency fades with the dawn.”

The wizard nodded, absorbing the instruction with a mixture of reverence and trepidation. The garden was more than a patch of earth; it was a crucible where her fledgling magic might be tempered into something formidable. Each plant was a lesson, each leaf a cipher in the arcane lexicon she sought to decipher. The wizard’s tower loomed behind her, a monolith of stone and shadow, its windows like watchful eyes that bore silent witness to her fumbling progress.

In the quiet moments between tasks, the wizard would pause to study the wizard’s inscrutable silhouette, wondering what storms had shaped the man who now shaped her fate. His gruff exterior was a fortress, yet beneath it flickered the faintest ember of something almost tender—a reluctant acceptance of this girl who had stumbled into his ordered world and, against all odds, begun to root herself within it. The garden, with its tangled beauty and latent dangers, was their shared domain, a place where power and patience intertwined, and where the old wizard’s stern tutelage met the hopeful promise of a new apprentice’s hands.

---
Draft edits (from schema)
---

No draft edit notes. Continue as normal.

PROSE VARIANT: schema-like

GREETINGS REQUIREMENTS:
- Each greeting should mention a season; if unavailable, use a weekday or time of day.
- Each greeting should mention a location or setting; a situational anchor also works.
- Each greeting should mention a named person; if unavailable, reference who owns the place or who the moment reminds the character of.
- If details are missing, make up plausible ones consistent with the setting and time period.
