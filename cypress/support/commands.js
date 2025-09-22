// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom commands for Priority Matrix app

// Task management commands
Cypress.Commands.add('addTask', (name, importance = 3, urgency = 3, description = '') => {
  cy.get('[data-cy="add-task-btn"]').click();

  cy.get('[data-cy="task-name"]').clear().type(name);

  if (description) {
    cy.get('[data-cy="task-description"]').clear().type(description);
  }

  cy.get('[data-cy="importance-slider"]').invoke('val', importance).trigger('input');
  cy.get('[data-cy="urgency-slider"]').invoke('val', urgency).trigger('input');

  cy.get('[data-cy="save-task-btn"]').click();

  // Wait for modal to close and task to appear
  cy.get('#task-modal').should('not.be.visible');
  cy.contains(name).should('be.visible');
});

Cypress.Commands.add('editTask', (taskName, newData) => {
  cy.contains('[data-cy="task-item"]', taskName)
    .find('[data-cy="edit-btn"]')
    .click();

  if (newData.name) {
    cy.get('[data-cy="task-name"]').clear().type(newData.name);
  }

  if (newData.description !== undefined) {
    cy.get('[data-cy="task-description"]').clear();
    if (newData.description) {
      cy.get('[data-cy="task-description"]').type(newData.description);
    }
  }

  if (newData.importance) {
    cy.get('[data-cy="importance-slider"]').invoke('val', newData.importance).trigger('input');
  }

  if (newData.urgency) {
    cy.get('[data-cy="urgency-slider"]').invoke('val', newData.urgency).trigger('input');
  }

  cy.get('[data-cy="save-task-btn"]').click();
  cy.get('#task-modal').should('not.be.visible');
});

Cypress.Commands.add('deleteTask', (taskName) => {
  cy.contains('[data-cy="task-item"]', taskName)
    .find('[data-cy="delete-btn"]')
    .click();

  // Handle confirmation dialog
  cy.on('window:confirm', () => true);

  // Verify task is removed
  cy.contains('[data-cy="task-item"]', taskName).should('not.exist');
});

Cypress.Commands.add('completeTask', (taskName) => {
  cy.contains('[data-cy="task-item"]', taskName)
    .find('[data-cy="complete-btn"]')
    .click();

  // Verify task is marked as completed
  cy.contains('[data-cy="task-item"]', taskName).should('have.class', 'completed');
});

Cypress.Commands.add('uncompleteTask', (taskName) => {
  cy.contains('[data-cy="task-item"]', taskName)
    .find('[data-cy="complete-btn"]')
    .click();

  // Verify task is no longer marked as completed
  cy.contains('[data-cy="task-item"]', taskName).should('not.have.class', 'completed');
});

// Battle mode commands
Cypress.Commands.add('startBattleMode', () => {
  cy.get('[data-cy="quadrant-1"]').find('[data-cy="battle-mode-btn"]').click();
  cy.get('#battle-modal').should('be.visible');
  cy.get('[data-cy="battle-comparison"]').should('be.visible');
});

Cypress.Commands.add('completeBattle', (choices = []) => {
  cy.startBattleMode();

  // If specific choices provided, use them; otherwise choose randomly
  if (choices.length > 0) {
    choices.forEach(choice => {
      cy.get(`[data-cy="choose-${choice.toLowerCase()}"]`).click();
      cy.wait(500); // Small delay between choices
    });
  } else {
    // Complete battle with random choices
    cy.get('[data-cy="battle-comparison"]').then(() => {
      const completeBattleRecursively = () => {
        cy.get('body').then($body => {
          if ($body.find('[data-cy="battle-comparison"]:visible').length > 0) {
            // Battle is still active, make a choice
            const choice = Math.random() > 0.5 ? 'a' : 'b';
            cy.get(`[data-cy="choose-${choice}"]`).click();
            cy.wait(300);
            completeBattleRecursively();
          }
        });
      };
      completeBattleRecursively();
    });
  }

  // Wait for battle to complete
  cy.get('[data-cy="the-one-result"]', { timeout: 10000 }).should('be.visible');
});

// Matrix navigation commands
Cypress.Commands.add('getQuadrant', (quadrantNumber) => {
  return cy.get(`[data-quadrant="${quadrantNumber}"]`);
});

Cypress.Commands.add('getTasksInQuadrant', (quadrantNumber) => {
  return cy.get(`[data-quadrant="${quadrantNumber}"] [data-cy="task-item"]`);
});

Cypress.Commands.add('verifyTaskInQuadrant', (taskName, quadrantNumber) => {
  cy.getQuadrant(quadrantNumber)
    .find('[data-cy="task-item"]')
    .contains(taskName)
    .should('exist');
});

// Report generation commands
Cypress.Commands.add('generateReport', () => {
  cy.get('[data-cy="generate-report-btn"]').click();
  cy.get('#report-modal').should('be.visible');
  cy.get('#report-content').should('be.visible');
});

Cypress.Commands.add('verifyReportContent', (expectedContent) => {
  cy.generateReport();

  if (expectedContent.theOne) {
    cy.get('#report-content').should('contain', expectedContent.theOne);
  }

  if (expectedContent.upNext) {
    expectedContent.upNext.forEach(task => {
      cy.get('#report-content').should('contain', task);
    });
  }

  if (expectedContent.statistics) {
    Object.entries(expectedContent.statistics).forEach(([key, value]) => {
      cy.get('#report-content').should('contain', value);
    });
  }
});

