/**
 * @fileoverview Example extensions for Priority Matrix project.
 * These examples show GitHub Copilot how to extend the project with new features
 * while maintaining the existing code patterns and architecture.
 * 
 * This file is for documentation purposes only and is not part of the runtime.
 */

/**
 * Example 1: Adding a new task property for tracking time estimates
 */
class TaskWithTimeEstimate extends Task {
  /**
   * Extended Task class with time estimation support.
   * 
   * @param {Object} data - Task data including time estimate
   * @param {number} [data.estimatedHours=0] - Estimated hours to complete
   */
  constructor(data = {}) {
    super(data);
    this.estimatedHours = data.estimatedHours || 0;
  }

  /**
   * Calculates priority score with time estimation factor.
   * Shorter tasks get slight priority boost for quick wins.
   * 
   * @returns {number} Enhanced priority score
   */
  getPriorityScore() {
    let score = super.getPriorityScore();
    
    // Quick wins bonus: tasks under 1 hour get priority boost
    if (this.estimatedHours > 0 && this.estimatedHours <= 1) {
      score += 0.5;
    }
    
    return score;
  }

  /**
   * Validates task including time estimate constraints.
   * 
   * @returns {TaskValidationResult} Enhanced validation result
   */
  validate() {
    const result = super.validate();
    
    if (this.estimatedHours < 0) {
      result.errors.push('Estimated hours cannot be negative');
      result.isValid = false;
    }
    
    if (this.estimatedHours > 100) {
      result.errors.push('Estimated hours seems too large (max 100)');
      result.isValid = false;
    }
    
    return result;
  }
}

/**
 * Example 2: Adding a notification system for overdue tasks
 */
class NotificationManager {
  /**
   * Manages task notifications and reminders.
   * 
   * @param {Matrix} matrix - Task matrix instance
   */
  constructor(matrix) {
    this.matrix = matrix;
    this.notificationQueue = [];
    this.isEnabled = this.getNotificationPermission();
  }

  /**
   * Checks for overdue tasks and sends notifications.
   */
  checkOverdueTasks() {
    const overdueTasks = this.matrix.getOverdueTasks();
    
    overdueTasks.forEach(task => {
      if (!this.hasNotificationBeenSent(task.id)) {
        this.queueNotification({
          title: 'Overdue Task',
          body: `"${task.name}" is overdue and needs attention`,
          taskId: task.id,
          type: 'overdue'
        });
      }
    });
    
    this.processNotificationQueue();
  }

  /**
   * Queues a notification for processing.
   * 
   * @param {Object} notification - Notification data
   * @param {string} notification.title - Notification title
   * @param {string} notification.body - Notification body
   * @param {string} notification.taskId - Associated task ID
   * @param {string} notification.type - Notification type
   */
  queueNotification(notification) {
    this.notificationQueue.push({
      ...notification,
      timestamp: Date.now()
    });
  }

  /**
   * Processes queued notifications if permission granted.
   */
  async processNotificationQueue() {
    if (!this.isEnabled || this.notificationQueue.length === 0) {
      return;
    }

    while (this.notificationQueue.length > 0) {
      const notification = this.notificationQueue.shift();
      await this.sendNotification(notification);
    }
  }

  /**
   * Sends a browser notification.
   * 
   * @param {Object} notification - Notification to send
   */
  async sendNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.body,
        icon: '/favicon.ico',
        tag: `task-${notification.taskId}`
      });
      
      this.markNotificationSent(notification.taskId, notification.type);
    }
  }

  /**
   * Checks notification permission status.
   * 
   * @returns {boolean} True if notifications are enabled
   */
  getNotificationPermission() {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  /**
   * Requests notification permission from user.
   * 
   * @returns {Promise<boolean>} True if permission granted
   */
  async requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.isEnabled = permission === 'granted';
      return this.isEnabled;
    }
    return false;
  }

  /**
   * Checks if notification has already been sent for a task.
   * 
   * @param {string} taskId - Task ID to check
   * @returns {boolean} True if notification was already sent
   */
  hasNotificationBeenSent(taskId) {
    const sent = localStorage.getItem(`notification-sent-${taskId}`);
    return sent === 'true';
  }

  /**
   * Marks a notification as sent to avoid duplicates.
   * 
   * @param {string} taskId - Task ID
   * @param {string} type - Notification type
   */
  markNotificationSent(taskId, type) {
    localStorage.setItem(`notification-sent-${taskId}`, 'true');
    localStorage.setItem(`notification-sent-${taskId}-type`, type);
  }
}

/**
 * Example 3: Adding task analytics and insights
 */
class TaskAnalytics {
  /**
   * Provides insights and analytics for task management patterns.
   * 
   * @param {Matrix} matrix - Task matrix instance
   */
  constructor(matrix) {
    this.matrix = matrix;
  }

