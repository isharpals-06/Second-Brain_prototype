import { serverEventBus } from '../../core/eventBus.js';
import { createSentinelEvent, EventPriority } from '../eventSchema.js';
import { aegisLogger } from '../../core/logger.js';

export const ObserverState = Object.freeze({
  UNINITIALIZED: 'uninitialized',
  INITIALIZED: 'initialized',
  RUNNING: 'running',
  PAUSED: 'paused',
  STOPPED: 'stopped',
  FAILED: 'failed'
});

export class BaseObserver {
  constructor(metadata = {}) {
    if (new.target === BaseObserver) {
      throw new TypeError('Cannot instantiate abstract BaseObserver directly.');
    }

    this.id = metadata.id || 'observer_base';
    this.name = metadata.name || 'Base Observer';
    this.category = metadata.category || 'general';
    this.version = metadata.version || '1.0.0';
    this.dependencies = metadata.dependencies || [];
    this.permissions = metadata.permissions || [];

    this.state = ObserverState.UNINITIALIZED;
    this.startTime = null;
    this.lastEventTime = null;
    this.eventCount = 0;
    this.errorCount = 0;
    this.lastError = null;

    this.log = aegisLogger.child(`Sentinel:${this.id}`);
  }

  async initialize() {
    this.state = ObserverState.INITIALIZED;
    this.log.info(`Initialized observer "${this.name}".`);
  }

  async start() {
    this.state = ObserverState.RUNNING;
    this.startTime = new Date().toISOString();
    this.log.info(`Started observer "${this.name}".`);
  }

  async pause() {
    if (this.state === ObserverState.RUNNING) {
      this.state = ObserverState.PAUSED;
      this.log.info(`Paused observer "${this.name}".`);
    }
  }

  async resume() {
    if (this.state === ObserverState.PAUSED) {
      this.state = ObserverState.RUNNING;
      this.log.info(`Resumed observer "${this.name}".`);
    }
  }

  async stop() {
    this.state = ObserverState.STOPPED;
    this.log.info(`Stopped observer "${this.name}".`);
  }

  async dispose() {
    await this.stop();
    this.log.info(`Disposed observer "${this.name}".`);
  }

  emitEvent(category, priority = EventPriority.LOW, payload = {}) {
    if (this.state !== ObserverState.RUNNING) return;

    try {
      const event = createSentinelEvent({
        observer: this.id,
        category: category || this.category,
        priority,
        payload
      });

      this.eventCount += 1;
      this.lastEventTime = event.timestamp;

      // Publish through centralized AEGISOS EventBus
      serverEventBus.publish(`sentinel:${event.category}`, event);
      serverEventBus.publish('sentinel:event', event);
    } catch (err) {
      this.errorCount += 1;
      this.lastError = err.message;
      this.log.error(`Failed to emit event: ${err.message}`);
    }
  }

  status() {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      version: this.version,
      state: this.state,
      startTime: this.startTime,
      lastEventTime: this.lastEventTime,
      eventCount: this.eventCount,
      errorCount: this.errorCount,
      lastError: this.lastError
    };
  }

  health() {
    let healthStatus = 'healthy';
    if (this.state === ObserverState.FAILED) {
      healthStatus = 'failed';
    } else if (this.errorCount > 5) {
      healthStatus = 'degraded';
    }

    return {
      observerId: this.id,
      status: healthStatus,
      state: this.state,
      errorCount: this.errorCount,
      lastError: this.lastError,
      lastEventTime: this.lastEventTime
    };
  }
}
