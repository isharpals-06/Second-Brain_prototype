import { agentRegistry } from './AgentRegistry.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('AgentRuntime:Scheduler');

export class AgentScheduler {
  constructor() {
    this.pendingQueue = [];
    this.runningQueue = [];
    this.completedQueue = [];
    this.failedQueue = [];
    this.concurrencyLimit = 3;
  }

  enqueuePlanTasks(plan) {
    if (!plan || !plan.tasks) return;

    plan.tasks.forEach(task => {
      const item = {
        id: `sched_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        planId: plan.id,
        taskId: task.id,
        title: task.title,
        priority: plan.priority || 'Medium',
        suggestedAgents: task.suggestedAgents || ['Librarian Agent'],
        status: 'pending',
        enqueuedAt: new Date().toISOString()
      };
      this.pendingQueue.push(item);
    });

    log.info(`Enqueued ${plan.tasks.length} tasks for plan "${plan.id}". Pending queue length: ${this.pendingQueue.length}`);
    this.processQueue();
  }

  processQueue() {
    while (this.runningQueue.length < this.concurrencyLimit && this.pendingQueue.length > 0) {
      const task = this.pendingQueue.shift();
      task.status = 'running';
      task.startedAt = new Date().toISOString();
      this.runningQueue.push(task);

      log.info(`Assigned task "${task.title}" to execution queue.`);

      // Simulate completion (Agent Runtime sandbox)
      setTimeout(() => {
        const idx = this.runningQueue.findIndex(t => t.id === task.id);
        if (idx !== -1) {
          const finished = this.runningQueue.splice(idx, 1)[0];
          finished.status = 'completed';
          finished.completedAt = new Date().toISOString();
          this.completedQueue.push(finished);
          log.info(`Task "${finished.title}" completed successfully.`);
          this.processQueue();
        }
      }, 100);
    }
  }

  getQueueStatus() {
    return {
      pending: this.pendingQueue.length,
      running: this.runningQueue.length,
      completed: this.completedQueue.length,
      failed: this.failedQueue.length,
      concurrencyLimit: this.concurrencyLimit
    };
  }
}

export const agentScheduler = new AgentScheduler();
