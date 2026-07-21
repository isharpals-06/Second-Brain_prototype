import path from 'path';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('WorldModel:WorkspaceManager');

export class WorkspaceManager {
  constructor() {
    this.currentWorkspace = path.resolve(process.cwd(), '../../../');
    this.workspaceHistory = [this.currentWorkspace];
    this.openDirectories = new Set([this.currentWorkspace]);
    this.recentDirectories = [this.currentWorkspace];
  }

  getCurrentWorkspace() {
    return {
      currentWorkspace: this.currentWorkspace,
      workspaceHistory: this.workspaceHistory,
      openDirectories: Array.from(this.openDirectories),
      recentDirectories: this.recentDirectories
    };
  }

  setWorkspace(dirPath) {
    if (!dirPath || this.currentWorkspace === dirPath) return;
    this.currentWorkspace = dirPath;
    this.workspaceHistory.push(dirPath);
    this.openDirectories.add(dirPath);

    if (!this.recentDirectories.includes(dirPath)) {
      this.recentDirectories.unshift(dirPath);
      if (this.recentDirectories.length > 10) this.recentDirectories.pop();
    }
    log.info(`Current workspace set to: ${dirPath}`);
  }
}

export const workspaceManager = new WorkspaceManager();
