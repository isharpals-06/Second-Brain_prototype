import { MissionStateEnum, RuntimeEventTypes } from './RuntimeTypes.js';
import { runtimeEvents } from './RuntimeEvents.js';
import { runtimeStore } from './RuntimeStore.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Runtime:Mission');

export class MissionRuntime {
  constructor() {
    this.missions = new Map();
  }

  createMission(intentText) {
    const missionId = `msn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const mission = {
      id: missionId,
      intent: intentText,
      state: MissionStateEnum.INTENT_RECEIVED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: [],
    };

    this.missions.set(missionId, mission);
    runtimeEvents.emit(RuntimeEventTypes.MISSION_CREATED, mission);
    this.transitionState(missionId, MissionStateEnum.MISSION_CREATED);
    
    // Auto-advance lifecycle steps for demonstration FSM
    setTimeout(() => this.advanceMission(missionId), 200);

    return mission;
  }

  transitionState(missionId, targetState) {
    const mission = this.missions.get(missionId);
    if (!mission) return null;

    mission.state = targetState;
    mission.updatedAt = new Date().toISOString();
    
    runtimeStore.updateState('missionState', { currentMission: mission });
    runtimeEvents.emit(RuntimeEventTypes.MISSION_UPDATED, mission);
    log.info(`Mission "${missionId}" transitioned to state "${targetState}".`);

    return mission;
  }

  advanceMission(missionId) {
    const mission = this.missions.get(missionId);
    if (!mission) return;

    if (mission.state === MissionStateEnum.INTENT_RECEIVED) {
      this.transitionState(missionId, MissionStateEnum.INTENT_CLASSIFIED);
      setTimeout(() => this.advanceMission(missionId), 100);
    } else if (mission.state === MissionStateEnum.INTENT_CLASSIFIED) {
      this.transitionState(missionId, MissionStateEnum.MISSION_DRAFTED);
      setTimeout(() => this.advanceMission(missionId), 100);
    } else if (mission.state === MissionStateEnum.MISSION_DRAFTED) {
      this.transitionState(missionId, MissionStateEnum.MISSION_VALIDATED);
      setTimeout(() => this.advanceMission(missionId), 100);
    } else if (mission.state === MissionStateEnum.MISSION_VALIDATED) {
      this.transitionState(missionId, MissionStateEnum.MISSION_CREATED);
      setTimeout(() => this.advanceMission(missionId), 100);
    } else if (mission.state === MissionStateEnum.MISSION_CREATED) {
      this.transitionState(missionId, MissionStateEnum.PLANNING_STARTED);
      setTimeout(() => this.advanceMission(missionId), 100);
    } else if (mission.state === MissionStateEnum.PLANNING_STARTED) {
      this.transitionState(missionId, MissionStateEnum.DEPENDENCIES_RESOLVED);
      setTimeout(() => this.advanceMission(missionId), 100);
    } else if (mission.state === MissionStateEnum.DEPENDENCIES_RESOLVED) {
      this.transitionState(missionId, MissionStateEnum.CAPABILITIES_ASSIGNED);
      setTimeout(() => this.advanceMission(missionId), 100);
    } else if (mission.state === MissionStateEnum.CAPABILITIES_ASSIGNED) {
      this.transitionState(missionId, MissionStateEnum.EXECUTION_PLAN_READY);
      setTimeout(() => this.advanceMission(missionId), 100);
    } else if (mission.state === MissionStateEnum.EXECUTION_PLAN_READY) {
      this.transitionState(missionId, MissionStateEnum.BUILDING_CONTEXT);
      setTimeout(() => this.advanceMission(missionId), 100);
    } else if (mission.state === MissionStateEnum.BUILDING_CONTEXT) {
      this.transitionState(missionId, MissionStateEnum.CONTEXT_READY);
      setTimeout(() => this.advanceMission(missionId), 100);
    } else if (mission.state === MissionStateEnum.CONTEXT_READY) {
      this.transitionState(missionId, MissionStateEnum.WAITING_FOR_AGENTS);
      setTimeout(() => this.advanceMission(missionId), 150);
    } else if (mission.state === MissionStateEnum.WAITING_FOR_AGENTS) {
      this.transitionState(missionId, MissionStateEnum.WAITING_FOR_EXECUTION);
      setTimeout(() => this.advanceMission(missionId), 150);
    } else if (mission.state === MissionStateEnum.WAITING_FOR_EXECUTION) {
      this.transitionState(missionId, MissionStateEnum.CONTEXT_LOADING);
      setTimeout(() => this.advanceMission(missionId), 150);
    } else if (mission.state === MissionStateEnum.CONTEXT_LOADING) {
      this.transitionState(missionId, MissionStateEnum.AGENT_ALLOCATION);
      setTimeout(() => this.advanceMission(missionId), 150);
    } else if (mission.state === MissionStateEnum.AGENT_ALLOCATION) {
      this.transitionState(missionId, MissionStateEnum.EXECUTION);
      setTimeout(() => this.advanceMission(missionId), 200);
    } else if (mission.state === MissionStateEnum.EXECUTION) {
      this.transitionState(missionId, MissionStateEnum.REFLECTION);
      setTimeout(() => this.advanceMission(missionId), 150);
    } else if (mission.state === MissionStateEnum.REFLECTION) {
      this.transitionState(missionId, MissionStateEnum.MEMORY_UPDATE);
      setTimeout(() => this.advanceMission(missionId), 100);
    } else if (mission.state === MissionStateEnum.MEMORY_UPDATE) {
      this.transitionState(missionId, MissionStateEnum.COMPLETED);
      runtimeEvents.emit(RuntimeEventTypes.MISSION_COMPLETED, mission);
    }
  }

  cancelMission(missionId) {
    const mission = this.missions.get(missionId);
    if (mission) {
      this.transitionState(missionId, MissionStateEnum.CANCELLED);
      runtimeEvents.emit(RuntimeEventTypes.MISSION_CANCELLED, mission);
      return true;
    }
    return false;
  }

  getMission(missionId) {
    return this.missions.get(missionId) || null;
  }

  listMissions() {
    return Array.from(this.missions.values());
  }
}

export const missionRuntime = new MissionRuntime();
