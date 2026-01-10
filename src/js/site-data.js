const defaultBase = '';
const DEFAULT_AVATAR_FILENAME = 'avatarImage.png';
const DEFAULT_PROSE_VARIANTS = ['schema-like', 'hybrid'];
const CATALOGUE_CANDIDATES = ['data/catalogue.json', 'data/characters.json'];
// DEV-ONLY: localhost cache-busting helper for local testing. Safe to remove later.
const IS_LOCALHOST = typeof window !== 'undefined'
  && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const DEV_CACHE_BUST = IS_LOCALHOST ? String(Date.now()) : '';

if (IS_LOCALHOST) {
  console.debug('[DEV] cache-busting enabled');
}

export function withDevCacheBust(url) {
  if (!DEV_CACHE_BUST || !url) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}dev=${DEV_CACHE_BUST}`;
}
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

export function getCharacterRoot(slug) {
  const base = getBasePath();
  const normalizedSlug = slug || '';
  return `${base}data/characters/${normalizedSlug}/`;
}

export function getCharacterPngPath(slug, variantSlug = null) {
  const root = getCharacterRoot(slug);
  if (variantSlug) {
    return `${root}variants/${variantSlug}/${DEFAULT_AVATAR_FILENAME}`;
  }
  return `${root}${DEFAULT_AVATAR_FILENAME}`;
}

export function getProseVariants(manifest = {}) {
  const variants =
    manifest?.x?.proseVariants ||
    manifest?.proseVariants ||
    manifest?.prose_variants ||
    [];
  if (Array.isArray(variants) && variants.length) {
    return variants;
  }
  return DEFAULT_PROSE_VARIANTS;
}

function resolveAssetUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = getBasePath();
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${normalized}`;
}

function resolveEntryImage(entry) {
  if (entry?.slug) {
    return resolveAssetUrl(getCharacterPngPath(entry.slug));
  }
  return null;
}

const MONTH_ABBREVIATIONS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function formatUploadDate(value) {
  if (!value) return value;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) {
    return value;
  }
  const shortYear = String(year % 100).padStart(2, '0');
  return `${MONTH_ABBREVIATIONS[month - 1]} ${day}, '${shortYear}`;
}

const PLACEHOLDER_COLORS = [
  { bg: 'ef476f', fg: 'fff9f4' },
  { bg: 'ffd166', fg: '1b1b1e' },
  { bg: '06d6a0', fg: '073b4c' },
  { bg: '118ab2', fg: 'fdfcdc' },
  { bg: '8338ec', fg: 'fdf0ff' },
  { bg: '3a86ff', fg: 'fefefe' },
  { bg: 'ff8fab', fg: '2b2d42' },
  { bg: '2ec4b6', fg: '0b132b' },
  { bg: 'f4a261', fg: '1d3557' },
  { bg: '8d99ae', fg: '1f2937' },
];

function hashString(value) {
  if (!value) return 0;
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

function buildPlaceholderImage(entry) {
  const seed = entry?.slug || entry?.name || 'character';
  const index = hashString(seed) % PLACEHOLDER_COLORS.length;
  const { bg, fg } = PLACEHOLDER_COLORS[index];
  return `https://placehold.co/600x400/${bg}/${fg}`;
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

function normalizeCatalogueEntries(payload) {
  if (!payload) {
    return [];
  }
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload.entries)) {
    return payload.entries;
  }
  if (Array.isArray(payload.characters)) {
    return payload.characters;
  }
  if (Array.isArray(payload.slugs)) {
    return payload.slugs;
  }
  return [];
}

function normalizeManifestEntry(manifest, override = {}) {
  const site = manifest?.site || manifest?.catalogue || manifest?.catalog || manifest?.x?.site || {};
  const slug =
    override.slug ||
    manifest?.slug ||
    site.slug ||
    manifest?.id ||
    '';
  return {
    slug,
    name: override.name || site.name || manifest?.name || manifest?.title || slug,
    description: override.description || site.description || manifest?.description || '',
    shortDescription: override.shortDescription || site.shortDescription || manifest?.shortDescription || '',
    tags: override.tags || site.tags || manifest?.tags || [],
    spoilerTags: override.spoilerTags || site.spoilerTags || manifest?.spoilerTags || [],
    featured: override.featured ?? site.featured ?? manifest?.featured ?? false,
    uploadDate: override.uploadDate || site.updatedAt || manifest?.updatedAt || manifest?.uploadDate || '',
    updatedAt: override.updatedAt || site.updatedAt || manifest?.updatedAt || '',
    aiTokens: override.aiTokens ?? site.aiTokens ?? manifest?.aiTokens ?? null,
    source: override.source || site.source || manifest?.source || null,
    provenance: override.provenance || manifest?.provenance || null,
    redistributeAllowed: override.redistributeAllowed || manifest?.redistributeAllowed || site.redistributeAllowed || '',
    manifest,
    proseVariants: getProseVariants(manifest),
    variantSlugs: manifest?.x?.variantSlugs || manifest?.variantSlugs || []
  };
}

