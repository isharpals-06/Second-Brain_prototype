import { serverEventBus } from '../core/eventBus.js';
import { triggerEngine } from './TriggerEngine.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Automation:EventEngine');

export class EventAutomationEngine {
  start() {
    log.info('Subscribing EventAutomationEngine to EventBus stream...');

    serverEventBus.subscribe('sentinel:event', (event) => {
      triggerEngine.evaluateEvent(event.type, event);
    });
  }
}

export const eventAutomationEngine = new EventAutomationEngine();
