const nameEl = document.getElementById('character-name');
const taglineEl = document.getElementById('character-tagline');
const detailEl = document.getElementById('character-detail');
const mediaEl = document.getElementById('character-media');
const statusEl = document.getElementById('character-status');

const setStatus = (message) => {
    if (statusEl) {
        statusEl.textContent = message;
    }
};

const resolveAssetUrl = (path) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    return path;
};

const resolveCharacterImage = (manifest) => {
    const candidate =
        manifest?.cardImage ||
        manifest?.image ||
        manifest?.media?.cardPng ||
        manifest?.media?.card ||
        manifest?.assets?.cardPng ||
        null;
    return resolveAssetUrl(candidate);
};

const resolveSourceSite = (url) => {
    if (!url) return 'unknown source';
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch (error) {
        return url;
    }
};

const buildAttributionSentence = (manifest) => {
    const author =
        manifest?.author?.name ||
        manifest?.creator ||
        manifest?.provenance?.original?.label ||
        'unknown author';
    const sourceUrl =
        manifest?.provenance?.original?.url ||
        manifest?.source?.url ||
        '';
    const sourceSite = resolveSourceSite(sourceUrl);
    return `rewriten or inspired by ${author} (${sourceSite})`;
};

const renderMedia = (manifest) => {
    if (!mediaEl) return;
    const imageUrl = resolveCharacterImage(manifest);
    mediaEl.innerHTML = '';
    if (!imageUrl) {
        const placeholder = document.createElement('p');
        placeholder.className = 'status-message';
        placeholder.textContent = 'No preview image available.';
        mediaEl.append(placeholder);
        return;
    }
    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = manifest.name ? `${manifest.name} preview` : 'Character preview';
    image.loading = 'lazy';
    mediaEl.append(image);
};

const renderCharacter = (manifest) => {
    if (!detailEl) {
        return;
    }

    detailEl.innerHTML = '';

    const description = document.createElement('p');
    description.textContent = manifest.description || 'No description is available yet.';

    const attribution = document.createElement('p');
    attribution.className = 'status-message';
    attribution.textContent = buildAttributionSentence(manifest);

    const updated = document.createElement('p');
    updated.className = 'status-message';
    updated.textContent = manifest.updated ? `Last updated: ${manifest.updated}` : 'Update date not provided.';

    const tagList = document.createElement('div');
    tagList.className = 'tag-list';

    const tags = Array.isArray(manifest.tags) ? manifest.tags : [];
    if (tags.length) {
        tags.forEach(tag => {
            const pill = document.createElement('span');
            pill.className = 'tag-pill';
            pill.textContent = tag;
            tagList.append(pill);
        });
    } else {
        const placeholder = document.createElement('span');
        placeholder.className = 'status-message';
        placeholder.textContent = 'No tags listed.';
        tagList.append(placeholder);
    }

    detailEl.append(description, attribution, tagList, updated);
};

const loadCharacter = async () => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    if (!slug) {
        setStatus('Missing character slug. Return to the landing page and select a character.');
        return;
    }

    try {
        const response = await fetch(`data/characters/${encodeURIComponent(slug)}/manifest.json`);
        if (!response.ok) {
            throw new Error('Manifest not found');
        }

        const manifest = await response.json();
        if (nameEl) {
            nameEl.textContent = manifest.name || slug;
        }
        if (taglineEl) {
            taglineEl.textContent = manifest.description || 'Manifest loaded from static data.';
        }
        renderMedia(manifest);
        renderCharacter(manifest);
    } catch (error) {
        setStatus('Unable to load this character. Check the URL or data folder.');
    }
};

if (detailEl) {
    loadCharacter();
}
