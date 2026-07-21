import path from 'path';
import fs from 'fs/promises';
import { BaseObserver } from './BaseObserver.js';
import { EventCategory, EventPriority } from '../eventSchema.js';

export class WorkspaceObserver extends BaseObserver {
  constructor(workspacePath) {
    super({
      id: 'workspace_observer',
      name: 'Workspace Observer',
      category: EventCategory.WORKSPACE,
      version: '1.0.0'
    });

    this.workspacePath = workspacePath || path.resolve(process.cwd(), '../../../');
    this.pollTimer = null;
    this.lastFileCount = 0;
  }

  async initialize() {
    await super.initialize();
    this.log.info(`WorkspaceObserver watching project root: ${this.workspacePath}`);
  }

  async start() {
    await super.start();

    // Sample workspace stats periodically (every 60s)
    this.pollTimer = setInterval(async () => {
      try {
        const stats = await this.scanWorkspaceStats();
        if (stats.fileCount !== this.lastFileCount) {
          this.emitEvent(EventCategory.WORKSPACE, EventPriority.LOW, {
            eventType: 'WORKSPACE_CHANGED',
            workspacePath: this.workspacePath,
            fileCount: stats.fileCount,
            delta: stats.fileCount - this.lastFileCount
          });
          this.lastFileCount = stats.fileCount;
        }
      } catch (err) {
        this.errorCount += 1;
        this.lastError = err.message;
      }
    }, 60000);

    // Initial emit
    this.scanWorkspaceStats().then(s => {
      this.lastFileCount = s.fileCount;
      this.emitEvent(EventCategory.WORKSPACE, EventPriority.LOW, {
        eventType: 'WORKSPACE_OPENED',
        workspacePath: this.workspacePath,
        fileCount: s.fileCount
      });
    }).catch(() => {});
  }

  async scanWorkspaceStats() {
    let count = 0;
    try {
      const items = await fs.readdir(this.workspacePath);
      count = items.length;
    } catch (_) {}
    return { fileCount: count };
  }

  async stop() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    await super.stop();
  }
}
