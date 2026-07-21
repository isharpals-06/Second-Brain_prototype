import { toolRegistry } from './ToolRegistry.js';
import { permissionGateway } from './PermissionGateway.js';
import { resourceGateway } from './ResourceGateway.js';
import { sandboxManager } from './SandboxManager.js';
import { resultPipeline } from './ResultPipeline.js';
import { ExecutionStatus, PermissionPolicy } from './types.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('ToolRuntime:ExecutionEngine');

export class ExecutionEngine {
  async executeTool(toolId, input = {}) {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const startTime = Date.now();

    log.info(`Executing tool request "${toolId}" (${executionId})...`);

    const tool = toolRegistry.getTool(toolId);
    if (!tool) {
      return resultPipeline.formatResult({
        executionId,
        toolId,
        status: ExecutionStatus.FAILED,
        error: new Error(`Tool "${toolId}" not found in ToolRegistry`)
      });
    }

    // 1. Validate Input
    const val = tool.validate(input);
    if (!val.isValid) {
      return resultPipeline.formatResult({
        executionId,
        toolId,
        status: ExecutionStatus.FAILED,
        error: new Error(`Validation failed: ${val.errors.join(', ')}`)
      });
    }

    // 2. Permission Gateway Check
    const permResult = permissionGateway.evaluatePermission(tool.permissions());
    if (permResult.policy !== PermissionPolicy.ALLOW) {
      return resultPipeline.formatResult({
        executionId,
        toolId,
        status: ExecutionStatus.PERMISSION_DENIED,
        error: new Error(permResult.reason)
      });
    }

    // 3. Resource Gateway Check
    const resResult = resourceGateway.validateResourceAccess(tool, input);
    if (!resResult.isAllowed) {
      return resultPipeline.formatResult({
        executionId,
        toolId,
        status: ExecutionStatus.FAILED,
        error: new Error(resResult.reason)
      });
    }

    // 4. Sandbox Write Permission Check
    if (tool.permissions().includes('write_file') && !sandboxManager.isWriteAllowed()) {
      return resultPipeline.formatResult({
        executionId,
        toolId,
        status: ExecutionStatus.PERMISSION_DENIED,
        error: new Error('Write actions blocked by current Sandbox Mode')
      });
    }

    // 5. Tool Execution
    try {
      tool.prepare(input);
      const output = await tool.execute(input);
      tool.cleanup();

      const durationMs = Date.now() - startTime;
      log.info(`Tool "${toolId}" executed successfully in ${durationMs}ms.`);

      return resultPipeline.formatResult({
        executionId,
        toolId,
        status: ExecutionStatus.SUCCESS,
        durationMs,
        inputSummary: input,
        output
      });
    } catch (err) {
      const durationMs = Date.now() - startTime;
      log.error(`Tool "${toolId}" execution failed: ${err.message}`);
      return resultPipeline.formatResult({
        executionId,
        toolId,
        status: ExecutionStatus.FAILED,
        durationMs,
        inputSummary: input,
        error: err
      });
    }
  }
}

export const executionEngine = new ExecutionEngine();
