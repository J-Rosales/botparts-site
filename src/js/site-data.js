const defaultBase = '';
const spoilerState = new Map();
const likedState = new Map();
const chipRows = new Set();
const chipRowTags = new WeakMap();
let resizeTimeoutId = null;

export function getBasePath() {
  return document.body?.dataset?.base ?? defaultBase;
}

export function getPageBase() {
  return document.body?.dataset?.pageBase ?? '';
}

function resolveAssetUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = getBasePath();
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${normalized}`;
}

function resolveEntryImage(entry) {
  const candidate =
    entry?.cardImage ||
    entry?.image ||
    entry?.media?.cardPng ||
    entry?.media?.card ||
    entry?.assets?.cardPng ||
    null;
  return resolveAssetUrl(candidate);
}

function createIcon(iconId) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('icon');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `${getBasePath()}icons/icons.svg#${iconId}`);
  svg.appendChild(use);
  return svg;
}

function applyChipOverflow(container, tags) {
  if (!container || container.hidden || !container.isConnected) {
    return;
  }

  container.innerHTML = '';
  const chips = (tags || []).map((tag) => {
    const chip = document.createElement('span');
    chip.className = 'tag-pill';
    chip.textContent = tag;
    container.appendChild(chip);
    return chip;
  });

  if (!chips.length) {
    return;
  }

  const firstLineTop = chips[0].offsetTop;
  let overflowIndex = chips.findIndex((chip) => chip.offsetTop > firstLineTop);
  if (overflowIndex === -1) {
    return;
  }

  for (let i = overflowIndex; i < chips.length; i += 1) {
    chips[i].hidden = true;
  }

  let hiddenCount = chips.length - overflowIndex;
  const overflowLabel = document.createElement('span');
  overflowLabel.className = 'tag-overflow';
  overflowLabel.textContent = `+${hiddenCount} more…`;
  container.appendChild(overflowLabel);

  while (overflowLabel.offsetTop > firstLineTop && overflowIndex > 0) {
    overflowIndex -= 1;
    chips[overflowIndex].hidden = true;
    hiddenCount += 1;
    overflowLabel.textContent = `+${hiddenCount} more…`;
  }
}

function registerChipRow(container, tags) {
  if (!container) {
    return;
  }
  chipRows.add(container);
  chipRowTags.set(container, tags || []);
  requestAnimationFrame(() => applyChipOverflow(container, tags));
}

