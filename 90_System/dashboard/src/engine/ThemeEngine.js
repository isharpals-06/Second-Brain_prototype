export class ThemeEngine {
  constructor() {
    this.activeTheme = 'dark-industrial';
  }

  getTheme() {
    return this.activeTheme;
  }

  setTheme(themeName) {
    this.activeTheme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    return true;
  }
}

export const themeEngine = new ThemeEngine();
