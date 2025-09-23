/**
 * Internationalization (i18n) manager for multi-language support.
 * Supports Portuguese (pt), English (en), and Spanish (es) with dynamic language switching.
 * 
 * Features:
 * - Dynamic language loading from JSON files
 * - Graceful fallback to English for missing translations
 * - Parameter interpolation in translations
 * - DOM element auto-translation via data-i18n attributes
 * - Persistent language preference storage
 * 
 * @class I18n
 */
class I18n {
  /**
   * Initializes the i18n system with stored language preference or English default.
   */
  constructor() {
    /** @type {string} Current active language code */
    this.currentLanguage = localStorage.getItem('priority-matrix-language') || 'en';
    
    /** @type {Object} Cache of loaded translation objects by language */
    this.translations = {};
    
    /** @type {string} Fallback language when translations are missing */
    this.fallbackLanguage = 'en';
  }

  /**
   * Initializes the i18n system by loading the current language and updating the DOM.
   * 
   * @async
   * @returns {Promise<void>}
   */
  async init() {
    await this.loadLanguage(this.currentLanguage);
    this.updateDOM();
    this.setupLanguageSelector();
  }

  /**
   * Loads translation data for a specific language from JSON file.
   * Falls back to English if the requested language fails to load.
   * 
   * @async
   * @param {string} lang - Language code (en, pt, es)
   * @returns {Promise<boolean>} True if language loaded successfully, false otherwise
   */
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
      
      // Recursive fallback to English
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