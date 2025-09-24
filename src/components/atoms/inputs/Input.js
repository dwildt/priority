/**
 * Input Atom Component
 *
 * Base input component for text inputs and textareas.
 * Supports various input types and validation states.
 *
 * @class Input
 */
class Input {
  /**
   * Creates an Input instance
   * @param {Object} config - Input configuration
   * @param {string} config.type - Input type ('text', 'textarea', 'email', etc.)
   * @param {string} [config.id] - Input ID
   * @param {string} [config.placeholder] - Placeholder text
   * @param {string} [config.value=''] - Initial value
   * @param {boolean} [config.required=false] - Required field
   * @param {number} [config.maxLength] - Maximum character length
   * @param {number} [config.rows=3] - Rows for textarea
   * @param {Function} [config.onInput] - Input change handler
   * @param {Function} [config.onFocus] - Focus handler
   * @param {Function} [config.onBlur] - Blur handler
   * @param {string} [config.className] - Additional CSS classes
   * @param {string} [config.dataCy] - Cypress test attribute
   */
  constructor(config) {
    this.config = {
      type: 'text',
      id: '',
      placeholder: '',
      value: '',
      required: false,
      maxLength: null,
      rows: 3,
      onInput: null,
      onFocus: null,
      onBlur: null,
      className: '',
      dataCy: '',
      ...config
    };

    this.element = this.createElement();
  }

  /**
   * Creates the input DOM element
   * @returns {HTMLInputElement|HTMLTextAreaElement} Input element
   */
  createElement() {
    let input;

    // Create appropriate element type
    if (this.config.type === 'textarea') {
      input = document.createElement('textarea');
      input.rows = this.config.rows;
    } else {
      input = document.createElement('input');
      input.type = this.config.type;
    }

    // Set basic attributes
    if (this.config.id) {
      input.id = this.config.id;
    }

    if (this.config.placeholder) {
      input.placeholder = this.config.placeholder;
    }

    input.value = this.config.value;
    input.required = this.config.required;

    if (this.config.maxLength) {
      input.maxLength = this.config.maxLength;
    }

    // Add classes
    if (this.config.className) {
      input.classList.add(...this.config.className.split(' '));
    }

    // Test attribute
    if (this.config.dataCy) {
      input.setAttribute('data-cy', this.config.dataCy);
    }

    // Event listeners
    if (this.config.onInput) {
      input.addEventListener('input', (event) => {
        this.config.value = event.target.value;
        this.config.onInput(event.target.value, event);
      });
    }

    if (this.config.onFocus) {
      input.addEventListener('focus', this.config.onFocus);
    }

    if (this.config.onBlur) {
      input.addEventListener('blur', this.config.onBlur);
    }

    return input;
  }

  /**
   * Gets the current value
   * @returns {string} Current input value
   */
  getValue() {
    return this.element ? this.element.value : this.config.value;
  }

  /**
   * Sets the input value
   * @param {string} value - New value
   */
  setValue(value) {
    this.config.value = value;
    if (this.element) {
      this.element.value = value;
    }
  }

  /**
   * Sets focus on the input
   */
  focus() {
    if (this.element) {
      this.element.focus();
    }
  }

  /**
   * Validates the input
   * @returns {boolean} Whether the input is valid
   */
  isValid() {
    if (!this.element) return true;

    // Required field validation
    if (this.config.required && !this.element.value.trim()) {
      return false;
    }

    // HTML5 validation
    return this.element.validity.valid;
  }

  /**
   * Sets validation state styling
   * @param {boolean} isValid - Whether the input is valid
   * @param {string} [message] - Validation message
   */
  setValidationState(isValid, message) {
    if (!this.element) return;

    if (isValid) {
      this.element.classList.remove('invalid');
      this.element.classList.add('valid');
    } else {
      this.element.classList.remove('valid');
      this.element.classList.add('invalid');
    }

    // You could extend this to show/hide validation messages
  }

  /**
   * Gets the DOM element
   * @returns {HTMLInputElement|HTMLTextAreaElement} Input element
   */
  getElement() {
    return this.element;
  }

  /**
   * Destroys the input component
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

// Export for ES modules
export default Input;

// Support CommonJS and browser globals
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Input;
} else if (typeof window !== 'undefined') {
  window.Input = Input;
}