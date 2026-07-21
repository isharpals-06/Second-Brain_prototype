import { exec } from 'child_process';
import path from 'path';
import { BaseObserver } from './BaseObserver.js';
import { EventCategory, EventPriority } from '../eventSchema.js';

export class GitObserver extends BaseObserver {
  constructor(repoPath) {
    super({
      id: 'git_observer',
      name: 'Git Repository Observer',
      category: EventCategory.GIT,
      version: '1.0.0'
    });

    this.repoPath = repoPath || path.resolve(process.cwd(), '../../../');
    this.pollTimer = null;
    this.lastBranch = null;
    this.lastCommit = null;
  }

  async initialize() {
    await super.initialize();
    this.log.info(`GitObserver monitoring repository: ${this.repoPath}`);
  }

  async start() {
    await super.start();

    // Poll git repository state every 15 seconds
    this.pollTimer = setInterval(() => this.checkGitStatus(), 15000);
    this.checkGitStatus(); // Immediate check
  }

  checkGitStatus() {
    if (this.state !== 'running') return;

    const cmd = `git -C "${this.repoPath}" branch --show-current && git -C "${this.repoPath}" log -1 --format="%H|%s"`;
    exec(cmd, (err, stdout) => {
      if (err) {
        // Not a git repo or git error
        return;
      }

      const lines = stdout.trim().split('\n');
      const branch = lines[0] || 'main';
      const commitInfo = lines[1] || '';
      const [commitHash, commitMsg] = commitInfo.split('|');

      // Check branch change
      if (this.lastBranch && this.lastBranch !== branch) {
        this.emitEvent(EventCategory.GIT, EventPriority.MEDIUM, {
          eventType: 'GIT_BRANCH_CHANGED',
          previousBranch: this.lastBranch,
          currentBranch: branch
        });
      }
      this.lastBranch = branch;

      // Check new commit
      if (this.lastCommit && commitHash && this.lastCommit !== commitHash) {
        this.emitEvent(EventCategory.GIT, EventPriority.MEDIUM, {
          eventType: 'GIT_COMMIT_DETECTED',
          branch,
          commitHash,
          commitMsg
        });
      }
      this.lastCommit = commitHash;
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
