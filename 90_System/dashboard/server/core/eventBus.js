import { SystemEvents } from './types.js';

class EventBus {
  constructor() {
    this.listeners = new Map();
    this.eventHistory = [];
    this.maxHistorySize = 100;
  }

  /**
   * Subscribe to a specific system event.
   * @param {string} event 
   * @param {Function} callback 
   * @returns {Function} Unsubscribe function
   */
  subscribe(event, callback) {
    if (!event || typeof callback !== 'function') {
      throw new Error('[EventBus] Event name and callback function are required.');
    }
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    return () => this.unsubscribe(event, callback);
  }

  /**
   * Unsubscribe from an event.
   * @param {string} event 
   * @param {Function} callback 
   */
  unsubscribe(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
      if (this.listeners.get(event).size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Publish an event to all subscribers asynchronously.
   * @param {string} event 
   * @param {any} payload 
   */
  publish(event, payload = {}) {
    const timestamp = new Date().toISOString();
    const eventRecord = { event, payload, timestamp };

    // Record history
    this.eventHistory.push(eventRecord);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(payload, eventRecord);
        } catch (err) {
          console.error(`[EventBus] Exception in subscriber for event "${event}":`, err);
        }
      });
    }
  }

  /**
   * Retrieve event log history.
   * @param {number} limit 
   * @returns {Array}
   */
  getHistory(limit = 20) {
    return this.eventHistory.slice(-limit);
  }

  /**
   * Clear event bus subscriptions and history.
   */
  clear() {
    this.listeners.clear();
    this.eventHistory = [];
  }
}

export const serverEventBus = new EventBus();
export { EventBus, SystemEvents };
