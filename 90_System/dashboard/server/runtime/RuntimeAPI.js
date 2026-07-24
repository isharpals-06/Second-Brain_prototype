import { runtimeKernel } from './RuntimeKernel.js';
import { runtimeStore } from './RuntimeStore.js';
import { runtimeEvents } from './RuntimeEvents.js';
import { missionRuntime } from './MissionRuntime.js';
import { intentRuntimeEngine } from './IntentRuntime/IntentRuntimeEngine.js';
import { missionValidator } from './IntentRuntime/MissionValidator.js';
import { intentEvents } from './IntentRuntime/IntentEvents.js';
import { plannerRuntimeEngine } from './PlannerRuntime/PlannerRuntimeEngine.js';
import { plannerEvents } from './PlannerRuntime/PlannerEvents.js';

export class RuntimeAPI {
  // --- A1 Base Methods ---
  createMission(intent) {
    return missionRuntime.createMission(intent);
  }

  cancelMission(missionId) {
    return missionRuntime.cancelMission(missionId);
  }

  getRuntimeState() {
    return runtimeStore.getState();
  }

  getHealth() {
    return runtimeKernel.getHealth();
  }

  subscribe(eventType, callback) {
    return runtimeEvents.on(eventType, callback);
  }

  dispatch(eventType, payload) {
    return runtimeEvents.emit(eventType, payload);
  }

  // --- A2 Intent Engine Methods ---
  submitIntent(rawIntentText) {
    return intentRuntimeEngine.processIntent(rawIntentText);
  }

  getMission(missionId) {
    return missionRuntime.getMission(missionId);
  }

  validateMission(missionDraft) {
    return missionValidator.validate(missionDraft);
  }

  getTaskGraph(missionId) {
    const msn = missionRuntime.getMission(missionId);
    return msn ? msn.taskGraph : null;
  }

  subscribeToIntent(eventType, callback) {
    return intentEvents.subscribe(eventType, callback);
  }

  // --- A3 Planner Runtime Methods ---
  planMission(missionId) {
    return plannerRuntimeEngine.planMission(missionId);
  }

  getExecutionPlan(planId) {
    return plannerRuntimeEngine.getExecutionPlan(planId);
  }

  getPlanByMissionId(missionId) {
    return plannerRuntimeEngine.getPlanByMissionId(missionId);
  }

  getPlanningState() {
    return runtimeStore.getState().planningState;
  }

  subscribeToPlanning(eventType, callback) {
    return plannerEvents.subscribe(eventType, callback);
  }
}

export const runtimeAPI = new RuntimeAPI();
