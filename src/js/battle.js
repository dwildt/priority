class BattleMode {
  constructor(tasks = []) {
    this.tasks = [...tasks];
    this.comparisons = new Map();
    this.pairs = [];
    this.currentPairIndex = 0;
    this.scores = new Map();
    this.isComplete = false;

    this.initializeScores();
    this.generatePairs();
  }

  initializeScores() {
    this.tasks.forEach(task => {
      this.scores.set(task.id, {
        wins: 0,
        losses: 0,
        comparisons: 0,
        score: 0
      });
    });
  }

  generatePairs() {
    this.pairs = [];

    // Generate all possible pairs (combinations)
    for (let i = 0; i < this.tasks.length; i++) {
      for (let j = i + 1; j < this.tasks.length; j++) {
        this.pairs.push({
          taskA: this.tasks[i],
          taskB: this.tasks[j],
          completed: false
        });
      }
    }

    // Shuffle pairs for random order
    this.shufflePairs();
  }

  shufflePairs() {
    for (let i = this.pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.pairs[i], this.pairs[j]] = [this.pairs[j], this.pairs[i]];
    }
  }

  getCurrentPair() {
    if (this.currentPairIndex >= this.pairs.length) {
      return null;
    }
    return this.pairs[this.currentPairIndex];
  }

  recordComparison(winnerTaskId, loserTaskId) {
    const pair = this.getCurrentPair();
    if (!pair) {
      throw new Error('No active comparison');
    }

    const { taskA, taskB } = pair;
    const validWinner = winnerTaskId === taskA.id || winnerTaskId === taskB.id;
    const validLoser = loserTaskId === taskA.id || loserTaskId === taskB.id;

    if (!validWinner || !validLoser || winnerTaskId === loserTaskId) {
      throw new Error('Invalid comparison result');
    }

    // Record the comparison
    const comparisonKey = this.getComparisonKey(taskA.id, taskB.id);
    this.comparisons.set(comparisonKey, {
      winner: winnerTaskId,
      loser: loserTaskId,
      timestamp: new Date()
    });

    // Update scores
    this.updateScores(winnerTaskId, loserTaskId);

    // Mark pair as completed
    pair.completed = true;

    // Move to next pair
    this.currentPairIndex++;

    // Check if battle is complete
    if (this.currentPairIndex >= this.pairs.length) {
      this.isComplete = true;
      this.calculateFinalRankings();
      this.saveBattleResults();
    }

    return {
      isComplete: this.isComplete,
      progress: this.getProgress(),
      currentPair: this.getCurrentPair()
    };
  }

  updateScores(winnerTaskId, loserTaskId) {
    const winnerScore = this.scores.get(winnerTaskId);
    const loserScore = this.scores.get(loserTaskId);

    if (winnerScore) {
      winnerScore.wins++;
      winnerScore.comparisons++;
    }

    if (loserScore) {
      loserScore.losses++;
      loserScore.comparisons++;
    }
  }

  calculateFinalRankings() {
    // Calculate final scores using win rate and Elo-like system
    this.scores.forEach((score) => {
      if (score.comparisons > 0) {
        const winRate = score.wins / score.comparisons;
        const bonusPoints = score.wins * 2; // Bonus for absolute wins
        score.score = Math.round((winRate * 100) + bonusPoints);
      } else {
        score.score = 0;
      }
    });

    // Update task battle scores
    this.tasks.forEach(task => {
      const score = this.scores.get(task.id);
      if (score) {
        task.battleScore = score.score;
      }
    });
  }

  getRankings() {
    const rankings = this.tasks.map(task => {
      const score = this.scores.get(task.id);
      return {
        task,
        score: score ? score.score : 0,
        wins: score ? score.wins : 0,
        losses: score ? score.losses : 0,
        winRate: score && score.comparisons > 0 ?
          Math.round((score.wins / score.comparisons) * 100) : 0
      };
    });

    // Sort by score (highest first)
    return rankings.sort((a, b) => b.score - a.score);
  }

  getTheOne() {
    if (!this.isComplete) {
      return null;
    }

    const rankings = this.getRankings();
    return rankings.length > 0 ? rankings[0] : null;
  }

  getUpNext(count = 3) {
    if (!this.isComplete) {
      return [];
    }

    const rankings = this.getRankings();
    return rankings.slice(1, count + 1); // Skip "The One", get next N
  }

  getProgress() {
    return {
      current: this.currentPairIndex,
      total: this.pairs.length,
      percentage: this.pairs.length > 0 ?
        Math.round((this.currentPairIndex / this.pairs.length) * 100) : 0,
      remaining: this.pairs.length - this.currentPairIndex
    };
  }

  getComparisonKey(taskId1, taskId2) {
    // Create consistent key regardless of order
    return [taskId1, taskId2].sort().join('vs');
  }

  hasComparison(taskId1, taskId2) {
    const key = this.getComparisonKey(taskId1, taskId2);
    return this.comparisons.has(key);
  }

  getComparison(taskId1, taskId2) {
    const key = this.getComparisonKey(taskId1, taskId2);
    return this.comparisons.get(key);
  }

  canStartBattle() {
    return this.tasks.length >= 2;
  }

  reset() {
    this.comparisons.clear();
    this.currentPairIndex = 0;
    this.isComplete = false;
    this.initializeScores();
    this.generatePairs();
  }

  getStatistics() {
    return {
      totalTasks: this.tasks.length,
      totalPairs: this.pairs.length,
      completedComparisons: this.currentPairIndex,
      remainingComparisons: this.pairs.length - this.currentPairIndex,
      isComplete: this.isComplete,
      progress: this.getProgress()
    };
  }

  saveBattleResults() {
    if (!this.isComplete) {
      return;
    }

    try {
      const rankings = this.getRankings();
      const battleResults = {
        rankings: rankings,
        timestamp: Date.now(),
        taskIds: this.tasks.map(task => task.id)
      };

      localStorage.setItem('priority-matrix-battle-results', JSON.stringify(battleResults));
      console.log('Battle results saved to localStorage');
    } catch (error) {
      console.error('Failed to save battle results:', error);
    }
  }

  static loadBattleResults() {
    try {
      const stored = localStorage.getItem('priority-matrix-battle-results');
      if (!stored) {
        return null;
      }

      const results = JSON.parse(stored);
      // Check if results are not too old (7 days)
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - results.timestamp > oneWeek) {
        localStorage.removeItem('priority-matrix-battle-results');
        return null;
      }

      return results;
    } catch (error) {
      console.error('Failed to load battle results:', error);
      return null;
    }
  }

  static clearBattleResults() {
    try {
      localStorage.removeItem('priority-matrix-battle-results');
      console.log('Battle results cleared from localStorage');
    } catch (error) {
      console.error('Failed to clear battle results:', error);
    }
  }

  exportBattleData() {
    return {
      tasks: this.tasks.map(task => task.toJSON()),
      comparisons: Array.from(this.comparisons.entries()),
      scores: Array.from(this.scores.entries()),
      isComplete: this.isComplete,
      currentPairIndex: this.currentPairIndex,
      timestamp: new Date().toISOString()
    };
  }

  static validateTasks(tasks) {
    if (!Array.isArray(tasks)) {
      throw new Error('Tasks must be an array');
    }

    if (tasks.length < 2) {
      throw new Error('At least 2 tasks are required for battle mode');
    }

    if (tasks.length > 20) {
      throw new Error('Maximum 20 tasks allowed in battle mode');
    }

    // Check for duplicate IDs
    const ids = new Set();
    for (const task of tasks) {
      if (!task.id) {
        throw new Error('All tasks must have an ID');
      }
      if (ids.has(task.id)) {
        throw new Error('Duplicate task IDs found');
      }
      ids.add(task.id);
    }

    return true;
  }
}

// Support both ES modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BattleMode;
  module.exports.default = BattleMode;
} else if (typeof window !== 'undefined') {
  window.BattleMode = BattleMode;
}

export default BattleMode;