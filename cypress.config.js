const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/integration/**/*.cy.js',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    fixturesFolder: 'cypress/fixtures',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshot: true,
    chromeWebSecurity: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      // Environment variables for tests
      REACT_APP_ENV: 'test'
    },
    retries: {
      // Configure retry attempts for `cypress run`
      runMode: 2,
      // Configure retry attempts for `cypress open`
      openMode: 0
    },
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    // Exclude example tests
    excludeSpecPattern: [
      'cypress/e2e/1-getting-started/*',
      'cypress/e2e/2-advanced-examples/*'
    ]
  },
});