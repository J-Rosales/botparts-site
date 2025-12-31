(() => {
  const ICONS_URL = '/icons/icons.svg';
  const ICONS_ID = 'site-icons-sprite';

  const injectSprite = async () => {
    if (document.getElementById(ICONS_ID)) {
      return;
    }

    try {
      const response = await fetch(ICONS_URL, { credentials: 'same-origin' });
      if (!response.ok) {
        throw new Error(`Failed to load icon sprite: ${response.status}`);
      }

      const markup = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(markup, 'image/svg+xml');
      const svg = doc.querySelector('svg');

      if (!svg) {
        throw new Error('Icon sprite did not contain an <svg> element.');
      }

      svg.setAttribute('id', ICONS_ID);
      svg.setAttribute('aria-hidden', 'true');

      const container = document.body;
      if (container) {
        container.insertBefore(svg, container.firstChild);
      }
    } catch (error) {
      console.warn('Icon sprite injection failed.', error);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      void injectSprite();
    });
  } else {
    void injectSprite();
  }
})();
