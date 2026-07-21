import { SystemEvents } from './types.js';
import { aegisLogger } from './logger.js';
import { AegisError, ErrorCodes } from './errors.js';

const log = aegisLogger.child('EventBus');

class EventBus {
  constructor(options = {}) {
    this.listeners = new Map();
    this.eventHistory = [];
    this.maxHistorySize = options.maxHistorySize || 100;
    this.maxListenersPerEvent = options.maxListeners || 25;
  }

  /**
   * Subscribe to a specific system event.
   * @param {string} event 
   * @param {Function} callback 
   * @returns {Function} Unsubscribe function
   */
  subscribe(event, callback) {
    if (!event || typeof callback !== 'function') {
      throw new AegisError(ErrorCodes.EVENT_ERROR, 'Event name and callback function are required.');
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const currentListeners = this.listeners.get(event);
    if (currentListeners.size >= this.maxListenersPerEvent) {
      log.warn(`Max listener threshold (${this.maxListenersPerEvent}) reached for event "${event}". Possible memory leak.`);
    }

    currentListeners.add(callback);
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

    // Record history with size cap
    this.eventHistory.push(eventRecord);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    const callbacks = this.listeners.get(event);
    if (callbacks && callbacks.size > 0) {
      callbacks.forEach((cb) => {
        try {
          cb(payload, eventRecord);
        } catch (err) {
          log.error(`Exception in subscriber for event "${event}": ${err.message}`, { error: err.stack });
        }
      });
    }
  }

  /**
   * Discover available events catalog with subscriber metrics.
   * @returns {Array<Object>}
   */
  getEventCatalog() {
    return Object.values(SystemEvents).map(eventName => ({
      name: eventName,
      activeSubscribers: this.listeners.has(eventName) ? this.listeners.get(eventName).size : 0
    }));
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
