# Testing Strategy and Guidelines

## Overview
The Priority Matrix application uses a comprehensive testing strategy combining unit tests (Jest) and end-to-end tests (Cypress) to ensure reliability and functionality across all features.

## Testing Philosophy

### Test Pyramid
1. **Unit Tests (Jest)** - 70% of test coverage
   - Business logic validation
   - Data manipulation functions
   - Utility functions
   - Individual component behavior

2. **Integration Tests (Jest)** - 20% of test coverage
   - Component interactions
   - API integrations
   - Data flow between modules

3. **End-to-End Tests (Cypress)** - 10% of test coverage
   - User workflows
   - Cross-browser compatibility
   - UI interactions

### Coverage Requirements
- **Minimum**: 90% code coverage
- **Target**: 95% code coverage
- **Critical paths**: 100% coverage (data persistence, battle mode algorithm)

## Unit Testing with Jest

### Setup
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
```

### Test Structure
```
tests/
├── unit/
│   ├── matrix.test.js       # Matrix logic tests
│   ├── battle.test.js       # Battle mode algorithm tests
│   ├── i18n.test.js         # Internationalization tests
│   ├── storage.test.js      # Data persistence tests
│   └── utils.test.js        # Utility functions tests
├── integration/
│   ├── task-management.test.js
│   ├── report-generation.test.js
│   └── language-switching.test.js
└── setup.js                # Test configuration
```

### Example Unit Tests

#### Matrix Logic Tests
```javascript
// tests/unit/matrix.test.js
import { Matrix } from '../../src/js/matrix.js';

describe('Matrix', () => {
  let matrix;

  beforeEach(() => {
    matrix = new Matrix();
  });

  describe('categorizeTask', () => {
    test('should place high importance and urgency in quadrant 1', () => {
      const task = {
        name: 'Critical bug fix',
        importance: 5,
        urgency: 5
      };

      const quadrant = matrix.categorizeTask(task);
      expect(quadrant).toBe(1); // Urgent & Important
    });

    test('should place high importance and low urgency in quadrant 2', () => {
      const task = {
        name: 'Strategic planning',
        importance: 5,
        urgency: 2
      };

      const quadrant = matrix.categorizeTask(task);
      expect(quadrant).toBe(2); // Important & Not Urgent
    });
  });

  describe('getTasksByQuadrant', () => {
    test('should return tasks grouped by quadrant', () => {
      matrix.addTask({ name: 'Task 1', importance: 5, urgency: 5 });
      matrix.addTask({ name: 'Task 2', importance: 5, urgency: 2 });

      const quadrants = matrix.getTasksByQuadrant();

      expect(quadrants[1]).toHaveLength(1);
      expect(quadrants[2]).toHaveLength(1);
      expect(quadrants[1][0].name).toBe('Task 1');
    });
  });
});
```

#### Battle Mode Tests
```javascript
// tests/unit/battle.test.js
import { BattleMode } from '../../src/js/battle.js';

describe('BattleMode', () => {
  let battleMode;
  let tasks;

  beforeEach(() => {
    tasks = [
      { id: 1, name: 'Task A', importance: 5, urgency: 5 },
      { id: 2, name: 'Task B', importance: 5, urgency: 5 },
      { id: 3, name: 'Task C', importance: 5, urgency: 5 }
    ];
    battleMode = new BattleMode(tasks);
  });

  test('should generate all possible pairs for comparison', () => {
    const pairs = battleMode.generatePairs();
    expect(pairs).toHaveLength(3); // C(3,2) = 3 pairs
  });

  test('should update rankings based on comparison results', () => {
    battleMode.recordComparison(1, 2, 1); // Task 1 beats Task 2
    battleMode.recordComparison(1, 3, 1); // Task 1 beats Task 3
    battleMode.recordComparison(2, 3, 2); // Task 2 beats Task 3

    const rankings = battleMode.getRankings();
    expect(rankings[0].id).toBe(1); // Task 1 should be first
  });

  test('should identify "The One" task', () => {
    battleMode.recordComparison(1, 2, 1);
    battleMode.recordComparison(1, 3, 1);
    battleMode.recordComparison(2, 3, 2);

    const theOne = battleMode.getTheOne();
    expect(theOne.id).toBe(1);
  });
});
```

#### i18n Tests
```javascript
// tests/unit/i18n.test.js
import { I18n } from '../../src/js/i18n.js';

