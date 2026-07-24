import { runtimeStore } from './RuntimeStore.js';
import { runtimeEvents } from './RuntimeEvents.js';
import { missionRuntime } from './MissionRuntime.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Runtime:Kernel');

export class RuntimeKernel {
  constructor() {
    this.booted = false;
    this.bootTime = null;
  }

  boot() {
    if (this.booted) return;
    this.bootTime = new Date().toISOString();
    this.booted = true;
    log.info('RuntimeKernel booted successfully.');
  }

  getHealth() {
    return {
      status: this.booted ? 'healthy' : 'uninitialized',
      bootTime: this.bootTime,
      activeMissionsCount: missionRuntime.listMissions().length,
      storeState: runtimeStore.getState(),
    };
  }

  shutdown() {
    this.booted = false;
    log.info('RuntimeKernel shut down gracefully.');
  }
}

export const runtimeKernel = new RuntimeKernel();
