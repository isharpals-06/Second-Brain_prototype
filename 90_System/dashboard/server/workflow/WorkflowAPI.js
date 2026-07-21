import { workflowRegistry } from './WorkflowRegistry.js';
import { workflowScheduler } from './WorkflowScheduler.js';
import { approvalManager } from './ApprovalManager.js';
import { checkpointManager } from './CheckpointManager.js';

class WorkflowAPI {
  listWorkflows() {
    return workflowRegistry.listWorkflows();
  }

  getWorkflow(id) {
    return workflowRegistry.getWorkflow(id);
  }

  runWorkflow(workflowId, inputs = {}) {
    return workflowScheduler.startWorkflow(workflowId, inputs);
  }

  listInstances() {
    return workflowScheduler.listInstances();
  }

  getInstance(instanceId) {
    const instance = workflowScheduler.getInstance(instanceId);
    if (!instance) return null;
    const checkpoint = checkpointManager.getLatestCheckpoint(instanceId);
    return {
      ...instance,
      latestCheckpoint: checkpoint
    };
  }

  approve(approvalId) {
    const success = approvalManager.approve(approvalId);
    if (success) {
      const appr = approvalManager.pendingApprovals.get(approvalId);
      if (appr) {
        workflowScheduler.resumeWorkflow(appr.instanceId);
      }
    }
    return success;
  }

  reject(approvalId, reason = '') {
    return approvalManager.reject(approvalId, reason);
  }

  listApprovals() {
    return approvalManager.listPending();
  }

  getMetrics() {
    const instances = workflowScheduler.listInstances();
    const completed = instances.filter(i => i.state === 'completed').length;
    const failed = instances.filter(i => i.state === 'failed').length;

    return {
      registeredWorkflows: workflowRegistry.listWorkflows().length,
      totalInstances: instances.length,
      completedInstances: completed,
      failedInstances: failed,
      pendingApprovals: approvalManager.listPending().length,
      successRatePercent: instances.length > 0 ? Math.round((completed / instances.length) * 100) : 100
    };
  }
}

export const workflowAPI = new WorkflowAPI();
export { WorkflowAPI };
