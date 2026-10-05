/**
 * Theme Store for Animori
 * Supports Dark mode (default), Light mode, persistence in localStorage,
 * and system preference detection via prefers-color-scheme.
 */

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'animori_theme';

class ThemeManager {
  current = $state<Theme>('dark');
  isInitialized = $state(false);

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === 'dark' || stored === 'light') {
      this.applyTheme(stored, false);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.applyTheme(prefersDark ? 'dark' : 'light', false);
    }

    // Listen to OS theme changes if user has not set an explicit override
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const hasStoredPreference = localStorage.getItem(STORAGE_KEY);
      if (!hasStoredPreference) {
        this.applyTheme(e.matches ? 'dark' : 'light', false);
      }
    });

    this.isInitialized = true;
  }

  applyTheme(theme: Theme, persist = true) {
    this.current = theme;

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
      root.setAttribute('data-theme', theme);

      // Update mobile browser chrome address bar color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#050811' : '#f4f6fa');
      }
    }

    if (persist && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, theme);
    }
  }

  toggleTheme() {
    const nextTheme: Theme = this.current === 'dark' ? 'light' : 'dark';
    this.applyTheme(nextTheme, true);
  }
}

export const themeManager = new ThemeManager();