  /**
   * Analyzes task creation patterns over time.
   * 
   * @returns {Object} Task creation analytics
   */
  getCreationPatterns() {
    const tasks = this.matrix.getAllTasks();
    const now = new Date();
    const patterns = {
      daily: this.groupTasksByTimeframe(tasks, 'day'),
      weekly: this.groupTasksByTimeframe(tasks, 'week'),
      monthly: this.groupTasksByTimeframe(tasks, 'month')
    };

    return {
      patterns,
      insights: this.generateCreationInsights(patterns),
      totalTasks: tasks.length
    };
  }

  /**
   * Analyzes completion rates by quadrant.
   * 
   * @returns {Object} Completion rate analytics
   */
  getCompletionAnalytics() {
    const quadrants = this.matrix.getTasksByQuadrant();
    const analytics = {};

    Object.entries(quadrants).forEach(([quadrant, tasks]) => {
      const completed = tasks.filter(task => task.completed).length;
      const total = tasks.length;
      
      analytics[quadrant] = {
        total,
        completed,
        pending: total - completed,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
        averageAgeCompleted: this.calculateAverageAge(
          tasks.filter(task => task.completed)
        )
      };
    });

    return analytics;
  }

  /**
   * Provides productivity insights and recommendations.
   * 
   * @returns {Object} Productivity insights
   */
  getProductivityInsights() {
    const statistics = this.matrix.getStatistics();
    const completionAnalytics = this.getCompletionAnalytics();
    const insights = [];

    // Quadrant 1 (Do First) insights
    if (completionAnalytics[1].total > completionAnalytics[2].total) {
      insights.push({
        type: 'warning',
        message: 'You have more crisis tasks than planned tasks. Consider spending more time on Quadrant 2 (Schedule) for better long-term planning.',
        action: 'Focus on prevention and planning activities'
      });
    }

    // Quadrant 4 (Eliminate) insights  
    if (completionAnalytics[4].total > statistics.total * 0.1) {
      insights.push({
        type: 'suggestion',
        message: 'You have many low-priority tasks. Consider eliminating or delegating these to focus on what matters most.',
        action: 'Review and eliminate time-wasting activities'
      });
    }

    // Completion rate insights
    if (statistics.completionRate < 50) {
      insights.push({
        type: 'tip',
        message: 'Your completion rate is below 50%. Try breaking large tasks into smaller, manageable pieces.',
        action: 'Break tasks into smaller chunks'
      });
    }

    return {
      insights,
      overallScore: this.calculateProductivityScore(statistics, completionAnalytics),
      recommendations: this.generateRecommendations(statistics, completionAnalytics)
    };
  }

  /**
   * Groups tasks by time frame for pattern analysis.
   * 
   * @param {Task[]} tasks - Tasks to analyze
   * @param {string} timeframe - 'day', 'week', or 'month'
   * @returns {Object} Grouped task data
   */
  groupTasksByTimeframe(tasks, timeframe) {
    const groups = {};
    
    tasks.forEach(task => {
      const date = new Date(task.created);
      let key;
      
      switch (timeframe) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(task);
    });
    
    return groups;
  }

  /**
   * Calculates average age of completed tasks.
   * 
   * @param {Task[]} tasks - Completed tasks
   * @returns {number} Average age in days
   */
  calculateAverageAge(tasks) {
    if (tasks.length === 0) return 0;
    
    const totalAge = tasks.reduce((sum, task) => sum + task.getAgeInDays(), 0);
    return Math.round(totalAge / tasks.length);
  }

  /**
   * Generates insights about task creation patterns.
   * 
   * @param {Object} patterns - Task creation patterns
   * @returns {string[]} Array of insight messages
   */
  generateCreationInsights(patterns) {
    const insights = [];
    
    // Analyze daily patterns
    const dailyData = Object.values(patterns.daily);
    if (dailyData.length > 0) {
      const avgTasksPerDay = dailyData.reduce((sum, tasks) => sum + tasks.length, 0) / dailyData.length;
      
      if (avgTasksPerDay > 5) {
        insights.push('You create many tasks daily. Consider batching similar tasks together.');
      } else if (avgTasksPerDay < 1) {
        insights.push('You create tasks infrequently. Regular task capture might improve your productivity.');
      }
    }
    
    return insights;
  }

  /**
   * Calculates overall productivity score.
   * 
   * @param {Object} statistics - Matrix statistics
   * @param {Object} completionAnalytics - Completion analytics
   * @returns {number} Productivity score (0-100)
   */
  calculateProductivityScore(statistics, completionAnalytics) {
    let score = 0;
    
    // Completion rate factor (40% of score)
    score += (statistics.completionRate / 100) * 40;
    
    // Quadrant distribution factor (30% of score)
    const idealQ2Ratio = 0.4; // 40% should be in Q2 (Schedule)
    const q2Ratio = completionAnalytics[2].total / statistics.total;
    const q2Score = Math.max(0, 30 - Math.abs(q2Ratio - idealQ2Ratio) * 100);
    score += q2Score;
    
    // Low priority task ratio factor (20% of score)
    const q4Ratio = completionAnalytics[4].total / statistics.total;
    const q4Score = Math.max(0, 20 - (q4Ratio * 100));
    score += q4Score;
    
    // Overdue task penalty (10% of score)
    const overdueRatio = statistics.overdue / statistics.total;
    const overdueScore = Math.max(0, 10 - (overdueRatio * 50));
    score += overdueScore;
    
    return Math.round(score);
  }

