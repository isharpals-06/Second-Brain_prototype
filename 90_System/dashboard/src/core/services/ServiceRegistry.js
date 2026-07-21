import { clientEventBus } from '../eventBus/EventBus.js';
import { SystemEvents, ServiceNames } from '../../types/index.js';

class ClientServiceRegistry {
  constructor() {
    this.services = new Map();
  }

  register(name, serviceInstance) {
    if (!name || !serviceInstance) {
      throw new Error('[ClientServiceRegistry] Service name and instance required.');
    }
    this.services.set(name, serviceInstance);
    clientEventBus.publish(SystemEvents.SERVICE_STARTED, { name, timestamp: new Date().toISOString() });
  }

  get(name) {
    return this.services.get(name) || null;
  }

  has(name) {
    return this.services.has(name);
  }

  list() {
    return Array.from(this.services.keys()).map(name => ({
      name,
      active: true
    }));
  }

  unregister(name) {
    if (this.services.has(name)) {
      this.services.delete(name);
      clientEventBus.publish(SystemEvents.SERVICE_STOPPED, { name, timestamp: new Date().toISOString() });
    }
  }
}

export const clientServiceRegistry = new ClientServiceRegistry();
export { ClientServiceRegistry, ServiceNames };
