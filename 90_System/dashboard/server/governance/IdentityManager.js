import { IdentityType } from './types.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Governance:IdentityManager');

export class IdentityManager {
  constructor() {
    this.identities = new Map([
      ['usr_admin', { id: 'usr_admin', name: 'System Admin', type: IdentityType.USER, roles: ['admin'] }],
      ['sys_kernel', { id: 'sys_kernel', name: 'AEGISOS Kernel', type: IdentityType.SYSTEM, roles: ['system'] }]
    ]);
  }

  createIdentity({ name, type = IdentityType.AGENT, roles = ['agent'] }) {
    const id = `id_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const identity = { id, name, type, roles, createdAt: new Date().toISOString() };
    this.identities.set(id, identity);
    log.info(`Registered identity "${name}" (${id}) [Type: ${type}]`);
    return identity;
  }

  getIdentity(id) {
    return this.identities.get(id) || null;
  }

  listIdentities() {
    return Array.from(this.identities.values());
  }
}

export const identityManager = new IdentityManager();
