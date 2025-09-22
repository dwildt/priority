class I18n {
  constructor() {
    this.currentLanguage = localStorage.getItem('priority-matrix-language') || 'en';
    this.translations = {};
    this.fallbackLanguage = 'en';
  }

  async init() {
    await this.loadLanguage(this.currentLanguage);
    this.updateDOM();
    this.setupLanguageSelector();
  }

  async loadLanguage(lang) {
    try {
      const response = await fetch(`i18n/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load language: ${lang}`);
      }
      this.translations[lang] = await response.json();
      this.currentLanguage = lang;
      localStorage.setItem('priority-matrix-language', lang);
      document.documentElement.lang = lang;
      return true;
    } catch (error) {
      console.warn(`Failed to load language ${lang}, falling back to ${this.fallbackLanguage}`, error);
      if (lang !== this.fallbackLanguage) {
        return await this.loadLanguage(this.fallbackLanguage);
      }
      return false;
    }
  }

  t(key, params = {}) {
    const keys = key.split('.');
    let translation = this.translations[this.currentLanguage];

    // Navigate through nested object
    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        translation = null;
        break;
      }
    }

    // Fallback to default language
    if (!translation && this.currentLanguage !== this.fallbackLanguage) {
      let fallback = this.translations[this.fallbackLanguage];
      for (const k of keys) {
        if (fallback && typeof fallback === 'object' && k in fallback) {
          fallback = fallback[k];
        } else {
          fallback = null;
          break;
        }
      }
      translation = fallback;
    }

    // Final fallback to key
    if (!translation) {
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }

    // Interpolate parameters
    if (typeof translation === 'string' && Object.keys(params).length > 0) {
      return translation.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param] !== undefined ? params[param] : match;
      });
    }

    return translation;
  }

  async setLanguage(lang) {
    const loaded = await this.loadLanguage(lang);
    if (loaded) {
      this.updateDOM();
      this.updateLanguageSelector();
      this.dispatchLanguageChange();
    }
    return loaded;
  }

  updateDOM() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);

      if (element.tagName === 'INPUT' && element.type === 'text') {
        element.placeholder = translation;
      } else if (element.tagName === 'INPUT' && element.type === 'submit') {
        element.value = translation;
      } else {
        element.textContent = translation;
      }
    });

    // Update title
    document.title = this.t('app.title');
  }

  setupLanguageSelector() {
    const selector = document.getElementById('language-selector');
    if (selector) {
      selector.value = this.currentLanguage;
      selector.addEventListener('change', async (e) => {
        await this.setLanguage(e.target.value);
      });
    }
  }

  updateLanguageSelector() {
    const selector = document.getElementById('language-selector');
    if (selector) {
      selector.value = this.currentLanguage;
    }
  }

  dispatchLanguageChange() {
    const event = new CustomEvent('languageChanged', {
      detail: { language: this.currentLanguage }
    });
    document.dispatchEvent(event);
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  getAvailableLanguages() {
    return ['en', 'pt', 'es'];
  }
}

export default I18n;