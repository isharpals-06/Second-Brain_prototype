import { PermissionPolicy } from './types.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('ToolRuntime:PermissionGateway');

export class PermissionGateway {
  constructor() {
    this.grantedPermissions = new Set([
      'read_file',
      'write_file',
      'search_vault',
      'git_commit',
      'query_knowledge'
    ]);
  }

  evaluatePermission(requiredPermissions = []) {
    for (const perm of requiredPermissions) {
      if (!this.grantedPermissions.has(perm)) {
        log.warn(`Permission Gateway DENIED: missing permission "${perm}"`);
        return { policy: PermissionPolicy.DENY, reason: `Missing permission "${perm}"` };
      }
    }
    return { policy: PermissionPolicy.ALLOW, reason: 'Permissions granted' };
  }
}

export const permissionGateway = new PermissionGateway();
