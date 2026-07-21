import { aegisLogger } from '../core/logger.js';
import { AegisError, ErrorCodes } from '../core/errors.js';

const log = aegisLogger.child('Sentinel:ObserverRegistry');

class ObserverRegistry {
  constructor() {
    this.observers = new Map();
  }

  register(observerInstance) {
    if (!observerInstance || !observerInstance.id) {
      throw new AegisError(ErrorCodes.SERVICE_ERROR, 'Observer instance must have a valid "id".');
    }

    if (this.observers.has(observerInstance.id)) {
      log.warn(`Observer "${observerInstance.id}" is already registered. Overwriting registration.`);
    }

    this.observers.set(observerInstance.id, observerInstance);
    log.info(`Registered observer "${observerInstance.name}" (${observerInstance.id}).`);
    return observerInstance;
  }

  unregister(id) {
    if (this.observers.has(id)) {
      const observer = this.observers.get(id);
      this.observers.delete(id);
      log.info(`Unregistered observer "${id}".`);
      return observer;
    }
    return null;
  }

  get(id) {
    return this.observers.get(id) || null;
  }

  has(id) {
    return this.observers.has(id);
  }

  list() {
    return Array.from(this.observers.values()).map(obs => obs.status());
  }

  listInstances() {
    return Array.from(this.observers.values());
  }
}

export const sentinelObserverRegistry = new ObserverRegistry();
export { ObserverRegistry };
