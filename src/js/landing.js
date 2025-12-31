import { buildCharacterCard, fetchIndexData } from './site-data.js';

console.debug('[CARD-WIRING] landing.js loaded');

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
      const cardEl = buildCharacterCard(entry);
      console.debug(
        '[CARD-WIRING] built card tag=',
        cardEl?.tagName,
        'class=',
        cardEl?.className,
        'built-by=',
        cardEl?.getAttribute?.('data-built-by'),
      );
      featuredGrid.appendChild(cardEl);
    });
  } catch (error) {
    if (featuredEmpty) {
      featuredEmpty.textContent = 'Unable to load featured characters right now.';
      featuredEmpty.classList.remove('hidden');
    }
  }
}

loadFeatured();
