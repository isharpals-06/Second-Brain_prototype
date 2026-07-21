import { SystemEvents } from '../../types/index.js';

class ClientEventBus {
  constructor() {
    this.listeners = new Map();
    this.history = [];
    this.maxHistory = 100;
  }

  subscribe(event, callback) {
    if (!event || typeof callback !== 'function') {
      throw new Error('[ClientEventBus] Event name and callback required.');
    }
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    return () => this.unsubscribe(event, callback);
  }

  unsubscribe(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
      if (this.listeners.get(event).size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  publish(event, payload = {}) {
    const timestamp = new Date().toISOString();
    const eventRecord = { event, payload, timestamp };

    this.history.push(eventRecord);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => {
        try {
          cb(payload, eventRecord);
        } catch (err) {
          console.error(`[ClientEventBus] Subscriber error for event "${event}":`, err);
        }
      });
    }
  }

  getHistory(limit = 20) {
    return this.history.slice(-limit);
  }
}

export const clientEventBus = new ClientEventBus();
export { ClientEventBus, SystemEvents };
