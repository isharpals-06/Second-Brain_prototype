import { runtimeKernel } from './RuntimeKernel.js';
import { runtimeStore } from './RuntimeStore.js';
import { runtimeEvents } from './RuntimeEvents.js';
import { missionRuntime } from './MissionRuntime.js';

export class RuntimeAPI {
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
}

export const runtimeAPI = new RuntimeAPI();
