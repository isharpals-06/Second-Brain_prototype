import { contextAssembler } from './ContextAssembler.js';
import { contextCache } from './ContextCache.js';
import { contextEvents } from './ContextEvents.js';
import { ContextEventTypes } from './ContextTypes.js';
import { runtimeStore } from '../RuntimeStore.js';
import { missionRuntime } from '../MissionRuntime.js';
import { plannerRuntimeEngine } from '../PlannerRuntime/PlannerRuntimeEngine.js';

export class ContextRuntimeEngine {
  buildContext(missionId) {
    const mission = missionRuntime.getMission(missionId);
    if (!mission) return null;

    const plan = plannerRuntimeEngine.getPlanByMissionId(missionId);
    if (!plan) return null;

    const workingContext = contextAssembler.assembleWorkingContext(mission, plan);

    runtimeStore.updateState('workingContextState', workingContext);
    runtimeStore.updateState('contextState', { activeContextId: workingContext.id, status: 'CONTEXT_READY' });
    runtimeStore.updateState('contextWindowState', workingContext.window);
    runtimeStore.updateState('contextMetricsState', { totalTokens: workingContext.totalTokens, policy: workingContext.policy });

    return workingContext;
  }

  getWorkingContext(missionId) {
    return contextCache.get(`ctx_${missionId}`) || null;
  }

  invalidateContext(missionId) {
    const success = contextCache.invalidate(`ctx_${missionId}`);
    if (success) {
      contextEvents.emit(ContextEventTypes.CONTEXT_INVALIDATED, { missionId });
    }
    return success;
  }
}

export const contextRuntimeEngine = new ContextRuntimeEngine();
