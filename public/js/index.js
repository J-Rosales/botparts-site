const featuredContainer = document.getElementById('featured-list');
const featuredStatus = document.getElementById('featured-status');
const IS_LOCALHOST = typeof window !== 'undefined'
    && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

console.debug('[CARD-WIRING] public/js/index.js loaded');

let hasLoggedCardBuilder = false;

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

const loadIndex = async () => {
    try {
        if (IS_LOCALHOST) {
            const placeholders = buildPlaceholderEntries();
            const { buildCharacterCard } = await import('./site-data.js');
            featuredContainer.innerHTML = '';
            placeholders.forEach(entry => {
                const cardEl = buildCharacterCard(entry);
                featuredContainer.appendChild(cardEl);
            });
            if (featuredStatus) {
                featuredStatus.textContent = '';
            }
            return;
        }
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
