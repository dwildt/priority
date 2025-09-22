const Matrix = require('../../src/js/matrix.js');
const Task = require('../../src/js/task.js');

describe('Matrix', () => {
  let matrix;

  beforeEach(() => {
    matrix = new Matrix();
    // Clear localStorage mock
    localStorage.clear();
  });

  describe('constructor', () => {
    test('should initialize empty matrix', () => {
      expect(matrix.tasks).toBeInstanceOf(Map);
      expect(matrix.tasks.size).toBe(0);
      expect(matrix.eventHandlers).toBeInstanceOf(Map);
    });
  });

  describe('addTask', () => {
    test('should add valid task', () => {
      const taskData = {
        name: 'Test Task',
        importance: 3,
        urgency: 4
      };

      const task = matrix.addTask(taskData);

      expect(task).toBeInstanceOf(Task);
      expect(task.name).toBe('Test Task');
      expect(matrix.tasks.has(task.id)).toBe(true);
      expect(matrix.tasks.size).toBe(1);
    });

    test('should add Task instance', () => {
      const task = new Task({ name: 'Direct Task', importance: 2, urgency: 3 });
      const addedTask = matrix.addTask(task);

      expect(addedTask).toBe(task);
      expect(matrix.tasks.has(task.id)).toBe(true);
    });

    test('should reject invalid task', () => {
      const invalidTaskData = {
        name: '', // Invalid: empty name
        importance: 3,
        urgency: 4
      };

      expect(() => {
        matrix.addTask(invalidTaskData);
      }).toThrow('Invalid task');

      expect(matrix.tasks.size).toBe(0);
    });

    test('should emit taskAdded event', () => {
      const eventHandler = jest.fn();
      matrix.on('taskAdded', eventHandler);

      const task = matrix.addTask({ name: 'Test Task', importance: 3, urgency: 3 });

      expect(eventHandler).toHaveBeenCalledWith(task);
    });

    test('should save to storage', () => {
      matrix.addTask({ name: 'Test Task', importance: 3, urgency: 3 });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'priority-matrix-data',
        expect.any(String)
      );
    });
  });

  describe('updateTask', () => {
    test('should update existing task', () => {
      const task = matrix.addTask({ name: 'Original', importance: 3, urgency: 3 });

      const updatedTask = matrix.updateTask(task.id, {
        name: 'Updated',
        importance: 5,
        urgency: 5
      });

      expect(updatedTask.name).toBe('Updated');
      expect(updatedTask.importance).toBe(5);
      expect(updatedTask.urgency).toBe(5);
      expect(updatedTask.quadrant).toBe(1); // Should recalculate
    });

    test('should throw error for non-existent task', () => {
      expect(() => {
        matrix.updateTask('non-existent-id', { name: 'Test' });
      }).toThrow('Task not found');
    });

    test('should reject invalid updates', () => {
      const task = matrix.addTask({ name: 'Test Task', importance: 3, urgency: 3 });

      expect(() => {
        matrix.updateTask(task.id, { name: '' }); // Invalid update
      }).toThrow('Invalid task update');
    });

    test('should emit taskUpdated event', () => {
      const eventHandler = jest.fn();
      matrix.on('taskUpdated', eventHandler);

      const task = matrix.addTask({ name: 'Test Task', importance: 3, urgency: 3 });
      const oldQuadrant = task.quadrant;

      matrix.updateTask(task.id, { name: 'Updated' });

      expect(eventHandler).toHaveBeenCalledWith({
        task: expect.any(Task),
        oldQuadrant
      });
    });
  });

  describe('deleteTask', () => {
    test('should delete existing task', () => {
      const task = matrix.addTask({ name: 'Test Task', importance: 3, urgency: 3 });

      const deletedTask = matrix.deleteTask(task.id);

      expect(deletedTask).toBe(task);
      expect(matrix.tasks.has(task.id)).toBe(false);
      expect(matrix.tasks.size).toBe(0);
    });

    test('should throw error for non-existent task', () => {
      expect(() => {
        matrix.deleteTask('non-existent-id');
      }).toThrow('Task not found');
    });

    test('should emit taskDeleted event', () => {
      const eventHandler = jest.fn();
      matrix.on('taskDeleted', eventHandler);

      const task = matrix.addTask({ name: 'Test Task', importance: 3, urgency: 3 });
      matrix.deleteTask(task.id);

      expect(eventHandler).toHaveBeenCalledWith(task);
    });
  });

  describe('getTasksByQuadrant', () => {
    beforeEach(() => {
      // Add tasks to different quadrants
      matrix.addTask({ name: 'Q1 Task', importance: 5, urgency: 5 }); // Quadrant 1
      matrix.addTask({ name: 'Q2 Task', importance: 5, urgency: 2 }); // Quadrant 2
      matrix.addTask({ name: 'Q3 Task', importance: 2, urgency: 5 }); // Quadrant 3
      matrix.addTask({ name: 'Q4 Task', importance: 2, urgency: 2 }); // Quadrant 4
      matrix.addTask({ name: 'Q1 Task 2', importance: 4, urgency: 4 }); // Quadrant 1
    });

    test('should return tasks for specific quadrant', () => {
      const q1Tasks = matrix.getTasksByQuadrant(1);
      const q2Tasks = matrix.getTasksByQuadrant(2);

      expect(q1Tasks).toHaveLength(2);
      expect(q2Tasks).toHaveLength(1);
      expect(q1Tasks.every(task => task.quadrant === 1)).toBe(true);
      expect(q2Tasks.every(task => task.quadrant === 2)).toBe(true);
    });

    test('should return all quadrants when no specific quadrant requested', () => {
      const allQuadrants = matrix.getTasksByQuadrant();

      expect(allQuadrants).toHaveProperty('1');
      expect(allQuadrants).toHaveProperty('2');
      expect(allQuadrants).toHaveProperty('3');
      expect(allQuadrants).toHaveProperty('4');
      expect(allQuadrants[1]).toHaveLength(2);
      expect(allQuadrants[2]).toHaveLength(1);
      expect(allQuadrants[3]).toHaveLength(1);
      expect(allQuadrants[4]).toHaveLength(1);
    });
  });

  describe('task filtering methods', () => {
    beforeEach(() => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10);

      matrix.addTask({ name: 'Completed Task', importance: 3, urgency: 3, completed: true });
      matrix.addTask({ name: 'Pending Task', importance: 4, urgency: 4, completed: false });
      matrix.addTask({
        name: 'Old Urgent Task',
        importance: 5,
        urgency: 5,
        completed: false,
        created: oldDate
      });
    });

    test('getCompletedTasks should return only completed tasks', () => {
      const completed = matrix.getCompletedTasks();
      expect(completed).toHaveLength(1);
      expect(completed[0].name).toBe('Completed Task');
    });

    test('getPendingTasks should return only pending tasks', () => {
      const pending = matrix.getPendingTasks();
      expect(pending).toHaveLength(2);
      expect(pending.every(task => !task.completed)).toBe(true);
    });

    test('getOverdueTasks should return overdue tasks', () => {
      const overdue = matrix.getOverdueTasks();
      expect(overdue).toHaveLength(1);
      expect(overdue[0].name).toBe('Old Urgent Task');
    });

    test('getTasksByImportance should filter by importance', () => {
      const highImportance = matrix.getTasksByImportance(5);
      expect(highImportance).toHaveLength(1);
      expect(highImportance[0].name).toBe('Old Urgent Task');
    });

    test('getTasksByUrgency should filter by urgency', () => {
      const highUrgency = matrix.getTasksByUrgency(5);
      expect(highUrgency).toHaveLength(1);
      expect(highUrgency[0].name).toBe('Old Urgent Task');
    });
  });

  describe('searchTasks', () => {
    beforeEach(() => {
      matrix.addTask({
        name: 'Important meeting',
        description: 'Discuss project roadmap',
        importance: 4,
        urgency: 3
      });
      matrix.addTask({
        name: 'Code review',
        description: 'Review pull request',
        importance: 3,
        urgency: 4
      });
      matrix.addTask({
        name: 'Documentation',
        description: 'Update project docs',
        importance: 2,
        urgency: 2
      });
    });

    test('should search by task name', () => {
      const results = matrix.searchTasks('meeting');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Important meeting');
    });

    test('should search by description', () => {
      const results = matrix.searchTasks('project');
      expect(results).toHaveLength(2); // Both tasks contain 'project'
    });

    test('should be case insensitive', () => {
      const results = matrix.searchTasks('MEETING');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Important meeting');
    });

    test('should return empty array for no matches', () => {
      const results = matrix.searchTasks('nonexistent');
      expect(results).toHaveLength(0);
    });

    test('should return empty array for empty query', () => {
      const results = matrix.searchTasks('');
      expect(results).toHaveLength(0);
    });
  });

  describe('sortTasksByPriority', () => {
    test('should sort tasks by priority score', () => {
      const task1 = matrix.addTask({ name: 'Low Priority', importance: 2, urgency: 2 });
      const task2 = matrix.addTask({ name: 'High Priority', importance: 5, urgency: 5 });
      matrix.addTask({ name: 'Medium Priority', importance: 3, urgency: 4 });

      const sorted = matrix.sortTasksByPriority();

      expect(sorted[0]).toBe(task2); // Highest priority first
      expect(sorted[2]).toBe(task1); // Lowest priority last
    });

    test('should sort provided tasks array', () => {
      const task1 = new Task({ name: 'Low', importance: 1, urgency: 1 });
      const task2 = new Task({ name: 'High', importance: 5, urgency: 5 });

      const sorted = matrix.sortTasksByPriority([task1, task2]);

      expect(sorted[0]).toBe(task2);
      expect(sorted[1]).toBe(task1);
    });
  });

  describe('getStatistics', () => {
    beforeEach(() => {
      matrix.addTask({ name: 'Task 1', importance: 5, urgency: 5, completed: true });
      matrix.addTask({ name: 'Task 2', importance: 4, urgency: 3, completed: false });
      matrix.addTask({ name: 'Task 3', importance: 3, urgency: 4, completed: false });
    });

    test('should calculate correct statistics', () => {
      const stats = matrix.getStatistics();

      expect(stats.total).toBe(3);
      expect(stats.completed).toBe(1);
      expect(stats.pending).toBe(2);
      expect(stats.completionRate).toBeCloseTo(33.33, 1);
      expect(stats.quadrantCounts[1]).toBe(1); // Q1 task
      expect(stats.quadrantCounts[3]).toBe(1); // Q3 task
      expect(stats.averageImportance).toBeCloseTo(4, 1);
      expect(stats.averageUrgency).toBeCloseTo(4, 1);
    });

    test('should handle empty matrix', () => {
      const emptyMatrix = new Matrix();
      const stats = emptyMatrix.getStatistics();

      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.pending).toBe(0);
      expect(stats.completionRate).toBe(0);
      expect(stats.averageImportance).toBe(0);
      expect(stats.averageUrgency).toBe(0);
    });
  });

  describe('moveTaskToQuadrant', () => {
    test('should move task to target quadrant', () => {
      const task = matrix.addTask({ name: 'Test Task', importance: 2, urgency: 2 });
      expect(task.quadrant).toBe(4);

      const result = matrix.moveTaskToQuadrant(task.id, 1);

      expect(result.oldQuadrant).toBe(4);
      expect(result.newQuadrant).toBe(1);
      expect(task.quadrant).toBe(1);
      expect(task.importance).toBe(5);
      expect(task.urgency).toBe(5);
    });

    test('should throw error for non-existent task', () => {
      expect(() => {
        matrix.moveTaskToQuadrant('non-existent', 1);
      }).toThrow('Task not found');
    });
  });

  describe('data management', () => {
    beforeEach(() => {
      matrix.addTask({ name: 'Task 1', importance: 3, urgency: 3 });
      matrix.addTask({ name: 'Task 2', importance: 4, urgency: 2 });
    });

    test('exportData should create valid export', () => {
      const exportData = matrix.exportData();

      expect(exportData.tasks).toHaveLength(2);
      expect(exportData.exportDate).toBeDefined();
      expect(exportData.version).toBe('1.0.0');
      expect(exportData.tasks[0]).toHaveProperty('id');
      expect(exportData.tasks[0]).toHaveProperty('name');
    });

    test('importData should restore tasks', () => {
      const exportData = matrix.exportData();
      const newMatrix = new Matrix();

      const result = newMatrix.importData(exportData);

      expect(result).toBe(true);
      expect(newMatrix.getAllTasks()).toHaveLength(2);
      expect(newMatrix.getAllTasks()[0].name).toBe('Task 1');
    });

    test('importData should reject invalid data', () => {
      expect(() => {
        matrix.importData({});
      }).toThrow('Invalid data format');

      expect(() => {
        matrix.importData({ tasks: 'not-an-array' });
      }).toThrow('Invalid data format');
    });

    test('clearAllTasks should remove all tasks', () => {
      expect(matrix.getAllTasks()).toHaveLength(2);

      const taskCount = matrix.clearAllTasks();

      expect(taskCount).toBe(2);
      expect(matrix.getAllTasks()).toHaveLength(0);
    });
  });

  describe('event system', () => {
    test('should register and call event handlers', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      matrix.on('test', handler1);
      matrix.on('test', handler2);

      matrix.emit('test', 'data');

      expect(handler1).toHaveBeenCalledWith('data');
      expect(handler2).toHaveBeenCalledWith('data');
    });

    test('should remove event handlers', () => {
      const handler = jest.fn();

      matrix.on('test', handler);
      matrix.off('test', handler);
      matrix.emit('test', 'data');

      expect(handler).not.toHaveBeenCalled();
    });

    test('should handle errors in event handlers', () => {
      const errorHandler = jest.fn(() => {
        throw new Error('Handler error');
      });
      const normalHandler = jest.fn();

      matrix.on('test', errorHandler);
      matrix.on('test', normalHandler);

      // Should not throw and should call other handlers
      expect(() => {
        matrix.emit('test', 'data');
      }).not.toThrow();

      expect(normalHandler).toHaveBeenCalled();
    });
  });

  describe('localStorage integration', () => {
    test('should save data on operations', () => {
      matrix.addTask({ name: 'Test Task', importance: 3, urgency: 3 });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'priority-matrix-data',
        expect.stringContaining('Test Task')
      );
    });

    test('should load data from localStorage on initialization', () => {
      const mockData = {
        tasks: [{
          id: 'test-123',
          name: 'Loaded Task',
          importance: 3,
          urgency: 3,
          quadrant: 4,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          completed: false,
          battleScore: 0
        }]
      };

      localStorage.getItem.mockReturnValue(JSON.stringify(mockData));

      const newMatrix = new Matrix();

      expect(newMatrix.getAllTasks()).toHaveLength(1);
      expect(newMatrix.getAllTasks()[0].name).toBe('Loaded Task');
    });

    test('should handle corrupted localStorage data', () => {
      localStorage.getItem.mockReturnValue('invalid json');

      // Should not throw error
      expect(() => {
        new Matrix();
      }).not.toThrow();
    });
  });
});