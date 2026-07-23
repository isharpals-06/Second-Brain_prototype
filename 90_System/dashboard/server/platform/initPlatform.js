import { platformKernel } from './PlatformKernel.js';
import { secretsManager } from './SecretsManager.js';
import { capabilityRegistry } from './CapabilityRegistry.js';
import { mcpManager } from './MCPManager.js';
import { pluginManager } from './PluginManager.js';
import { serverServiceRegistry } from '../core/serviceRegistry.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Platform:Bootstrapper');

export function initializePlatformKernel() {
  console.log('----------------------------------------------------');
  console.log('🔌 Initializing AEGISOS Platform Kernel (v1.0.0)...');
  console.log('----------------------------------------------------');

  serverServiceRegistry.register('PlatformKernel', {
    name: 'AEGISOS Platform Kernel',
    status: 'running',
    platformKernel,
    secretsManager,
    capabilityRegistry,
    mcpManager,
    pluginManager,
  });

  log.info('[Platform Kernel] Provider routing, MCP discovery, Plugin registry, Secrets & Capability engines active.');

  return {
    platformKernel,
    secretsManager,
    capabilityRegistry,
    mcpManager,
    pluginManager,
  };
}
