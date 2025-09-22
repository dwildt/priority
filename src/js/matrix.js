import Task from './task.js';
import BattleMode from './battle.js';

class Matrix {
  constructor() {
    this.tasks = new Map();
    this.eventHandlers = new Map();
    this.loadFromStorage();
  }

  addTask(taskData) {
    const task = taskData instanceof Task ? taskData : new Task(taskData);
    const validation = task.validate();

    if (!validation.isValid) {
      throw new Error(`Invalid task: ${validation.errors.join(', ')}`);
    }

    this.tasks.set(task.id, task);
    this.saveToStorage();
    this.emit('taskAdded', task);
    return task;
  }

  updateTask(taskId, updateData) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const oldQuadrant = task.quadrant;
    task.update(updateData);

    const validation = task.validate();
    if (!validation.isValid) {
      throw new Error(`Invalid task update: ${validation.errors.join(', ')}`);
    }

    this.saveToStorage();
    this.emit('taskUpdated', { task, oldQuadrant });
    return task;
  }

  deleteTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    this.tasks.delete(taskId);
    this.saveToStorage();
    this.emit('taskDeleted', task);
    return task;
  }

  getTask(taskId) {
    return this.tasks.get(taskId);
  }

  getAllTasks() {
    return Array.from(this.tasks.values());
  }

  getTasksByQuadrant(quadrant = null) {
    const allTasks = this.getAllTasks();

    if (quadrant !== null) {
      return allTasks.filter(task => task.quadrant === quadrant);
    }

    // Return all quadrants
    return {
      1: allTasks.filter(task => task.quadrant === 1),
      2: allTasks.filter(task => task.quadrant === 2),
      3: allTasks.filter(task => task.quadrant === 3),
      4: allTasks.filter(task => task.quadrant === 4)
    };
  }

  getCompletedTasks() {
    return this.getAllTasks().filter(task => task.completed);
  }

  getPendingTasks() {
    return this.getAllTasks().filter(task => !task.completed);
  }

  getOverdueTasks() {
    return this.getAllTasks().filter(task => task.isOverdue());
  }

  getTasksByImportance(importance) {
    return this.getAllTasks().filter(task => task.importance === importance);
  }

  getTasksByUrgency(urgency) {
    return this.getAllTasks().filter(task => task.urgency === urgency);
  }

  searchTasks(query) {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return [];

    return this.getAllTasks().filter(task => {
      return task.name.toLowerCase().includes(searchTerm) ||
             task.description.toLowerCase().includes(searchTerm);
    });
  }

  sortTasksByPriority(tasks = null, quadrant = null) {
    const tasksToSort = tasks || this.getAllTasks();

    // For Do First quadrant (quadrant 1), try to use battle results
    if (quadrant === 1) {
      return this.sortTasksWithBattleResults(tasksToSort);
    }

    // Default priority score sorting for other quadrants
    return tasksToSort.sort((a, b) => b.getPriorityScore() - a.getPriorityScore());
  }

  sortTasksWithBattleResults(tasks) {
    // Load battle results from localStorage
    const battleResults = BattleMode.loadBattleResults();

    if (!battleResults || !battleResults.rankings) {
      // No battle results available, use default priority sorting
      return tasks.sort((a, b) => b.getPriorityScore() - a.getPriorityScore());
    }

    // Create a map of task ID to battle ranking for quick lookup
    const battleRankingMap = new Map();
    battleResults.rankings.forEach((ranking, index) => {
      battleRankingMap.set(ranking.task.id, {
        score: ranking.score,
        position: index
      });
    });

    // Sort tasks using battle results, with fallback to priority score
    return tasks.sort((a, b) => {
      const aRanking = battleRankingMap.get(a.id);
      const bRanking = battleRankingMap.get(b.id);

      // If both tasks have battle rankings, use battle order
      if (aRanking && bRanking) {
        return aRanking.position - bRanking.position; // Lower position = higher rank
      }

      // If only one has battle ranking, prioritize it
      if (aRanking && !bRanking) return -1;
      if (!aRanking && bRanking) return 1;

      // Neither has battle ranking, use priority score
      return b.getPriorityScore() - a.getPriorityScore();
    });
  }

  getStatistics() {
    const allTasks = this.getAllTasks();
    const completedTasks = this.getCompletedTasks();
    const overdueTasks = this.getOverdueTasks();
    const quadrants = this.getTasksByQuadrant();

    return {
      total: allTasks.length,
      completed: completedTasks.length,
      pending: allTasks.length - completedTasks.length,
      overdue: overdueTasks.length,
      completionRate: allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0,
      quadrantCounts: {
        1: quadrants[1].length,
        2: quadrants[2].length,
        3: quadrants[3].length,
        4: quadrants[4].length
      },
      averageImportance: this.calculateAverage(allTasks, 'importance'),
      averageUrgency: this.calculateAverage(allTasks, 'urgency')
    };
  }

  calculateAverage(tasks, property) {
    if (tasks.length === 0) return 0;
    const sum = tasks.reduce((acc, task) => acc + task[property], 0);
    return Math.round((sum / tasks.length) * 100) / 100;
  }

  moveTaskToQuadrant(taskId, targetQuadrant) {
    const task = this.getTask(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const oldQuadrant = task.quadrant;

    // Calculate new importance/urgency based on target quadrant
    const quadrantMap = {
      1: { importance: 5, urgency: 5 }, // Important & Urgent
      2: { importance: 5, urgency: 2 }, // Important & Not Urgent
      3: { importance: 2, urgency: 5 }, // Not Important & Urgent
      4: { importance: 2, urgency: 2 }  // Not Important & Not Urgent
    };

    if (quadrantMap[targetQuadrant]) {
      this.updateTask(taskId, {
        ...quadrantMap[targetQuadrant],
        quadrant: targetQuadrant
      });
    }

    return { task, oldQuadrant, newQuadrant: targetQuadrant };
  }

  exportData() {
    return {
      tasks: Array.from(this.tasks.values()).map(task => task.toJSON()),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  importData(data) {
    try {
      if (!data || !data.tasks || !Array.isArray(data.tasks)) {
        throw new Error('Invalid data format');
      }

      // Clear existing tasks
      this.tasks.clear();

      // Import tasks
      data.tasks.forEach(taskData => {
        const task = Task.fromJSON(taskData);
        this.tasks.set(task.id, task);
      });

      this.saveToStorage();
      this.emit('dataImported', { taskCount: data.tasks.length });
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }

  clearAllTasks() {
    const taskCount = this.tasks.size;
    this.tasks.clear();
    this.saveToStorage();
    this.emit('tasksCleared', { taskCount });
    return taskCount;
  }

  saveToStorage() {
    try {
      const data = this.exportData();
      localStorage.setItem('priority-matrix-data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem('priority-matrix-data');
      if (data) {
        const parsedData = JSON.parse(data);
        if (parsedData.tasks) {
          parsedData.tasks.forEach(taskData => {
            const task = Task.fromJSON(taskData);
            this.tasks.set(task.id, task);
          });
        }
      }
    } catch (error) {
      console.error('Failed to load from storage:', error);
    }
  }

  // Event system
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }
}

// Support both ES modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Matrix;
  module.exports.default = Matrix;
} else if (typeof window !== 'undefined') {
  window.Matrix = Matrix;
}

export default Matrix;