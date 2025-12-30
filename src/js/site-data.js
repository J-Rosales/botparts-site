const defaultBase = '';

export function getBasePath() {
  return document.body?.dataset?.base ?? defaultBase;
}

export function getPageBase() {
  return document.body?.dataset?.pageBase ?? '';
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

  const tags = (entry.tags || []).map((tag) => `<span class="tag-pill">${tag}</span>`).join('');
  const pageBase = getPageBase();
  const href = `${pageBase}character.html?slug=${encodeURIComponent(entry.slug)}`;

  card.innerHTML = `
    <a class="card-link" href="${href}">
      <div class="card-content">
        <span class="card-badge">${entry.featured ? 'Featured' : 'Character'}</span>
        <h3 class="card-title">${entry.name}</h3>
        <p class="card-subtitle">${entry.description || 'No description provided yet.'}</p>
        <div class="card-tags">${tags}</div>
      </div>
    </a>
  `;

  return card;
}
