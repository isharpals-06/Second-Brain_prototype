import { runtimeEvents } from '../RuntimeEvents.js';
import { aegisLogger } from '../../core/logger.js';

const log = aegisLogger.child('Intent:Events');

export class IntentEvents {
  emit(eventType, payload = {}) {
    log.info(`Intent Event Emitted: [${eventType}]`);
    return runtimeEvents.emit(eventType, payload);
  }

  subscribe(eventType, listener) {
    return runtimeEvents.on(eventType, listener);
  }
}

export const intentEvents = new IntentEvents();
