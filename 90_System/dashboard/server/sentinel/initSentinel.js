import { sentinelObserverRegistry } from './ObserverRegistry.js';
import { sentinelObserverManager } from './ObserverManager.js';
import { FileObserver } from './observers/FileObserver.js';
import { VaultObserver } from './observers/VaultObserver.js';
import { WorkspaceObserver } from './observers/WorkspaceObserver.js';
import { GitObserver } from './observers/GitObserver.js';
import { ClipboardObserver } from './observers/ClipboardObserver.js';
import { SystemObserver } from './observers/SystemObserver.js';
import { serverServiceRegistry } from '../core/serviceRegistry.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Sentinel:Bootstrapper');

export async function initializeSentinelCore() {
  console.log('----------------------------------------------------');
  console.log('👁️ Initializing AEGISOS Sentinel Core (v0.2.0)...');
  console.log('----------------------------------------------------');

  // 1. Instantiate Observers
  const fileObserver = new FileObserver();
  const vaultObserver = new VaultObserver();
  const workspaceObserver = new WorkspaceObserver();
  const gitObserver = new GitObserver();
  const clipboardObserver = new ClipboardObserver();
  const systemObserver = new SystemObserver();

  // 2. Register Observers into ObserverRegistry
  sentinelObserverRegistry.register(fileObserver);
  sentinelObserverRegistry.register(vaultObserver);
  sentinelObserverRegistry.register(workspaceObserver);
  sentinelObserverRegistry.register(gitObserver);
  sentinelObserverRegistry.register(clipboardObserver);
  sentinelObserverRegistry.register(systemObserver);

  // 3. Initialize & Start Observers via ObserverManager
  await sentinelObserverManager.initializeAll();
  await sentinelObserverManager.startAll();

  // 4. Register Sentinel Runtime in ServiceRegistry
  serverServiceRegistry.register('Sentinel', {
    name: 'Sentinel Perception Runtime',
    status: 'running',
    stop: () => sentinelObserverManager.stopAll()
  });

  log.info('[Sentinel Core] Active observers booted & publishing normalized perception events.');

  return {
    registry: sentinelObserverRegistry,
    manager: sentinelObserverManager
  };
}
