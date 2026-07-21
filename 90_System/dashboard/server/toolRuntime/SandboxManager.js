import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('ToolRuntime:SandboxManager');

export class SandboxManager {
  constructor() {
    this.sandboxMode = 'standard'; // 'standard', 'dry_run', 'read_only'
  }

  setMode(mode) {
    this.sandboxMode = mode;
    log.info(`Sandbox mode set to: "${mode}"`);
  }

  isWriteAllowed() {
    return this.sandboxMode !== 'read_only' && this.sandboxMode !== 'dry_run';
  }
}

export const sandboxManager = new SandboxManager();
