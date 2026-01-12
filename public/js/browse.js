(async () => {
  const { downloadSiteBundle } = await import('./downloads.js');
  const {
    buildCharacterCard,
    fetchCatalogueEntries,
    fetchCharacterSpec,
    getProseVariants
  } = await import('./site-data.js');

  console.debug('[CARD-WIRING] browse.js loaded');

  const browseGrid = document.getElementById('browseGrid');
  const browseEmpty = document.getElementById('browseEmpty');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const tagFilterList = document.getElementById('tagFilterList');
  const filterSummary = document.getElementById('filterSummary');
  const downloadEverythingButton = document.getElementById('downloadEverythingSite');

  const tagStates = new Map();
  const tagLabels = new Map();
  let entries = [];
  let filteredEntries = [];

  const TAG_STATE_CYCLE = ['off', 'include', 'exclude'];

  function normalizeTag(tag) {
    return tag.trim().toLowerCase();
  }

  async function runDownload(button, action) {
    if (!button) return;
    button.disabled = true;
    const originalLabel = button.textContent;
    button.textContent = 'Building ZIP...';
    try {
      await action();
    } catch (error) {
      button.textContent = 'Download failed. Try again?';
      setTimeout(() => {
        button.textContent = originalLabel;
      }, 2000);
      button.disabled = false;
      return;
    }
    button.textContent = originalLabel;
    button.disabled = false;
  }

  function getTagState(tag) {
    return tagStates.get(tag) ?? 'off';
  }

  function setTagState(tag, state) {
    tagStates.set(tag, state);
  }

  function extractTokenCount(data) {
    const candidates = [
      data?.tokenCount,
      data?.stats?.tokenCount,
      data?.metrics?.tokenCount,
      data?.data?.extensions?.token_count,
      data?.data?.extensions?.tokenCount,
      data?.card?.extensions?.token_count,
      data?.card?.data?.extensions?.token_count,
      data?.baseCard?.extensions?.token_count,
      data?.baseCard?.data?.extensions?.token_count,
    ];
    const value = candidates.find((candidate) => typeof candidate === 'number');
    return typeof value === 'number' ? value : 0;
  }

  function extractAltGreetingsCount(data) {
    const candidates = [
      data?.alternateGreetings,
      data?.content?.alternateGreetings,
      data?.data?.alternate_greetings,
      data?.card?.data?.alternate_greetings,
      data?.baseCard?.data?.alternate_greetings,
    ];
    const greetings = candidates.find((candidate) => Array.isArray(candidate));
    return Array.isArray(greetings) ? greetings.length : 0;
  }

  function parseDateValue(entry) {
    const raw = entry.uploadDate ?? entry.lastUpdated;
    if (!raw) {
      return 0;
    }
    const dateValue = typeof raw === 'number' ? raw : Date.parse(raw);
    return Number.isNaN(dateValue) ? 0 : dateValue;
  }

  function getSearchTerm() {
    return searchInput?.value.trim() ?? '';
  }

  function getActiveTags(state) {
    return [...tagStates.entries()]
      .filter(([, value]) => value === state)
      .map(([tag]) => tag);
  }

  function matchesFilters(entry) {
    const includeTags = getActiveTags('include');
    const excludeTags = getActiveTags('exclude');
    const entryTags = (entry.tags || []).map((tag) => normalizeTag(tag));

    if (includeTags.length && !includeTags.every((tag) => entryTags.includes(tag))) {
      return false;
    }
    if (excludeTags.length && excludeTags.some((tag) => entryTags.includes(tag))) {
      return false;
    }

    const searchTerm = getSearchTerm();
    if (!searchTerm) {
      return true;
    }
    const normalizedSearch = searchTerm.toLowerCase();
    const haystack = [
      entry.name,
      entry.description,
      ...(entry.tags || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalizedSearch);
  }

  function sortEntries(list) {
    const sortValue = sortSelect?.value ?? 'upload_date';
    const sorted = [...list];
    if (sortValue === 'token_count') {
      sorted.sort((a, b) => b.stats.tokenCount - a.stats.tokenCount);
      return sorted;
    }
    if (sortValue === 'alt_greetings') {
      sorted.sort((a, b) => b.stats.altGreetings - a.stats.altGreetings);
      return sorted;
    }
    sorted.sort((a, b) => b.stats.uploadDate - a.stats.uploadDate);
    return sorted;
  }

  function renderEntries(list) {
    if (!browseGrid) {
      return;
    }
    browseGrid.innerHTML = '';
    if (!list.length) {
      if (browseEmpty) {
        browseEmpty.textContent = 'No results match your filters.';
      }
      browseEmpty?.classList.remove('hidden');
      return;
    }
    browseEmpty?.classList.add('hidden');
    list.forEach((entry) => {
      const cardEl = buildCharacterCard(entry);
      console.debug(
        '[CARD-WIRING] built card tag=',
        cardEl?.tagName,
        'class=',
        cardEl?.className,
        'built-by=',
        cardEl?.getAttribute?.('data-built-by'),
      );
      browseGrid.appendChild(cardEl);
    });
  }

function updateSummary() {
  if (!filterSummary) {
    return;
  }
  const includeTags = getActiveTags('include');
  const excludeTags = getActiveTags('exclude');
  const tags = [];
  if (includeTags.length) {
    const labels = includeTags.map((tag) => tagLabels.get(tag) ?? tag);
    tags.push(...labels.map((label) => `+${label}`));
  }
  if (excludeTags.length) {
    const labels = excludeTags.map((tag) => tagLabels.get(tag) ?? tag);
    tags.push(...labels.map((label) => `-${label}`));
  }
  if (!tags.length) {
    filterSummary.textContent = 'Filter: none';
    return;
  }
  filterSummary.textContent = `Filter: ${tags.join(', ')}`;
}

  function updateUrlState() {
    const params = new URLSearchParams();
    const searchTerm = getSearchTerm();
    if (searchTerm) {
      params.set('q', searchTerm);
    }
    const includeTags = getActiveTags('include');
    const excludeTags = getActiveTags('exclude');
    if (includeTags.length) {
      params.set('include', includeTags.join(','));
    }
    if (excludeTags.length) {
      params.set('exclude', excludeTags.join(','));
    }
    const sortValue = sortSelect?.value ?? 'upload_date';
    if (sortValue && sortValue !== 'upload_date') {
      params.set('sort', sortValue);
    }
    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }

  function applyFilters() {
    filteredEntries = sortEntries(entries.filter(matchesFilters));
    renderEntries(filteredEntries);
    updateSummary();
    updateUrlState();
  }

  function updateTagButton(button, tag) {
    const state = getTagState(tag);
    button.dataset.state = state;
    button.classList.toggle('is-include', state === 'include');
    button.classList.toggle('is-exclude', state === 'exclude');
    if (state === 'include') {
      button.setAttribute('aria-checked', 'true');
    } else if (state === 'exclude') {
      button.setAttribute('aria-checked', 'mixed');
    } else {
      button.setAttribute('aria-checked', 'false');
    }
  }

  function handleTagClick(event) {
    const button = event.currentTarget;
    const tag = button.dataset.tag;
    const currentState = getTagState(tag);
    const nextIndex = (TAG_STATE_CYCLE.indexOf(currentState) + 1) % TAG_STATE_CYCLE.length;
    const nextState = TAG_STATE_CYCLE[nextIndex];
    setTagState(tag, nextState);
    updateTagButton(button, tag);
    applyFilters();
  }

  function renderTagFilters(tags) {
    if (!tagFilterList) {
      return;
    }
    tagFilterList.innerHTML = '';
    tags.forEach((tag) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'tag-filter-chip';
      const normalizedTag = normalizeTag(tag);
      button.dataset.tag = normalizedTag;
      button.setAttribute('role', 'checkbox');
      button.textContent = tag;
      updateTagButton(button, normalizedTag);
      button.addEventListener('click', handleTagClick);
      tagFilterList.appendChild(button);
    });
  }

  function loadStateFromUrl(tags) {
    const params = new URLSearchParams(window.location.search);
    const searchValue = params.get('q');
    if (searchValue && searchInput) {
      searchInput.value = searchValue;
    }
    const sortValue = params.get('sort');
    if (sortValue && sortSelect) {
      sortSelect.value = sortValue;
    }
    const includeTags = (params.get('include') || '').split(',').filter(Boolean);
    const excludeTags = (params.get('exclude') || '').split(',').filter(Boolean);
    tags.forEach((tag) => {
      const normalized = normalizeTag(tag);
      if (includeTags.includes(normalized)) {
        setTagState(normalized, 'include');
      }
      if (excludeTags.includes(normalized)) {
        setTagState(normalized, 'exclude');
      }
    });
  }

  async function hydrateEntryStats(entry) {
    const stats = {
      tokenCount: 0,
      altGreetings: 0,
      uploadDate: parseDateValue(entry),
    };
    try {
      const proseVariants = entry.proseVariants || getProseVariants(entry.manifest);
      const primaryVariant = proseVariants[0] || 'schema-like';
      const spec = await fetchCharacterSpec(entry.slug, primaryVariant);
      stats.tokenCount = extractTokenCount(spec);
      stats.altGreetings = extractAltGreetingsCount(spec);
    } catch (error) {
      stats.tokenCount = entry.tokenCount ?? 0;
      stats.altGreetings = entry.altGreetings ?? 0;
    }
    return {
      ...entry,
      stats,
    };
  }

  async function loadBrowse() {
    if (!browseGrid) {
      return;
    }

    try {
    const rawEntries = await fetchCatalogueEntries();

    if (!rawEntries.length) {
      browseEmpty?.classList.remove('hidden');
      return;
    }

    entries = await Promise.all(rawEntries.map((entry) => hydrateEntryStats(entry)));

      const tagMap = new Map();
      entries.forEach((entry) => {
        (entry.tags || []).forEach((tag) => {
          const normalized = normalizeTag(tag);
          if (!tagMap.has(normalized)) {
            tagMap.set(normalized, tag);
          }
        });
      });

      const tagList = [...tagMap.values()].sort((a, b) => a.localeCompare(b));
      tagList.forEach((tag) => {
        const normalized = normalizeTag(tag);
        tagLabels.set(normalized, tag);
        setTagState(normalized, 'off');
      });
      loadStateFromUrl(tagList);
      renderTagFilters(tagList);

      searchInput?.addEventListener('input', applyFilters);
      sortSelect?.addEventListener('change', applyFilters);
      if (downloadEverythingButton) {
        downloadEverythingButton.addEventListener('click', () => {
          runDownload(downloadEverythingButton, () => downloadSiteBundle());
        });
      }

      applyFilters();
    } catch (error) {
      if (browseEmpty) {
        browseEmpty.textContent = 'Unable to load catalogue data right now.';
        browseEmpty.classList.remove('hidden');
      }
    }
  }

  loadBrowse();
})();
