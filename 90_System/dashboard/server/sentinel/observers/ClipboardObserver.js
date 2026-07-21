import { exec } from 'child_process';
import { BaseObserver } from './BaseObserver.js';
import { EventCategory, EventPriority } from '../eventSchema.js';

export class ClipboardObserver extends BaseObserver {
  constructor() {
    super({
      id: 'clipboard_observer',
      name: 'Clipboard Text Observer',
      category: EventCategory.CLIPBOARD,
      version: '1.0.0'
    });

    this.pollTimer = null;
    this.lastContent = null;
  }

  async initialize() {
    await super.initialize();
    this.log.info('ClipboardObserver initialized.');
  }

  async start() {
    await super.start();
    // Poll clipboard content lightweight every 3000ms
    this.pollTimer = setInterval(() => this.checkClipboard(), 3000);
  }

  checkClipboard() {
    if (this.state !== 'running') return;

    // Use PowerShell Get-Clipboard on Windows
    const cmd = `powershell -NoProfile -Command "Get-Clipboard"`;
    exec(cmd, { timeout: 2000 }, (err, stdout) => {
      if (err) return;

      const text = stdout ? stdout.trim() : '';
      if (!text || text.length > 5000) return; // Skip empty or massive buffer dumps

      if (this.lastContent !== null && text !== this.lastContent) {
        this.emitEvent(EventCategory.CLIPBOARD, EventPriority.LOW, {
          eventType: 'CLIPBOARD_UPDATED',
          charCount: text.length,
          snippet: text.substring(0, 100) + (text.length > 100 ? '...' : '')
        });
      }
      this.lastContent = text;
    });
  }

  async stop() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    await super.stop();
  }
}
