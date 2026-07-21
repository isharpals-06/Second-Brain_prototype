import { TriggerType, AutomationStatus } from './types.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Automation:Registry');

export class AutomationRegistry {
  constructor() {
    this.automations = new Map();
    this.initDefaultAutomations();
  }

  initDefaultAutomations() {
    const defaults = [
      {
        id: 'auto_vault_index',
        name: 'Auto-Index New Vault Notes',
        description: 'Triggers semantic indexing when new Obsidian vault notes are detected',
        trigger: { type: TriggerType.FILESYSTEM, path: 'C:\\Users\\ishar\\Projects\\10_Subjects' },
        workflowId: 'wf_research_pipeline',
        status: AutomationStatus.IDLE
      },
      {
        id: 'auto_git_guard',
        name: 'Git Feature Commit Guard',
        description: 'Runs git status checks and validates pre-commit requirements',
        trigger: { type: TriggerType.GIT, repo: 'SecondBrain' },
        workflowId: 'wf_git_feature',
        status: AutomationStatus.IDLE
      },
      {
        id: 'auto_health_audit',
        name: 'Daily System Health Telemetry Audit',
        description: 'Runs daily inspection of system observers and hardware telemetry',
        trigger: { type: TriggerType.CRON, cron: '0 0 * * *' },
        workflowId: 'wf_system_inspection',
        status: AutomationStatus.SCHEDULED
      }
    ];

    defaults.forEach(a => this.automations.set(a.id, a));
    log.info(`Initialized AutomationRegistry with ${this.automations.size} default automations.`);
  }

  getAutomation(id) {
    return this.automations.get(id) || null;
  }

  listAutomations() {
    return Array.from(this.automations.values());
  }
}

export const automationRegistry = new AutomationRegistry();
