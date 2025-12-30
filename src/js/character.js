import { fetchCharacterData } from './site-data.js';

const nameEl = document.getElementById('characterName');
const descriptionEl = document.getElementById('characterDescription');
const tagsEl = document.getElementById('characterTags');
const sourceEl = document.getElementById('characterSource');
const noticeEl = document.getElementById('characterNotice');
const errorEl = document.getElementById('characterError');

function setError(message) {
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
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

    if (sourceEl) {
      const url = data.provenance?.original?.url || data.source?.url;
      const label = data.provenance?.original?.label || data.source?.label || 'Original source';
      if (url) {
        sourceEl.href = url;
        sourceEl.textContent = label;
      } else {
        sourceEl.textContent = 'Source link pending.';
      }
    }

    if (noticeEl) {
      const status = data.redistributeAllowed || 'unknown';
      noticeEl.textContent = `Redistribution status: ${status}.`;
    }
  } catch (error) {
    setError('Unable to load this character yet. Please try again later.');
  }
}

loadCharacter();
