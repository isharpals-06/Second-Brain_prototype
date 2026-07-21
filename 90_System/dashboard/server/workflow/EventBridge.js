import { serverEventBus } from '../core/eventBus.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Workflow:EventBridge');

export class EventBridge {
  constructor() {
    this.eventCount = 0;
  }

  start() {
    log.info('Subscribing EventBridge to EventBus stream...');

    serverEventBus.subscribe('sentinel:event', (event) => {
      this.eventCount += 1;
      log.debug(`EventBridge received perception event [${event.category}]`);
    });
  }
}

export const eventBridge = new EventBridge();
