# GitHub Copilot Instructions for Priority Matrix Project

## Project Overview
This is a **Priority Matrix** application based on the Eisenhower Matrix for task prioritization. The system organizes tasks into 4 quadrants based on importance and urgency.

## Architecture & Technology Stack
- **Frontend**: Vanilla JavaScript (ES6+ modules)
- **Styling**: CSS3 with CSS Grid and Flexbox
- **Storage**: Browser LocalStorage
- **Testing**: Jest (unit tests) + Cypress (E2E tests)
- **Build**: ESLint + npm scripts
- **Deployment**: GitHub Pages

## Core Concepts

### Eisenhower Matrix Quadrants
1. **Q1 (Do First)**: Important & Urgent - Crisis, emergencies, deadline-driven projects
2. **Q2 (Schedule)**: Important & Not Urgent - Prevention, planning, development, research  
3. **Q3 (Delegate)**: Not Important & Urgent - Interruptions, some calls/emails, some meetings
4. **Q4 (Eliminate)**: Not Important & Not Urgent - Time wasters, some mail, some phone calls

### Key Classes & Modules

#### `Task` Class (`src/js/task.js`)
- Represents individual tasks with importance/urgency boolean flags
- Supports legacy numeric values (1-5) for backward compatibility
- Auto-calculates quadrant placement
- Includes validation, priority scoring, and age tracking

#### `Matrix` Class (`src/js/matrix.js`)
- Manages collection of tasks with CRUD operations
- Handles local storage persistence
- Provides filtering, sorting, and statistics
- Event-driven architecture for UI updates
- Supports battle mode integration for "The One" prioritization

#### `BattleMode` Class (`src/js/battle.js`)
- Implements pairwise task comparison system
- Helps users identify their single most important task ("The One")
- Uses tournament-style elimination

#### `I18n` Class (`src/js/i18n.js`)
- Multi-language support (Portuguese, English, Spanish)
- Dynamic translation loading and switching

## Development Guidelines

### Code Style Conventions
- Use **camelCase** for variables and functions
- Use **PascalCase** for classes
- Use **SCREAMING_SNAKE_CASE** for constants
- Follow ESLint configuration (semi-colons required, single quotes)
- 2-space indentation

### Data Structures
```javascript
// Task data structure
{
  id: "unique-id-string",
  name: "Task name",
  description: "Optional description",
  importance: true|false,  // boolean flags (not 1-5 scale)
  urgency: true|false,
  quadrant: 1|2|3|4,       // auto-calculated
  created: Date,
  updated: Date,
  completed: false,
  battleScore: 0
}
```

### File Organization
```
src/
├── js/              # JavaScript modules
│   ├── app.js       # Main application controller
│   ├── task.js      # Task class and logic
│   ├── matrix.js    # Matrix management
│   ├── battle.js    # Battle mode functionality
│   └── i18n.js      # Internationalization
├── css/             # Stylesheets
├── i18n/            # Translation files (JSON)
└── index.html       # Main HTML file
```

### Testing Patterns
- **Unit tests**: Jest with jsdom environment
- **E2E tests**: Cypress with custom commands
- **Coverage target**: >90% code coverage
- Use descriptive test names following AAA pattern (Arrange, Act, Assert)

### Event System
The Matrix class uses an event-driven architecture:
- `taskAdded` - When new task is created
- `taskUpdated` - When task is modified  
- `taskDeleted` - When task is removed
- `dataImported` - When data is imported
- `tasksCleared` - When all tasks are cleared

### Common Patterns

#### Creating New Tasks
```javascript
const task = new Task({
  name: "Task name",
  description: "Description",
  importance: true,    // boolean, not numeric
  urgency: false
});

matrix.addTask(task);
```

#### Filtering by Quadrant
```javascript
const urgentImportant = matrix.getTasksByQuadrant(1); // Q1
const allQuadrants = matrix.getTasksByQuadrant();     // All 4 quadrants
```

#### Battle Mode Integration
```javascript
const battleMode = new BattleMode(matrix.getTasksByQuadrant(1));
battleMode.runBattle(); // Returns "The One" most important task
```

## UI Components & Data Attributes

### HTML Data Attributes for Testing
- `data-cy="element-name"` - Cypress test selectors
- `data-quadrant="1-4"` - Quadrant identification
- `data-i18n="translation.key"` - Translation keys

### CSS Classes
- `.matrix-grid` - Main 4-quadrant layout
- `.quadrant-{1-4}` - Individual quadrant containers
- `.task-item` - Individual task elements
- `.the-one-display` - Special display for "The One" task

## Internationalization

### Translation Key Format
Use hierarchical keys: `section.subsection.key`

Examples:
- `app.title` - Application title
- `matrix.quadrants.urgent_important` - Quadrant labels
- `forms.task.name` - Form field labels
- `buttons.add_task` - Button text

### Adding New Translations
1. Add keys to `src/i18n/en.json` (source of truth)
2. Translate to `src/i18n/pt.json` and `src/i18n/es.json`
3. Use `data-i18n` attributes in HTML
4. Access via `i18n.t('key.path')` in JavaScript

## Performance Considerations
- Minimize DOM manipulations
- Use event delegation for dynamic content
- Optimize for print media queries
- Keep localStorage usage efficient
- Lazy load translations

## Common Development Tasks

### Adding New Task Properties
1. Update `Task` constructor to handle new property
2. Add to `toJSON()` and validation methods
3. Update UI forms and display components
4. Add tests for new functionality

### Adding New Matrix Methods
1. Add method to `Matrix` class with JSDoc comments
2. Include proper error handling
3. Emit relevant events if state changes
4. Add unit tests for new functionality

### UI Development
- Use semantic HTML with proper accessibility
- Follow responsive design principles
- Maintain print-friendly styles
- Test across different screen sizes

Remember: This is a **vanilla JavaScript** project - no frameworks or build tools beyond basic linting and testing.