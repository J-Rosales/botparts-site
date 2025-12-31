const featuredContainer = document.getElementById('featured-list');
const featuredStatus = document.getElementById('featured-status');

console.debug('[CARD-WIRING] public/js/index.js loaded');

let hasLoggedCardBuilder = false;

const loadIndex = async () => {
    try {
        const response = await fetch('data/index.json');
        if (!response.ok) {
            throw new Error('Failed to load index.json');
        }
        const data = await response.json();
        const entries = Array.isArray(data.entries) ? data.entries : [];

        if (!entries.length) {
            featuredStatus.textContent = 'No featured bots are available yet.';
            return;
        }

        const featuredEntries = entries.filter(entry => entry.featured);
        if (!featuredEntries.length) {
            featuredStatus.textContent = 'No featured bots are available yet.';
            return;
        }
        const { buildCharacterCard } = await import('./site-data.js');
        if (!hasLoggedCardBuilder) {
            console.debug('[catalogue] buildCharacterCard active for featured cards');
            hasLoggedCardBuilder = true;
        }
        featuredContainer.innerHTML = '';
        featuredEntries.forEach(entry => {
            const cardEl = buildCharacterCard(entry);
            console.debug(
                '[CARD-WIRING] built card tag=',
                cardEl?.tagName,
                'class=',
                cardEl?.className,
                'built-by=',
                cardEl?.getAttribute?.('data-built-by'),
            );
            featuredContainer.appendChild(cardEl);
        });
    } catch (error) {
        const message = 'Unable to load catalogue data. Please check the data folder.';
        if (featuredStatus) {
            featuredStatus.textContent = message;
        }
    }
};

if (featuredContainer && featuredStatus) {
    loadIndex();
}
