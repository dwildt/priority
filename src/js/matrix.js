import Task from './task.js';
import BattleMode from './battle.js';

/**
 * Eisenhower Priority Matrix management class.
 * Manages a collection of tasks organized by importance and urgency into 4 quadrants:
 * - Q1 (Do First): Important & Urgent - Crisis, emergencies, deadlines
 * - Q2 (Schedule): Important & Not Urgent - Prevention, planning, development  
 * - Q3 (Delegate): Not Important & Urgent - Interruptions, some calls/emails
 * - Q4 (Eliminate): Not Important & Not Urgent - Time wasters, busy work
 * 
 * Features:
 * - Task CRUD operations with validation
 * - Local storage persistence
 * - Battle mode integration for "The One" prioritization
 * - Statistics and reporting
 * - Event-driven architecture
 * - Data import/export capabilities
 * 
 * @class Matrix
 */
class Matrix {
  /**
   * Creates a new Matrix instance and loads existing tasks from local storage.
   */
  constructor() {
    /** @type {Map<string, Task>} Map of task IDs to Task instances */
    this.tasks = new Map();
    
    /** @type {Map<string, Function[]>} Event handlers by event name */
    this.eventHandlers = new Map();
    
    this.loadFromStorage();
  }

  /**
   * Adds a new task to the matrix after validation.
   * Automatically saves to storage and emits 'taskAdded' event.
   * 
   * @param {Object|Task} taskData - Task data object or Task instance
   * @param {string} taskData.name - Task name (required)
   * @param {string} [taskData.description] - Task description
   * @param {boolean} [taskData.importance] - Task importance flag
   * @param {boolean} [taskData.urgency] - Task urgency flag
   * @returns {Task} The created and added task
   * @throws {Error} If task validation fails
   */
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

  /**
   * Updates an existing task with new data.
   * Validates the update and saves to storage. Emits 'taskUpdated' event.
   * 
   * @param {string} taskId - ID of the task to update
   * @param {Object} updateData - Object containing fields to update
   * @param {string} [updateData.name] - New task name
   * @param {string} [updateData.description] - New task description
   * @param {boolean} [updateData.importance] - New importance flag
   * @param {boolean} [updateData.urgency] - New urgency flag
   * @param {boolean} [updateData.completed] - New completion status
   * @returns {Task} The updated task
   * @throws {Error} If task not found or validation fails
   */
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

  /**
   * Removes a task from the matrix.
   * Saves to storage and emits 'taskDeleted' event.
   * 
   * @param {string} taskId - ID of the task to delete
   * @returns {Task} The deleted task
   * @throws {Error} If task not found
   */
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

  /**
   * Retrieves a task by its ID.
   * 
   * @param {string} taskId - ID of the task to retrieve
   * @returns {Task|undefined} The task if found, undefined otherwise
   */
  getTask(taskId) {
    return this.tasks.get(taskId);
  }

  /**
   * Gets all tasks as an array.
   * 
   * @returns {Task[]} Array of all tasks in the matrix
   */
  getAllTasks() {
    return Array.from(this.tasks.values());
  }

  /**
   * Gets tasks filtered by quadrant(s).
   * 
   * @param {number|null} [quadrant=null] - Specific quadrant (1-4) or null for all quadrants
   * @returns {Task[]|Object} Array of tasks for specific quadrant, or object with all quadrants
   * @returns {Task[]} returns.1 - Q1: Important & Urgent (Do First)
   * @returns {Task[]} returns.2 - Q2: Important & Not Urgent (Schedule)  
   * @returns {Task[]} returns.3 - Q3: Not Important & Urgent (Delegate)
   * @returns {Task[]} returns.4 - Q4: Not Important & Not Urgent (Eliminate)
   */
  getTasksByQuadrant(quadrant = null) {
    const allTasks = this.getAllTasks();

    if (quadrant !== null) {
      return allTasks.filter(task => task.quadrant === quadrant);
    }

    // Return tasks grouped by all quadrants
    return {
      1: allTasks.filter(task => task.quadrant === 1), // Do First
      2: allTasks.filter(task => task.quadrant === 2), // Schedule
      3: allTasks.filter(task => task.quadrant === 3), // Delegate
      4: allTasks.filter(task => task.quadrant === 4)  // Eliminate
    };
  }

  /**
   * Gets all completed tasks.
   * 
   * @returns {Task[]} Array of completed tasks
   */
  getCompletedTasks() {
    return this.getAllTasks().filter(task => task.completed);
  }

  /**
   * Gets all pending (incomplete) tasks.
   * 
   * @returns {Task[]} Array of pending tasks
   */
  getPendingTasks() {
    return this.getAllTasks().filter(task => !task.completed);
  }

  /**
   * Gets all overdue tasks (Q1 tasks older than 7 days).
   * 
   * @returns {Task[]} Array of overdue tasks
   */
  getOverdueTasks() {
    return this.getAllTasks().filter(task => task.isOverdue());
  }

  /**
   * Filters tasks by importance level.
   * 
   * @param {boolean} importance - True for important tasks, false for not important
   * @returns {Task[]} Array of tasks matching the importance criteria
   */
  getTasksByImportance(importance) {
    return this.getAllTasks().filter(task => task.importance === importance);
  }

  /**
   * Filters tasks by urgency level.
   * 
   * @param {boolean} urgency - True for urgent tasks, false for not urgent
   * @returns {Task[]} Array of tasks matching the urgency criteria
   */
  getTasksByUrgency(urgency) {
    return this.getAllTasks().filter(task => task.urgency === urgency);
  }

  /**
   * Searches tasks by name and description using case-insensitive matching.
   * 
   * @param {string} query - Search term to match against task name and description
   * @returns {Task[]} Array of tasks matching the search query
   */
  searchTasks(query) {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return [];

    return this.getAllTasks().filter(task => {
      return task.name.toLowerCase().includes(searchTerm) ||
             task.description.toLowerCase().includes(searchTerm);
    });
  }

  /**
   * Sorts tasks by priority score with optional battle mode integration.
   * For Q1 (Do First) tasks, uses battle results if available for more accurate prioritization.
   * 
   * @param {Task[]|null} [tasks=null] - Tasks to sort, or null to sort all tasks
   * @param {number|null} [quadrant=null] - Specific quadrant for specialized sorting logic
   * @returns {Task[]} Array of tasks sorted by priority (highest priority first)
   */
  sortTasksByPriority(tasks = null, quadrant = null) {
    const tasksToSort = tasks || this.getAllTasks();

    // For Do First quadrant (quadrant 1), try to use battle results for "The One" prioritization
    if (quadrant === 1) {
      return this.sortTasksWithBattleResults(tasksToSort);
    }

    // Default priority score sorting for other quadrants
    return tasksToSort.sort((a, b) => b.getPriorityScore() - a.getPriorityScore());
  }

  /**
   * Sorts tasks using battle mode results for more accurate priority ranking.
   * Falls back to priority score sorting if no battle results are available.
   * 
   * @param {Task[]} tasks - Tasks to sort using battle results
   * @returns {Task[]} Tasks sorted by battle ranking, then by priority score
   */
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

      // If both tasks have battle rankings, use battle order (lower position = higher rank)
      if (aRanking && bRanking) {
        return aRanking.position - bRanking.position;
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