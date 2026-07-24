import { runtimeKernel } from './RuntimeKernel.js';
import { runtimeAPI } from './RuntimeAPI.js';
import { serverServiceRegistry } from '../core/serviceRegistry.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Runtime:Bootstrapper');

export function initializeRuntimeCore() {
  console.log('----------------------------------------------------');
  console.log('🧠 Initializing AEGISOS Runtime Core (v1.0.0)...');
  console.log('----------------------------------------------------');

  runtimeKernel.boot();

  serverServiceRegistry.register('RuntimeCore', {
    name: 'AEGISOS Runtime Core',
    status: 'running',
    runtimeKernel,
    runtimeAPI,
  });

  log.info('[Runtime Core] Runtime Kernel, Mission FSM, Event Bus & Runtime Store operational.');

  return {
    runtimeKernel,
    runtimeAPI,
  };
}
