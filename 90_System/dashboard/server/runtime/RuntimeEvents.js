import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Runtime:Events');

export class RuntimeEvents {
  constructor() {
    this.listeners = new Map();
  }

  on(eventType, listener) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(listener);
    return () => this.off(eventType, listener);
  }

  off(eventType, listener) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).delete(listener);
    }
  }

  emit(eventType, payload = {}) {
    const record = {
      event: eventType,
      timestamp: new Date().toISOString(),
      payload,
    };

    if (this.listeners.has(eventType)) {
      for (const listener of this.listeners.get(eventType)) {
        try {
          listener(record);
        } catch (err) {
          log.error(`Listener error on event "${eventType}": ${err.message}`);
        }
      }
    }
    log.info(`Runtime Event Emitted: [${eventType}]`);
    return record;
  }
}

export const runtimeEvents = new RuntimeEvents();
