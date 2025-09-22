describe('Priority Matrix - Basic Functionality', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForAppToLoad();
  });

  describe('Application Loading', () => {
    it('should load the application successfully', () => {
      cy.get('[data-cy="app-title"]').should('contain', 'Priority Matrix');
      cy.get('.matrix-grid').should('be.visible');
      cy.get('[data-cy="quadrant-1"]').should('be.visible');
      cy.get('[data-cy="quadrant-2"]').should('be.visible');
      cy.get('[data-cy="quadrant-3"]').should('be.visible');
      cy.get('[data-cy="quadrant-4"]').should('be.visible');
    });

    it('should display all UI elements', () => {
      cy.get('[data-cy="language-selector"]').should('be.visible');
      cy.get('[data-cy="add-task-btn"]').should('be.visible');
      cy.get('[data-cy="generate-report-btn"]').should('be.visible');
    });

    it('should have proper quadrant headers', () => {
      cy.get('[data-cy="quadrant-1"]').should('contain', 'Do First');
      cy.get('[data-cy="quadrant-2"]').should('contain', 'Schedule');
      cy.get('[data-cy="quadrant-3"]').should('contain', 'Delegate');
      cy.get('[data-cy="quadrant-4"]').should('contain', 'Eliminate');
    });
  });

  describe('Task Management', () => {
    it('should add a new task successfully', () => {
      cy.addTask('Test Task', 3, 4, 'This is a test task');

      // Task should appear in the correct quadrant (Q3: Not Important & Urgent)
      cy.verifyTaskInQuadrant('Test Task', 3);
    });

    it('should categorize tasks into correct quadrants', () => {
      // Add tasks for each quadrant
      cy.addTask('Critical Task', 5, 5); // Q1: Important & Urgent
      cy.addTask('Planning Task', 5, 2); // Q2: Important & Not Urgent
      cy.addTask('Interruption Task', 2, 5); // Q3: Not Important & Urgent
      cy.addTask('Time Waster', 2, 2); // Q4: Not Important & Not Urgent

      // Verify tasks are in correct quadrants
      cy.verifyTaskInQuadrant('Critical Task', 1);
      cy.verifyTaskInQuadrant('Planning Task', 2);
      cy.verifyTaskInQuadrant('Interruption Task', 3);
      cy.verifyTaskInQuadrant('Time Waster', 4);
    });

    it('should edit an existing task', () => {
      cy.addTask('Original Task', 3, 3);

      cy.editTask('Original Task', {
        name: 'Updated Task',
        importance: 5,
        urgency: 5,
        description: 'Updated description'
      });

      // Task should move to new quadrant and have updated name
      cy.verifyTaskInQuadrant('Updated Task', 1);
      cy.contains('Original Task').should('not.exist');
    });

    it('should delete a task', () => {
      cy.addTask('Task to Delete', 3, 3);
      cy.contains('Task to Delete').should('exist');

      cy.deleteTask('Task to Delete');
      cy.contains('Task to Delete').should('not.exist');
    });

    it('should mark task as completed', () => {
      cy.addTask('Task to Complete', 4, 4);

      cy.completeTask('Task to Complete');

      cy.contains('[data-cy="task-item"]', 'Task to Complete')
        .should('have.class', 'completed');
    });

    it('should handle task validation', () => {
      // Try to create task without name
      cy.get('[data-cy="add-task-btn"]').click();
      cy.get('[data-cy="save-task-btn"]').click();

      // Modal should remain open (validation failed)
      cy.get('#task-modal').should('be.visible');

      // Add proper name and save
      cy.get('[data-cy="task-name"]').type('Valid Task Name');
      cy.get('[data-cy="save-task-btn"]').click();

      // Modal should close and task should be created
      cy.get('#task-modal').should('not.be.visible');
      cy.contains('Valid Task Name').should('exist');
    });
  });

  describe('Task Form Interface', () => {
    beforeEach(() => {
      cy.get('[data-cy="add-task-btn"]').click();
    });

    it('should open and close task modal', () => {
      cy.get('#task-modal').should('be.visible');

      cy.get('[data-cy="close-modal"]').click();
      cy.get('#task-modal').should('not.be.visible');
    });

    it('should update slider values in real-time', () => {
      cy.get('[data-cy="importance-slider"]').invoke('val', 4).trigger('input');
      cy.get('#importance-value').should('contain', '4');

      cy.get('[data-cy="urgency-slider"]').invoke('val', 2).trigger('input');
      cy.get('#urgency-value').should('contain', '2');
    });

    it('should close modal on outside click', () => {
      cy.get('.modal').click({ force: true });
      cy.get('#task-modal').should('not.be.visible');
    });

    it('should close modal on escape key', () => {
      cy.get('body').type('{esc}');
      cy.get('#task-modal').should('not.be.visible');
    });
  });

  describe('Language Support', () => {
    it('should switch to Portuguese', () => {
      cy.switchLanguage('pt');
      cy.verifyLanguage('pt');

      cy.get('[data-cy="add-task-btn"]').should('contain', 'Adicionar Tarefa');
      cy.get('[data-cy="quadrant-1"]').should('contain', 'Fazer Primeiro');
    });

    it('should switch to Spanish', () => {
      cy.switchLanguage('es');
      cy.verifyLanguage('es');

      cy.get('[data-cy="add-task-btn"]').should('contain', 'Agregar Tarea');
      cy.get('[data-cy="quadrant-1"]').should('contain', 'Hacer Primero');
    });

    it('should persist language preference', () => {
      cy.switchLanguage('pt');
      cy.reload();
      cy.waitForAppToLoad();

      cy.verifyLanguage('pt');
    });

    it('should maintain task data when switching languages', () => {
      cy.addTask('Test Task', 3, 3);

      cy.switchLanguage('pt');
      cy.contains('Test Task').should('exist');

      cy.switchLanguage('es');
      cy.contains('Test Task').should('exist');

      cy.switchLanguage('en');
      cy.contains('Test Task').should('exist');
    });
  });

  describe('Data Persistence', () => {
    it('should persist tasks across page reloads', () => {
      cy.addTask('Persistent Task', 4, 3, 'This should persist');

      cy.reload();
      cy.waitForAppToLoad();

      cy.contains('Persistent Task').should('exist');
      cy.verifyTaskInQuadrant('Persistent Task', 3);
    });

    it('should handle empty localStorage gracefully', () => {
      cy.clearAllTasks();

      // Should show empty quadrants
      cy.get('[data-cy="quadrant-1"] [data-cy="task-item"]').should('not.exist');
      cy.get('[data-cy="quadrant-2"] [data-cy="task-item"]').should('not.exist');
      cy.get('[data-cy="quadrant-3"] [data-cy="task-item"]').should('not.exist');
      cy.get('[data-cy="quadrant-4"] [data-cy="task-item"]').should('not.exist');

      // App should still be functional
      cy.addTask('New Task After Clear', 3, 3);
      cy.contains('New Task After Clear').should('exist');
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile viewport', () => {
      cy.setMobileViewport();

      // Core functionality should still work
      cy.get('[data-cy="app-title"]').should('be.visible');
      cy.get('[data-cy="add-task-btn"]').should('be.visible');

      cy.addTask('Mobile Task', 3, 3);
      cy.contains('Mobile Task').should('exist');

      cy.setDesktopViewport();
    });

    it('should work on tablet viewport', () => {
      cy.setTabletViewport();

      cy.get('.matrix-grid').should('be.visible');
      cy.addTask('Tablet Task', 4, 4);
      cy.contains('Tablet Task').should('exist');

      cy.setDesktopViewport();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard shortcuts', () => {
      // Test Ctrl+N for new task
      cy.get('body').type('{ctrl}n');
      cy.get('#task-modal').should('be.visible');

      // Test Escape to close
      cy.get('body').type('{esc}');
      cy.get('#task-modal').should('not.be.visible');
    });

    it('should have proper tab order', () => {
      cy.testKeyboardNavigation();
    });
  });

  describe('Error Handling', () => {
    it('should handle corrupted localStorage data', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('priority-matrix-data', 'invalid json');
      });

      cy.reload();
      cy.waitForAppToLoad();

      // App should still load and be functional
      cy.get('[data-cy="app-title"]').should('be.visible');
      cy.addTask('Recovery Task', 3, 3);
      cy.contains('Recovery Task').should('exist');
    });

    it('should handle missing translation keys gracefully', () => {
      // This would be more relevant in actual implementation
      // For now, just verify app doesn't crash with different languages
      cy.switchLanguage('pt');
      cy.switchLanguage('es');
      cy.switchLanguage('en');

      cy.get('[data-cy="app-title"]').should('be.visible');
    });
  });

  describe('Performance', () => {
    it('should load quickly', () => {
      cy.measureLoadTime('initial');
      cy.visit('/');
      cy.waitForAppToLoad();
      cy.endMeasureLoadTime('initial');
    });

    it('should handle multiple tasks efficiently', () => {
      // Add multiple tasks
      for (let i = 1; i <= 10; i++) {
        cy.addTask(`Task ${i}`,
          Math.floor(Math.random() * 5) + 1,
          Math.floor(Math.random() * 5) + 1
        );
      }

      // App should remain responsive
      cy.get('[data-cy="task-item"]').should('have.length', 10);
      cy.get('[data-cy="add-task-btn"]').click();
      cy.get('#task-modal').should('be.visible');
      cy.get('[data-cy="close-modal"]').click();
    });
  });
});