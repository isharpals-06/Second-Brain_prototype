import { runtimeEvents } from '../RuntimeEvents.js';
import { aegisLogger } from '../../core/logger.js';

const log = aegisLogger.child('Context:Events');

export class ContextEvents {
  emit(eventType, payload = {}) {
    log.info(`Context Event Emitted: [${eventType}]`);
    return runtimeEvents.emit(eventType, payload);
  }

  subscribe(eventType, listener) {
    return runtimeEvents.on(eventType, listener);
  }
}

export const contextEvents = new ContextEvents();
