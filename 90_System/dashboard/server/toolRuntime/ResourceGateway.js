import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('ToolRuntime:ResourceGateway');

export class ResourceGateway {
  validateResourceAccess(tool, input) {
    if (input && input.filePath) {
      if (input.filePath.includes('..') || input.filePath.includes('system32')) {
        log.warn(`Resource Gateway blocked unsafe path access: "${input.filePath}"`);
        return { isAllowed: false, reason: 'Restricted system file path' };
      }
    }
    return { isAllowed: true, reason: 'Resource access valid' };
  }
}

export const resourceGateway = new ResourceGateway();
