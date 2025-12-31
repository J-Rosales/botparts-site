const listContainer = document.getElementById('character-list');
const featuredContainer = document.getElementById('featured-list');
const indexStatus = document.getElementById('index-status');
const featuredStatus = document.getElementById('featured-status');

const buildCard = (entry) => {
    const card = document.createElement('a');
    card.className = 'character-card';
    card.href = `character.html?slug=${encodeURIComponent(entry.slug)}`;

    const title = document.createElement('h3');
    title.textContent = entry.name || entry.slug;

    const description = document.createElement('p');
    description.textContent = entry.description || 'No description provided yet.';

    card.append(title, description);
    return card;
};

const renderList = (container, entries) => {
    container.innerHTML = '';
    entries.forEach(entry => {
        container.append(buildCard(entry));
    });
};

const loadIndex = async () => {
    try {
        const response = await fetch('data/index.json');
        if (!response.ok) {
            throw new Error('Failed to load index.json');
        }
        const data = await response.json();
        const entries = Array.isArray(data.entries) ? data.entries : [];

        if (!entries.length) {
            indexStatus.textContent = 'No entries were found in data/index.json.';
            featuredStatus.textContent = 'No featured bots are available yet.';
            return;
        }

        renderList(listContainer, entries);

        const featuredEntries = entries.filter(entry => entry.featured);
        const featuredList = featuredEntries.length ? featuredEntries : entries.slice(0, 3);
        renderList(featuredContainer, featuredList);
    } catch (error) {
        const message = 'Unable to load catalogue data. Please check the data folder.';
        if (indexStatus) {
            indexStatus.textContent = message;
        }
        if (featuredStatus) {
            featuredStatus.textContent = message;
        }
    }
};

if (listContainer && featuredContainer) {
    loadIndex();
}