async function fetchCatalogueSeed() {
  const base = getBasePath();
  for (const candidate of CATALOGUE_CANDIDATES) {
    const response = await fetch(withDevCacheBust(`${base}${candidate}`));
    if (response.ok) {
      return response.json();
    }
  }
  throw new Error('Unable to load catalogue data.');
}

export async function fetchCatalogueEntries() {
  const seed = await fetchCatalogueSeed();
  const rawEntries = normalizeCatalogueEntries(seed);
  if (!rawEntries.length) {
    return [];
  }
  const entries = await Promise.all(rawEntries.map(async (entry) => {
    const slug = typeof entry === 'string' ? entry : entry?.slug;
    if (!slug) {
      return null;
    }
    const manifest = await fetchCharacterManifest(slug);
    const override = typeof entry === 'string' ? {} : entry;
    return normalizeManifestEntry(manifest, override);
  }));
  return entries.filter(Boolean);
}

export async function fetchCharacterManifest(slug) {
  const root = getCharacterRoot(slug);
  const response = await fetch(withDevCacheBust(`${root}manifest.json`));
  if (!response.ok) {
    throw new Error(`Manifest not found: ${slug}`);
  }
  return response.json();
}

export async function fetchCharacterSpec(slug, proseVariant = 'schema-like', variantSlug = null) {
  const root = variantSlug
    ? `${getCharacterRoot(slug)}variants/${variantSlug}/`
    : getCharacterRoot(slug);
  const response = await fetch(withDevCacheBust(`${root}spec_v2.${proseVariant}.json`));
  if (!response.ok) {
    throw new Error(`Spec not found: ${slug} (${proseVariant})`);
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
  const uploadDate = typeof entry.uploadDate === 'string'
    ? formatUploadDate(entry.uploadDate.trim())
    : '';
  const imageUrl = resolveEntryImage(entry);
  const resolvedImageUrl = imageUrl || buildPlaceholderImage(entry);
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
  const image = document.createElement('img');
  image.src = resolvedImageUrl;
  image.alt = entry.name ? `${entry.name} preview` : 'Character preview';
  image.loading = 'lazy';
  if (!imageUrl) {
    image.dataset.placeholder = 'true';
  }
  imageLink.appendChild(image);
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

  const toggleRow = document.createElement('div');
  toggleRow.className = 'spoiler-toggle-row';
  const toggleButton = document.createElement('button');
  toggleButton.type = 'button';
  toggleButton.className = 'spoiler-toggle';
  toggleButton.textContent = isSpoilerOpen ? 'hide spoiler tags' : 'show spoiler tags';
  toggleRow.appendChild(toggleButton);
  content.appendChild(toggleRow);

  if (spoilerTags.length) {
    const spoilerRowId = `spoiler-tags-${slug}`;
    toggleButton.setAttribute('aria-expanded', String(isSpoilerOpen));
    toggleButton.setAttribute('aria-controls', spoilerRowId);

    const spoilerRow = document.createElement('div');
    spoilerRow.className = 'card-tags spoiler-tags';
    spoilerRow.id = spoilerRowId;
    spoilerRow.hidden = !isSpoilerOpen;
    spoilerRow.classList.toggle('is-hidden', !isSpoilerOpen);

    toggleButton.addEventListener('click', () => {
      const nextState = !(spoilerState.get(slug) ?? false);
      spoilerState.set(slug, nextState);
      spoilerRow.hidden = !nextState;
      spoilerRow.classList.toggle('is-hidden', !nextState);
      toggleButton.textContent = nextState ? 'hide spoiler tags' : 'show spoiler tags';
      toggleButton.setAttribute('aria-expanded', String(nextState));
      if (nextState) {
        applyChipOverflow(spoilerRow, spoilerTags);
      }
    });

    content.appendChild(spoilerRow);
    registerChipRow(spoilerRow, spoilerTags);
  } else {
    toggleButton.disabled = true;
    toggleButton.classList.add('is-disabled');
    toggleButton.setAttribute('aria-disabled', 'true');
  }

  content.appendChild(footerRow);
  card.appendChild(content);
  registerChipRow(tagRow, tags);

  return card;
}
