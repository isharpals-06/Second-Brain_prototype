import { StepType } from './types.js';
import { toolRuntimeAPI } from '../toolRuntime/ToolRuntimeAPI.js';
import { agentRuntimeAPI } from '../agentRuntime/AgentRuntimeAPI.js';
import { approvalManager } from './ApprovalManager.js';
import { checkpointManager } from './CheckpointManager.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Workflow:StepExecutor');

export class StepExecutor {
  async executeStep(instance, step) {
    log.info(`Executing step "${step.title}" (${step.type}) for workflow instance "${instance.id}"...`);
    const startTime = Date.now();

    try {
      let output = null;

      switch (step.type) {
        case StepType.TOOL: {
          const toolResult = await toolRuntimeAPI.executeTool(step.toolId, step.inputs || {});
          output = toolResult.output;
          break;
        }

        case StepType.AGENT: {
          agentRuntimeAPI.startAgent(step.agentId);
          output = { message: `Invoked agent ${step.agentId}`, status: 'running' };
          break;
        }

        case StepType.APPROVAL: {
          const approval = approvalManager.requestApproval({
            instanceId: instance.id,
            stepId: step.id,
            actionName: step.actionName || step.title,
            description: step.description
          });
          output = { approvalId: approval.approvalId, status: 'pending_approval' };
          break;
        }

        case StepType.CHECKPOINT: {
          const chk = checkpointManager.createCheckpoint(instance);
          output = { checkpointId: chk.checkpointId, timestamp: chk.timestamp };
          break;
        }

        default:
          output = { message: `Executed declarative step ${step.id}`, status: 'success' };
          break;
      }

      const durationMs = Date.now() - startTime;
      log.info(`Step "${step.title}" executed successfully in ${durationMs}ms.`);

      return {
        stepId: step.id,
        status: 'success',
        durationMs,
        output
      };
    } catch (err) {
      log.error(`Step "${step.title}" execution failed: ${err.message}`);
      return {
        stepId: step.id,
        status: 'failed',
        error: err.message
      };
    }
  }
}

export const stepExecutor = new StepExecutor();
