import { downloadCharacterBundle, downloadSelection } from './downloads.js';
import { fetchCharacterData, getBasePath, withDevCacheBust } from './site-data.js';

const nameEl = document.getElementById('characterName');
const descriptionEl = document.getElementById('characterDescription');
const tagsEl = document.getElementById('characterTags');
const errorEl = document.getElementById('characterError');
const provenanceStatusEl = document.getElementById('provenanceStatus');
const provenanceButton = document.getElementById('provenanceButton');
const provenanceModal = document.getElementById('provenanceModal');
const provenanceClose = document.getElementById('provenanceClose');
const provenanceDetails = document.getElementById('provenanceDetails');
const characterMedia = document.getElementById('characterMedia');
const characterMediaPlaceholder = document.getElementById('characterMediaPlaceholder');
const metaEl = document.getElementById('characterMeta');
const changelogEl = document.getElementById('characterChangelog');
const changelogCard = document.getElementById('characterChangelogCard');
const moduleControls = document.getElementById('moduleControls');
const transformControls = document.getElementById('transformControls');
const outputControls = document.getElementById('outputControls');
const configSummary = document.getElementById('configSummary');
const downloadPrimaryButton = document.getElementById('downloadPrimary');
const downloadAllButton = document.getElementById('downloadAll');

const outputOptions = [
  { id: 'json', label: 'SillyTavern JSON' },
  { id: 'text', label: 'Prompt pack (text)' },
  { id: 'png', label: 'PNG card' }
];

function setError(message) {
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  }
}

function normalizeText(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join('\n\n');
  }
  if (value == null) {
    return '';
  }
  return String(value);
}

function buildMetaRow(label, value) {
  if (!metaEl) return;
  const wrapper = document.createElement('div');
  const dt = document.createElement('dt');
  dt.textContent = label;
  const dd = document.createElement('dd');
  dd.textContent = value || 'Not specified';
  wrapper.appendChild(dt);
  wrapper.appendChild(dd);
  metaEl.appendChild(wrapper);
}

function resolveAssetUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = getBasePath();
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${normalized}`;
}

function resolveCharacterImage(data) {
  const candidate =
    data?.cardImage ||
    data?.image ||
    data?.media?.cardPng ||
    data?.media?.card ||
    data?.assets?.cardPng ||
    null;
  return resolveAssetUrl(candidate);
}

function resolveSourceSite(url) {
  if (!url) return 'unknown source';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch (error) {
    return url;
  }
}

function buildAttributionSentence(data) {
  const author =
    data?.author?.name ||
    data?.creator ||
    data?.provenance?.original?.label ||
    'unknown author';
  const sourceUrl =
    data?.provenance?.original?.url ||
    data?.source?.url ||
    '';
  const sourceSite = resolveSourceSite(sourceUrl);
  return `rewriten or inspired by ${author} (${sourceSite})`;
}

function buildOptionCard({ id, label, name, checked }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'option-card';
  const input = document.createElement('input');
  input.type = 'radio';
  input.name = name;
  input.id = id;
  input.checked = checked;
  const labelEl = document.createElement('label');
  labelEl.htmlFor = id;
  labelEl.textContent = label;
  wrapper.appendChild(input);
  wrapper.appendChild(labelEl);
  return { wrapper, input };
}

function updateUrl(state) {
  const params = new URLSearchParams(window.location.search);
  if (state.modules.size) {
    params.set('modules', Array.from(state.modules).join(','));
  } else {
    params.delete('modules');
  }
  if (state.transform) {
    params.set('transform', state.transform);
  } else {
    params.delete('transform');
  }
  if (state.output) {
    params.set('output', state.output);
  } else {
    params.delete('output');
  }
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', newUrl);
}

function renderSummary(state, modules, transforms) {
  if (!configSummary) return;
  const selectedModules = modules.filter((module) => state.modules.has(module.id));
  const transform = transforms.find((item) => item.id === state.transform);
  const output = outputOptions.find((item) => item.id === state.output);

  configSummary.innerHTML = `
    <h3>Current configuration</h3>
    <p><strong>Transform:</strong> ${transform ? transform.label : 'None selected'}</p>
    <p><strong>Output:</strong> ${output ? output.label : 'None selected'}</p>
    <div>
      <strong>Modules:</strong>
      <ul>
        ${selectedModules.map((module) => `<li>${module.label}</li>`).join('')}
      </ul>
    </div>
  `;
}

async function runDownload(button, action) {
  if (!button) return;
  button.disabled = true;
  try {
    await action();
  } catch (error) {
    setError('Download failed. Please try again.');
  } finally {
    button.disabled = false;
  }
}

function renderProvenanceModal(data) {
  if (!provenanceDetails) return;
  const original = data.provenance?.original || data.source;
  const backup = data.provenance?.backup;
  const redistribute = data.redistributeAllowed || 'unknown';
  const notes = data.provenance?.notes;
  const attribution = buildAttributionSentence(data);

  const rows = [];
  rows.push(`<p><strong>Attribution:</strong> ${attribution}</p>`);
  if (original?.url) {
    rows.push(`<p><strong>Original source:</strong> <a href="${original.url}" target="_blank" rel="noreferrer">${original.label || original.url}</a></p>`);
  }
  if (backup?.url) {
    rows.push(`<p><strong>Backup mirror:</strong> <a href="${backup.url}" target="_blank" rel="noreferrer">${backup.label || backup.url}</a></p>`);
  }
  rows.push(`<p><strong>Redistribution:</strong> ${redistribute}</p>`);
  if (notes) {
    rows.push(`<p>${notes}</p>`);
  }

  provenanceDetails.innerHTML = rows.join('');
}

function toggleModal(isOpen) {
  if (!provenanceModal) return;
  provenanceModal.classList.toggle('hidden', !isOpen);
  if (isOpen) {
    provenanceClose?.focus();
  }
}

function setupModal() {
  if (!provenanceModal || !provenanceButton || !provenanceClose) return;
  provenanceButton.addEventListener('click', () => toggleModal(true));
  provenanceClose.addEventListener('click', () => toggleModal(false));
  provenanceModal.addEventListener('click', (event) => {
    if (event.target === provenanceModal) {
      toggleModal(false);
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !provenanceModal.classList.contains('hidden')) {
      toggleModal(false);
    }
  });
}

function buildModulePreview(module, content) {
  const previewText = module.preview ?? content?.[module.contentKey];
  return normalizeText(previewText) || 'No preview available for this module.';
}

function deriveDefaults(modules) {
  const defaults = new Set();
  const groupDefaults = new Map();

  modules.forEach((module) => {
    if (module.type === 'required' || module.defaultEnabled) {
      defaults.add(module.id);
    }
    if (module.group && module.type === 'oneOf' && module.defaultEnabled) {
      groupDefaults.set(module.group, module.id);
    }
  });

  modules.forEach((module) => {
    if (module.group && module.type === 'oneOf' && !groupDefaults.has(module.group)) {
      groupDefaults.set(module.group, module.id);
    }
  });

  groupDefaults.forEach((moduleId) => defaults.add(moduleId));
  return defaults;
}

function parseModuleParams(modules) {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('modules');
  if (!raw) return null;
  const requested = new Set(raw.split(',').map((item) => item.trim()).filter(Boolean));
  const validIds = new Set(modules.map((module) => module.id));
  const selected = new Set();
  requested.forEach((id) => {
    if (validIds.has(id)) selected.add(id);
  });
  return selected.size ? selected : null;
}

function buildModuleGroups(modules) {
  const groups = new Map();
  modules.forEach((module) => {
    const key = module.group || module.id;
    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        label: module.groupLabel || module.group || module.label,
        selectionType: module.type === 'oneOf' || module.group ? 'single' : 'multi',
        modules: []
      });
    }
    const group = groups.get(key);
    if (module.type === 'oneOf') {
      group.selectionType = 'single';
    }
    group.modules.push(module);
  });
  return Array.from(groups.values());
}

function enforceGroupSelection(state, groups) {
  groups.forEach((group) => {
    if (group.selectionType !== 'single') return;
    const selected = group.modules.filter((module) => state.modules.has(module.id));
    if (!selected.length) {
      state.modules.add(group.modules[0].id);
      return;
    }
    selected.slice(1).forEach((module) => state.modules.delete(module.id));
  });
}

async function loadCharacter() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  if (!slug) {
    setError('No character selected. Return to the catalogue to choose a profile.');
    return;
  }

  try {
    const data = await fetchCharacterData(slug);
    document.title = `${data.name} | Bot Catalogue`;
    if (nameEl) nameEl.textContent = data.name;
    if (descriptionEl) descriptionEl.textContent = data.description || 'Description coming soon.';

    if (tagsEl) {
      tagsEl.innerHTML = '';
      (data.tags || []).forEach((tag) => {
        const span = document.createElement('span');
        span.className = 'tag-pill';
        span.textContent = tag;
        tagsEl.appendChild(span);
      });
    }

    if (provenanceStatusEl) {
      const status = data.redistributeAllowed || 'unknown';
      provenanceStatusEl.textContent = `Redistribution: ${status}`;
    }
    renderProvenanceModal(data);
    setupModal();

    if (metaEl) {
      metaEl.innerHTML = '';
      buildMetaRow('Slug', data.slug);
      buildMetaRow('Character type', data.type || 'Character');
      buildMetaRow('Last update', data.updated || 'Pending');
      buildMetaRow('Attribution', buildAttributionSentence(data));
      const sourceLabel = data.provenance?.original?.label || data.source?.label || 'Original source';
      buildMetaRow('Primary source', sourceLabel);
    }

    if (characterMedia) {
      const imageUrl = resolveCharacterImage(data);
      if (imageUrl) {
        const img = document.createElement('img');
        img.src = withDevCacheBust(imageUrl);
        img.alt = data.name ? `${data.name} preview` : 'Character preview';
        img.loading = 'lazy';
        characterMedia.innerHTML = '';
        characterMedia.appendChild(img);
        characterMediaPlaceholder?.classList.add('hidden');
      } else {
        characterMediaPlaceholder?.classList.remove('hidden');
      }
    }

    if (changelogEl && changelogCard) {
      const history = data.versions || [];
      changelogEl.innerHTML = '';
      if (history.length) {
        history.forEach((entry) => {
          const item = document.createElement('li');
          item.innerHTML = `<strong>${entry.version}</strong> — ${entry.date || 'Date TBD'}<br>${entry.notes || ''}`;
          changelogEl.appendChild(item);
        });
      } else {
        changelogCard.classList.add('hidden');
      }
    }

    const modules = data.modules || [];
    const transforms = data.transforms || [];
    const defaults = deriveDefaults(modules);
    const paramModules = parseModuleParams(modules);
    const state = {
      modules: paramModules || defaults,
      transform: params.get('transform') || transforms[0]?.id || null,
      output: params.get('output') || outputOptions[0].id
    };

    const groups = buildModuleGroups(modules);
    enforceGroupSelection(state, groups);
    if (moduleControls) {
      moduleControls.innerHTML = '';
      groups.forEach((group) => {
        const groupWrapper = document.createElement('div');
        groupWrapper.className = 'config-group';
        if (group.modules.length > 1) {
          const title = document.createElement('div');
          title.className = 'config-group-title';
          title.textContent = group.label;
          groupWrapper.appendChild(title);
        }
        group.modules.forEach((module) => {
          const details = document.createElement('details');
          details.className = 'module-item';
          details.open = module.defaultOpen || false;
          const summary = document.createElement('summary');
          summary.className = 'module-summary';
          const input = document.createElement('input');
          const groupName = `module-${group.id}`;
          input.type = group.selectionType === 'single' ? 'radio' : 'checkbox';
          input.name = groupName;
          input.id = `module-${module.id}`;
          input.checked = state.modules.has(module.id);
          input.disabled = module.type === 'required';
          const label = document.createElement('label');
          label.htmlFor = input.id;
          label.textContent = module.label;
          const tooltip = document.createElement('button');
          tooltip.className = 'tooltip-button';
          tooltip.type = 'button';
          tooltip.textContent = '?';
          tooltip.title = module.help || 'Toggle this module for the export.';
          tooltip.setAttribute('aria-label', `About ${module.label}`);
          summary.appendChild(input);
          summary.appendChild(label);
          summary.appendChild(tooltip);

          const preview = document.createElement('textarea');
          preview.readOnly = true;
          preview.value = buildModulePreview(module, data.content);
          details.appendChild(summary);
          details.appendChild(preview);
          groupWrapper.appendChild(details);

          input.addEventListener('change', () => {
            if (group.selectionType === 'single') {
              group.modules.forEach((item) => state.modules.delete(item.id));
              state.modules.add(module.id);
            } else if (input.checked) {
              state.modules.add(module.id);
            } else if (!input.checked) {
              state.modules.delete(module.id);
            }
            renderSummary(state, modules, transforms);
            updateUrl(state);
          });
        });
        moduleControls.appendChild(groupWrapper);
      });
    }

    if (transformControls) {
      transformControls.innerHTML = '';
      transforms.forEach((transform) => {
        const { wrapper, input } = buildOptionCard({
          id: `transform-${transform.id}`,
          label: transform.label,
          name: 'transform-mode',
          checked: state.transform === transform.id
        });
        input.addEventListener('change', () => {
          state.transform = transform.id;
          renderSummary(state, modules, transforms);
          updateUrl(state);
        });
        transformControls.appendChild(wrapper);
      });
    }

    if (outputControls) {
      outputControls.innerHTML = '';
      outputOptions.forEach((output) => {
        const { wrapper, input } = buildOptionCard({
          id: `output-${output.id}`,
          label: output.label,
          name: 'output-type',
          checked: state.output === output.id
        });
        input.addEventListener('change', () => {
          state.output = output.id;
          renderSummary(state, modules, transforms);
          updateUrl(state);
        });
        outputControls.appendChild(wrapper);
      });
    }

    renderSummary(state, modules, transforms);
    updateUrl(state);

    if (downloadPrimaryButton) {
      downloadPrimaryButton.addEventListener('click', () => {
        runDownload(downloadPrimaryButton, () =>
          downloadSelection({
            character: data,
            moduleIds: Array.from(state.modules),
            transformId: state.transform,
            outputType: state.output
          })
        );
      });
    }

    if (downloadAllButton) {
      downloadAllButton.addEventListener('click', () => {
        runDownload(downloadAllButton, () =>
          downloadCharacterBundle({
            character: data,
            moduleIds: Array.from(state.modules),
            transformId: state.transform
          })
        );
      });
    }
  } catch (error) {
    setError('Unable to load this character yet. Please try again later.');
  }
}

loadCharacter();
