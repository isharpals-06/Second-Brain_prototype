import { contextResolver } from './ContextResolver.js';
import { contextWindow } from './ContextWindow.js';
import { contextPolicies } from './ContextPolicies.js';
import { contextCache } from './ContextCache.js';
import { contextEvents } from './ContextEvents.js';
import { ContextEventTypes } from './ContextTypes.js';
import { runtimeStore } from '../RuntimeStore.js';
import { aegisLogger } from '../../core/logger.js';

const log = aegisLogger.child('Context:Assembler');

export class ContextAssembler {
  assembleWorkingContext(mission, executionPlan) {
    const cacheKey = `ctx_${mission.id}`;
    const cached = contextCache.get(cacheKey);
    if (cached) {
      log.info(`Returning cached WorkingContext for Mission "${mission.id}"`);
      return cached;
    }

    contextEvents.emit(ContextEventTypes.CONTEXT_REQUESTED, { missionId: mission.id });

    // Step 1: Resolve Context Requirements
    const requirements = contextResolver.resolveContextRequirements(mission, executionPlan);
    contextEvents.emit(ContextEventTypes.CONTEXT_RESOLVED, requirements);

    // Step 2: Build Raw Blocks
    const rawBlocks = [
      { id: 'blk_intent', title: 'User Intent', content: mission.intent, priority: 1, tokenEstimate: 250 },
      { id: 'blk_goals', title: 'Mission Goals', content: JSON.stringify(mission.goals), priority: 1, tokenEstimate: 400 },
      { id: 'blk_plan', title: 'Execution Strategy', content: JSON.stringify(executionPlan), priority: 1, tokenEstimate: 1200 },
      { id: 'blk_runtime', title: 'Runtime Store State', content: JSON.stringify(runtimeStore.getState().workspaceState), priority: 2, tokenEstimate: 300 },
    ];

    // Step 3: Apply Policy Filter
    const filteredBlocks = contextPolicies.applyPolicy(rawBlocks);

    // Step 4: Fit to Context Window
    const windowFitting = contextWindow.fitToWindow(filteredBlocks);
    if (windowFitting.hasOverflow) {
      contextEvents.emit(ContextEventTypes.CONTEXT_OVERFLOW, windowFitting.overflowBlocks);
    }

    // Step 5: Construct Immutable Working Context
    const contextId = `ctx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const workingContext = {
      id: contextId,
      missionId: mission.id,
      planId: executionPlan.id,
      assembledAt: new Date().toISOString(),
      policy: contextPolicies.getPolicy(),
      window: windowFitting,
      blocks: windowFitting.fittedBlocks,
      totalTokens: windowFitting.tokenUsage,
    };

    const immutableContext = Object.freeze(workingContext);
    contextCache.set(cacheKey, immutableContext);

    contextEvents.emit(ContextEventTypes.CONTEXT_BUILT, immutableContext);
    return immutableContext;
  }
}

export const contextAssembler = new ContextAssembler();
