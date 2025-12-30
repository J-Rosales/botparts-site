const DEFAULT_SPEC = {
  spec: 'chara_card_v2',
  specVersion: '2.0'
};

const FIELD_LABELS = {
  personality: 'Personality',
  scenario: 'Scenario',
  first_mes: 'First message',
  mes_example: 'Example messages',
  creator_notes: 'Creator notes',
  system_prompt: 'System prompt',
  post_history_instructions: 'Post-history instructions',
  alternate_greetings: 'Alternate greetings'
};

const CONTENT_FIELD_MAP = {
  persona: 'personality',
  scenario: 'scenario',
  firstMessage: 'first_mes',
  messageExamples: 'mes_example',
  mesExample: 'mes_example',
  creatorNotes: 'creator_notes',
  systemPrompt: 'system_prompt',
  postHistoryInstructions: 'post_history_instructions',
  alternateGreetings: 'alternate_greetings'
};

function toArray(value) {
  if (value == null) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }
  return [String(value)];
}

function mergeContent(target, key, value) {
  const existing = target[key] || [];
  const additions = toArray(value);
  if (!additions.length) return;
  target[key] = existing.concat(additions);
}

export function applyModules(modules = [], content = {}, selectedModuleIds = []) {
  const selected = new Set(selectedModuleIds);
  const assembled = {};
  const applied = [];

  modules.forEach((module) => {
    const enabled = module.type === 'required' || selected.has(module.id);
    if (!enabled) return;
    applied.push(module.id);
    if (!module.contentKey) return;
    mergeContent(assembled, module.contentKey, content?.[module.contentKey]);
  });

  return {
    content: assembled,
    appliedModules: applied
  };
}

export function compileCharacter(character, selectedModuleIds = []) {
  if (!character) {
    throw new Error('Character data is required to compile.');
  }
  const { content, appliedModules } = applyModules(
    character.modules || [],
    character.content || {},
    selectedModuleIds
  );

  return {
    meta: {
      slug: character.slug,
      name: character.name,
      description: character.description,
      tags: character.tags || [],
      updated: character.updated,
      provenance: character.provenance || null,
      creator: character.creator || character.author?.name || '',
      version: character.version || character.versions?.[0]?.version || ''
    },
    modules: appliedModules,
    content
  };
}

function resolveTransformId(transform) {
  if (!transform) return 'natural';
  if (typeof transform === 'string') return transform;
  if (typeof transform === 'object' && transform.id) return transform.id;
  return 'natural';
}

function joinFragments(fragments) {
  if (!fragments || !fragments.length) return '';
  return fragments.map((item) => String(item)).filter(Boolean).join('\n\n');
}

function formatSchemaBlock(label, text) {
  if (!text) return '';
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return '';
  return `${label}:\n${lines.map((line) => `- ${line}`).join('\n')}`;
}

function formatTextField(label, text, transformId) {
  if (transformId === 'schema') {
    return formatSchemaBlock(label, text);
  }
  return text;
}

function buildFieldValues(compiled, transformId) {
  const fields = {
    personality: '',
    scenario: '',
    first_mes: '',
    mes_example: '',
    creator_notes: '',
    system_prompt: '',
    post_history_instructions: '',
    alternate_greetings: []
  };

  const usedKeys = new Set();

  Object.entries(CONTENT_FIELD_MAP).forEach(([contentKey, field]) => {
    const fragments = compiled.content?.[contentKey];
    if (!fragments || !fragments.length) return;
    usedKeys.add(contentKey);
    if (field === 'alternate_greetings') {
      fields.alternate_greetings = fields.alternate_greetings.concat(fragments);
    } else {
      const text = joinFragments(fragments);
      fields[field] = formatTextField(FIELD_LABELS[field], text, transformId);
    }
  });

  const extras = Object.keys(compiled.content || {}).filter(
    (key) => !usedKeys.has(key)
  );

  return { fields, extras };
}

export function emitSillyTavernJson(compiled, transform = 'natural') {
  const transformId = resolveTransformId(transform);
  const { fields, extras } = buildFieldValues(compiled, transformId);

  const extensions = {
    'catalog/appliedModules': compiled.modules || []
  };

  if (extras.length) {
    const extraFragments = {};
    extras.forEach((key) => {
      extraFragments[key] = compiled.content?.[key] || [];
    });
    extensions['catalog/extraFragments'] = extraFragments;
  }

  return {
    spec: DEFAULT_SPEC.spec,
    spec_version: DEFAULT_SPEC.specVersion,
    data: {
      name: compiled.meta?.name || '',
      description: compiled.meta?.description || '',
      personality: fields.personality,
      scenario: fields.scenario,
      first_mes: fields.first_mes,
      mes_example: fields.mes_example,
      creator_notes: fields.creator_notes,
      system_prompt: fields.system_prompt,
      post_history_instructions: fields.post_history_instructions,
      alternate_greetings: fields.alternate_greetings,
      tags: compiled.meta?.tags || [],
      creator: compiled.meta?.creator || '',
      character_version: compiled.meta?.version || '',
      extensions
    }
  };
}

export function emitTextPacks(compiled, transform = 'natural') {
  const transformId = resolveTransformId(transform);
  const { fields } = buildFieldValues(compiled, transformId);

  const sections = [
    { label: FIELD_LABELS.personality, value: fields.personality },
    { label: FIELD_LABELS.scenario, value: fields.scenario },
    { label: FIELD_LABELS.first_mes, value: fields.first_mes },
    { label: FIELD_LABELS.mes_example, value: fields.mes_example },
    { label: FIELD_LABELS.system_prompt, value: fields.system_prompt },
    { label: FIELD_LABELS.post_history_instructions, value: fields.post_history_instructions },
    { label: FIELD_LABELS.alternate_greetings, value: fields.alternate_greetings.join('\n') },
    { label: FIELD_LABELS.creator_notes, value: fields.creator_notes }
  ];

  const content = sections
    .filter((section) => section.value)
    .map((section) => {
      if (transformId === 'schema') {
        return section.value;
      }
      return `${section.label}\n${section.value}`;
    })
    .join('\n\n');

  return [
    {
      name: `${compiled.meta?.slug || 'character'}-${transformId}.txt`,
      content
    }
  ];
}

export function emitPngPlaceholder(compiled, transform = 'natural') {
  const transformId = resolveTransformId(transform);
  return {
    format: 'png',
    transform: transformId,
    note: 'PNG embedding is pending spec confirmation. Use the JSON payload for now.',
    metadata: emitSillyTavernJson(compiled, transformId)
  };
}
