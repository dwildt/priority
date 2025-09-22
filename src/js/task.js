class Task {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.name = data.name || '';
    this.description = data.description || '';
    // Handle both old numeric values (1-5) and new boolean values
    if (typeof data.importance === 'boolean') {
      this.importance = data.importance;
    } else if (typeof data.importance === 'number') {
      // Convert old numeric values to boolean (4+ = true)
      this.importance = data.importance >= 4;
    } else {
      this.importance = false; // Default to not important
    }

    if (typeof data.urgency === 'boolean') {
      this.urgency = data.urgency;
    } else if (typeof data.urgency === 'number') {
      // Convert old numeric values to boolean (4+ = true)
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

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  calculateQuadrant() {
    // Importance and urgency are now boolean values
    const isImportant = this.importance;
    const isUrgent = this.urgency;

    if (isImportant && isUrgent) return 1; // Important & Urgent
    if (isImportant && !isUrgent) return 2; // Important & Not Urgent
    if (!isImportant && isUrgent) return 3; // Not Important & Urgent
    return 4; // Not Important & Not Urgent
  }

  update(data) {
    Object.keys(data).forEach(key => {
      if (key in this && key !== 'id' && key !== 'created') {
        this[key] = data[key];
      }
    });
    this.updated = new Date();
    this.quadrant = this.calculateQuadrant();
  }

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

  static fromJSON(data) {
    return new Task(data);
  }

  clone() {
    return new Task(this.toJSON());
  }

  getImportanceLabel() {
    return this.importance ? 'Important' : 'Not Important';
  }

  getUrgencyLabel() {
    return this.urgency ? 'Urgent' : 'Not Urgent';
  }

  getQuadrantName() {
    const names = {
      1: 'Do First',
      2: 'Schedule',
      3: 'Delegate',
      4: 'Eliminate'
    };
    return names[this.quadrant] || 'Unknown';
  }

  getAgeInDays() {
    const now = new Date();
    const diffTime = Math.abs(now - this.created);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isOverdue() {
    return this.getAgeInDays() > 7 && this.quadrant === 1 && !this.completed;
  }

  getPriorityScore() {
    // Higher score = higher priority
    let score = (this.importance * 2) + this.urgency;

    // Bonus for age (older tasks get slight priority boost)
    const ageBonus = Math.min(this.getAgeInDays() * 0.1, 2);
    score += ageBonus;

    // Battle score influence
    score += this.battleScore;

    return score;
  }

  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Task name is required');
    }

    if (this.name && this.name.length > 100) {
      errors.push('Task name must be 100 characters or less');
    }

    if (this.description && this.description.length > 500) {
      errors.push('Description must be 500 characters or less');
    }

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