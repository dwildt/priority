/**
 * Button Atom Component
 *
 * Basic button component following atomic design principles.
 * Supports different variants (primary, secondary, battle) and states.
 *
 * @class Button
 */
class Button {
  /**
   * Creates a Button instance
   * @param {Object} config - Button configuration
   * @param {string} config.text - Button text content
   * @param {string} [config.variant='primary'] - Button variant (primary, secondary, battle, icon)
   * @param {string} [config.size='medium'] - Button size (small, medium, large)
   * @param {boolean} [config.disabled=false] - Disabled state
   * @param {Function} [config.onClick] - Click handler
   * @param {string} [config.className] - Additional CSS classes
   * @param {string} [config.dataCy] - Cypress test attribute
   */
  constructor(config) {
    this.config = {
      text: '',
      variant: 'primary',
      size: 'medium',
      disabled: false,
      onClick: null,
      className: '',
      dataCy: '',
      ...config
    };

    this.element = this.createElement();
  }

  /**
   * Creates the button DOM element
   * @returns {HTMLButtonElement} Button element
   */
  createElement() {
    const button = document.createElement('button');

    // Base classes
    button.className = `btn btn-${this.config.variant}`;

    // Size modifier
    if (this.config.size !== 'medium') {
      button.classList.add(`btn-${this.config.size}`);
    }

    // Additional classes
    if (this.config.className) {
      button.classList.add(...this.config.className.split(' '));
    }

    // Content
    button.textContent = this.config.text;

    // States
    button.disabled = this.config.disabled;

    // Test attribute
    if (this.config.dataCy) {
      button.setAttribute('data-cy', this.config.dataCy);
    }

    // Event listeners
    if (this.config.onClick) {
      button.addEventListener('click', this.config.onClick);
    }

    return button;
  }

  /**
   * Updates button text
   * @param {string} text - New text content
   */
  setText(text) {
    this.config.text = text;
    this.element.textContent = text;
  }

  /**
   * Updates button disabled state
   * @param {boolean} disabled - Disabled state
   */
  setDisabled(disabled) {
    this.config.disabled = disabled;
    this.element.disabled = disabled;
  }

  /**
   * Gets the DOM element
   * @returns {HTMLButtonElement} Button element
   */
  getElement() {
    return this.element;
  }

  /**
   * Destroys the button component
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

// Export for ES modules
export default Button;

// Support CommonJS and browser globals
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Button;
} else if (typeof window !== 'undefined') {
  window.Button = Button;
}