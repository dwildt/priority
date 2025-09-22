import I18n from './i18n.js';
import Matrix from './matrix.js';
import BattleMode from './battle.js';

class PriorityMatrixApp {
  constructor() {
    this.i18n = new I18n();
    this.matrix = new Matrix();
    this.battleMode = null;
    this.currentEditingTask = null;

    // DOM elements
    this.elements = {};

    this.init();
  }

  async init() {
    try {
      // Initialize i18n
      await this.i18n.init();

      // Cache DOM elements
      this.cacheElements();

      // Set up event listeners
      this.setupEventListeners();

      // Render initial state
      this.renderMatrix();

      console.log('Priority Matrix App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.showError('Failed to initialize application');
    }
  }

  cacheElements() {
    this.elements = {
      // Buttons
      addTaskBtn: document.getElementById('add-task-btn'),
      generateReportBtn: document.getElementById('generate-report-btn'),
      battleModeBtn: document.querySelector('.battle-mode-btn'),

      // Modals
      taskModal: document.getElementById('task-modal'),
      battleModal: document.getElementById('battle-modal'),
      reportModal: document.getElementById('report-modal'),

      // Task form
      taskForm: document.getElementById('task-form'),
      taskName: document.getElementById('task-name'),
      taskDescription: document.getElementById('task-description'),
      importanceToggle: document.getElementById('importance-toggle'),
      urgencyToggle: document.getElementById('urgency-toggle'),

      // Battle mode
      battleComparison: document.getElementById('battle-comparison'),
      battleResult: document.getElementById('battle-result'),
      battleTaskA: document.getElementById('battle-task-a'),
      battleTaskB: document.getElementById('battle-task-b'),
      chooseA: document.getElementById('choose-a'),
      chooseB: document.getElementById('choose-b'),
      battleProgress: document.getElementById('battle-progress'),
      battleProgressText: document.getElementById('battle-progress-text'),

      // Quadrants
      quadrant1: document.querySelector('[data-quadrant="1"] .task-list'),
      quadrant2: document.querySelector('[data-quadrant="2"] .task-list'),
      quadrant3: document.querySelector('[data-quadrant="3"] .task-list'),
      quadrant4: document.querySelector('[data-quadrant="4"] .task-list'),

      // Other
      loading: document.getElementById('loading'),
      theOneDisplay: document.getElementById('the-one-display'),
      printReportBtn: document.getElementById('print-report-btn')
    };
  }

  setupEventListeners() {
    // Add task button
    this.elements.addTaskBtn?.addEventListener('click', () => this.openTaskModal());

    // Generate report button
    this.elements.generateReportBtn?.addEventListener('click', () => this.generateReport());

    // Print report button
    this.elements.printReportBtn?.addEventListener('click', () => this.printReport());

    // Battle mode button
    this.elements.battleModeBtn?.addEventListener('click', () => this.startBattleMode());

    // Task form
    this.elements.taskForm?.addEventListener('submit', (e) => this.handleTaskSubmit(e));

    // Toggle updates - no need for value display since it's visual

    // Battle mode choices
    this.elements.chooseA?.addEventListener('click', () => this.handleBattleChoice('A'));
    this.elements.chooseB?.addEventListener('click', () => this.handleBattleChoice('B'));

    // Modal close buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
    });

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal);
        }
      });
    });

    // Matrix events
    this.matrix.on('taskAdded', () => this.renderMatrix());
    this.matrix.on('taskUpdated', () => this.renderMatrix());
    this.matrix.on('taskDeleted', () => this.renderMatrix());

    // Language change
    document.addEventListener('languageChanged', () => this.renderMatrix());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
  }

  openTaskModal(task = null) {
    this.currentEditingTask = task;

    if (task) {
      // Edit mode
      this.elements.taskName.value = task.name;
      this.elements.taskDescription.value = task.description;
      this.elements.importanceToggle.checked = task.importance;
      this.elements.urgencyToggle.checked = task.urgency;
    } else {
      // Add mode
      this.elements.taskForm.reset();
      this.elements.importanceToggle.checked = false;
      this.elements.urgencyToggle.checked = false;
    }

    this.showModal(this.elements.taskModal);
  }

  handleTaskSubmit(e) {
    e.preventDefault();

    const taskData = {
      name: this.elements.taskName.value.trim(),
      description: this.elements.taskDescription.value.trim(),
      importance: this.elements.importanceToggle.checked,
      urgency: this.elements.urgencyToggle.checked
    };

    try {
      if (this.currentEditingTask) {
        // Update existing task
        this.matrix.updateTask(this.currentEditingTask.id, taskData);
        this.showSuccess(this.i18n.t('messages.task_updated'));
      } else {
        // Add new task
        this.matrix.addTask(taskData);
        this.showSuccess(this.i18n.t('messages.task_added'));
      }

      this.closeModal(this.elements.taskModal);
      this.currentEditingTask = null;
    } catch (error) {
      console.error('Error saving task:', error);
      this.showError(error.message);
    }
  }

  renderMatrix() {
    const quadrants = this.matrix.getTasksByQuadrant();

    // Render each quadrant
    Object.keys(quadrants).forEach(quadrantNum => {
      const quadrantElement = this.elements[`quadrant${quadrantNum}`];
      if (quadrantElement) {
        this.renderQuadrant(quadrantElement, quadrants[quadrantNum]);
      }
    });

    // Update battle mode button visibility
    this.updateBattleModeButton();

    // Update "The One" display
    this.updateTheOneDisplay();
  }

  renderQuadrant(element, tasks) {
    element.innerHTML = '';

    if (tasks.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-quadrant';
      emptyMessage.textContent = this.i18n.t('matrix.empty_quadrant');
      element.appendChild(emptyMessage);
      return;
    }

    // Sort tasks by priority
    const sortedTasks = this.matrix.sortTasksByPriority(tasks);

    sortedTasks.forEach(task => {
      const taskElement = this.createTaskElement(task);
      element.appendChild(taskElement);
    });
  }

  createTaskElement(task) {
    const taskEl = document.createElement('div');
    taskEl.className = `task-item ${task.completed ? 'completed' : ''}`;
    taskEl.setAttribute('data-cy', 'task-item');
    taskEl.setAttribute('data-task-id', task.id);

    const priorityClass = this.getPriorityClass(task);
    taskEl.classList.add(priorityClass);

    taskEl.innerHTML = `
      <div class="task-content">
        <h4 class="task-name">${this.escapeHtml(task.name)}</h4>
        ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
        <div class="task-meta">
          <span class="importance">I: ${task.getImportanceLabel()}</span>
          <span class="urgency">U: ${task.getUrgencyLabel()}</span>
          <span class="age">${task.getAgeInDays()}d</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="btn-icon edit-btn" data-cy="edit-btn" title="${this.i18n.t('buttons.edit')}">✏️</button>
        <button class="btn-icon delete-btn" data-cy="delete-btn" title="${this.i18n.t('buttons.delete')}">🗑️</button>
        <button class="btn-icon complete-btn" data-cy="complete-btn" title="${task.completed ? this.i18n.t('buttons.uncomplete') : this.i18n.t('buttons.complete')}">
          ${task.completed ? '↩️' : '✅'}
        </button>
      </div>
    `;

    // Add event listeners
    taskEl.querySelector('.edit-btn').addEventListener('click', () => this.openTaskModal(task));
    taskEl.querySelector('.delete-btn').addEventListener('click', () => this.deleteTask(task.id));
    taskEl.querySelector('.complete-btn').addEventListener('click', () => this.toggleTaskComplete(task.id));

    return taskEl;
  }

  getPriorityClass(task) {
    const score = task.getPriorityScore();
    if (score >= 12) return 'priority-critical';
    if (score >= 10) return 'priority-high';
    if (score >= 7) return 'priority-medium';
    return 'priority-low';
  }

  updateBattleModeButton() {
    const urgentImportantTasks = this.matrix.getTasksByQuadrant(1).filter(task => !task.completed);
    this.elements.battleModeBtn.style.display = urgentImportantTasks.length >= 2 ? 'block' : 'none';
  }

  startBattleMode() {
    const urgentImportantTasks = this.matrix.getTasksByQuadrant(1).filter(task => !task.completed);

    if (urgentImportantTasks.length < 2) {
      this.showError(this.i18n.t('battle.not_enough_tasks'));
      return;
    }

    try {
      this.battleMode = new BattleMode(urgentImportantTasks);
      this.showBattleComparison();
      this.showModal(this.elements.battleModal);
    } catch (error) {
      console.error('Error starting battle mode:', error);
      this.showError(error.message);
    }
  }

  showBattleComparison() {
    const pair = this.battleMode.getCurrentPair();
    if (!pair) {
      this.showBattleResult();
      return;
    }

    // Update progress
    const progress = this.battleMode.getProgress();
    this.elements.battleProgress.style.width = `${progress.percentage}%`;
    this.elements.battleProgressText.textContent = `${progress.current} / ${progress.total}`;

    // Show tasks
    this.elements.battleTaskA.innerHTML = this.createBattleTaskCard(pair.taskA);
    this.elements.battleTaskB.innerHTML = this.createBattleTaskCard(pair.taskB);

    // Show comparison UI
    this.elements.battleComparison.style.display = 'block';
    this.elements.battleResult.style.display = 'none';
  }

  createBattleTaskCard(task) {
    return `
      <div class="battle-task-card">
        <h5>${this.escapeHtml(task.name)}</h5>
        ${task.description ? `<p>${this.escapeHtml(task.description)}</p>` : ''}
        <div class="task-details">
          <span>Importance: ${task.getImportanceLabel()}</span>
          <span>Urgency: ${task.getUrgencyLabel()}</span>
          <span>Age: ${task.getAgeInDays()} days</span>
        </div>
      </div>
    `;
  }

  handleBattleChoice(choice) {
    const pair = this.battleMode.getCurrentPair();
    if (!pair) return;

    const winner = choice === 'A' ? pair.taskA : pair.taskB;
    const loser = choice === 'A' ? pair.taskB : pair.taskA;

    try {
      const result = this.battleMode.recordComparison(winner.id, loser.id);

      if (result.isComplete) {
        this.showBattleResult();
      } else {
        this.showBattleComparison();
      }
    } catch (error) {
      console.error('Error recording battle choice:', error);
      this.showError(error.message);
    }
  }

  showBattleResult() {
    const theOne = this.battleMode.getTheOne();
    const upNext = this.battleMode.getUpNext(3);

    this.elements.battleComparison.style.display = 'none';
    this.elements.battleResult.style.display = 'block';

    const resultHTML = `
      <div class="battle-the-one-result">
        <h4>${this.i18n.t('reports.the_one')}</h4>
        ${theOne ? this.createBattleResultCard(theOne) : '<p>No winner determined</p>'}
      </div>
      <div class="battle-up-next-result">
        <h4>${this.i18n.t('reports.up_next')}</h4>
        ${upNext.map(item => this.createBattleResultCard(item)).join('')}
      </div>
    `;

    document.getElementById('battle-the-one').innerHTML = resultHTML;

    // Update the main display
    this.updateTheOneDisplay();
  }

  createBattleResultCard(rankingItem) {
    const { task, score, wins, losses, winRate } = rankingItem;
    return `
      <div class="battle-result-card">
        <h5>${this.escapeHtml(task.name)}</h5>
        <div class="battle-stats">
          <span>Score: ${score}</span>
          <span>Win Rate: ${winRate}%</span>
          <span>Wins: ${wins}</span>
          <span>Losses: ${losses}</span>
        </div>
      </div>
    `;
  }

  updateTheOneDisplay() {
    // Check if we have a "The One" from recent battle
    const urgentTasks = this.matrix.getTasksByQuadrant(1);
    const sortedTasks = this.matrix.sortTasksByPriority(urgentTasks);

    if (sortedTasks.length > 0) {
      const theOne = sortedTasks[0];
      this.elements.theOneDisplay.style.display = 'block';
      document.getElementById('the-one-task').innerHTML = this.createTaskElement(theOne).outerHTML;
    } else {
      this.elements.theOneDisplay.style.display = 'none';
    }
  }

  generateReport() {
    const stats = this.matrix.getStatistics();
    const quadrants = this.matrix.getTasksByQuadrant();
    const theOneTask = this.matrix.sortTasksByPriority(quadrants[1])[0];
    const upNext = this.matrix.sortTasksByPriority(quadrants[1]).slice(1, 4);

    const reportHTML = `
      <div class="report-header">
        <h1>${this.i18n.t('reports.title')}</h1>
        <p>${this.i18n.t('reports.generated_on')}: ${new Date().toLocaleDateString()}</p>
      </div>

      ${theOneTask ? `
        <div class="report-section">
          <h2>${this.i18n.t('reports.the_one')}</h2>
          <div class="report-task-card">
            <h3>${this.escapeHtml(theOneTask.name)}</h3>
            ${theOneTask.description ? `<p>${this.escapeHtml(theOneTask.description)}</p>` : ''}
            <div class="task-details">
              <span>Importance: ${theOneTask.getImportanceLabel()}</span>
              <span>Urgency: ${theOneTask.getUrgencyLabel()}</span>
              <span>Priority Score: ${theOneTask.getPriorityScore()}</span>
            </div>
          </div>
        </div>
      ` : ''}

      ${upNext.length > 0 ? `
        <div class="report-section">
          <h2>${this.i18n.t('reports.up_next')}</h2>
          ${upNext.map(task => `
            <div class="report-task-card">
              <h4>${this.escapeHtml(task.name)}</h4>
              ${task.description ? `<p>${this.escapeHtml(task.description)}</p>` : ''}
              <div class="task-details">
                <span>Importance: ${task.getImportanceLabel()}</span>
                <span>Urgency: ${task.getUrgencyLabel()}</span>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="report-section">
        <h2>${this.i18n.t('reports.matrix_overview')}</h2>
        <div class="report-matrix">
          ${Object.keys(quadrants).map(q => `
            <div class="report-quadrant">
              <h4>${this.i18n.t(`matrix.quadrants.quadrant_${q}`)}</h4>
              <p>${quadrants[q].length} tasks</p>
              ${quadrants[q].length > 0 ? quadrants[q].map(task => `
                <div class="report-task-item">
                  <strong>${this.escapeHtml(task.name)}</strong>
                  ${task.description ? `<br><small>${this.escapeHtml(task.description)}</small>` : ''}
                  <br><small>Priority: ${task.getPriorityScore()} | Age: ${task.getAgeInDays()}d</small>
                </div>
              `).join('') : '<div class="report-task-item"><em>No tasks in this quadrant</em></div>'}
            </div>
          `).join('')}
        </div>
      </div>

      <div class="report-section">
        <h2>Statistics</h2>
        <div class="report-stats">
          <div>Total Tasks: ${stats.total}</div>
          <div>Completed: ${stats.completed}</div>
          <div>Pending: ${stats.pending}</div>
          <div>Overdue: ${stats.overdue}</div>
          <div>Completion Rate: ${stats.completionRate.toFixed(1)}%</div>
          <div>Avg Importance: ${stats.averageImportance.toFixed(1)}</div>
        </div>

        <h3>Quadrant Distribution</h3>
        <div class="report-stats">
          <div>Do First (Q1): ${stats.quadrantCounts[1]} tasks</div>
          <div>Schedule (Q2): ${stats.quadrantCounts[2]} tasks</div>
          <div>Delegate (Q3): ${stats.quadrantCounts[3]} tasks</div>
          <div>Eliminate (Q4): ${stats.quadrantCounts[4]} tasks</div>
        </div>
      </div>
    `;

    document.getElementById('report-content').innerHTML = reportHTML;
    this.showModal(this.elements.reportModal);
  }

  printReport() {
    // Add class to body to hide main content during print
    document.body.classList.add('printing-report');

    // Print the page
    window.print();

    // Remove the class after printing
    setTimeout(() => {
      document.body.classList.remove('printing-report');
    }, 1000);
  }

  deleteTask(taskId) {
    if (confirm(this.i18n.t('messages.confirm_delete'))) {
      try {
        this.matrix.deleteTask(taskId);
        this.showSuccess(this.i18n.t('messages.task_deleted'));
      } catch (error) {
        console.error('Error deleting task:', error);
        this.showError(error.message);
      }
    }
  }

  toggleTaskComplete(taskId) {
    try {
      const task = this.matrix.getTask(taskId);
      this.matrix.updateTask(taskId, { completed: !task.completed });
      this.showSuccess(task.completed ? this.i18n.t('messages.task_uncompleted') : this.i18n.t('messages.task_completed'));
    } catch (error) {
      console.error('Error toggling task completion:', error);
      this.showError(error.message);
    }
  }

  handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + N: New task
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      this.openTaskModal();
    }

    // Escape: Close modals
    if (e.key === 'Escape') {
      const openModal = document.querySelector('.modal[style*="block"]');
      if (openModal) {
        this.closeModal(openModal);
      }
    }
  }

  showModal(modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type = 'info') {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new PriorityMatrixApp();
});

export default PriorityMatrixApp;