describe('I18n', () => {
  let i18n;

  beforeEach(() => {
    i18n = new I18n();
  });

  test('should load translation files', async () => {
    await i18n.loadLanguage('en');
    expect(i18n.translations.en).toBeDefined();
  });

  test('should translate keys correctly', () => {
    i18n.translations.en = {
      'app.title': 'Priority Matrix'
    };
    i18n.currentLanguage = 'en';

    expect(i18n.t('app.title')).toBe('Priority Matrix');
  });

  test('should handle missing translations with fallback', () => {
    i18n.translations.en = {
      'app.title': 'Priority Matrix'
    };
    i18n.currentLanguage = 'pt';
    i18n.fallbackLanguage = 'en';

    expect(i18n.t('app.title')).toBe('Priority Matrix');
  });

  test('should interpolate parameters', () => {
    i18n.translations.en = {
      'greeting': 'Hello, {name}!'
    };
    i18n.currentLanguage = 'en';

    expect(i18n.t('greeting', { name: 'John' })).toBe('Hello, John!');
  });
});
```

### Testing Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test -- matrix.test.js

# Run tests with verbose output
npm test -- --verbose
```

## End-to-End Testing with Cypress

### Setup
```javascript
// cypress.config.js
module.exports = {
  e2e: {
    baseUrl: 'http://localhost:8080',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/integration/**/*.cy.js',
    viewportWidth: 1280,
    viewportHeight: 720
  }
};
```

### Test Structure
```
cypress/
├── integration/
│   ├── task-management.cy.js    # Task CRUD operations
│   ├── matrix-organization.cy.js # Matrix functionality
│   ├── battle-mode.cy.js        # Battle mode workflow
│   ├── language-switching.cy.js # i18n functionality
│   ├── report-generation.cy.js  # Report creation
│   └── data-persistence.cy.js   # Storage functionality
├── fixtures/
│   ├── tasks.json              # Test data
│   └── translations.json       # Translation test data
└── support/
    ├── commands.js             # Custom commands
    └── e2e.js                  # Global configuration
```

### Example E2E Tests

#### Task Management
```javascript
// cypress/integration/task-management.cy.js
describe('Task Management', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clearLocalStorage();
  });

  it('should add a new task successfully', () => {
    cy.get('[data-cy=add-task-btn]').click();
    cy.get('[data-cy=task-name]').type('Complete project documentation');
    cy.get('[data-cy=importance-slider]').invoke('val', 4).trigger('change');
    cy.get('[data-cy=urgency-slider]').invoke('val', 3).trigger('change');
    cy.get('[data-cy=save-task-btn]').click();

    cy.get('[data-cy=quadrant-2]').should('contain', 'Complete project documentation');
  });

  it('should edit an existing task', () => {
    // Create task first
    cy.addTask('Test task', 3, 3);

    cy.get('[data-cy=task-item]').first().find('[data-cy=edit-btn]').click();
    cy.get('[data-cy=task-name]').clear().type('Updated task name');
    cy.get('[data-cy=save-task-btn]').click();

    cy.get('[data-cy=task-item]').should('contain', 'Updated task name');
  });

  it('should delete a task', () => {
    cy.addTask('Task to delete', 2, 2);

    cy.get('[data-cy=task-item]').first().find('[data-cy=delete-btn]').click();
    cy.get('[data-cy=confirm-delete]').click();

    cy.get('[data-cy=task-item]').should('not.exist');
  });
});
```

