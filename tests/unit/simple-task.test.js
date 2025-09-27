// Simple task tests with basic functionality
describe('Task Core Functionality', () => {
  // Define Task class inline for testing
  class Task {
    constructor(data = {}) {
      this.id = data.id || this.generateId();
      this.name = data.name || '';
      this.description = data.description || '';
      this.importance = data.importance !== undefined ? data.importance : 3;
      this.urgency = data.urgency !== undefined ? data.urgency : 3;
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
      const isImportant = this.importance >= 4;
      const isUrgent = this.urgency >= 4;

      if (isImportant && isUrgent) return 1;
      if (isImportant && !isUrgent) return 2;
      if (!isImportant && isUrgent) return 3;
      return 4;
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

      if (this.importance < 1 || this.importance > 5) {
        errors.push('Importance must be between 1 and 5');
      }

      if (this.urgency < 1 || this.urgency > 5) {
        errors.push('Urgency must be between 1 and 5');
      }

      return {
        isValid: errors.length === 0,
        errors
      };
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

    getImportanceLabelCompact() {
      const important = typeof this.importance === 'boolean' ? this.importance : this.importance >= 4;
      return important ? 'I' : 'NI';
    }

    getUrgencyLabelCompact() {
      const urgent = typeof this.urgency === 'boolean' ? this.urgency : this.urgency >= 4;
      return urgent ? 'U' : 'NU';
    }
  }

  describe('Basic Task Creation', () => {
    test('should create task with default values', () => {
      const task = new Task();

      expect(task.id).toBeDefined();
      expect(task.name).toBe('');
      expect(task.importance).toBe(3);
      expect(task.urgency).toBe(3);
      expect(task.quadrant).toBe(4);
      expect(task.completed).toBe(false);
    });

    test('should create task with provided data', () => {
      const task = new Task({
        name: 'Test Task',
        importance: 5,
        urgency: 4
      });

      expect(task.name).toBe('Test Task');
      expect(task.importance).toBe(5);
      expect(task.urgency).toBe(4);
      expect(task.quadrant).toBe(1);
    });
  });

  describe('Quadrant Calculation', () => {
    test('should place high importance and urgency in quadrant 1', () => {
      const task = new Task({ importance: 5, urgency: 5 });
      expect(task.quadrant).toBe(1);
    });

    test('should place high importance and low urgency in quadrant 2', () => {
      const task = new Task({ importance: 5, urgency: 2 });
      expect(task.quadrant).toBe(2);
    });

    test('should place low importance and high urgency in quadrant 3', () => {
      const task = new Task({ importance: 2, urgency: 5 });
      expect(task.quadrant).toBe(3);
    });

    test('should place low importance and urgency in quadrant 4', () => {
      const task = new Task({ importance: 2, urgency: 2 });
      expect(task.quadrant).toBe(4);
    });
  });

  describe('Validation', () => {
    test('should validate valid task', () => {
      const task = new Task({
        name: 'Valid Task',
        importance: 3,
        urgency: 4
      });

      const validation = task.validate();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should reject empty task name', () => {
      const task = new Task({ name: '' });
      const validation = task.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Task name is required');
    });

    test('should reject invalid importance values', () => {
      const task = new Task({ name: 'Test', importance: 0 });
      const validation = task.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Importance must be between 1 and 5');
    });

    test('should reject invalid urgency values', () => {
      const task = new Task({ name: 'Test', urgency: 6 });
      const validation = task.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Urgency must be between 1 and 5');
    });
  });

  describe('Task Updates', () => {
    test('should update task properties', () => {
      const task = new Task({ name: 'Original', importance: 3 });

      task.update({
        name: 'Updated',
        importance: 5
      });

      expect(task.name).toBe('Updated');
      expect(task.importance).toBe(5);
      expect(task.quadrant).toBe(2); // Should recalculate
    });

    test('should not update protected properties', () => {
      const task = new Task({ id: 'original-id' });
      const originalCreated = task.created;

      task.update({
        id: 'new-id',
        created: new Date('2020-01-01')
      });

      expect(task.id).toBe('original-id');
      expect(task.created).toBe(originalCreated);
    });
  });

  describe('Compact Label Methods', () => {
    test('should return correct compact importance labels', () => {
      const importantTask = new Task({ importance: 5 });
      const notImportantTask = new Task({ importance: 2 });

      expect(importantTask.getImportanceLabelCompact()).toBe('I');
      expect(notImportantTask.getImportanceLabelCompact()).toBe('NI');
    });

    test('should return correct compact urgency labels', () => {
      const urgentTask = new Task({ urgency: 5 });
      const notUrgentTask = new Task({ urgency: 2 });

      expect(urgentTask.getUrgencyLabelCompact()).toBe('U');
      expect(notUrgentTask.getUrgencyLabelCompact()).toBe('NU');
    });

    test('should handle boolean importance values for compact labels', () => {
      const importantTask = new Task({ importance: true });
      const notImportantTask = new Task({ importance: false });

      expect(importantTask.getImportanceLabelCompact()).toBe('I');
      expect(notImportantTask.getImportanceLabelCompact()).toBe('NI');
    });

    test('should handle boolean urgency values for compact labels', () => {
      const urgentTask = new Task({ urgency: true });
      const notUrgentTask = new Task({ urgency: false });

      expect(urgentTask.getUrgencyLabelCompact()).toBe('U');
      expect(notUrgentTask.getUrgencyLabelCompact()).toBe('NU');
    });
  });
});