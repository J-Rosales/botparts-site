# Embedded Entries LLM Log

## Input
```
Entry types:
- locations
- items
- knowledge
- ideology
- relationships

Target entries per type: 2

NOTES:
Include an entry with a catalogue of her culinary knowledge. She has entries about other staff in the manor as well as the Lord and Lady of the house. She also has a secret hobby of an entomological collection.
```

## Prompt
```
You are generating embedded entries for a character authoring workflow.

You will receive a list of entry types and a target total entry count.
Return JSON only. The JSON must be an object keyed by entry type. Each entry type value is a list of objects with:
- title (string)
- slug (string, lowercase letters/digits/hyphens/underscores)
- description (string)
- scopeLevelIndex (integer, optional; 0=world, 1=character, 2=variant)

Rules:
- Generate exactly the target total number of entries across all types.
- If you must choose fewer types to stay within the target, do so.
- If you have no ideas for a type, return an empty list for that type.
- Keep entries grounded, concrete, and reusable.
- If NOTES or variant context are provided, ensure the entries reflect those constraints.
- Output JSON only (no markdown, no commentary).

ENTRY TYPES:
Entry types:
- locations
- items
- knowledge
- ideology
- relationships

Target entries per type: 2

NOTES:
Include an entry with a catalogue of her culinary knowledge. She has entries about other staff in the manor as well as the Lord and Lady of the house. She also has a secret hobby of an entomological collection.
```

## Response
```
{
  "locations": [
    {
      "title": "Manor Kitchen",
      "slug": "manor_kitchen",
      "description": "The bustling kitchen of the manor where meals are prepared and culinary secrets are kept.",
      "scopeLevelIndex": 0
    },
    {
      "title": "Entomology Study",
      "slug": "entomology_study",
      "description": "A private room in the manor dedicated to the secret hobby of collecting and studying insects.",
      "scopeLevelIndex": 1
    }
  ],
  "items": [
    {
      "title": "Culinary Herb Collection",
      "slug": "culinary_herb_collection",
      "description": "A carefully curated assortment of herbs used in the manor's cooking, essential for flavor and aroma.",
      "scopeLevelIndex": 1
    },
    {
      "title": "Insect Display Case",
      "slug": "insect_display_case",
      "description": "A glass case housing the character's secret entomological specimens, preserved and labeled.",
      "scopeLevelIndex": 2
    }
  ],
  "knowledge": [
    {
      "title": "Culinary Catalogue",
      "slug": "culinary_catalogue",
      "description": "A detailed compilation of recipes, cooking techniques, and ingredient knowledge specific to the manor's cuisine.",
      "scopeLevelIndex": 1
    },
    {
      "title": "Manor Staff Profiles",
      "slug": "manor_staff_profiles",
      "description": "Information about the roles, personalities, and habits of the manor's staff members.",
      "scopeLevelIndex": 1
    }
  ],
  "ideology": [
    {
      "title": "Respect for Tradition",
      "slug": "respect_for_tradition",
      "description": "A belief in maintaining the manor's customs and culinary heritage as a core value.",
      "scopeLevelIndex": 1
    },
    {
      "title": "Curiosity in Nature",
      "slug": "curiosity_in_nature",
      "description": "An ideology valuing the study and appreciation of natural life, reflected in the secret entomological hobby.",
      "scopeLevelIndex": 1
    }
  ],
  "relationships": [
    {
      "title": "Lord of the Manor",
      "slug": "lord_of_the_manor",
      "description": "The character's formal relationship with the Lord, involving duties and respect within the household.",
      "scopeLevelIndex": 1
    },
    {
      "title": "Lady of the Manor",
      "slug": "lady_of_the_manor",
      "description": "The character's connection to the Lady, including service and occasional personal interactions.",
      "scopeLevelIndex": 1
    }
  ]
}
```

## Model
```json
{
  "api_base": "https://api.openai.com/v1",
  "max_output_tokens": null,
  "model": "gpt-4.1-mini",
  "provider": "openai",
  "response_id": "resp_0802ef235d25d90e0069613d790d60819fb6ddba2600c3f292",
  "temperature": 0.3
}
```
