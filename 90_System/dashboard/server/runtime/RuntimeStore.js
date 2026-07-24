import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Runtime:Store');

export class RuntimeStore {
  constructor() {
    this.state = {
      intentState: { lastIntent: null, category: null },
      missionDraft: null,
      goalState: { activeGoals: null },
      taskGraphState: null,
      validationState: null,
      executionPlanState: null,
      planningState: { activePlanId: null, status: 'IDLE' },
      dependencyGraphState: null,
      capabilityAssignmentsState: null,
      approvalState: { approvalGates: [] },
      resourceEstimatesState: null,
      missionState: { activeMissions: [], currentMission: null },
      executionState: { activeExecutions: [], history: [] },
      providerState: { activeProvider: 'gemini', status: 'online' },
      plannerState: { activePlan: null, goals: [] },
      contextState: { workingContext: [], activeFiles: [] },
      memoryState: { lastConsolidation: null, stats: {} },
      workspaceState: { activeSurface: 'mission', activeMode: 'OBSERVE' },
      agentState: { activeSwarm: [], allocatedCount: 0 },
    };
  }

  getState() {
    return JSON.parse(JSON.stringify(this.state)); // Immutable copy
  }

  updateState(domain, payload) {
    if (this.state.hasOwnProperty(domain)) {
      this.state[domain] = payload;
      log.info(`RuntimeStore updated domain "${domain}".`);
    } else {
      log.warn(`Unknown domain "${domain}" passed to RuntimeStore.`);
    }
    return this.getState();
  }
}

export const runtimeStore = new RuntimeStore();
