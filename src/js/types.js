/**
 * @fileoverview Type definitions and interfaces for Priority Matrix project.
 * This file provides type hints and documentation for GitHub Copilot to better understand
 * the data structures and expected API contracts in the vanilla JavaScript codebase.
 * 
 * Note: This is a documentation file for development assistance only.
 * The actual implementation uses standard JavaScript without TypeScript.
 */

/**
 * @typedef {Object} TaskData
 * @property {string} [id] - Unique identifier (auto-generated if not provided)
 * @property {string} name - Task name/title (required)
 * @property {string} [description=''] - Optional task description
 * @property {boolean} [importance=false] - Task importance flag
 * @property {boolean} [urgency=false] - Task urgency flag
 * @property {number} [quadrant] - Eisenhower Matrix quadrant (1-4, auto-calculated)
 * @property {Date|string} [created] - Creation timestamp
 * @property {Date|string} [updated] - Last update timestamp
 * @property {boolean} [completed=false] - Task completion status
 * @property {number} [battleScore=0] - Score from battle mode comparisons
 */

/**
 * @typedef {Object} TaskValidationResult
 * @property {boolean} isValid - True if task passes all validations
 * @property {string[]} errors - Array of validation error messages
 */

/**
 * @typedef {Object} MatrixStatistics
 * @property {number} total - Total number of tasks
 * @property {number} completed - Number of completed tasks
 * @property {number} pending - Number of pending tasks
 * @property {number} overdue - Number of overdue tasks
 * @property {number} completionRate - Completion rate as percentage (0-100)
 * @property {Object} quadrantCounts - Task counts by quadrant
 * @property {number} quadrantCounts.1 - Q1: Important & Urgent
 * @property {number} quadrantCounts.2 - Q2: Important & Not Urgent
 * @property {number} quadrantCounts.3 - Q3: Not Important & Urgent
 * @property {number} quadrantCounts.4 - Q4: Not Important & Not Urgent
 * @property {number} averageImportance - Average importance score
 * @property {number} averageUrgency - Average urgency score
 */

/**
 * @typedef {Object} QuadrantTasks
 * @property {Task[]} 1 - Q1: Important & Urgent (Do First)
 * @property {Task[]} 2 - Q2: Important & Not Urgent (Schedule)
 * @property {Task[]} 3 - Q3: Not Important & Urgent (Delegate)
 * @property {Task[]} 4 - Q4: Not Important & Not Urgent (Eliminate)
 */

/**
 * @typedef {Object} ExportData
 * @property {TaskData[]} tasks - Array of serialized tasks
 * @property {string} exportDate - ISO date string of export
 * @property {string} version - Export format version
 */

/**
 * @typedef {Object} BattleResult
 * @property {Task} winner - Winning task from battle comparison
 * @property {Task} loser - Losing task from battle comparison
 * @property {string} reason - User's reason for the choice
 */

/**
 * @typedef {Object} BattleRanking
 * @property {Task} task - The ranked task
 * @property {number} score - Battle score (wins - losses)
 * @property {number} position - Final ranking position (0-based)
 */

/**
 * @typedef {Object} BattleResults
 * @property {BattleRanking[]} rankings - Final task rankings
 * @property {BattleResult[]} battles - Individual battle results
 * @property {Date} completedAt - When battle mode was completed
 * @property {Task|null} theOne - The highest-ranked task ("The One")
 */

/**
 * @typedef {Object} I18nTranslations
 * @property {Object} app - Application-level translations
 * @property {Object} matrix - Matrix and quadrant translations
 * @property {Object} forms - Form field translations
 * @property {Object} buttons - Button text translations
 * @property {Object} reports - Report-related translations
 * @property {Object} battle - Battle mode translations
 * @property {Object} footer - Footer content translations
 */

/**
 * @typedef {Object} DOMElements
 * @property {HTMLButtonElement} addTaskBtn - Add task button
 * @property {HTMLButtonElement} generateReportBtn - Generate report button
 * @property {HTMLButtonElement} battleModeBtn - Battle mode button
 * @property {HTMLDialogElement} taskModal - Task creation/editing modal
 * @property {HTMLDialogElement} battleModal - Battle mode modal
 * @property {HTMLDialogElement} reportModal - Report display modal
 * @property {HTMLFormElement} taskForm - Task creation/editing form
 * @property {HTMLSelectElement} languageSelector - Language switcher
 * @property {HTMLDivElement} theOneDisplay - "The One" task display area
 * @property {NodeListOf<HTMLDivElement>} quadrants - All quadrant containers
 */

/**
 * Eisenhower Matrix quadrant constants for reference
 */
const QUADRANTS = {
  /** @type {number} Important & Urgent (Do First) */
  DO_FIRST: 1,
  
  /** @type {number} Important & Not Urgent (Schedule) */
  SCHEDULE: 2,
  
  /** @type {number} Not Important & Urgent (Delegate) */
  DELEGATE: 3,
  
  /** @type {number} Not Important & Not Urgent (Eliminate) */
  ELIMINATE: 4
};

/**
 * Event names used throughout the application
 */
const EVENTS = {
  TASK_ADDED: 'taskAdded',
  TASK_UPDATED: 'taskUpdated',
  TASK_DELETED: 'taskDeleted',
  DATA_IMPORTED: 'dataImported',
  TASKS_CLEARED: 'tasksCleared',
  LANGUAGE_CHANGED: 'languageChanged',
  BATTLE_COMPLETED: 'battleCompleted'
};

/**
 * Storage keys for localStorage
 */
const STORAGE_KEYS = {
  MATRIX_DATA: 'priority-matrix-data',
  BATTLE_RESULTS: 'priority-matrix-battle-results',
  LANGUAGE_PREFERENCE: 'priority-matrix-language',
  USER_PREFERENCES: 'priority-matrix-preferences'
};

/**
 * Common CSS selectors used in the application
 */
const SELECTORS = {
  QUADRANT: '[data-quadrant]',
  TASK_ITEM: '[data-cy="task-item"]',
  TASK_MODAL: '#task-modal',
  BATTLE_MODAL: '#battle-modal',
  REPORT_MODAL: '#report-modal',
  LANGUAGE_SELECTOR: '[data-cy="language-selector"]',
  ADD_TASK_BTN: '[data-cy="add-task-btn"]',
  THE_ONE_DISPLAY: '#the-one-display'
};

/**
 * Translation namespaces for organized i18n
 */
const I18N_NAMESPACES = {
  APP: 'app',
  MATRIX: 'matrix',
  FORMS: 'forms',
  BUTTONS: 'buttons',
  REPORTS: 'reports',
  BATTLE: 'battle',
  FOOTER: 'footer'
};

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    QUADRANTS,
    EVENTS,
    STORAGE_KEYS,
    SELECTORS,
    I18N_NAMESPACES
  };
}