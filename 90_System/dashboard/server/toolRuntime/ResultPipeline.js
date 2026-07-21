import { ExecutionStatus } from './types.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('ToolRuntime:ResultPipeline');

export class ResultPipeline {
  formatResult({ executionId, toolId, status = ExecutionStatus.SUCCESS, durationMs = 0, inputSummary = {}, output = null, error = null }) {
    const record = {
      executionId,
      toolId,
      timestamp: new Date().toISOString(),
      status,
      durationMs,
      inputSummary,
      output: error ? null : output,
      artifacts: output?.artifacts || [],
      error: error ? (error.message || String(error)) : null,
      resourceUsage: {
        memoryMb: 32,
        cpuPercent: 5
      }
    };

    log.debug(`Formatted result for execution "${executionId}" (${status})`);
    return record;
  }
}

export const resultPipeline = new ResultPipeline();
