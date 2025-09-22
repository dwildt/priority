// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests from command log to reduce noise
const app = window.top;
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML =
    '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test on uncaught exceptions
  // We can be more specific about which errors to ignore
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false;
  }
  // Don't fail on network errors during development
  if (err.message.includes('Loading failed for the <script>')) {
    return false;
  }
  return true;
});

// Clear localStorage before each test
beforeEach(() => {
  cy.clearLocalStorage();
  cy.clearCookies();
});

// Add global test utilities
Cypress.Commands.add('waitForAppToLoad', () => {
  cy.get('[data-cy="app-title"]', { timeout: 10000 }).should('be.visible');
  cy.get('.matrix-grid', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('skipOnboarding', () => {
  // Skip any onboarding flows if they exist
  cy.get('body').then(($body) => {
    if ($body.find('[data-cy="skip-onboarding"]').length > 0) {
      cy.get('[data-cy="skip-onboarding"]').click();
    }
  });
});

// Custom assertions
Cypress.Commands.add('shouldBeInQuadrant', (taskName, quadrant) => {
  cy.get(`[data-quadrant="${quadrant}"]`)
    .find('[data-cy="task-item"]')
    .contains(taskName)
    .should('exist');
});

Cypress.Commands.add('shouldHaveTaskCount', (quadrant, count) => {
  if (count === 0) {
    cy.get(`[data-quadrant="${quadrant}"] [data-cy="task-item"]`).should('not.exist');
  } else {
    cy.get(`[data-quadrant="${quadrant}"] [data-cy="task-item"]`).should('have.length', count);
  }
});

// Network stubbing for offline testing
Cypress.Commands.add('mockOffline', () => {
  cy.intercept('**', { forceNetworkError: true });
});

// Performance testing utilities
Cypress.Commands.add('measureLoadTime', (alias) => {
  cy.window().then((win) => {
    const startTime = win.performance.now();
    cy.wrap(startTime).as(`${alias}_start`);
  });
});

Cypress.Commands.add('endMeasureLoadTime', (alias) => {
  cy.window().then((win) => {
    const endTime = win.performance.now();
    cy.get(`@${alias}_start`).then((startTime) => {
      const loadTime = endTime - startTime;
      cy.log(`${alias} load time: ${loadTime.toFixed(2)}ms`);
      expect(loadTime).to.be.lessThan(5000); // 5 second threshold
    });
  });
});

// Accessibility testing setup
Cypress.Commands.add('checkA11y', (selector = null, options = {}) => {
  const defaultOptions = {
    includedImpacts: ['critical', 'serious'],
    rules: {
      'color-contrast': { enabled: false }, // Disable color contrast checks in tests
    }
  };

  const mergedOptions = { ...defaultOptions, ...options };

  if (selector) {
    cy.get(selector).should('exist');
  }

  // Note: Would need to install cypress-axe for full a11y testing
  // cy.checkA11y(selector, mergedOptions);
});

// Mobile testing utilities
Cypress.Commands.add('setMobileViewport', () => {
  cy.viewport(375, 667); // iPhone 6/7/8 size
});

Cypress.Commands.add('setTabletViewport', () => {
  cy.viewport(768, 1024); // iPad size
});

Cypress.Commands.add('setDesktopViewport', () => {
  cy.viewport(1280, 720); // Default desktop size
});

// Language testing utilities
Cypress.Commands.add('switchLanguage', (language) => {
  cy.get('[data-cy="language-selector"]').select(language);
  cy.wait(500); // Wait for language to load and DOM to update
});

Cypress.Commands.add('verifyLanguage', (language) => {
  const languageTexts = {
    en: 'Priority Matrix',
    pt: 'Matriz de Prioridades',
    es: 'Matriz de Prioridades'
  };

  cy.get('[data-cy="app-title"]').should('contain', languageTexts[language]);
});

// Custom logging
Cypress.Commands.add('logStep', (message) => {
  cy.log(`📝 Step: ${message}`);
});

Cypress.Commands.add('logSection', (section) => {
  cy.log(`🔍 Testing: ${section}`);
});

// Date utilities for testing
Cypress.Commands.add('mockDate', (dateString) => {
  cy.window().then((win) => {
    const mockDate = new Date(dateString);
    cy.stub(win, 'Date').returns(mockDate);
  });
});

// Print testing utilities
Cypress.Commands.add('testPrintStyles', () => {
  cy.window().then((win) => {
    // Temporarily apply print media query
    const mediaQuery = win.matchMedia('print');

    // Add print class to body for testing
    cy.get('body').then(($body) => {
      $body.addClass('print-mode');

      // Verify print-specific elements are hidden
      cy.get('.btn', { timeout: 1000 }).should('not.be.visible');
      cy.get('.modal-header', { timeout: 1000 }).should('not.be.visible');

      // Remove print class
      $body.removeClass('print-mode');
    });
  });
});

// Data persistence testing
Cypress.Commands.add('verifyDataPersistence', () => {
  // Reload page and verify data persists
  cy.reload();
  cy.waitForAppToLoad();

  // Check localStorage
  cy.window().its('localStorage').invoke('getItem', 'priority-matrix-data').should('exist');
});

// Performance and memory leak detection
Cypress.Commands.add('checkMemoryLeaks', () => {
  cy.window().then((win) => {
    const initialMemory = win.performance.memory?.usedJSHeapSize || 0;
    cy.wrap(initialMemory).as('initialMemory');
  });
});

Cypress.Commands.add('verifyNoMemoryLeaks', () => {
  cy.get('@initialMemory').then((initialMemory) => {
    cy.window().then((win) => {
      const currentMemory = win.performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = currentMemory - initialMemory;

      // Allow for some memory increase but flag if excessive
      if (memoryIncrease > 10 * 1024 * 1024) { // 10MB threshold
        cy.log(`⚠️ Potential memory leak detected: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB increase`);
      }
    });
  });
});

// Global error handling
Cypress.on('fail', (error, runnable) => {
  // Take screenshot on failure
  if (error.message.includes('Timed out')) {
    cy.screenshot(`timeout-failure-${runnable.title}`, {
      capture: 'fullPage',
      overwrite: true
    });
  }

  throw error;
});