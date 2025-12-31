const nameEl = document.getElementById('character-name');
const taglineEl = document.getElementById('character-tagline');
const detailEl = document.getElementById('character-detail');
const statusEl = document.getElementById('character-status');

const setStatus = (message) => {
    if (statusEl) {
        statusEl.textContent = message;
    }
};

const renderCharacter = (manifest) => {
    if (!detailEl) {
        return;
    }

    detailEl.innerHTML = '';

    const description = document.createElement('p');
    description.textContent = manifest.description || 'No description is available yet.';

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

    detailEl.append(description, tagList, updated);
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
        renderCharacter(manifest);
    } catch (error) {
        setStatus('Unable to load this character. Check the URL or data folder.');
    }
};

if (detailEl) {
    loadCharacter();
}
