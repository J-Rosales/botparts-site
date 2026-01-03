const THEME_STORAGE_KEY = 'theme';
const DEFAULT_THEME = 'tomorrow';
const THEMES = new Set([
  'tomorrow',
  'photon',
  'yotsuba',
  'yotsuba-b',
  'futaba',
  'burichan',
]);

const resolveTheme = (value) => (THEMES.has(value) ? value : DEFAULT_THEME);

const applyTheme = (theme) => {
  const resolvedTheme = resolveTheme(theme);
  document.documentElement.dataset.theme = resolvedTheme;
  localStorage.setItem(THEME_STORAGE_KEY, resolvedTheme);
  return resolvedTheme;
};

const initThemeSwitcher = () => {
  const themeSelect = document.getElementById('themeSelect');
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const initialTheme = resolveTheme(storedTheme || document.documentElement.dataset.theme);

  document.documentElement.dataset.theme = initialTheme;
  if (themeSelect) {
    themeSelect.value = initialTheme;
    themeSelect.addEventListener('change', (event) => {
      applyTheme(event.target.value);
    });
  }
};

initThemeSwitcher();
