import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Simulation:ConflictDetector');

export class ConflictDetector {
  detectConflicts(plan) {
    const conflicts = [];

    if (!plan || !plan.tasks) return conflicts;

    const taskIds = new Set();
    plan.tasks.forEach(task => {
      if (taskIds.has(task.id)) {
        conflicts.push(`Duplicate task ID found: "${task.id}"`);
      }
      taskIds.add(task.id);
    });

    log.debug(`Conflict detection found ${conflicts.length} conflicts.`);
    return conflicts;
  }
}

export const conflictDetector = new ConflictDetector();
