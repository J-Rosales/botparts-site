import { buildCharacterCard, fetchIndexData } from './site-data.js';

const browseGrid = document.getElementById('browseGrid');
const browseEmpty = document.getElementById('browseEmpty');

async function loadBrowse() {
  if (!browseGrid) {
    return;
  }

  try {
    const data = await fetchIndexData();
    const entries = data.entries || [];

    if (!entries.length) {
      browseEmpty?.classList.remove('hidden');
      return;
    }

    entries.forEach((entry) => {
      browseGrid.appendChild(buildCharacterCard(entry));
    });
  } catch (error) {
    if (browseEmpty) {
      browseEmpty.textContent = 'Unable to load catalogue data right now.';
      browseEmpty.classList.remove('hidden');
    }
  }
}

loadBrowse();
