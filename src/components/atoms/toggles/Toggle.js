/**
 * Toggle Atom Component
 *
 * Toggle switch component for boolean settings (importance/urgency).
 * Follows atomic design principles with clean state management.
 *
 * @class Toggle
 */
class Toggle {
  /**
   * Creates a Toggle instance
   * @param {Object} config - Toggle configuration
   * @param {string} config.id - Unique identifier for the toggle
   * @param {string} config.label - Toggle label text
   * @param {boolean} [config.checked=false] - Initial checked state
   * @param {Function} [config.onChange] - Change handler
   * @param {string} [config.className] - Additional CSS classes
   * @param {string} [config.dataCy] - Cypress test attribute
   */
  constructor(config) {
    this.config = {
      id: '',
      label: '',
      checked: false,
      onChange: null,
      className: '',
      dataCy: '',
      ...config
    };

    this.element = this.createElement();
  }

  /**
   * Creates the toggle DOM structure
   * @returns {HTMLDivElement} Toggle container element
   */
  createElement() {
    const container = document.createElement('div');
    container.className = 'toggle-container';

    if (this.config.className) {
      container.classList.add(...this.config.className.split(' '));
    }

    // Create toggle switch structure
    const toggleLabel = document.createElement('label');
    toggleLabel.className = 'toggle-switch';
    toggleLabel.setAttribute('for', this.config.id);

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = this.config.id;
    input.checked = this.config.checked;

    if (this.config.dataCy) {
      input.setAttribute('data-cy', this.config.dataCy);
    }

    const slider = document.createElement('span');
    slider.className = 'toggle-slider';

    const labelText = document.createElement('span');
    labelText.className = 'toggle-label';
    labelText.textContent = this.config.label;

    // Event listeners
    if (this.config.onChange) {
      input.addEventListener('change', (event) => {
        this.config.checked = event.target.checked;
        this.config.onChange(event.target.checked, event);
      });
    }

    // Assemble structure
    toggleLabel.appendChild(input);
    toggleLabel.appendChild(slider);
    container.appendChild(toggleLabel);
    container.appendChild(labelText);

    this.input = input;
    return container;
  }

  /**
   * Gets the current checked state
   * @returns {boolean} Current checked state
   */
  getChecked() {
    return this.input ? this.input.checked : this.config.checked;
  }

  /**
   * Sets the checked state
   * @param {boolean} checked - New checked state
   */
  setChecked(checked) {
    this.config.checked = checked;
    if (this.input) {
      this.input.checked = checked;
    }
  }

  /**
   * Updates the label text
   * @param {string} label - New label text
   */
  setLabel(label) {
    this.config.label = label;
    const labelElement = this.element.querySelector('.toggle-label');
    if (labelElement) {
      labelElement.textContent = label;
    }
  }

  /**
   * Gets the DOM element
   * @returns {HTMLDivElement} Toggle container element
   */
  getElement() {
    return this.element;
  }

  /**
   * Gets the input element for direct access
   * @returns {HTMLInputElement} Input element
   */
  getInput() {
    return this.input;
  }

  /**
   * Destroys the toggle component
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

// Export for ES modules
export default Toggle;

// Support CommonJS and browser globals
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Toggle;
} else if (typeof window !== 'undefined') {
  window.Toggle = Toggle;
}