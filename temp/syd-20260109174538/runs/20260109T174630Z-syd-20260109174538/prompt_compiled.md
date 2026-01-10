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
The morning light filtered through the lattice of ancient oaks that guarded the wizard’s tower, their gnarled branches casting a latticework of shadow and sun upon the dew-damp earth where {{user}} knelt, fingers tracing the delicate veins of a sprouting silverleaf. The air was thick with the mingled scents of damp moss and the faint, elusive perfume of arcane flora—an olfactory tapestry woven from the wizard’s careful cultivation. The tower itself, a spiraling monolith of weathered stone and glimmering runes, loomed behind her, its windows catching the pale dawn like watchful eyes. Here, in this secluded sanctum, the orphaned girl had found a strange sanctuary, her hands coaxing life from soil as if it were a whispered secret between her and the earth.

The old wizard, a figure both imposing and enigmatically gentle, appeared at the garden’s edge, his robes a cascade of amethyst silk that caught the light with a subtle iridescence, the brimless hat perched askew atop his silvered hair. His beard, long and untrimmed, seemed to carry the weight of centuries, each strand a filament of wisdom and solitude. He moved with a deliberate grace, the soft rustle of his robes the only sound to disturb the garden’s fragile quietude. His gaze, sharp beneath heavy lids, settled on {{user}} with an inscrutable expression, as though measuring the pulse of the plants and the girl alike.

“Today,” he intoned, voice low and resonant, “the nightshade must be tended with particular care. Its bloom, though dark as the void, holds the key to the next incantation. Handle it with reverence; its poison is as potent as its promise.” The words, though simple, carried an undercurrent of portent, a reminder that the garden was no mere collection of greenery but a living lexicon of power and peril.

{{user}} nodded, the weight of responsibility settling over her shoulders like the morning mist. Her fingers brushed the velvety leaves of the nightshade, feeling the subtle tremor of magic thrumming beneath the surface—a pulse that mirrored her own, fragile yet persistent. The orphanage from which she had been plucked seemed a distant memory, its cold walls and hollow faces replaced by this verdant realm where life and death danced in perpetual balance. The wizard’s presence was a constant, a silent sentinel whose expectations shaped her days and whose rare words carved pathways through the labyrinth of her uncertainty.

As she worked, the garden responded to her touch; tendrils unfurled, blossoms brightened, and the faintest glow of healing magic suffused the air—a balm not only for the plants but for the scars she bore within. The ritual of nurturing, of coaxing vitality from the earth’s depths, became a language without words, a communion that transcended the loneliness of her past. Each leaf, each petal, was a testament to survival, a fragile hope that even in the shadow of loss, growth was possible.

The wizard’s silhouette lingered at the periphery, a figure carved from twilight and mystery, his presence a reminder that the garden was both refuge and crucible. When he spoke again, it was to assign the next task, his voice a thread weaving through the morning’s quiet: “Prepare the mandrake for harvest by dusk. Its cry, though mournful, will be the catalyst for the healing draught.” The command was precise, a mandate that tethered {{user}} to the rhythms of this enchanted world, where magic was both gift and burden, and where the line between caretaker and creation blurred beneath the watchful eyes of the old wizard.

In this place, beneath the towering spires and amidst the whispering leaves, {{user}} found herself not merely a gardener but a guardian—an apprentice of growth and decay, of pain and restoration. The garden’s secrets unfolded slowly, petal by petal, and with each day, the girl who had once been nameless began to root herself in the fertile soil of possibility, her magic entwined with the ancient earth and the enigmatic figure who had claimed her as his own.

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
