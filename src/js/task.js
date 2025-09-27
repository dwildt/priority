/**
 * Represents a task in the Eisenhower Priority Matrix system.
 * Tasks are categorized by importance and urgency into 4 quadrants:
 * Q1: Important & Urgent (Do First)
 * Q2: Important & Not Urgent (Schedule) 
 * Q3: Not Important & Urgent (Delegate)
 * Q4: Not Important & Not Urgent (Eliminate)
 * 
 * @class Task
 */
class Task {
  /**
   * Creates a new Task instance with Eisenhower Matrix categorization.
   * Supports both legacy numeric importance/urgency values (1-5) and modern boolean values.
   * 
   * @param {Object} data - Task configuration object
   * @param {string} [data.id] - Unique identifier, auto-generated if not provided
   * @param {string} [data.name=''] - Task name/title
   * @param {string} [data.description=''] - Task description
   * @param {boolean|number} [data.importance=false] - Task importance (boolean or 1-5 scale)
   * @param {boolean|number} [data.urgency=false] - Task urgency (boolean or 1-5 scale)  
   * @param {number} [data.quadrant] - Eisenhower Matrix quadrant (1-4), auto-calculated if not provided
   * @param {string|Date} [data.created] - Creation timestamp
   * @param {string|Date} [data.updated] - Last update timestamp
   * @param {boolean} [data.completed=false] - Task completion status
   * @param {number} [data.battleScore=0] - Score from battle mode comparisons
   */
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.name = data.name || '';
    this.description = data.description || '';
    
    // Handle both old numeric values (1-5) and new boolean values for backward compatibility
    if (typeof data.importance === 'boolean') {
      this.importance = data.importance;
    } else if (typeof data.importance === 'number') {
      // Convert legacy numeric values to boolean (4+ = important)
      this.importance = data.importance >= 4;
    } else {
      this.importance = false; // Default to not important
    }

    if (typeof data.urgency === 'boolean') {
      this.urgency = data.urgency;
    } else if (typeof data.urgency === 'number') {
      // Convert legacy numeric values to boolean (4+ = urgent)  
      this.urgency = data.urgency >= 4;
    } else {
      this.urgency = false; // Default to not urgent
    }
    
