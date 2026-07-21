import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Simulation:PermissionValidator');

export class PermissionValidator {
  constructor() {
    this.grantedPermissions = new Set([
      'read_file',
      'write_file',
      'search_vault',
      'query_knowledge',
      'git_commit'
    ]);

    this.restrictedPermissions = new Set([
      'delete_root_directory',
      'execute_untrusted_binary',
      'format_disk'
    ]);
  }

  validatePermissions(requiredPermissions = []) {
    const missing = [];
    const restricted = [];

    requiredPermissions.forEach(perm => {
      if (this.restrictedPermissions.has(perm)) {
        restricted.push(perm);
      } else if (!this.grantedPermissions.has(perm)) {
        missing.push(perm);
      }
    });

    const isPermitted = restricted.length === 0;
    log.debug(`Permission validation: ${isPermitted ? 'PASSED' : 'FAILED'} (Missing: ${missing.length}, Restricted: ${restricted.length})`);

    return {
      isPermitted,
      missingPermissions: missing,
      restrictedPermissions: restricted
    };
  }
}

export const permissionValidator = new PermissionValidator();