function refreshChipRows() {
  chipRows.forEach((row) => {
    if (!row.isConnected) {
      chipRows.delete(row);
      return;
    }
    const tags = chipRowTags.get(row) || [];
    applyChipOverflow(row, tags);
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => {
    if (resizeTimeoutId) {
      window.clearTimeout(resizeTimeoutId);
    }
    resizeTimeoutId = window.setTimeout(refreshChipRows, 150);
  });
}

export async function fetchIndexData() {
  const base = getBasePath();
  const response = await fetch(`${base}data/index.json`);
  if (!response.ok) {
    throw new Error('Unable to load index data.');
  }
  return response.json();
}

export async function fetchCharacterData(slug) {
  const base = getBasePath();
  const response = await fetch(`${base}data/characters/${slug}.json`);
  if (!response.ok) {
    throw new Error(`Character not found: ${slug}`);
  }
  return response.json();
}

export function buildCharacterCard(entry) {
  const card = document.createElement('article');
  card.className = 'character-card';
  card.setAttribute('data-built-by', 'src/js/site-data.js::buildCharacterCard');
  card.setAttribute('data-built-at', new Date().toISOString());
  card.setAttribute('data-built-slug', entry?.slug ?? '');

  const pageBase = getPageBase();
  const slug = entry.slug || '';
  const href = `${pageBase}character.html?slug=${encodeURIComponent(slug)}`;
  const tags = Array.isArray(entry.tags) ? entry.tags.filter(Boolean) : [];
  const spoilerTags = Array.isArray(entry.spoilerTags) ? entry.spoilerTags.filter(Boolean) : [];
  const shortDescription = typeof entry.shortDescription === 'string'
    ? entry.shortDescription.trim()
    : '';
  const uploadDate = typeof entry.uploadDate === 'string' ? entry.uploadDate.trim() : '';
  const imageUrl = resolveEntryImage(entry);
  const aiTokenLabel = entry.aiTokens != null && entry.aiTokens !== ''
    ? `AI tokens: ${entry.aiTokens}`
    : 'AI tokens: unknown';
  const isSpoilerOpen = spoilerState.get(slug) ?? false;
  const isLiked = likedState.get(slug) ?? false;

  const content = document.createElement('div');
  content.className = 'card-content';

  const nameRow = document.createElement('div');
  nameRow.className = 'card-name-row';
  const nameLink = document.createElement('a');
  nameLink.className = 'card-link';
  nameLink.href = href;
  const title = document.createElement('h3');
  title.className = 'card-title';
  title.textContent = entry.name || entry.slug || 'Untitled';
  nameLink.appendChild(title);
  nameRow.appendChild(nameLink);

  const imageRow = document.createElement('div');
  imageRow.className = 'card-image-row';
  const imageLink = document.createElement('a');
  imageLink.className = 'card-link';
  imageLink.href = href;
  if (imageUrl) {
    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = entry.name ? `${entry.name} preview` : 'Character preview';
    image.loading = 'lazy';
    imageLink.appendChild(image);
  } else {
    const placeholder = document.createElement('span');
    placeholder.textContent = 'No preview image';
    imageLink.appendChild(placeholder);
  }
  imageRow.appendChild(imageLink);

  const tagRow = document.createElement('div');
  tagRow.className = 'card-tags';

  const footerRow = document.createElement('div');
  footerRow.className = 'card-footer';
  if (uploadDate) {
    const uploadDateEl = document.createElement('span');
    uploadDateEl.className = 'card-upload-date';
    uploadDateEl.textContent = uploadDate;
    footerRow.appendChild(uploadDateEl);
  }

  const footerActions = document.createElement('div');
  footerActions.className = 'card-footer-actions';
  const likeButton = document.createElement('button');
  likeButton.type = 'button';
  likeButton.className = 'icon-button card-like-button';
  likeButton.setAttribute('aria-label', 'Like');
  likeButton.title = 'Like';
  likeButton.dataset.liked = String(isLiked);
  likeButton.classList.toggle('is-liked', isLiked);
  likeButton.appendChild(createIcon('icon-heart'));
  likeButton.addEventListener('click', () => {
    const nextState = !(likedState.get(slug) ?? false);
    likedState.set(slug, nextState);
    likeButton.dataset.liked = String(nextState);
    likeButton.classList.toggle('is-liked', nextState);
  });

  const openLink = document.createElement('a');
  openLink.className = 'icon-button card-open-link';
  openLink.href = href;
  openLink.target = '_blank';
  openLink.rel = 'noopener';
  openLink.setAttribute('aria-label', 'Open in new window');
  openLink.title = 'Open in new window';
  openLink.appendChild(createIcon('icon-external'));

  const tokensButton = document.createElement('button');
  tokensButton.type = 'button';
  tokensButton.className = 'icon-button card-token-button';
  tokensButton.setAttribute('aria-label', aiTokenLabel);
  tokensButton.title = aiTokenLabel;
  tokensButton.appendChild(createIcon('icon-token'));

  footerActions.append(likeButton, openLink, tokensButton);
  footerRow.appendChild(footerActions);

  content.appendChild(nameRow);
  content.appendChild(imageRow);

  if (shortDescription) {
    const descriptionRow = document.createElement('p');
    descriptionRow.className = 'card-short-description';
    descriptionRow.textContent = shortDescription;
    content.appendChild(descriptionRow);
  }

  content.appendChild(tagRow);

  if (spoilerTags.length) {
    const toggleRow = document.createElement('div');
    toggleRow.className = 'spoiler-toggle-row';
    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'spoiler-toggle';
    toggleButton.textContent = isSpoilerOpen ? 'hide spoiler tags' : 'show spoiler tags';
    const spoilerRowId = `spoiler-tags-${slug}`;
    toggleButton.setAttribute('aria-expanded', String(isSpoilerOpen));
    toggleButton.setAttribute('aria-controls', spoilerRowId);
    toggleRow.appendChild(toggleButton);

    const spoilerRow = document.createElement('div');
    spoilerRow.className = 'card-tags spoiler-tags';
    spoilerRow.id = spoilerRowId;
    spoilerRow.hidden = !isSpoilerOpen;

    toggleButton.addEventListener('click', () => {
      const nextState = !(spoilerState.get(slug) ?? false);
      spoilerState.set(slug, nextState);
      spoilerRow.hidden = !nextState;
      toggleButton.textContent = nextState ? 'hide spoiler tags' : 'show spoiler tags';
      toggleButton.setAttribute('aria-expanded', String(nextState));
      if (nextState) {
        applyChipOverflow(spoilerRow, spoilerTags);
      }
    });

    content.appendChild(toggleRow);
    content.appendChild(spoilerRow);
    registerChipRow(spoilerRow, spoilerTags);
  }

  content.appendChild(footerRow);
  card.appendChild(content);
  registerChipRow(tagRow, tags);

  return card;
}
