import { GovernanceStorage } from './GovernanceStorage.js';
import { governanceAPI } from './GovernanceAPI.js';
import { serverServiceRegistry } from '../core/serviceRegistry.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Governance:Bootstrapper');

export function initializeGovernancePlatform(dbInstance) {
  console.log('----------------------------------------------------');
  console.log('🛡️ Initializing AEGISOS Governance & Trust Platform (v0.8.0)...');
  console.log('----------------------------------------------------');

  // 1. Initialize SQLite Storage
  const storage = new GovernanceStorage(dbInstance);

  // 2. Perform initial test evaluation
  governanceAPI.evaluate({ action: 'tool_git_status', requester: 'sys_bootstrapper' });

  // 3. Register GovernanceAndTrustPlatform Service in ServiceRegistry
  serverServiceRegistry.register('GovernanceAndTrustPlatform', {
    name: 'Governance & Trust Platform',
    status: 'running',
    governanceAPI
  });

  log.info('[Governance Platform] Policy Engine, Trust Engine, Identity Manager, Audit Engine & Security Monitor active.');

  return {
    governanceAPI,
    storage
  };
}
