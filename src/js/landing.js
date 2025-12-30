import { buildCharacterCard, fetchIndexData } from './site-data.js';

const featuredGrid = document.getElementById('featuredGrid');
const featuredEmpty = document.getElementById('featuredEmpty');

async function loadFeatured() {
  if (!featuredGrid) {
    return;
  }

  try {
    const data = await fetchIndexData();
    const featured = (data.entries || []).filter((entry) => entry.featured);

    if (!featured.length) {
      featuredEmpty?.classList.remove('hidden');
      return;
    }

    featured.forEach((entry) => {
      featuredGrid.appendChild(buildCharacterCard(entry));
    });
  } catch (error) {
    if (featuredEmpty) {
      featuredEmpty.textContent = 'Unable to load featured characters right now.';
      featuredEmpty.classList.remove('hidden');
    }
  }
}

loadFeatured();
