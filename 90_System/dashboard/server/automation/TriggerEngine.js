import { TriggerType } from './types.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Automation:TriggerEngine');

export class TriggerEngine {
  constructor() {
    this.activeTriggers = new Map();
  }

  registerTrigger(automationId, triggerConfig) {
    this.activeTriggers.set(automationId, triggerConfig);
    log.info(`Registered trigger [Type: ${triggerConfig.type}] for automation "${automationId}"`);
  }

  evaluateEvent(eventType, eventData = {}) {
    log.debug(`Evaluating event trigger type "${eventType}"...`);
    const triggeredAutomations = [];

    for (const [autoId, config] of this.activeTriggers.entries()) {
      if (config.type === eventType || config.type === TriggerType.EVENT) {
        triggeredAutomations.push(autoId);
      }
    }

    return triggeredAutomations;
  }
}

export const triggerEngine = new TriggerEngine();
