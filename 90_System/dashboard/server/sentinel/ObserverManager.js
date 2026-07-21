import { sentinelObserverRegistry } from './ObserverRegistry.js';
import { ObserverState } from './observers/BaseObserver.js';
import { aegisLogger } from '../core/logger.js';
import { serverEventBus } from '../core/eventBus.js';

const log = aegisLogger.child('Sentinel:ObserverManager');

class ObserverManager {
  constructor() {
    this.healthMonitorTimer = null;
    this.checkIntervalMs = 30000; // 30s check
    this.restartAttempts = new Map();
    this.maxRestartAttempts = 3;
  }

  async initializeAll() {
    log.info('Initializing all registered Sentinel Observers...');
    for (const observer of sentinelObserverRegistry.listInstances()) {
      try {
        await observer.initialize();
      } catch (err) {
        log.error(`Failed to initialize observer "${observer.id}": ${err.message}`);
        observer.state = ObserverState.FAILED;
      }
    }
  }

  async startAll() {
    log.info('Starting all Sentinel Observers...');
    for (const observer of sentinelObserverRegistry.listInstances()) {
      try {
        if (observer.state === ObserverState.INITIALIZED || observer.state === ObserverState.STOPPED) {
          await observer.start();
        }
      } catch (err) {
        log.error(`Failed to start observer "${observer.id}": ${err.message}`);
        observer.state = ObserverState.FAILED;
      }
    }
    this.startHealthMonitor();
  }

  async stopAll() {
    log.info('Stopping Sentinel Observers cleanly...');
    this.stopHealthMonitor();
    for (const observer of sentinelObserverRegistry.listInstances()) {
      try {
        await observer.stop();
      } catch (err) {
        log.error(`Error stopping observer "${observer.id}": ${err.message}`);
      }
    }
  }

  async restartObserver(id) {
    const observer = sentinelObserverRegistry.get(id);
    if (!observer) return false;

    log.warn(`Attempting restart for observer "${id}"...`);
    const attempts = (this.restartAttempts.get(id) || 0) + 1;
    this.restartAttempts.set(id, attempts);

    try {
      await observer.stop();
      await observer.initialize();
      await observer.start();
      log.info(`Successfully restarted observer "${id}".`);
      this.restartAttempts.set(id, 0); // Reset counter on success
      return true;
    } catch (err) {
      log.error(`Restart failed for observer "${id}" (Attempt ${attempts}/${this.maxRestartAttempts}): ${err.message}`);
      observer.state = ObserverState.FAILED;
      return false;
    }
  }

  async pauseObserver(id) {
    const observer = sentinelObserverRegistry.get(id);
    if (observer) await observer.pause();
  }

  async resumeObserver(id) {
    const observer = sentinelObserverRegistry.get(id);
    if (observer) await observer.resume();
  }

  startHealthMonitor() {
    if (this.healthMonitorTimer) return;

    this.healthMonitorTimer = setInterval(async () => {
      log.debug('Running Sentinel health monitor check...');
      for (const observer of sentinelObserverRegistry.listInstances()) {
        const health = observer.health();
        if (health.status === 'failed' || observer.state === ObserverState.FAILED) {
          const attempts = this.restartAttempts.get(observer.id) || 0;
          if (attempts < this.maxRestartAttempts) {
            log.warn(`Health monitor detected failed observer "${observer.id}". Triggering auto-restart.`);
            await this.restartObserver(observer.id);
          } else {
            log.error(`Observer "${observer.id}" reached max restart attempts (${this.maxRestartAttempts}). Marking permanently failed.`);
          }
        }
      }
    }, this.checkIntervalMs);
  }

  stopHealthMonitor() {
    if (this.healthMonitorTimer) {
      clearInterval(this.healthMonitorTimer);
      this.healthMonitorTimer = null;
    }
  }

  getMetrics() {
    const observers = sentinelObserverRegistry.list();
    const totalEvents = observers.reduce((sum, obs) => sum + obs.eventCount, 0);
    const totalErrors = observers.reduce((sum, obs) => sum + obs.errorCount, 0);
    const activeCount = observers.filter(obs => obs.state === ObserverState.RUNNING).length;

    return {
      totalObservers: observers.length,
      activeObservers: activeCount,
      totalEvents,
      totalErrors,
      healthMonitorActive: !!this.healthMonitorTimer
    };
  }
}

export const sentinelObserverManager = new ObserverManager();
export { ObserverManager };
