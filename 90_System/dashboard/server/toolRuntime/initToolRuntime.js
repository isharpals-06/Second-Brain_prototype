import { ToolStorage } from './ToolStorage.js';
import { toolRuntimeAPI } from './ToolRuntimeAPI.js';
import { serverServiceRegistry } from '../core/serviceRegistry.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('ToolRuntime:Bootstrapper');

export function initializeToolRuntime(dbInstance) {
  console.log('----------------------------------------------------');
  console.log('🛠️ Initializing AEGISOS Tool Runtime (v0.5.5)...');
  console.log('----------------------------------------------------');

  // 1. Initialize SQLite Tool Storage
  const storage = new ToolStorage(dbInstance);
  toolRuntimeAPI.setStorage(storage);

  // 2. Execute initial tool status check (git_status)
  toolRuntimeAPI.executeTool('tool_git_status', {}).catch(() => {});

  // 3. Register ToolRuntime Service in ServiceRegistry
  serverServiceRegistry.register('ToolRuntime', {
    name: 'Tool Runtime & Hardware Abstraction Layer',
    status: 'running',
    toolRuntimeAPI
  });

  log.info('[Tool Runtime] Tool Registry, Permission Gateway, Resource Gateway, Sandbox Manager & Result Pipeline active.');

  return {
    toolRuntimeAPI,
    storage
  };
}
