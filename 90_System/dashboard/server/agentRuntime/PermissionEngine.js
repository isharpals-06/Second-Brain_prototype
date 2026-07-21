import { agentRegistry } from './AgentRegistry.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('AgentRuntime:PermissionEngine');

export class PermissionEngine {
  checkPermission(agentId, actionPermission) {
    const agent = agentRegistry.getAgent(agentId);
    if (!agent) return false;

    const permissions = agent.permissions();
    const hasPerm = permissions.includes(actionPermission) || permissions.includes('*');

    log.debug(`Permission check for agent "${agentId}" -> "${actionPermission}": ${hasPerm ? 'GRANTED' : 'DENIED'}`);
    return hasPerm;
  }
}

export const permissionEngine = new PermissionEngine();
