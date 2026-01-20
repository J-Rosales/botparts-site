(async () => {
  const { downloadCharacterBundle, downloadSelection } = await import('./downloads.js');
  const {
    fetchCharacterManifest,
    getBasePath,
    getCharacterPngPath,
    getProseVariants,
    withDevCacheBust
  } = await import('./site-data.js');

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
  const variantControls = document.getElementById('variantControls');
  const proseControls = document.getElementById('proseControls');
  const outputControls = document.getElementById('outputControls');
  const configSummary = document.getElementById('configSummary');
  const downloadPrimaryButton = document.getElementById('downloadPrimary');
  const downloadAllButton = document.getElementById('downloadAll');

  const outputOptions = [
    { id: 'json', label: 'Spec v2 JSON' },
    { id: 'png', label: 'PNG card' }
  ];

  function setError(message) {
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }
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

  function resolveCharacterImage(slug, variantSlug) {
    if (!slug) return null;
    return resolveAssetUrl(getCharacterPngPath(slug, variantSlug));
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
      data?.source?.label ||
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
    if (state.proseVariant) {
      params.set('prose', state.proseVariant);
    } else {
      params.delete('prose');
    }
    if (state.variantSlug) {
      params.set('variant', state.variantSlug);
    } else {
      params.delete('variant');
    }
    if (state.output) {
      params.set('output', state.output);
    } else {
      params.delete('output');
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }

  function renderSummary(state, variants, variantOptions) {
    if (!configSummary) return;
    const variant = variants.find((item) => item.id === state.proseVariant);
    const characterVariant = variantOptions.find((item) => item.id === state.variantSlug);
    const output = outputOptions.find((item) => item.id === state.output);

    configSummary.innerHTML = `
      <h3>Current configuration</h3>
      <p><strong>Prose variant:</strong> ${variant ? variant.label : 'None selected'}</p>
      <p><strong>Character variant:</strong> ${characterVariant ? characterVariant.label : 'Canon (root)'}</p>
      <p><strong>Output:</strong> ${output ? output.label : 'None selected'}</p>
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

  function formatVariantLabel(variant) {
    if (variant === 'schema-like') {
      return 'Schema-like prose';
    }
    if (variant === 'hybrid') {
      return 'Hybrid prose';
    }
    return variant;
  }

  function updateCharacterImage(slug, variantSlug, name) {
    if (!characterMedia) return;
    const imageUrl = resolveCharacterImage(slug, variantSlug);
    if (imageUrl) {
      const img = document.createElement('img');
      img.src = withDevCacheBust(imageUrl);
      img.alt = name ? `${name} preview` : 'Character preview';
      img.loading = 'lazy';
      characterMedia.innerHTML = '';
      characterMedia.appendChild(img);
      characterMediaPlaceholder?.classList.add('hidden');
    } else {
      characterMediaPlaceholder?.classList.remove('hidden');
    }
  }

  async function loadCharacter() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    if (!slug) {
      setError('No character selected. Return to the catalogue to choose a profile.');
      return;
    }

    try {
      const manifest = await fetchCharacterManifest(slug);
      const site = manifest?.site || manifest?.catalogue || manifest?.catalog || manifest?.x?.site || {};
      const name = site.name || manifest?.name || slug;
      const description = site.description || manifest?.description || 'Description coming soon.';
      const tags = site.tags || manifest?.tags || [];
      const proseVariants = getProseVariants(manifest);
      const variantSlugs = manifest?.x?.variantSlugs || manifest?.variantSlugs || [];
      const variants = proseVariants.map((variant) => ({
        id: variant,
        label: formatVariantLabel(variant)
      }));
      const requestedVariantSlug = params.get('variant');
      const requestedProseVariant = params.get('prose');
      const resolvedVariantSlug = variantSlugs.includes(requestedVariantSlug)
        ? requestedVariantSlug
        : null;
      const resolvedProseVariant = variants.find((variant) => variant.id === requestedProseVariant)?.id
        || (!resolvedVariantSlug
          ? variants.find((variant) => variant.id === requestedVariantSlug)?.id
          : null)
        || variants[0]?.id
        || null;
      const state = {
        proseVariant: resolvedProseVariant,
        variantSlug: resolvedVariantSlug,
        output: params.get('output') || outputOptions[0].id
      };
      const variantOptions = [
        { id: null, label: 'Canon (root)' },
        ...variantSlugs.map((variantSlug) => ({ id: variantSlug, label: variantSlug }))
      ];

      document.title = `${name} | Botparts Catalogue`;
      if (nameEl) nameEl.textContent = name;
      if (descriptionEl) descriptionEl.textContent = description;

      if (tagsEl) {
        tagsEl.innerHTML = '';
        tags.forEach((tag) => {
          const span = document.createElement('span');
          span.className = 'tag-pill';
          span.textContent = tag;
          tagsEl.appendChild(span);
        });
      }

      if (provenanceStatusEl) {
        const status = manifest?.redistributeAllowed || site.redistributeAllowed || 'unknown';
        provenanceStatusEl.textContent = `Redistribution: ${status}`;
      }
      renderProvenanceModal(manifest);
      setupModal();

      if (metaEl) {
        metaEl.innerHTML = '';
        buildMetaRow('Slug', manifest.slug || slug);
        buildMetaRow('Character type', manifest.type || site.type || 'Character');
        buildMetaRow('Last update', site.updatedAt || manifest.updatedAt || manifest.uploadDate || 'Pending');
        buildMetaRow('Attribution', buildAttributionSentence(manifest));
        const sourceLabel = manifest.provenance?.original?.label || manifest.source?.label || 'Original source';
        buildMetaRow('Primary source', sourceLabel);
      }

      updateCharacterImage(slug, state.variantSlug, name);

      if (changelogEl && changelogCard) {
        const history = manifest.versions || site.versions || [];
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

      if (variantControls) {
        variantControls.innerHTML = '';
        variantOptions.forEach((variant) => {
          const { wrapper, input } = buildOptionCard({
            id: `character-variant-${variant.id || 'canon'}`,
            label: variant.label,
            name: 'character-variant',
            checked: state.variantSlug === variant.id
          });
          input.addEventListener('change', () => {
            state.variantSlug = variant.id;
            updateCharacterImage(slug, state.variantSlug, name);
            renderSummary(state, variants, variantOptions);
            updateUrl(state);
          });
          variantControls.appendChild(wrapper);
        });
      }

      if (proseControls) {
        proseControls.innerHTML = '';
        variants.forEach((variant) => {
          const { wrapper, input } = buildOptionCard({
            id: `variant-${variant.id}`,
            label: variant.label,
            name: 'prose-variant',
            checked: state.proseVariant === variant.id
          });
          input.addEventListener('change', () => {
            state.proseVariant = variant.id;
            renderSummary(state, variants, variantOptions);
            updateUrl(state);
          });
          proseControls.appendChild(wrapper);
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
            renderSummary(state, variants, variantOptions);
            updateUrl(state);
          });
          outputControls.appendChild(wrapper);
        });
      }

      renderSummary(state, variants, variantOptions);
      updateUrl(state);

      if (downloadPrimaryButton) {
        downloadPrimaryButton.addEventListener('click', () => {
          runDownload(downloadPrimaryButton, () =>
            downloadSelection({
              slug,
              manifest,
              proseVariant: state.proseVariant,
              outputType: state.output,
              variantSlug: state.variantSlug
            })
          );
        });
      }

      if (downloadAllButton) {
        downloadAllButton.addEventListener('click', () => {
          runDownload(downloadAllButton, () =>
            downloadCharacterBundle({
              slug,
              manifest
            })
          );
        });
      }
    } catch (error) {
      setError('Unable to load this character yet. Please try again later.');
    }
  }

  loadCharacter();
})();
