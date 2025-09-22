const BattleMode = require('../../src/js/battle.js');
const Task = require('../../src/js/task.js');

describe('BattleMode', () => {
  let tasks;
  let battleMode;

  beforeEach(() => {
    tasks = [
      new Task({ id: '1', name: 'Task A', importance: 5, urgency: 5 }),
      new Task({ id: '2', name: 'Task B', importance: 5, urgency: 5 }),
      new Task({ id: '3', name: 'Task C', importance: 5, urgency: 5 }),
    ];
    battleMode = new BattleMode(tasks);
  });

  describe('constructor', () => {
    test('should initialize with provided tasks', () => {
      expect(battleMode.tasks).toHaveLength(3);
      expect(battleMode.tasks[0].name).toBe('Task A');
      expect(battleMode.currentPairIndex).toBe(0);
      expect(battleMode.isComplete).toBe(false);
    });

    test('should initialize scores for all tasks', () => {
      expect(battleMode.scores.size).toBe(3);
      expect(battleMode.scores.get('1')).toEqual({
        wins: 0,
        losses: 0,
        comparisons: 0,
        score: 0
      });
    });

    test('should generate correct number of pairs', () => {
      // C(3,2) = 3 pairs
      expect(battleMode.pairs).toHaveLength(3);
    });

    test('should handle empty task list', () => {
      const emptyBattle = new BattleMode([]);
      expect(emptyBattle.tasks).toHaveLength(0);
      expect(emptyBattle.pairs).toHaveLength(0);
    });
  });

  describe('generatePairs', () => {
    test('should generate all unique pairs', () => {
      const battleWith4Tasks = new BattleMode([
        new Task({ id: '1', name: 'A' }),
        new Task({ id: '2', name: 'B' }),
        new Task({ id: '3', name: 'C' }),
        new Task({ id: '4', name: 'D' }),
      ]);

      // C(4,2) = 6 pairs
      expect(battleWith4Tasks.pairs).toHaveLength(6);

      // Check that all pairs are unique
      const pairIds = battleWith4Tasks.pairs.map(pair =>
        `${pair.taskA.id}-${pair.taskB.id}`
      );
      const uniquePairIds = new Set(pairIds);
      expect(uniquePairIds.size).toBe(6);
    });

    test('should handle single task', () => {
      const singleTaskBattle = new BattleMode([
        new Task({ id: '1', name: 'Solo Task' })
      ]);

      expect(singleTaskBattle.pairs).toHaveLength(0);
    });

    test('should handle two tasks', () => {
      const twoTaskBattle = new BattleMode([
        new Task({ id: '1', name: 'Task A' }),
        new Task({ id: '2', name: 'Task B' })
      ]);

      expect(twoTaskBattle.pairs).toHaveLength(1);
      expect(twoTaskBattle.pairs[0].taskA.id).toBe('1');
      expect(twoTaskBattle.pairs[0].taskB.id).toBe('2');
    });
  });

  describe('getCurrentPair', () => {
    test('should return current pair', () => {
      const currentPair = battleMode.getCurrentPair();
      expect(currentPair).toBeDefined();
      expect(currentPair.taskA).toBeDefined();
      expect(currentPair.taskB).toBeDefined();
    });

    test('should return null when battle is complete', () => {
      battleMode.currentPairIndex = battleMode.pairs.length;
      const currentPair = battleMode.getCurrentPair();
      expect(currentPair).toBeNull();
    });
  });

  describe('recordComparison', () => {
    test('should record valid comparison', () => {
      const pair = battleMode.getCurrentPair();
      const winnerTaskId = pair.taskA.id;
      const loserTaskId = pair.taskB.id;

      const result = battleMode.recordComparison(winnerTaskId, loserTaskId);

      expect(result.isComplete).toBe(false);
      expect(result.progress.current).toBe(1);
      expect(battleMode.scores.get(winnerTaskId).wins).toBe(1);
      expect(battleMode.scores.get(loserTaskId).losses).toBe(1);
    });

    test('should reject invalid winner/loser combination', () => {
      expect(() => {
        battleMode.recordComparison('invalid-id', 'another-invalid-id');
      }).toThrow('Invalid comparison result');
    });

    test('should reject same task as winner and loser', () => {
      const pair = battleMode.getCurrentPair();
      expect(() => {
        battleMode.recordComparison(pair.taskA.id, pair.taskA.id);
      }).toThrow('Invalid comparison result');
    });

    test('should complete battle after all comparisons', () => {
      // Complete all comparisons
      while (!battleMode.isComplete) {
        const pair = battleMode.getCurrentPair();
        if (pair) {
          battleMode.recordComparison(pair.taskA.id, pair.taskB.id);
        }
      }

      expect(battleMode.isComplete).toBe(true);
      expect(battleMode.getCurrentPair()).toBeNull();
    });

    test('should throw error when no active comparison', () => {
      // Complete all comparisons first
      while (battleMode.getCurrentPair()) {
        const pair = battleMode.getCurrentPair();
        battleMode.recordComparison(pair.taskA.id, pair.taskB.id);
      }

      expect(() => {
        battleMode.recordComparison('1', '2');
      }).toThrow('No active comparison');
    });
  });

  describe('rankings and scoring', () => {
    beforeEach(() => {
      // Complete a simple battle: A beats B, A beats C, B beats C
      // So ranking should be: A (2 wins), B (1 win), C (0 wins)
      // Get pairs for reference (though we'll execute comparisons directly)

      // Find and execute specific comparisons
      // Note: We don't need to store these pairs, just execute the comparisons

      // Simulate comparisons with Task A always winning, then Task B
      battleMode.currentPairIndex = 0;
      battleMode.recordComparison('1', '2'); // A beats B
      battleMode.recordComparison('1', '3'); // A beats C
      battleMode.recordComparison('2', '3'); // B beats C
    });

    test('should calculate correct rankings', () => {
      const rankings = battleMode.getRankings();

      expect(rankings).toHaveLength(3);
      expect(rankings[0].task.id).toBe('1'); // Task A should be first
      expect(rankings[0].wins).toBe(2);
      expect(rankings[0].losses).toBe(0);
      expect(rankings[0].winRate).toBe(100);

      expect(rankings[1].task.id).toBe('2'); // Task B should be second
      expect(rankings[1].wins).toBe(1);
      expect(rankings[1].losses).toBe(1);
      expect(rankings[1].winRate).toBe(50);

      expect(rankings[2].task.id).toBe('3'); // Task C should be last
      expect(rankings[2].wins).toBe(0);
      expect(rankings[2].losses).toBe(2);
      expect(rankings[2].winRate).toBe(0);
    });

    test('should identify "The One"', () => {
      const theOne = battleMode.getTheOne();

      expect(theOne).toBeDefined();
      expect(theOne.task.id).toBe('1');
      expect(theOne.wins).toBe(2);
    });

    test('should get "Up Next" tasks', () => {
      const upNext = battleMode.getUpNext(2);

      expect(upNext).toHaveLength(2);
      expect(upNext[0].task.id).toBe('2'); // Second place
      expect(upNext[1].task.id).toBe('3'); // Third place
    });

    test('should return null for "The One" when not complete', () => {
      const incompleteBattle = new BattleMode(tasks);
      expect(incompleteBattle.getTheOne()).toBeNull();
    });

    test('should update task battle scores', () => {
      expect(battleMode.tasks[0].battleScore).toBeGreaterThan(0);
      expect(battleMode.tasks[1].battleScore).toBeGreaterThan(0);
      expect(battleMode.tasks[2].battleScore).toBeGreaterThan(0);
    });
  });

  describe('progress tracking', () => {
    test('should track progress correctly', () => {
      const initialProgress = battleMode.getProgress();
      expect(initialProgress.current).toBe(0);
      expect(initialProgress.total).toBe(3);
      expect(initialProgress.percentage).toBe(0);
      expect(initialProgress.remaining).toBe(3);

      // Complete one comparison
      const pair = battleMode.getCurrentPair();
      battleMode.recordComparison(pair.taskA.id, pair.taskB.id);

      const midProgress = battleMode.getProgress();
      expect(midProgress.current).toBe(1);
      expect(midProgress.percentage).toBeCloseTo(33.33, 1);
      expect(midProgress.remaining).toBe(2);
    });

    test('should reach 100% when complete', () => {
      // Complete all comparisons
      while (!battleMode.isComplete) {
        const pair = battleMode.getCurrentPair();
        if (pair) {
          battleMode.recordComparison(pair.taskA.id, pair.taskB.id);
        }
      }

      const finalProgress = battleMode.getProgress();
      expect(finalProgress.current).toBe(3);
      expect(finalProgress.percentage).toBe(100);
      expect(finalProgress.remaining).toBe(0);
    });
  });

  describe('getStatistics', () => {
    test('should provide accurate statistics', () => {
      const stats = battleMode.getStatistics();

      expect(stats.totalTasks).toBe(3);
      expect(stats.totalPairs).toBe(3);
      expect(stats.completedComparisons).toBe(0);
      expect(stats.remainingComparisons).toBe(3);
      expect(stats.isComplete).toBe(false);
    });

    test('should update statistics as battle progresses', () => {
      const pair = battleMode.getCurrentPair();
      battleMode.recordComparison(pair.taskA.id, pair.taskB.id);

      const stats = battleMode.getStatistics();
      expect(stats.completedComparisons).toBe(1);
      expect(stats.remainingComparisons).toBe(2);
    });
  });

  describe('reset', () => {
    test('should reset battle to initial state', () => {
      // Progress the battle
      const pair = battleMode.getCurrentPair();
      battleMode.recordComparison(pair.taskA.id, pair.taskB.id);

      expect(battleMode.currentPairIndex).toBe(1);
      expect(battleMode.comparisons.size).toBeGreaterThan(0);

      // Reset
      battleMode.reset();

      expect(battleMode.currentPairIndex).toBe(0);
      expect(battleMode.isComplete).toBe(false);
      expect(battleMode.comparisons.size).toBe(0);
      expect(battleMode.scores.get('1').wins).toBe(0);
    });
  });

  describe('comparison utilities', () => {
    test('should generate consistent comparison keys', () => {
      const key1 = battleMode.getComparisonKey('1', '2');
      const key2 = battleMode.getComparisonKey('2', '1');
      expect(key1).toBe(key2);
    });

    test('should check if comparison exists', () => {
      expect(battleMode.hasComparison('1', '2')).toBe(false);

      const pair = battleMode.getCurrentPair();
      battleMode.recordComparison(pair.taskA.id, pair.taskB.id);

      expect(battleMode.hasComparison(pair.taskA.id, pair.taskB.id)).toBe(true);
    });

    test('should retrieve comparison data', () => {
      const pair = battleMode.getCurrentPair();
      battleMode.recordComparison(pair.taskA.id, pair.taskB.id);

      const comparison = battleMode.getComparison(pair.taskA.id, pair.taskB.id);
      expect(comparison).toBeDefined();
      expect(comparison.winner).toBe(pair.taskA.id);
      expect(comparison.loser).toBe(pair.taskB.id);
      expect(comparison.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('canStartBattle', () => {
    test('should return true for sufficient tasks', () => {
      expect(battleMode.canStartBattle()).toBe(true);
    });

    test('should return false for insufficient tasks', () => {
      const singleTaskBattle = new BattleMode([
        new Task({ id: '1', name: 'Solo Task' })
      ]);
      expect(singleTaskBattle.canStartBattle()).toBe(false);

      const emptyBattle = new BattleMode([]);
      expect(emptyBattle.canStartBattle()).toBe(false);
    });
  });

  describe('exportBattleData', () => {
    test('should export complete battle data', () => {
      // Progress the battle a bit
      const pair = battleMode.getCurrentPair();
      battleMode.recordComparison(pair.taskA.id, pair.taskB.id);

      const exportData = battleMode.exportBattleData();

      expect(exportData.tasks).toHaveLength(3);
      expect(exportData.comparisons).toHaveLength(1);
      expect(exportData.scores).toHaveLength(3);
      expect(exportData.isComplete).toBe(false);
      expect(exportData.currentPairIndex).toBe(1);
      expect(exportData.timestamp).toBeDefined();
    });
  });

  describe('validateTasks', () => {
    test('should validate proper task array', () => {
      expect(() => {
        BattleMode.validateTasks(tasks);
      }).not.toThrow();
    });

    test('should reject non-array input', () => {
      expect(() => {
        BattleMode.validateTasks('not an array');
      }).toThrow('Tasks must be an array');
    });

    test('should reject insufficient tasks', () => {
      expect(() => {
        BattleMode.validateTasks([new Task({ id: '1', name: 'Solo' })]);
      }).toThrow('At least 2 tasks are required');
    });

    test('should reject too many tasks', () => {
      const manyTasks = Array.from({ length: 21 }, (_, i) =>
        new Task({ id: i.toString(), name: `Task ${i}` })
      );

      expect(() => {
        BattleMode.validateTasks(manyTasks);
      }).toThrow('Maximum 20 tasks allowed');
    });

    test('should reject tasks without IDs', () => {
      const tasksWithoutIds = [
        { name: 'Task A' }, // Missing ID
        { id: '2', name: 'Task B' }
      ];

      expect(() => {
        BattleMode.validateTasks(tasksWithoutIds);
      }).toThrow('All tasks must have an ID');
    });

    test('should reject duplicate task IDs', () => {
      const duplicateTasks = [
        new Task({ id: '1', name: 'Task A' }),
        new Task({ id: '1', name: 'Task B' }) // Duplicate ID
      ];

      expect(() => {
        BattleMode.validateTasks(duplicateTasks);
      }).toThrow('Duplicate task IDs found');
    });
  });

  describe('edge cases', () => {
    test('should handle battle with exactly 2 tasks', () => {
      const twoTaskBattle = new BattleMode([
        new Task({ id: '1', name: 'Task A' }),
        new Task({ id: '2', name: 'Task B' })
      ]);

      expect(twoTaskBattle.pairs).toHaveLength(1);

      const pair = twoTaskBattle.getCurrentPair();
      const result = twoTaskBattle.recordComparison(pair.taskA.id, pair.taskB.id);

      expect(result.isComplete).toBe(true);
      expect(twoTaskBattle.getTheOne()).toBeDefined();
    });

    test('should handle battle with maximum tasks', () => {
      const maxTasks = Array.from({ length: 20 }, (_, i) =>
        new Task({ id: i.toString(), name: `Task ${i}` })
      );

      const largeBattle = new BattleMode(maxTasks);

      // C(20,2) = 190 pairs
      expect(largeBattle.pairs).toHaveLength(190);
      expect(largeBattle.canStartBattle()).toBe(true);
    });
  });
});