#### Battle Mode
```javascript
// cypress/integration/battle-mode.cy.js
describe('Battle Mode', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clearLocalStorage();

    // Add multiple high-priority tasks
    cy.addTask('Critical Task A', 5, 5);
    cy.addTask('Critical Task B', 5, 5);
    cy.addTask('Critical Task C', 5, 5);
  });

  it('should run battle mode and determine "The One"', () => {
    cy.get('[data-cy=quadrant-1]').find('[data-cy=battle-mode-btn]').click();

    // Complete all comparisons
    cy.get('[data-cy=battle-comparison]').should('be.visible');

    // Make choices in battle mode
    cy.get('[data-cy=choose-a]').click();
    cy.get('[data-cy=choose-b]').click();
    cy.get('[data-cy=choose-a]').click();

    // Verify "The One" is determined
    cy.get('[data-cy=the-one-result]').should('be.visible');
    cy.get('[data-cy=the-one-task]').should('not.be.empty');
  });
});
```

#### Language Switching
```javascript
// cypress/integration/language-switching.cy.js
describe('Language Switching', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should switch to Portuguese', () => {
    cy.get('[data-cy=language-selector]').select('pt');
    cy.get('[data-cy=app-title]').should('contain', 'Matriz de Prioridades');
    cy.get('[data-cy=add-task-btn]').should('contain', 'Adicionar Tarefa');
  });

  it('should switch to Spanish', () => {
    cy.get('[data-cy=language-selector]').select('es');
    cy.get('[data-cy=app-title]').should('contain', 'Matriz de Prioridades');
    cy.get('[data-cy=add-task-btn]').should('contain', 'Agregar Tarea');
  });

  it('should maintain language preference', () => {
    cy.get('[data-cy=language-selector]').select('pt');
    cy.reload();
    cy.get('[data-cy=app-title]').should('contain', 'Matriz de Prioridades');
  });
});
```

### Custom Cypress Commands
```javascript
// cypress/support/commands.js
Cypress.Commands.add('addTask', (name, importance, urgency) => {
  cy.get('[data-cy=add-task-btn]').click();
  cy.get('[data-cy=task-name]').type(name);
  cy.get('[data-cy=importance-slider]').invoke('val', importance).trigger('change');
  cy.get('[data-cy=urgency-slider]').invoke('val', urgency).trigger('change');
  cy.get('[data-cy=save-task-btn]').click();
});

Cypress.Commands.add('clearTasks', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('priority-matrix-tasks');
  });
});
```

### Running E2E Tests
```bash
# Open Cypress test runner
npm run cypress:open

# Run tests headlessly
npm run cypress:run

# Run specific test file
npx cypress run --spec "cypress/integration/task-management.cy.js"
```

## Test Data Management

### Fixtures
```javascript
// cypress/fixtures/tasks.json
{
  "sampleTasks": [
    {
      "name": "Fix critical bug",
      "description": "Security vulnerability in authentication",
      "importance": 5,
      "urgency": 5
    },
    {
      "name": "Plan next sprint",
      "description": "Define goals for upcoming development cycle",
      "importance": 4,
      "urgency": 2
    }
  ]
}
```

### Test Utilities
```javascript
// tests/utils/test-helpers.js
export const createMockTask = (overrides = {}) => ({
  id: Math.random().toString(36),
  name: 'Test Task',
  description: 'Test Description',
  importance: 3,
  urgency: 3,
  created: new Date(),
  ...overrides
});

export const createMockMatrix = () => {
  const matrix = new Matrix();
  return matrix;
};
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'

    - run: npm ci
    - run: npm run lint
    - run: npm run test:coverage
    - run: npm run cypress:run

    - name: Upload coverage
      uses: codecov/codecov-action@v3
```

## Testing Best Practices

### Unit Tests
- Test one thing at a time
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Test edge cases and error conditions

### E2E Tests
- Test critical user journeys
- Use data-cy attributes for selectors
- Keep tests independent
- Use page object pattern for complex flows
- Test responsive behavior

### General Guidelines
- Maintain test documentation
- Review test coverage reports regularly
- Update tests when features change
- Use meaningful test data
- Keep tests fast and reliable