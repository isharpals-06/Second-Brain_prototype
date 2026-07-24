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

    if (mission.state === MissionStateEnum.MISSION_CREATED) {
      this.transitionState(missionId, MissionStateEnum.PLANNING);
      setTimeout(() => this.advanceMission(missionId), 300);
    } else if (mission.state === MissionStateEnum.PLANNING) {
      this.transitionState(missionId, MissionStateEnum.CONTEXT_LOADING);
      setTimeout(() => this.advanceMission(missionId), 300);
    } else if (mission.state === MissionStateEnum.CONTEXT_LOADING) {
      this.transitionState(missionId, MissionStateEnum.AGENT_ALLOCATION);
      setTimeout(() => this.advanceMission(missionId), 300);
    } else if (mission.state === MissionStateEnum.AGENT_ALLOCATION) {
      this.transitionState(missionId, MissionStateEnum.EXECUTION);
      setTimeout(() => this.advanceMission(missionId), 400);
    } else if (mission.state === MissionStateEnum.EXECUTION) {
      this.transitionState(missionId, MissionStateEnum.REFLECTION);
      setTimeout(() => this.advanceMission(missionId), 300);
    } else if (mission.state === MissionStateEnum.REFLECTION) {
      this.transitionState(missionId, MissionStateEnum.MEMORY_UPDATE);
      setTimeout(() => this.advanceMission(missionId), 200);
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
