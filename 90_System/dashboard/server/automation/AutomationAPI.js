import { automationRegistry } from './AutomationRegistry.js';
import { policyExecutor } from './PolicyExecutor.js';
import { humanApprovalManager } from './HumanApprovalManager.js';
import { rollbackManager } from './RollbackManager.js';
import { analyticsEngine } from './AnalyticsEngine.js';
import { workflowAPI } from '../workflow/WorkflowAPI.js';
import { AutonomyLevel, AutomationStatus } from './types.js';

class AutomationAPI {
  constructor() {
    this.currentAutonomyLevel = AutonomyLevel.L1_RECOMMENDATION;
    this.storage = null;
  }

  setStorage(storageInstance) {
    this.storage = storageInstance;
  }

  getAutonomyLevel() {
    return this.currentAutonomyLevel;
  }

  setAutonomyLevel(level) {
    this.currentAutonomyLevel = level;
    return this.currentAutonomyLevel;
  }

  listAutomations() {
    return automationRegistry.listAutomations();
  }

  getAutomation(id) {
    return automationRegistry.getAutomation(id);
  }

  async triggerAutomation(automationId) {
    const automation = automationRegistry.getAutomation(automationId);
    if (!automation) throw new Error(`Automation "${automationId}" not found`);

    const startTime = Date.now();
    automation.status = AutomationStatus.SIMULATING;

    // 1. Policy & Decision Simulation Check
    const verification = await policyExecutor.verifyAndPrepare(automation);
    if (!verification.isAllowed) {
      automation.status = AutomationStatus.FAILED;
      analyticsEngine.recordExecution({ automationId, status: 'failed', durationMs: Date.now() - startTime, error: verification.reason });
      throw new Error(`Automation blocked: ${verification.reason}`);
    }

    // 2. Autonomy Level & Approval Check
    if (this.currentAutonomyLevel === AutonomyLevel.L0_OBSERVATION) {
      automation.status = AutomationStatus.IDLE;
      return { status: 'observation_only', message: 'Execution skipped due to Autonomy Level 0 (Observation Only)' };
    }

    if (this.currentAutonomyLevel === AutonomyLevel.L1_RECOMMENDATION || this.currentAutonomyLevel === AutonomyLevel.L2_APPROVAL) {
      automation.status = AutomationStatus.WAITING_APPROVAL;
      const approval = humanApprovalManager.requestApproval({
        automationId,
        name: automation.name,
        actionSummary: `Trigger workflow ${automation.workflowId}`
      });
      return { status: 'waiting_approval', approvalId: approval.id };
    }

    // 3. Execution via Workflow Orchestration Platform
    automation.status = AutomationStatus.EXECUTING;
    const instance = workflowAPI.runWorkflow(automation.workflowId);

    const durationMs = Date.now() - startTime;
    automation.status = AutomationStatus.COMPLETED;

    analyticsEngine.recordExecution({ automationId, status: 'completed', durationMs });
    if (this.storage) {
      this.storage.saveExecution(automationId, 'completed', durationMs);
    }

    return {
      status: 'completed',
      automationId,
      durationMs,
      workflowInstanceId: instance.id
    };
  }

  listApprovals() {
    return humanApprovalManager.listPending();
  }

  listRollbacks() {
    return rollbackManager.listRollbacks();
  }

  triggerRollback(executionId) {
    return rollbackManager.rollback({ executionId, strategy: 'compensation' });
  }

  getAnalytics() {
    return analyticsEngine.getAnalytics();
  }
}

export const automationAPI = new AutomationAPI();
export { AutomationAPI };
