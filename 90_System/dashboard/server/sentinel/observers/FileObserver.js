import chokidar from 'chokidar';
import path from 'path';
import { BaseObserver } from './BaseObserver.js';
import { EventCategory, EventPriority } from '../eventSchema.js';

export class FileObserver extends BaseObserver {
  constructor(watchPath) {
    super({
      id: 'file_observer',
      name: 'Filesystem Observer',
      category: EventCategory.FILESYSTEM,
      version: '1.0.0'
    });

    this.watchPath = watchPath || path.resolve(process.cwd(), '../../../00_Inbox');
    this.watcher = null;
    this.debounceTimers = new Map();
  }

  async initialize() {
    await super.initialize();
    this.log.info(`Configured file watcher on: ${this.watchPath}`);
  }

  async start() {
    await super.start();

    try {
      this.watcher = chokidar.watch(this.watchPath, {
        ignoreInitial: true,
        persistent: true,
        awaitWriteFinish: {
          stabilityThreshold: 500,
          pollInterval: 100
        }
      });

      this.watcher.on('add', (filePath) => this.debounceEvent('add', filePath, EventPriority.MEDIUM));
      this.watcher.on('change', (filePath) => this.debounceEvent('change', filePath, EventPriority.LOW));
      this.watcher.on('unlink', (filePath) => this.debounceEvent('unlink', filePath, EventPriority.HIGH));
      
      this.log.info(`FileObserver active and watching ${this.watchPath}`);
    } catch (err) {
      this.errorCount += 1;
      this.lastError = err.message;
      this.log.error(`Failed to start FileObserver: ${err.message}`);
    }
  }

  debounceEvent(type, filePath, priority) {
    const key = `${type}:${filePath}`;
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }

    const timer = setTimeout(() => {
      this.debounceTimers.delete(key);
      const filename = path.basename(filePath);
      this.emitEvent(EventCategory.FILESYSTEM, priority, {
        eventType: type, // 'add' | 'change' | 'unlink'
        filePath,
        filename,
        extension: path.extname(filename)
      });
    }, 300);

    this.debounceTimers.set(key, timer);
  }

  async stop() {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }
    this.debounceTimers.forEach(t => clearTimeout(t));
    this.debounceTimers.clear();
    await super.stop();
  }
}