    this.quadrant = data.quadrant || this.calculateQuadrant();
    this.created = data.created ? new Date(data.created) : new Date();
    this.updated = data.updated ? new Date(data.updated) : new Date();
    this.completed = data.completed || false;
    this.battleScore = data.battleScore || 0;
  }

  /**
   * Generates a unique identifier for the task using timestamp and random values.
   * Format: base36(timestamp) + base36(random) for URL-safe, sortable IDs.
   * 
   * @returns {string} Unique task identifier
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Calculates the Eisenhower Matrix quadrant based on importance and urgency.
   * Uses boolean values for modern classification:
   * 
   * @returns {number} Quadrant number (1-4)
   * - 1: Important & Urgent (Do First) - Crisis, emergencies, deadline-driven projects
   * - 2: Important & Not Urgent (Schedule) - Prevention, planning, development, research
   * - 3: Not Important & Urgent (Delegate) - Interruptions, some calls/emails, some meetings
   * - 4: Not Important & Not Urgent (Eliminate) - Time wasters, some mail, some phone calls, some web browsing
   */
  calculateQuadrant() {
    const isImportant = this.importance;
    const isUrgent = this.urgency;

    if (isImportant && isUrgent) return 1; // Important & Urgent (Do First)
    if (isImportant && !isUrgent) return 2; // Important & Not Urgent (Schedule)
    if (!isImportant && isUrgent) return 3; // Not Important & Urgent (Delegate)
    return 4; // Not Important & Not Urgent (Eliminate)
  }

  /**
   * Updates task properties while preserving immutable fields.
   * Automatically updates the modification timestamp and recalculates quadrant.
   * 
   * @param {Object} data - Object containing properties to update
   * @param {string} [data.name] - New task name
   * @param {string} [data.description] - New task description
   * @param {boolean} [data.importance] - New importance status
   * @param {boolean} [data.urgency] - New urgency status
   * @param {boolean} [data.completed] - New completion status
   * @param {number} [data.battleScore] - New battle mode score
   */
  update(data) {
    Object.keys(data).forEach(key => {
      if (key in this && key !== 'id' && key !== 'created') {
        this[key] = data[key];
      }
    });
    this.updated = new Date();
    this.quadrant = this.calculateQuadrant();
  }

  /**
   * Converts task to JSON-serializable object for storage/transmission.
   * Dates are converted to ISO strings for consistent serialization.
   * 
   * @returns {Object} JSON-serializable task object
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      importance: this.importance,
      urgency: this.urgency,
      quadrant: this.quadrant,
      created: this.created.toISOString(),
      updated: this.updated.toISOString(),
      completed: this.completed,
      battleScore: this.battleScore
    };
  }

  /**
   * Creates a new Task instance from a JSON object.
   * Static factory method for deserialization from storage.
   * 
   * @param {Object} data - JSON object representing a task
   * @returns {Task} New Task instance
   */
  static fromJSON(data) {
    return new Task(data);
  }

  /**
   * Creates a deep copy of the task.
   * Useful for editing tasks without modifying the original.
   * 
   * @returns {Task} Cloned task instance
   */
  clone() {
    return new Task(this.toJSON());
  }

  /**
   * Gets human-readable importance label for UI display.
   * 
   * @returns {string} "Important" or "Not Important"
   */
  getImportanceLabel() {
    return this.importance ? 'Important' : 'Not Important';
  }

  /**
   * Gets human-readable urgency label for UI display.
   * 
   * @returns {string} "Urgent" or "Not Urgent"
   */
  getUrgencyLabel() {
    return this.urgency ? 'Urgent' : 'Not Urgent';
  }

  /**
   * Gets compact importance label for UI display.
   * Works with both boolean and legacy numeric values.
   * 
   * @returns {string} "I" or "NI"
   */
  getImportanceLabelCompact() {
    return this.importance ? 'I' : 'NI';
  }

  /**
   * Gets compact urgency label for UI display.
   * Works with both boolean and legacy numeric values.
   * 
   * @returns {string} "U" or "NU"
   */
  getUrgencyLabelCompact() {
    return this.urgency ? 'U' : 'NU';
  }

  /**
   * Gets the Eisenhower Matrix quadrant name for this task.
   * 
   * @returns {string} Quadrant action name: "Do First", "Schedule", "Delegate", or "Eliminate"
   */
  getQuadrantName() {
    const names = {
      1: 'Do First',    // Important & Urgent
      2: 'Schedule',    // Important & Not Urgent  
      3: 'Delegate',    // Not Important & Urgent
      4: 'Eliminate'    // Not Important & Not Urgent
    };
    return names[this.quadrant] || 'Unknown';
  }

  /**
   * Calculates task age in days since creation.
   * Useful for identifying stale tasks that need attention.
   * 
   * @returns {number} Number of days since task creation
   */
  getAgeInDays() {
    const now = new Date();
    const diffTime = Math.abs(now - this.created);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Determines if a task is overdue based on age and priority.
   * Quadrant 1 tasks (Do First) are considered overdue after 7 days.
   * 
   * @returns {boolean} True if task is overdue and incomplete
   */
  isOverdue() {
    return this.getAgeInDays() > 7 && this.quadrant === 1 && !this.completed;
  }

  /**
   * Calculates a numerical priority score for task sorting.
   * Higher scores indicate higher priority. Formula includes:
   * - Base score: importance (2 points) + urgency (1 point)
   * - Age bonus: Up to 2 additional points for older tasks
   * - Battle score: Points from pairwise comparisons
   * 
   * @returns {number} Priority score (higher = more important)
   */
  getPriorityScore() {
    // Base priority calculation
    let score = (this.importance * 2) + this.urgency;

    // Age bonus: Older tasks get slight priority boost (max 2 points)
    const ageBonus = Math.min(this.getAgeInDays() * 0.1, 2);
    score += ageBonus;

    // Battle mode results influence final score
    score += this.battleScore;

    return score;
  }

  /**
   * Validates task data integrity and business rules.
   * Checks for required fields, length limits, and type constraints.
   * 
   * @returns {Object} Validation result object
   * @returns {boolean} returns.isValid - True if task passes all validations
   * @returns {string[]} returns.errors - Array of validation error messages
   */
  validate() {
    const errors = [];

    // Name validation
    if (!this.name || this.name.trim().length === 0) {
      errors.push('Task name is required');
    }

    if (this.name && this.name.length > 100) {
      errors.push('Task name must be 100 characters or less');
    }

    // Description validation  
    if (this.description && this.description.length > 500) {
      errors.push('Description must be 500 characters or less');
    }

    // Type validation for importance/urgency
    if (typeof this.importance !== 'boolean') {
      errors.push('Importance must be a boolean value');
    }

    if (typeof this.urgency !== 'boolean') {
      errors.push('Urgency must be a boolean value');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Support both ES modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Task;
  module.exports.default = Task;
} else if (typeof window !== 'undefined') {
  window.Task = Task;
}

export default Task;