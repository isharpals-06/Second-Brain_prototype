import { workflowRegistry } from './WorkflowRegistry.js';
import { stateMachine } from './StateMachine.js';
import { stepExecutor } from './StepExecutor.js';
import { checkpointManager } from './CheckpointManager.js';
import { WorkflowState, StepType } from './types.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Workflow:Scheduler');

export class WorkflowScheduler {
  constructor() {
    this.instances = new Map();
  }

  startWorkflow(workflowId, initialVariables = {}) {
    const template = workflowRegistry.getWorkflow(workflowId);
    if (!template) return null;

    const instanceId = `wfi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const instance = {
      id: instanceId,
      workflowId: template.id,
      name: template.name,
      state: WorkflowState.PENDING,
      currentStepIndex: 0,
      steps: template.steps,
      variables: { ...initialVariables },
      completedSteps: [],
      createdAt: now,
      updatedAt: now
    };

    this.instances.set(instanceId, instance);
    stateMachine.transition(instance, WorkflowState.RUNNING, 'Started workflow');

    // Execute step sequence asynchronously
    this.runInstanceSteps(instance);

    return instance;
  }

  async runInstanceSteps(instance) {
    while (instance.currentStepIndex < instance.steps.length && instance.state === WorkflowState.RUNNING) {
      const step = instance.steps[instance.currentStepIndex];

      if (step.type === StepType.APPROVAL) {
        stateMachine.transition(instance, WorkflowState.WAITING, `Waiting for approval on step: ${step.title}`);
        await stepExecutor.executeStep(instance, step);
        break; // Pause until approval comes
      }

      const result = await stepExecutor.executeStep(instance, step);

      if (result.status === 'success') {
        instance.completedSteps.push(result);
        checkpointManager.createCheckpoint(instance);
        instance.currentStepIndex += 1;
      } else {
        stateMachine.transition(instance, WorkflowState.FAILED, `Step failed: ${step.title}`);
        break;
      }
    }

    if (instance.currentStepIndex >= instance.steps.length) {
      stateMachine.transition(instance, WorkflowState.COMPLETED, 'All steps completed');
    }
  }

  resumeWorkflow(instanceId) {
    const instance = this.instances.get(instanceId);
    if (!instance) return false;

    if (instance.state === WorkflowState.WAITING || instance.state === WorkflowState.PAUSED || instance.state === WorkflowState.APPROVED) {
      stateMachine.transition(instance, WorkflowState.RUNNING, 'Resuming workflow');
      instance.currentStepIndex += 1;
      this.runInstanceSteps(instance);
      return true;
    }
    return false;
  }

  getInstance(instanceId) {
    return this.instances.get(instanceId) || null;
  }

  listInstances() {
    return Array.from(this.instances.values());
  }
}

export const workflowScheduler = new WorkflowScheduler();
