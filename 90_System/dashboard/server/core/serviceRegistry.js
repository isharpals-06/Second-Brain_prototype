import { serverEventBus } from './eventBus.js';
import { SystemEvents, ServiceNames } from './types.js';
import { aegisLogger } from './logger.js';
import { AegisError, ErrorCodes } from './errors.js';

const log = aegisLogger.child('ServiceRegistry');

class ServiceRegistry {
  constructor() {
    this.services = new Map();
    this.lazyFactories = new Map();
  }

  /**
   * Register a named service instance directly.
   * @param {string} name 
   * @param {Object} serviceInstance 
   */
  register(name, serviceInstance) {
    if (!name || !serviceInstance) {
      throw new AegisError(ErrorCodes.SERVICE_ERROR, 'Service name and instance are required.');
    }
    this.services.set(name, serviceInstance);
    log.info(`Service "${name}" registered.`);

    serverEventBus.publish(SystemEvents.SERVICE_STARTED, { name, timestamp: new Date().toISOString() });
  }

  /**
   * Register a lazy factory function for deferred instantiation with dependency resolution.
   * @param {string} name 
   * @param {Function} factoryFn 
   * @param {Array<string>} dependencies 
   */
  registerLazy(name, factoryFn, dependencies = []) {
    if (!name || typeof factoryFn !== 'function') {
      throw new AegisError(ErrorCodes.SERVICE_ERROR, 'Service name and factory function are required.');
    }
    this.lazyFactories.set(name, { factoryFn, dependencies, instance: null });
    log.info(`Lazy service factory "${name}" registered (Dependencies: [${dependencies.join(', ')}]).`);
  }

  /**
   * Retrieve a service instance, resolving lazy factories if necessary.
   * @param {string} name 
   * @returns {Object|null}
   */
  get(name) {
    // 1. Direct instance
    if (this.services.has(name)) {
      return this.services.get(name);
    }

    // 2. Lazy factory resolution
    if (this.lazyFactories.has(name)) {
      const lazyRecord = this.lazyFactories.get(name);
      if (lazyRecord.instance) {
        return lazyRecord.instance;
      }

      log.info(`Resolving lazy service "${name}"...`);
      // Resolve dependencies
      const resolvedDeps = {};
      for (const depName of lazyRecord.dependencies) {
        const depService = this.get(depName);
        if (!depService) {
          throw new AegisError(ErrorCodes.SERVICE_ERROR, `Cannot resolve dependency "${depName}" for service "${name}".`);
        }
        resolvedDeps[depName] = depService;
      }

      // Instantiate instance
      try {
        const instance = lazyRecord.factoryFn(resolvedDeps);
        lazyRecord.instance = instance;
        this.services.set(name, instance);
        serverEventBus.publish(SystemEvents.SERVICE_STARTED, { name, timestamp: new Date().toISOString(), lazy: true });
        return instance;
      } catch (err) {
        throw new AegisError(ErrorCodes.SERVICE_ERROR, `Failed to instantiate lazy service "${name}": ${err.message}`);
      }
    }

    log.warn(`Requested service "${name}" is not registered.`);
    return null;
  }

  has(name) {
    return this.services.has(name) || this.lazyFactories.has(name);
  }

  list() {
    const directKeys = Array.from(this.services.keys());
    const lazyKeys = Array.from(this.lazyFactories.keys());

    const allNames = Array.from(new Set([...directKeys, ...lazyKeys]));
    return allNames.map(name => ({
      name,
      active: this.services.has(name),
      isLazy: this.lazyFactories.has(name) && !this.services.has(name)
    }));
  }

  unregister(name) {
    if (this.services.has(name)) {
      const service = this.services.get(name);
      if (typeof service.stop === 'function') {
        try {
          service.stop();
        } catch (err) {
          log.error(`Error stopping service "${name}": ${err.message}`);
        }
      }
      this.services.delete(name);
      serverEventBus.publish(SystemEvents.SERVICE_STOPPED, { name, timestamp: new Date().toISOString() });
    }
    if (this.lazyFactories.has(name)) {
      this.lazyFactories.delete(name);
    }
  }

  stopAll() {
    for (const name of Array.from(this.services.keys())) {
      this.unregister(name);
    }
  }
}

export const serverServiceRegistry = new ServiceRegistry();
export { ServiceRegistry, ServiceNames };