  /**
   * Generates personalized recommendations.
   * 
   * @param {Object} statistics - Matrix statistics
   * @param {Object} completionAnalytics - Completion analytics
   * @returns {string[]} Array of recommendations
   */
  generateRecommendations(statistics, completionAnalytics) {
    const recommendations = [];
    
    // Focus area recommendations
    if (completionAnalytics[1].total > completionAnalytics[2].total) {
      recommendations.push('Spend more time on Quadrant 2 (Schedule) tasks to prevent future crises');
    }
    
    if (completionAnalytics[3].total > statistics.total * 0.15) {
      recommendations.push('Consider delegating some Quadrant 3 (Delegate) tasks to free up time for important work');
    }
    
    // Time management recommendations
    if (statistics.completionRate < 60) {
      recommendations.push('Break large tasks into smaller, actionable steps to improve completion rates');
    }
    
    if (statistics.overdue > 0) {
      recommendations.push('Set up regular review sessions to catch tasks before they become overdue');
    }
    
    return recommendations;
  }
}

/**
 * Example 4: Adding keyboard shortcuts and accessibility enhancements
 */
class AccessibilityManager {
  /**
   * Manages keyboard shortcuts and accessibility features.
   * 
   * @param {PriorityMatrixApp} app - Main application instance
   */
  constructor(app) {
    this.app = app;
    this.shortcuts = new Map();
    this.setupDefaultShortcuts();
  }

  /**
   * Sets up default keyboard shortcuts.
   */
  setupDefaultShortcuts() {
    // Task management shortcuts
    this.addShortcut('ctrl+n', () => this.app.openTaskModal(), 'Create new task');
    this.addShortcut('ctrl+s', () => this.app.saveCurrentTask(), 'Save current task');
    this.addShortcut('escape', () => this.app.closeAllModals(), 'Close modals');
    
    // Navigation shortcuts
    this.addShortcut('ctrl+1', () => this.focusQuadrant(1), 'Focus Quadrant 1');
    this.addShortcut('ctrl+2', () => this.focusQuadrant(2), 'Focus Quadrant 2');
    this.addShortcut('ctrl+3', () => this.focusQuadrant(3), 'Focus Quadrant 3');
    this.addShortcut('ctrl+4', () => this.focusQuadrant(4), 'Focus Quadrant 4');
    
    // Report shortcuts
    this.addShortcut('ctrl+r', () => this.app.generateReport(), 'Generate report');
    this.addShortcut('ctrl+b', () => this.app.startBattleMode(), 'Start battle mode');
    
    // Language shortcuts
    this.addShortcut('ctrl+shift+e', () => this.app.i18n.setLanguage('en'), 'Switch to English');
    this.addShortcut('ctrl+shift+p', () => this.app.i18n.setLanguage('pt'), 'Switch to Portuguese');
    this.addShortcut('ctrl+shift+s', () => this.app.i18n.setLanguage('es'), 'Switch to Spanish');
  }

  /**
   * Adds a keyboard shortcut.
   * 
   * @param {string} keys - Key combination (e.g., 'ctrl+n')
   * @param {Function} handler - Function to execute
   * @param {string} description - Description for help
   */
  addShortcut(keys, handler, description) {
    this.shortcuts.set(keys, { handler, description });
  }

  /**
   * Handles keyboard events and executes shortcuts.
   * 
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyboard(event) {
    const keys = this.getKeyString(event);
    const shortcut = this.shortcuts.get(keys);
    
    if (shortcut) {
      event.preventDefault();
      shortcut.handler();
    }
  }

  /**
   * Converts keyboard event to string representation.
   * 
   * @param {KeyboardEvent} event - Keyboard event
   * @returns {string} Key combination string
   */
  getKeyString(event) {
    const parts = [];
    
    if (event.ctrlKey) parts.push('ctrl');
    if (event.shiftKey) parts.push('shift');
    if (event.altKey) parts.push('alt');
    if (event.metaKey) parts.push('meta');
    
    parts.push(event.key.toLowerCase());
    
    return parts.join('+');
  }

  /**
   * Focuses on a specific quadrant.
   * 
   * @param {number} quadrantNumber - Quadrant to focus (1-4)
   */
  focusQuadrant(quadrantNumber) {
    const quadrant = document.querySelector(`[data-quadrant="${quadrantNumber}"]`);
    if (quadrant) {
      quadrant.focus();
      quadrant.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Shows help modal with available shortcuts.
   */
  showKeyboardHelp() {
    const shortcuts = Array.from(this.shortcuts.entries())
      .map(([keys, { description }]) => `${keys}: ${description}`)
      .join('\n');
    
    alert(`Keyboard Shortcuts:\n\n${shortcuts}`);
  }
}

// These examples show GitHub Copilot the patterns and conventions used in this project.
// When extending the real application, follow these same patterns for consistency.