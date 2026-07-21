import { StepType } from './types.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Workflow:Registry');

export class WorkflowRegistry {
  constructor() {
    this.workflows = new Map();
    this.registerBuiltInWorkflows();
  }

  registerBuiltInWorkflows() {
    const defaultWorkflows = [
      {
        id: 'wf_research_pipeline',
        name: 'Research Paper Pipeline',
        description: 'Searches vault notes, extracts concepts, and indexes PDF papers',
        version: '1.0.0',
        steps: [
          { id: 's1', title: 'Search Vault Notes', type: StepType.TOOL, toolId: 'tool_vault_search', inputs: { query: 'Operating Systems' } },
          { id: 's2', title: 'Save Checkpoint', type: StepType.CHECKPOINT },
          { id: 's3', title: 'Organize Notes via Librarian Agent', type: StepType.AGENT, agentId: 'agent_librarian' }
        ]
      },
      {
        id: 'wf_git_feature',
        name: 'Git Feature Workflow',
        description: 'Queries status, checks changed files, and commits feature update',
        version: '1.0.0',
        steps: [
          { id: 's1', title: 'Check Git Status', type: StepType.TOOL, toolId: 'tool_git_status' },
          { id: 's2', title: 'Request Git Commit Approval', type: StepType.APPROVAL, actionName: 'Git Commit Feature' }
        ]
      },
      {
        id: 'wf_system_inspection',
        name: 'System Health Inspection',
        description: 'Inspects telemetry, reads system status, and generates summary',
        version: '1.0.0',
        steps: [
          { id: 's1', title: 'Run System Telemetry Inspection', type: StepType.AGENT, agentId: 'agent_monitoring' },
          { id: 's2', title: 'Save Inspection Checkpoint', type: StepType.CHECKPOINT }
        ]
      }
    ];

    defaultWorkflows.forEach(wf => {
      this.workflows.set(wf.id, wf);
    });

    log.info(`Registered ${this.workflows.size} declarative workflows in WorkflowRegistry.`);
  }

  getWorkflow(id) {
    return this.workflows.get(id) || null;
  }

  listWorkflows() {
    return Array.from(this.workflows.values());
  }
}

export const workflowRegistry = new WorkflowRegistry();
