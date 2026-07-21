import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Planner:ConstraintEngine');

export class ConstraintEngine {
  constructor() {
    this.constraints = {
      offlineMode: false,
      gpuBusy: false,
      memoryHigh: false,
      allowedTools: ['read_file', 'write_file', 'query_notes', 'search_vault', 'vector_search'],
      restrictedActions: ['execute_untrusted_script', 'delete_root_directory']
    };
  }

  evaluateConstraints() {
    return {
      ...this.constraints,
      activeConstraintsCount: (this.constraints.offlineMode ? 1 : 0) + (this.constraints.gpuBusy ? 1 : 0)
    };
  }

  updateConstraint(key, value) {
    if (key in this.constraints) {
      this.constraints[key] = value;
      log.info(`Updated constraint "${key}" -> ${value}`);
    }
  }
}

export const constraintEngine = new ConstraintEngine();
