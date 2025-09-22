const Task = require('../../src/js/task.js');

describe('Task', () => {
  describe('constructor', () => {
    test('should create task with default values', () => {
      const task = new Task();

      expect(task.id).toBeDefined();
      expect(task.name).toBe('');
      expect(task.description).toBe('');
      expect(task.importance).toBe(false);
      expect(task.urgency).toBe(false);
      expect(task.quadrant).toBe(4); // Not important & not urgent
      expect(task.created).toBeInstanceOf(Date);
      expect(task.updated).toBeInstanceOf(Date);
      expect(task.completed).toBe(false);
      expect(task.battleScore).toBe(0);
    });

    test('should create task with provided data', () => {
      const taskData = {
        id: 'test-123',
        name: 'Test Task',
        description: 'Test Description',
        importance: true,
        urgency: true,
        completed: true,
        battleScore: 10
      };

      const task = new Task(taskData);

      expect(task.id).toBe('test-123');
      expect(task.name).toBe('Test Task');
      expect(task.description).toBe('Test Description');
      expect(task.importance).toBe(true);
      expect(task.urgency).toBe(true);
      expect(task.completed).toBe(true);
      expect(task.battleScore).toBe(10);
    });

    test('should handle date strings in data', () => {
      const taskData = {
        created: '2024-01-01T00:00:00.000Z',
        updated: '2024-01-02T00:00:00.000Z'
      };

      const task = new Task(taskData);

      expect(task.created).toBeInstanceOf(Date);
      expect(task.updated).toBeInstanceOf(Date);
      expect(task.created.getTime()).toBe(new Date('2024-01-01T00:00:00.000Z').getTime());
      expect(task.updated.getTime()).toBe(new Date('2024-01-02T00:00:00.000Z').getTime());
    });
  });

  describe('calculateQuadrant', () => {
    test('should place important and urgent in quadrant 1', () => {
      const task = new Task({ importance: true, urgency: true });
      expect(task.quadrant).toBe(1);
    });

    test('should place important and not urgent in quadrant 2', () => {
      const task = new Task({ importance: true, urgency: false });
      expect(task.quadrant).toBe(2);
    });

    test('should place not important and urgent in quadrant 3', () => {
      const task = new Task({ importance: false, urgency: true });
      expect(task.quadrant).toBe(3);
    });

    test('should place not important and not urgent in quadrant 4', () => {
      const task = new Task({ importance: false, urgency: false });
      expect(task.quadrant).toBe(4);
    });

    test('should handle legacy numeric values correctly', () => {
      const task1 = new Task({ importance: 4, urgency: 4 }); // Above threshold (>=4)
      expect(task1.quadrant).toBe(1);

      const task2 = new Task({ importance: 3, urgency: 4 }); // Below importance threshold
      expect(task2.quadrant).toBe(3);

      const task3 = new Task({ importance: 4, urgency: 3 }); // Below urgency threshold
      expect(task3.quadrant).toBe(2);

      const task4 = new Task({ importance: 3, urgency: 3 }); // Both below threshold
      expect(task4.quadrant).toBe(4);
    });
  });

  describe('update', () => {
    test('should update task properties', () => {
      const task = new Task({ name: 'Original', importance: false });
      const originalUpdated = task.updated;

      // Wait a bit to ensure different timestamp
      setTimeout(() => {
        task.update({
          name: 'Updated',
          importance: true,
          urgency: true
        });

        expect(task.name).toBe('Updated');
        expect(task.importance).toBe(true);
        expect(task.urgency).toBe(true);
        expect(task.quadrant).toBe(1); // Should recalculate quadrant
        expect(task.updated.getTime()).toBeGreaterThan(originalUpdated.getTime());
      }, 1);
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

  describe('validation', () => {
    test('should validate valid task', () => {
      const task = new Task({
        name: 'Valid Task',
        description: 'Valid description',
        importance: true,
        urgency: false
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

    test('should reject whitespace-only task name', () => {
      const task = new Task({ name: '   ' });
      const validation = task.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Task name is required');
    });

    test('should reject task name that is too long', () => {
      const task = new Task({ name: 'a'.repeat(101) });
      const validation = task.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Task name must be 100 characters or less');
    });

    test('should reject description that is too long', () => {
      const task = new Task({
        name: 'Valid name',
        description: 'a'.repeat(501)
      });
      const validation = task.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Description must be 500 characters or less');
    });

    test('should reject invalid importance values', () => {
      const task1 = new Task({ name: 'Test', importance: 'invalid' });
      const task2 = new Task({ name: 'Test', importance: 1 }); // numeric should be converted to boolean

      expect(task1.validate().isValid).toBe(false);
      expect(task1.validate().errors).toContain('Importance must be a boolean value');
      expect(task2.validate().isValid).toBe(true); // legacy values are converted
    });

    test('should reject invalid urgency values', () => {
      const task1 = new Task({ name: 'Test', urgency: 'invalid' });
      const task2 = new Task({ name: 'Test', urgency: 1 }); // numeric should be converted to boolean

      expect(task1.validate().isValid).toBe(false);
      expect(task1.validate().errors).toContain('Urgency must be a boolean value');
      expect(task2.validate().isValid).toBe(true); // legacy values are converted
    });

    test('should collect multiple validation errors', () => {
      const task = new Task({
        name: '',
        importance: 'invalid',
        urgency: 'invalid'
      });

      const validation = task.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(3);
      expect(validation.errors).toContain('Task name is required');
      expect(validation.errors).toContain('Importance must be a boolean value');
      expect(validation.errors).toContain('Urgency must be a boolean value');
    });
  });

  describe('utility methods', () => {
    test('getImportanceLabel should return correct labels', () => {
      expect(new Task({ importance: true }).getImportanceLabel()).toBe('Important');
      expect(new Task({ importance: false }).getImportanceLabel()).toBe('Not Important');
    });

    test('getUrgencyLabel should return correct labels', () => {
      expect(new Task({ urgency: true }).getUrgencyLabel()).toBe('Urgent');
      expect(new Task({ urgency: false }).getUrgencyLabel()).toBe('Not Urgent');
    });

    test('getQuadrantName should return correct names', () => {
      expect(new Task({ importance: true, urgency: true }).getQuadrantName()).toBe('Do First');
      expect(new Task({ importance: true, urgency: false }).getQuadrantName()).toBe('Schedule');
      expect(new Task({ importance: false, urgency: true }).getQuadrantName()).toBe('Delegate');
      expect(new Task({ importance: false, urgency: false }).getQuadrantName()).toBe('Eliminate');
    });

    test('getAgeInDays should calculate correct age', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const task = new Task({ created: threeDaysAgo });
      expect(task.getAgeInDays()).toBe(3);
    });

    test('isOverdue should identify overdue tasks', () => {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      const overdueTask = new Task({
        created: tenDaysAgo,
        importance: true,
        urgency: true,
        completed: false
      });

      const recentTask = new Task({
        importance: true,
        urgency: true,
        completed: false
      });

      const completedTask = new Task({
        created: tenDaysAgo,
        importance: true,
        urgency: true,
        completed: true
      });

      expect(overdueTask.isOverdue()).toBe(true);
      expect(recentTask.isOverdue()).toBe(false);
      expect(completedTask.isOverdue()).toBe(false);
    });

    test('getPriorityScore should calculate priority correctly', () => {
      const highPriorityTask = new Task({
        importance: true,
        urgency: true,
        battleScore: 10
      });

      const lowPriorityTask = new Task({
        importance: false,
        urgency: false,
        battleScore: 0
      });

      expect(highPriorityTask.getPriorityScore()).toBeGreaterThan(lowPriorityTask.getPriorityScore());
    });
  });

  describe('serialization', () => {
    test('toJSON should serialize all properties', () => {
      const task = new Task({
        id: 'test-123',
        name: 'Test Task',
        description: 'Test Description',
        importance: true,
        urgency: false,
        completed: true,
        battleScore: 5
      });

      const json = task.toJSON();

      expect(json.id).toBe('test-123');
      expect(json.name).toBe('Test Task');
      expect(json.description).toBe('Test Description');
      expect(json.importance).toBe(true);
      expect(json.urgency).toBe(false);
      expect(json.quadrant).toBe(2); // Important & Not urgent
      expect(json.completed).toBe(true);
      expect(json.battleScore).toBe(5);
      expect(json.created).toBeDefined();
      expect(json.updated).toBeDefined();
    });

    test('fromJSON should deserialize correctly', () => {
      const json = {
        id: 'test-456',
        name: 'Deserialized Task',
        description: 'Deserialized Description',
        importance: false,
        urgency: true,
        quadrant: 3,
        created: '2024-01-01T00:00:00.000Z',
        updated: '2024-01-02T00:00:00.000Z',
        completed: false,
        battleScore: 0
      };

      const task = Task.fromJSON(json);

      expect(task).toBeInstanceOf(Task);
      expect(task.id).toBe('test-456');
      expect(task.name).toBe('Deserialized Task');
      expect(task.created).toBeInstanceOf(Date);
      expect(task.updated).toBeInstanceOf(Date);
    });

    test('clone should create independent copy', () => {
      const original = new Task({
        name: 'Original Task',
        importance: false,
        urgency: false
      });

      const clone = original.clone();

      expect(clone.id).not.toBe(original.id);
      expect(clone.name).toBe(original.name);
      expect(clone.importance).toBe(original.importance);

      // Modifying clone shouldn't affect original
      clone.update({ name: 'Modified Clone' });
      expect(original.name).toBe('Original Task');
      expect(clone.name).toBe('Modified Clone');
    });
  });

  describe('generateId', () => {
    test('should generate unique IDs', () => {
      const task1 = new Task();
      const task2 = new Task();

      expect(task1.id).not.toBe(task2.id);
      expect(task1.id).toBeDefined();
      expect(task2.id).toBeDefined();
      expect(typeof task1.id).toBe('string');
      expect(task1.id.length).toBeGreaterThan(0);
    });
  });
});