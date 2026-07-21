import os from 'os';
import { BaseObserver } from './BaseObserver.js';
import { EventCategory, EventPriority } from '../eventSchema.js';

export class SystemObserver extends BaseObserver {
  constructor() {
    super({
      id: 'system_observer',
      name: 'System Hardware Observer',
      category: EventCategory.SYSTEM,
      version: '1.0.0'
    });

    this.pollTimer = null;
  }

  async initialize() {
    await super.initialize();
    this.log.info('SystemObserver initialized.');
  }

  async start() {
    await super.start();
    // Sample hardware stats every 20 seconds
    this.pollTimer = setInterval(() => this.sampleTelemetry(), 20000);
    this.sampleTelemetry(); // Immediate initial sample
  }

  sampleTelemetry() {
    if (this.state !== 'running') return;

    try {
      const freeMemMb = Math.round(os.freemem() / (1024 * 1024));
      const totalMemMb = Math.round(os.totalmem() / (1024 * 1024));
      const usedMemMb = totalMemMb - freeMemMb;
      const memUsagePercent = Math.round((usedMemMb / totalMemMb) * 100);

      const loadAvg = os.loadavg();
      const uptimeSec = Math.round(os.uptime());

      this.emitEvent(EventCategory.SYSTEM, EventPriority.LOW, {
        eventType: 'SYSTEM_TELEMETRY_UPDATED',
        memory: {
          totalMb: totalMemMb,
          usedMb: usedMemMb,
          freeMb: freeMemMb,
          usagePercent: memUsagePercent
        },
        cpu: {
          cores: os.cpus().length,
          model: os.cpus()[0]?.model || 'Generic CPU',
          loadAverage: loadAvg
        },
        uptimeSeconds: uptimeSec,
        platform: os.platform(),
        arch: os.arch()
      });
    } catch (err) {
      this.errorCount += 1;
      this.lastError = err.message;
    }
  }

  async stop() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    await super.stop();
  }
}
