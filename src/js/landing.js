import { buildCharacterCard, fetchIndexData } from './site-data.js';

console.debug('[CARD-WIRING] landing.js loaded');

const featuredGrid = document.getElementById('featuredGrid');
const featuredEmpty = document.getElementById('featuredEmpty');
const IS_LOCALHOST = typeof window !== 'undefined'
  && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const buildPlaceholderEntries = () => {
  const baseTags = [
    ['prototype', 'friendly', 'guide'],
    ['noir', 'detective', 'mystery'],
    ['space', 'navigator', 'calm'],
    ['fantasy', 'healer', 'support'],
    ['retro', 'arcade', 'energetic'],
  ];
  const spoilerTags = [
    ['major reveal', 'ending'],
    ['secret origin'],
    [],
    ['plot twist'],
    [],
  ];

  return Array.from({ length: 10 }, (_, index) => {
    const id = String(index + 1).padStart(2, '0');
    return {
      slug: `placeholder-${id}`,
      name: `Placeholder Bot ${id}`,
      featured: true,
      tags: baseTags[index % baseTags.length],
      spoilerTags: spoilerTags[index % spoilerTags.length],
      shortDescription: `Preview layout card ${id} for local grid testing.`,
      uploadDate: `2025-01-${id}`,
      aiTokens: 1200 + index * 150,
    };
  });
};

async function loadFeatured() {
  if (!featuredGrid) {
    return;
  }

  try {
    if (IS_LOCALHOST) {
      const placeholders = buildPlaceholderEntries();
      featuredGrid.innerHTML = '';
      featuredEmpty?.classList.add('hidden');
      placeholders.forEach((entry) => {
        const cardEl = buildCharacterCard(entry);
        featuredGrid.appendChild(cardEl);
      });
      return;
    }
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
