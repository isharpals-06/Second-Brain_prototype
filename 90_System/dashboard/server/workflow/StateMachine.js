import { WorkflowState } from './types.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Workflow:StateMachine');

export class StateMachine {
  constructor() {
    this.validTransitions = new Map([
      [WorkflowState.PENDING, [WorkflowState.READY, WorkflowState.RUNNING, WorkflowState.CANCELLED]],
      [WorkflowState.READY, [WorkflowState.RUNNING, WorkflowState.CANCELLED]],
      [WorkflowState.RUNNING, [WorkflowState.WAITING, WorkflowState.PAUSED, WorkflowState.RETRYING, WorkflowState.COMPLETED, WorkflowState.FAILED, WorkflowState.CANCELLED, WorkflowState.TIMED_OUT]],
      [WorkflowState.WAITING, [WorkflowState.APPROVED, WorkflowState.REJECTED, WorkflowState.CANCELLED]],
      [WorkflowState.PAUSED, [WorkflowState.RUNNING, WorkflowState.CANCELLED]],
      [WorkflowState.APPROVED, [WorkflowState.RUNNING, WorkflowState.COMPLETED]],
      [WorkflowState.REJECTED, [WorkflowState.FAILED, WorkflowState.CANCELLED]],
      [WorkflowState.RETRYING, [WorkflowState.RUNNING, WorkflowState.FAILED]]
    ]);
  }

  canTransition(fromState, toState) {
    const allowed = this.validTransitions.get(fromState);
    return allowed ? allowed.includes(toState) : false;
  }

  transition(instance, toState, reason = '') {
    const fromState = instance.state;
    if (!this.canTransition(fromState, toState) && fromState !== toState) {
      log.warn(`Invalid state transition: ${fromState} -> ${toState} for instance "${instance.id}"`);
      return false;
    }

    instance.state = toState;
    instance.updatedAt = new Date().toISOString();
    log.info(`Workflow instance "${instance.id}" state transitioned: ${fromState} -> ${toState} (${reason})`);
    return true;
  }
}

export const stateMachine = new StateMachine();