// Language testing commands
Cypress.Commands.add('testAllLanguages', (testCallback) => {
  const languages = ['en', 'pt', 'es'];

  languages.forEach(language => {
    cy.switchLanguage(language);
    cy.verifyLanguage(language);

    if (testCallback) {
      testCallback(language);
    }
  });

  // Return to English
  cy.switchLanguage('en');
});

// Data management commands
Cypress.Commands.add('clearAllTasks', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('priority-matrix-data');
  });
  cy.reload();
  cy.waitForAppToLoad();
});

Cypress.Commands.add('seedTestData', () => {
  const testTasks = [
    { name: 'Critical Bug Fix', importance: 5, urgency: 5, description: 'Fix security vulnerability' },
    { name: 'Strategic Planning', importance: 5, urgency: 2, description: 'Plan next quarter goals' },
    { name: 'Team Meeting', importance: 2, urgency: 5, description: 'Weekly standup meeting' },
    { name: 'Code Cleanup', importance: 2, urgency: 2, description: 'Refactor old code' },
    { name: 'Review Documentation', importance: 4, urgency: 3, description: 'Update project docs' }
  ];

  testTasks.forEach(task => {
    cy.addTask(task.name, task.importance, task.urgency, task.description);
  });
});

// Accessibility commands
Cypress.Commands.add('testKeyboardNavigation', () => {
  // Test tab navigation
  cy.get('body').tab();
  cy.focused().should('have.attr', 'data-cy', 'language-selector');

  cy.focused().tab();
  cy.focused().should('have.attr', 'data-cy', 'add-task-btn');

  cy.focused().tab();
  cy.focused().should('have.attr', 'data-cy', 'generate-report-btn');
});

Cypress.Commands.add('testKeyboardShortcuts', () => {
  // Test Ctrl+N for new task
  cy.get('body').type('{ctrl}n');
  cy.get('#task-modal').should('be.visible');
  cy.get('[data-cy="close-modal"]').click();

  // Test Escape to close modals
  cy.get('[data-cy="add-task-btn"]').click();
  cy.get('body').type('{esc}');
  cy.get('#task-modal').should('not.be.visible');
});

// Performance testing commands
Cypress.Commands.add('testLargeDataSet', () => {
  // Add many tasks to test performance
  for (let i = 1; i <= 50; i++) {
    cy.addTask(
      `Performance Test Task ${i}`,
      Math.floor(Math.random() * 5) + 1,
      Math.floor(Math.random() * 5) + 1,
      `Description for task ${i}`
    );
  }

  // Verify app still performs well
  cy.get('[data-cy="task-item"]').should('have.length', 50);
  cy.get('.matrix-grid').should('be.visible');
});

// Error handling commands
Cypress.Commands.add('testErrorStates', () => {
  // Test with invalid task data
  cy.get('[data-cy="add-task-btn"]').click();
  cy.get('[data-cy="save-task-btn"]').click(); // Try to save without name

  // Should show validation error or prevent saving
  cy.get('#task-modal').should('be.visible'); // Modal should still be open
});

// Mobile testing commands
Cypress.Commands.add('testMobileInteractions', () => {
  cy.setMobileViewport();

  // Test touch interactions
  cy.get('[data-cy="add-task-btn"]').should('be.visible');
  cy.get('.matrix-grid').should('be.visible');

  // Test that all functionality works on mobile
  cy.addTask('Mobile Test Task', 3, 3);
  cy.contains('Mobile Test Task').should('be.visible');

  cy.setDesktopViewport(); // Reset viewport
});

// Utility commands
Cypress.Commands.add('debugState', () => {
  cy.window().then((win) => {
    console.log('Current app state:', {
      localStorage: win.localStorage.getItem('priority-matrix-data'),
      language: win.localStorage.getItem('priority-matrix-language'),
      url: win.location.href
    });
  });
});

Cypress.Commands.add('takeScreenshot', (name) => {
  cy.screenshot(name || 'debug-screenshot', {
    capture: 'fullPage',
    overwrite: true
  });
});

// Drag and drop commands (for future drag-and-drop functionality)
Cypress.Commands.add('dragTaskToQuadrant', (taskName, targetQuadrant) => {
  cy.contains('[data-cy="task-item"]', taskName)
    .trigger('mousedown', { which: 1 });

  cy.get(`[data-quadrant="${targetQuadrant}"]`)
    .trigger('mousemove')
    .trigger('mouseup');

  // Verify task moved to correct quadrant
  cy.verifyTaskInQuadrant(taskName, targetQuadrant);
});

// Custom assertions
Cypress.Commands.add('shouldHaveQuadrantDistribution', (expected) => {
  Object.entries(expected).forEach(([quadrant, count]) => {
    cy.shouldHaveTaskCount(quadrant, count);
  });
});

// Wait commands
Cypress.Commands.add('waitForAnimation', (duration = 500) => {
  cy.wait(duration);
});

Cypress.Commands.add('waitForNetworkIdle', (timeout = 5000) => {
  cy.intercept('**', (req) => {
    req.reply();
  });
  cy.wait(timeout);
});

// Cleanup commands
Cypress.Commands.add('resetApp', () => {
  cy.clearLocalStorage();
  cy.clearCookies();
  cy.reload();
  cy.waitForAppToLoad();
});

Cypress.Commands.add('restoreDefaults', () => {
  cy.window().then((win) => {
    win.localStorage.clear();
  });
  cy.reload();
  cy.waitForAppToLoad();
  cy.switchLanguage('en');
});