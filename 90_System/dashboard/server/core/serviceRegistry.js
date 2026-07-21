import { serverEventBus } from './eventBus.js';
import { SystemEvents, ServiceNames } from './types.js';

class ServiceRegistry {
  constructor() {
    this.services = new Map();
  }

  /**
   * Register a named internal service instance.
   * @param {string} name 
   * @param {Object} serviceInstance 
   */
  register(name, serviceInstance) {
    if (!name || !serviceInstance) {
      throw new Error('[ServiceRegistry] Service name and instance are required.');
    }
    this.services.set(name, serviceInstance);
    console.log(`[ServiceRegistry] Service "${name}" registered.`);

    serverEventBus.publish(SystemEvents.SERVICE_STARTED, { name, timestamp: new Date().toISOString() });
  }

  /**
   * Retrieve a registered service by name.
   * @param {string} name 
   * @returns {Object|null}
   */
  get(name) {
    const service = this.services.get(name);
    if (!service) {
      console.warn(`[ServiceRegistry] Requested service "${name}" is not registered.`);
    }
    return service || null;
  }

  /**
   * Check if a service is registered.
   * @param {string} name 
   * @returns {boolean}
   */
  has(name) {
    return this.services.has(name);
  }

  /**
   * List all registered service metadata.
   * @returns {Array<{ name: string, active: boolean }>}
   */
  list() {
    return Array.from(this.services.keys()).map(name => ({
      name,
      active: true
    }));
  }

  /**
   * Unregister and stop a named service.
   * @param {string} name 
   */
  unregister(name) {
    if (this.services.has(name)) {
      const service = this.services.get(name);
      if (typeof service.stop === 'function') {
        try {
          service.stop();
        } catch (err) {
          console.error(`[ServiceRegistry] Error stopping service "${name}":`, err);
        }
      }
      this.services.delete(name);
      serverEventBus.publish(SystemEvents.SERVICE_STOPPED, { name, timestamp: new Date().toISOString() });
    }
  }

  /**
   * Shutdown all registered services cleanly.
   */
  stopAll() {
    for (const name of Array.from(this.services.keys())) {
      this.unregister(name);
    }
  }
}

export const serverServiceRegistry = new ServiceRegistry();
export { ServiceRegistry, ServiceNames };
