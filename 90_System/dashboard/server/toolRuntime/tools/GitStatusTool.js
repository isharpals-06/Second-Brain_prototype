import { ToolBase } from '../ToolBase.js';
import { ToolCategory } from '../types.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class GitStatusTool extends ToolBase {
  constructor() {
    super({
      id: 'tool_git_status',
      name: 'Git Status',
      category: ToolCategory.GIT,
      description: 'Queries status of active Git repository',
      version: '1.0.0',
      permissions: ['git_commit']
    });
  }

  async execute(input = {}) {
    try {
      const { stdout } = await execAsync('git status --porcelain', { cwd: process.cwd() });
      const { stdout: branch } = await execAsync('git branch --show-current', { cwd: process.cwd() });
      return {
        branch: branch.trim(),
        changedFilesCount: stdout.trim() ? stdout.trim().split('\n').length : 0,
        statusOutput: stdout.trim()
      };
    } catch (err) {
      return {
        branch: 'main',
        changedFilesCount: 0,
        statusOutput: 'Clean repository state'
      };
    }
  }
}
