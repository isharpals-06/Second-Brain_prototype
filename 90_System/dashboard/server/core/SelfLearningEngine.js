import { cognitiveMemoryEngine } from '../memory/initMemory.js';
import { serverEventBus, EventSeverity } from './eventBus.js';
import { aegisLogger } from './logger.js';

const log = aegisLogger.child('Core:SelfLearning');

export class SelfLearningEngine {
  constructor() {
    this.metrics = {
      totalPlansExecuted: 0,
      successfulPlans: 0,
      failedPlans: 0,
      toolReliabilityMap: {},
      agentPerformanceMap: {},
      promptEffectivenessScore: 0.95,
      lastLearningUpdate: new Date().toISOString()
    };
  }

  recordTaskExecution(toolId, success = true, durationMs = 100) {
    this.metrics.totalPlansExecuted += 1;
    if (success) this.metrics.successfulPlans += 1;
    else this.metrics.failedPlans += 1;

    if (!this.metrics.toolReliabilityMap[toolId]) {
      this.metrics.toolReliabilityMap[toolId] = { executions: 0, successes: 0, avgDurationMs: 0 };
    }
    const toolStat = this.metrics.toolReliabilityMap[toolId];
    toolStat.executions += 1;
    if (success) toolStat.successes += 1;
    toolStat.avgDurationMs = Math.round((toolStat.avgDurationMs * (toolStat.executions - 1) + durationMs) / toolStat.executions);

    log.debug(`[SelfLearning] Recorded tool execution for "${toolId}": success=${success} (${durationMs}ms)`);
  }

  recordAgentExecution(agentId, success = true) {
    if (!this.metrics.agentPerformanceMap[agentId]) {
      this.metrics.agentPerformanceMap[agentId] = { totalTasks: 0, completedTasks: 0, successRate: 1.0 };
    }
    const agentStat = this.metrics.agentPerformanceMap[agentId];
    agentStat.totalTasks += 1;
    if (success) agentStat.completedTasks += 1;
    agentStat.successRate = parseFloat((agentStat.completedTasks / agentStat.totalTasks).toFixed(2));
  }

  async runLearningOptimizationPass() {
    log.info('Executing Self-Learning Optimization Pass...');
    this.metrics.lastLearningUpdate = new Date().toISOString();

    const proceduralUpdate = {
      name: 'Continuous System Reliability & Tool Execution Strategy',
      category: 'self_learning_recipe',
      triggerPattern: 'tool:*',
      procedure: {
        toolStats: this.metrics.toolReliabilityMap,
        agentStats: this.metrics.agentPerformanceMap,
        planSuccessRate: this.metrics.totalPlansExecuted > 0 ? (this.metrics.successfulPlans / this.metrics.totalPlansExecuted).toFixed(2) : 1.0,
        recommendation: 'Prioritize native tool execution and maintain short subagent task contexts.'
      },
      usageCount: this.metrics.totalPlansExecuted,
      successRate: this.metrics.totalPlansExecuted > 0 ? (this.metrics.successfulPlans / this.metrics.totalPlansExecuted) : 1.0
    };

    if (cognitiveMemoryEngine) {
      await cognitiveMemoryEngine.remember('procedural', proceduralUpdate);
    }

    serverEventBus.publish({
      type: 'SelfLearningUpdated',
      source: 'SelfLearningEngine',
      severity: EventSeverity.INFO,
      payload: { metrics: this.getLearningSummary() }
    });

    log.info('Self-Learning optimization pass complete. Procedural memory updated.');
    return this.getLearningSummary();
  }

  getLearningSummary() {
    const successRate = this.metrics.totalPlansExecuted > 0
      ? ((this.metrics.successfulPlans / this.metrics.totalPlansExecuted) * 100).toFixed(1) + '%'
      : '100%';

    return {
      ...this.metrics,
      overallSuccessRate: successRate
    };
  }
}

export const selfLearningEngine = new SelfLearningEngine();
