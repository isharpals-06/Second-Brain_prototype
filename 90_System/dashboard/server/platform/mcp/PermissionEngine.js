import { aegisLogger } from '../../core/logger.js';

const log = aegisLogger.child('MCP:PermissionEngine');

export class MCPPermissionEngine {
  constructor() {
    this.trustedPermissions = new Set([
      'read_filesystem',
      'write_filesystem',
      'execute_shell',
      'query_graph',
      'design_stitch',
    ]);
  }

  checkPermission(permissionName) {
    const isGranted = this.trustedPermissions.has(permissionName);
    if (!isGranted) {
      log.warn(`Permission "${permissionName}" requested but not in trusted scope.`);
    }
    return isGranted;
  }

  grantPermission(permissionName) {
    this.trustedPermissions.add(permissionName);
    log.info(`Permission "${permissionName}" granted.`);
    return true;
  }

  revokePermission(permissionName) {
    this.trustedPermissions.delete(permissionName);
    log.info(`Permission "${permissionName}" revoked.`);
    return true;
  }

  listPermissions() {
    return Array.from(this.trustedPermissions);
  }
}

export const mcpPermissionEngine = new MCPPermissionEngine();
