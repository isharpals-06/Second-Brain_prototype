import chokidar from 'chokidar';
import path from 'path';
import { BaseObserver } from './BaseObserver.js';
import { EventCategory, EventPriority } from '../eventSchema.js';

export class VaultObserver extends BaseObserver {
  constructor(vaultPath) {
    super({
      id: 'vault_observer',
      name: 'Obsidian Vault Observer',
      category: EventCategory.VAULT,
      version: '1.0.0'
    });

    this.vaultPath = vaultPath || path.resolve(process.cwd(), '../../../10_Subjects');
    this.watcher = null;
  }

  async initialize() {
    await super.initialize();
    this.log.info(`VaultObserver set to watch: ${this.vaultPath}`);
  }

  async start() {
    await super.start();

    try {
      this.watcher = chokidar.watch(this.vaultPath, {
        ignoreInitial: true,
        persistent: true,
        depth: 3
      });

      this.watcher.on('add', (filePath) => {
        if (filePath.endsWith('.md')) {
          const isMoc = filePath.toLowerCase().includes('moc.md');
          this.emitEvent(EventCategory.VAULT, isMoc ? EventPriority.HIGH : EventPriority.MEDIUM, {
            eventType: 'NOTE_CREATED',
            isMoc,
            filePath,
            noteName: path.basename(filePath, '.md')
          });
        }
      });

      this.watcher.on('change', (filePath) => {
        if (filePath.endsWith('.md')) {
          const isMoc = filePath.toLowerCase().includes('moc.md');
          this.emitEvent(EventCategory.VAULT, EventPriority.LOW, {
            eventType: 'NOTE_UPDATED',
            isMoc,
            filePath,
            noteName: path.basename(filePath, '.md')
          });
        }
      });

      this.watcher.on('unlink', (filePath) => {
        if (filePath.endsWith('.md')) {
          this.emitEvent(EventCategory.VAULT, EventPriority.HIGH, {
            eventType: 'NOTE_DELETED',
            filePath,
            noteName: path.basename(filePath, '.md')
          });
        }
      });

      this.log.info('VaultObserver active.');
    } catch (err) {
      this.errorCount += 1;
      this.lastError = err.message;
      this.log.error(`VaultObserver error: ${err.message}`);
    }
  }

  async stop() {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }
    await super.stop();
  }
}
