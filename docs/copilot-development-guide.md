# GitHub Copilot Development Guide

## Quick Start for Copilot-Assisted Development

This guide helps you leverage GitHub Copilot effectively when working on the Priority Matrix project.

### 🚀 Setup Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run linter
npm run lint

# Run full build check
npm run build
```

### 📝 Key Patterns for Copilot Suggestions

#### 1. Creating New Tasks
```javascript
// Copilot will suggest proper Task instantiation
const task = new Task({
  name: "Review project documentation",
  description: "Go through all README files and update outdated information",
  importance: true,  // boolean, not numeric
  urgency: false
});

// Add to matrix with validation
matrix.addTask(task);
```

#### 2. Filtering and Querying Tasks
```javascript
// Get tasks by quadrant
const urgentImportant = matrix.getTasksByQuadrant(1);
const allQuadrants = matrix.getTasksByQuadrant();

// Filter by completion status
const completed = matrix.getCompletedTasks();
const pending = matrix.getPendingTasks();

// Search functionality
const searchResults = matrix.searchTasks("documentation");
```

#### 3. Event Handling Pattern
```javascript
// Matrix events
matrix.on('taskAdded', (task) => {
  console.log(`Task added: ${task.name}`);
  this.renderMatrix();
});

matrix.on('taskUpdated', ({ task, oldQuadrant }) => {
  if (task.quadrant !== oldQuadrant) {
    this.animateTaskMovement(task, oldQuadrant);
  }
});
```

#### 4. Internationalization Usage
```javascript
// Get translated text
const title = this.i18n.t('app.title');
const quadrantName = this.i18n.t('matrix.quadrants.urgent_important');

// Update UI with translations
element.textContent = this.i18n.t('buttons.add_task');
```

#### 5. DOM Element Caching Pattern
```javascript
cacheElements() {
  this.elements = {
    // Cache frequently used elements
    addTaskBtn: document.getElementById('add-task-btn'),
    taskModal: document.getElementById('task-modal'),
    quadrants: document.querySelectorAll('.quadrant'),
    taskForm: document.getElementById('task-form')
  };
}
```

### 🎯 Copilot Context Helpers

#### Task Quadrant Logic
```javascript
// Eisenhower Matrix quadrant calculation
// Q1: Important & Urgent (Do First) - Crisis, emergencies
// Q2: Important & Not Urgent (Schedule) - Planning, development  
// Q3: Not Important & Urgent (Delegate) - Interruptions, some meetings
// Q4: Not Important & Not Urgent (Eliminate) - Time wasters

function calculateQuadrant(importance, urgency) {
  if (importance && urgency) return 1;      // Do First
  if (importance && !urgency) return 2;     // Schedule
  if (!importance && urgency) return 3;     // Delegate
  return 4;                                 // Eliminate
}
```

#### Battle Mode Implementation Pattern
```javascript
// Battle mode for finding "The One" most important task
const battleMode = new BattleMode(matrix.getTasksByQuadrant(1));

// Run pairwise comparisons
battleMode.on('battleNeeded', ({ taskA, taskB, onResult }) => {
  // Present choice to user
  showBattleComparison(taskA, taskB, (winner) => {
    onResult(winner);
  });
});

// Get final ranking
const results = battleMode.getResults();
const theOne = results.theOne; // Most important task
```

### 🔧 Common Development Patterns

#### 1. Form Validation with Error Display
```javascript
validateTaskForm(formData) {
  const errors = [];
  
  if (!formData.name.trim()) {
    errors.push(this.i18n.t('validation.name_required'));
  }
  
  if (formData.name.length > 100) {
    errors.push(this.i18n.t('validation.name_too_long'));
  }
  
  return { isValid: errors.length === 0, errors };
}
```

#### 2. Local Storage Management
```javascript
// Save data with error handling
saveToStorage() {
  try {
    const data = this.exportData();
    localStorage.setItem('priority-matrix-data', JSON.stringify(data));
  } catch (error) {
    console.error('Storage failed:', error);
    this.showError('Failed to save data');
  }
}
```

#### 3. Responsive UI Updates
```javascript
renderMatrix() {
  const quadrants = this.matrix.getTasksByQuadrant();
  
  Object.entries(quadrants).forEach(([quadrantNum, tasks]) => {
    const container = this.elements.quadrants[quadrantNum - 1];
    container.innerHTML = '';
    
    tasks.forEach(task => {
      const taskElement = this.createTaskElement(task);
      container.appendChild(taskElement);
    });
  });
}
```

#### 4. Print Report Generation
```javascript
generateReport() {
  const statistics = this.matrix.getStatistics();
  const theOne = this.getTheOneTask();
  const upNext = this.getUpNextTasks(5);
  
  return {
    theOne,
    upNext,
    statistics,
    quadrants: this.matrix.getTasksByQuadrant(),
    generatedAt: new Date().toISOString()
  };
}
```

### 🎨 CSS Class Patterns

#### Quadrant Styling
```css
.quadrant-1 { /* Important & Urgent - Red */ }
.quadrant-2 { /* Important & Not Urgent - Green */ }
.quadrant-3 { /* Not Important & Urgent - Yellow */ }
.quadrant-4 { /* Not Important & Not Urgent - Gray */ }
```

#### Task States
```css
.task-item { /* Base task styling */ }
.task-item.completed { /* Completed task styling */ }
.task-item.overdue { /* Overdue task styling */ }
.task-item.the-one { /* "The One" special styling */ }
```

### 🧪 Testing Patterns

#### Unit Test Structure
```javascript
describe('Task Functionality', () => {
  test('should calculate correct quadrant', () => {
    const task = new Task({
      name: 'Test Task',
      importance: true,
      urgency: false
    });
    
    expect(task.quadrant).toBe(2); // Schedule quadrant
  });
});
```

#### Cypress E2E Patterns
```javascript
it('should add and categorize task correctly', () => {
  cy.addTask('Important Project', true, false);
  cy.verifyTaskInQuadrant('Important Project', 2);
});
```

### 📱 Accessibility Considerations

#### Keyboard Navigation
```javascript
setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault();
      this.openTaskModal();
    }
    
    if (e.key === 'Escape') {
      this.closeAllModals();
    }
  });
}
```

#### ARIA Labels
```javascript
createTaskElement(task) {
  const element = document.createElement('div');
  element.setAttribute('role', 'listitem');
  element.setAttribute('aria-label', 
    `${task.name}, ${task.getQuadrantName()}, ${task.getImportanceLabel()}, ${task.getUrgencyLabel()}`
  );
  return element;
}
```

### 🌍 Multi-language Support

#### Adding New Translation Keys
```javascript
// 1. Add to en.json (source of truth)
{
  "new_feature": {
    "title": "New Feature",
    "description": "Feature description"
  }
}

// 2. Use in code
const title = this.i18n.t('new_feature.title');
```

#### Dynamic Language Switching
```javascript
switchLanguage(langCode) {
  this.i18n.setLanguage(langCode);
  this.updateAllTranslations();
  localStorage.setItem('priority-matrix-language', langCode);
}
```

### 🔍 Debugging Helpers

#### Matrix State Inspection
```javascript
// Debug helpers for development
console.log('Matrix Statistics:', this.matrix.getStatistics());
console.log('All Tasks:', this.matrix.getAllTasks());
console.log('Battle Results:', BattleMode.loadBattleResults());
```

This guide provides the context and patterns that GitHub Copilot needs to generate relevant, project-appropriate suggestions. Keep this file updated as the project evolves!