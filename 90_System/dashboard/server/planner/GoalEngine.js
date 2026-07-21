import { PriorityLevel, GoalStatus } from './types.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Planner:GoalEngine');

export class GoalEngine {
  constructor() {
    this.goals = new Map([
      ['goal_aegisos_core', {
        id: 'goal_aegisos_core',
        title: 'Complete AEGISOS System Architecture Phases',
        description: 'Build complete AEGISOS Agent OS (Kernel, Sentinel, World Model, Knowledge Graph, Planner, Agent Runtime)',
        priority: PriorityLevel.HIGH,
        status: GoalStatus.ACTIVE,
        dependencies: [],
        estimatedDurationMin: 300,
        relatedProject: 'SecondBrain',
        relatedResources: ['Documentation/Instructions/P6.txt'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]
    ]);
  }

  createGoal({ title, description = '', priority = PriorityLevel.MEDIUM, dependencies = [], estimatedDurationMin = 60, relatedProject = 'SecondBrain', relatedResources = [] }) {
    if (!title) return null;

    const id = `goal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const goal = {
      id,
      title,
      description,
      priority,
      status: GoalStatus.PROPOSED,
      dependencies,
      estimatedDurationMin,
      relatedProject,
      relatedResources,
      createdAt: now,
      updatedAt: now
    };

    this.goals.set(id, goal);
    log.info(`Created goal "${title}" (${id})`);
    return goal;
  }

  updateGoal(id, updates = {}) {
    const goal = this.goals.get(id);
    if (!goal) return null;

    Object.assign(goal, updates, { updatedAt: new Date().toISOString() });
    log.info(`Updated goal "${goal.title}" (${id})`);
    return goal;
  }

  getGoal(id) {
    return this.goals.get(id) || null;
  }

  listGoals(statusFilter = null) {
    const list = Array.from(this.goals.values());
    if (statusFilter) return list.filter(g => g.status === statusFilter);
    return list;
  }
}

export const goalEngine = new GoalEngine();
