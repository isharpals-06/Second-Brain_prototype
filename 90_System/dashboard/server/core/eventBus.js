import { SystemEvents, EventSeverity } from './types.js';
import { aegisLogger } from './logger.js';
import { AegisError, ErrorCodes } from './errors.js';

const log = aegisLogger.child('EventBus');

class EventBus {
  constructor(options = {}) {
    this.listeners = new Map();
    this.globalListeners = new Set();
    this.eventHistory = [];
    this.maxHistorySize = options.maxHistorySize || 500;
    this.maxListenersPerEvent = options.maxListeners || 50;
  }

  /**
   * Subscribe to a specific system event or '*' for all events.
   * @param {string} event 
   * @param {Function} callback 
   * @returns {Function} Unsubscribe function
   */
  subscribe(event, callback) {
    if (!event || typeof callback !== 'function') {
      throw new AegisError(ErrorCodes.EVENT_ERROR, 'Event name and callback function are required.');
    }

    if (event === '*') {
      this.globalListeners.add(callback);
      return () => this.globalListeners.delete(callback);
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
    if (event === '*') {
      this.globalListeners.delete(callback);
      return;
    }

    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
      if (this.listeners.get(event).size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Publish a structured event to subscribers asynchronously.
   * @param {string} event 
   * @param {Object} payload 
   * @param {Object} [meta={}] 
   */
  publish(event, payload = {}, meta = {}) {
    const timestamp = new Date().toISOString();
    const correlationId = meta.correlationId || `corr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const subsystem = meta.subsystem || payload.subsystem || 'Kernel';
    const severity = meta.severity || payload.severity || EventSeverity.INFO;

    const eventRecord = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      event,
      timestamp,
      correlationId,
      subsystem,
      severity,
      payload
    };

    // Record history with size cap
    this.eventHistory.push(eventRecord);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // 1. Notify specific topic listeners
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

    // 2. Notify global stream subscribers (SSE / WebSockets)
    if (this.globalListeners.size > 0) {
      this.globalListeners.forEach((cb) => {
        try {
          cb(eventRecord);
        } catch (err) {
          log.error(`Exception in global subscriber for event "${event}": ${err.message}`, { error: err.stack });
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
      activeSubscribers: (this.listeners.has(eventName) ? this.listeners.get(eventName).size : 0) + this.globalListeners.size
    }));
  }

  /**
   * Retrieve event log history.
   * @param {number} limit 
   * @returns {Array}
   */
  getHistory(limit = 50) {
    return this.eventHistory.slice(-limit);
  }

  /**
   * Clear event bus subscriptions and history.
   */
  clear() {
    this.listeners.clear();
    this.globalListeners.clear();
    this.eventHistory = [];
  }
}

export const serverEventBus = new EventBus();
export { EventBus, SystemEvents, EventSeverity };
