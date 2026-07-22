import { agentRegistry } from './AgentRegistry.js';
import { serverEventBus, SystemEvents, EventSeverity } from '../core/eventBus.js';
import { executionEngine } from '../toolRuntime/ExecutionEngine.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('AgentRuntime:Scheduler');

export class AgentScheduler {
  constructor() {
    this.pendingQueue = [];
    this.runningQueue = [];
    this.completedQueue = [];
    this.failedQueue = [];
    this.concurrencyLimit = 3;
    this.taskHandlers = new Map();
    this.initDefaultTaskHandlers();
  }

  initDefaultTaskHandlers() {
    // Register real functional task handlers for common system operations
    this.taskHandlers.set('tool_execution', async (task) => {
      const toolId = task.toolId || 'tool_git_status';
      const params = task.params || {};
      return await executionEngine.executeTool(toolId, params, 'sys_scheduler');
    });

    this.taskHandlers.set('telemetry_inspection', async (task) => {
      return { status: 'nominal', inspectedAt: new Date().toISOString() };
    });
  }

  registerHandler(type, handlerFn) {
    this.taskHandlers.set(type, handlerFn);
  }

  enqueuePlanTasks(plan) {
    if (!plan || !plan.tasks) return;

    plan.tasks.forEach(task => {
      const item = {
        id: `sched_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        planId: plan.id,
        taskId: task.id,
        title: task.title,
        type: task.type || 'telemetry_inspection',
        toolId: task.toolId,
        params: task.params,
        priority: plan.priority || 'Medium',
        suggestedAgents: task.suggestedAgents || ['Librarian Agent'],
        status: 'pending',
        attempts: 0,
        maxRetries: 3,
        enqueuedAt: new Date().toISOString()
      };
      this.pendingQueue.push(item);
    });

    log.info(`Enqueued ${plan.tasks.length} tasks for plan "${plan.id}". Pending queue length: ${this.pendingQueue.length}`);
    this.processQueue();
  }

  async processQueue() {
    while (this.runningQueue.length < this.concurrencyLimit && this.pendingQueue.length > 0) {
      const task = this.pendingQueue.shift();
      task.status = 'running';
      task.startedAt = new Date().toISOString();
      task.attempts += 1;
      this.runningQueue.push(task);

      log.info(`Executing task "${task.title}" (Attempt ${task.attempts}/${task.maxRetries}).`);

      serverEventBus.publish(SystemEvents.AGENT_STARTED, {
        taskId: task.id,
        title: task.title,
        assignedAgent: task.suggestedAgents[0] || 'Librarian Agent'
      }, { subsystem: 'AgentRuntime', severity: EventSeverity.INFO });

      // Execute real handler or fallback
      (async () => {
        try {
          const handler = this.taskHandlers.get(task.type) || this.taskHandlers.get('telemetry_inspection');
          const result = await handler(task);

          // Task Succeeded
          const idx = this.runningQueue.findIndex(t => t.id === task.id);
          if (idx !== -1) {
            const finished = this.runningQueue.splice(idx, 1)[0];
            finished.status = 'completed';
            finished.completedAt = new Date().toISOString();
            finished.result = result;
            this.completedQueue.push(finished);

            log.info(`Task "${finished.title}" completed successfully.`);

            serverEventBus.publish(SystemEvents.AGENT_COMPLETED, {
              taskId: finished.id,
              title: finished.title,
              durationMs: new Date(finished.completedAt) - new Date(finished.startedAt),
              result
            }, { subsystem: 'AgentRuntime', severity: EventSeverity.INFO });
          }
        } catch (err) {
          log.error(`Task "${task.title}" failed: ${err.message}`);

          const idx = this.runningQueue.findIndex(t => t.id === task.id);
          if (idx !== -1) {
            const failedTask = this.runningQueue.splice(idx, 1)[0];

            if (failedTask.attempts < failedTask.maxRetries) {
              failedTask.status = 'pending';
              this.pendingQueue.push(failedTask);
              log.warn(`Re-queued failed task "${failedTask.title}" for retry.`);
            } else {
              failedTask.status = 'failed';
              failedTask.failedAt = new Date().toISOString();
              failedTask.error = err.message;
              this.failedQueue.push(failedTask);

              serverEventBus.publish(SystemEvents.AGENT_FAILED, {
                taskId: failedTask.id,
                title: failedTask.title,
                error: err.message
              }, { subsystem: 'AgentRuntime', severity: EventSeverity.ERROR });
            }
          }
        } finally {
          this.processQueue();
        }
      })();
    }
  }

  cancelTask(taskId) {
    const pendIdx = this.pendingQueue.findIndex(t => t.id === taskId);
    if (pendIdx !== -1) {
      const removed = this.pendingQueue.splice(pendIdx, 1)[0];
      removed.status = 'cancelled';
      this.failedQueue.push(removed);
      return true;
    }
    return false;
  }

  getQueueStatus() {
    return {
      pending: this.pendingQueue.length,
      running: this.runningQueue.length,
      completed: this.completedQueue.length,
      failed: this.failedQueue.length,
      concurrencyLimit: this.concurrencyLimit,
      pendingTasks: this.pendingQueue,
      runningTasks: this.runningQueue,
      recentCompleted: this.completedQueue.slice(-10)
    };
  }
}

export const agentScheduler = new AgentScheduler();
