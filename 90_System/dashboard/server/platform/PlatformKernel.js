import { aegisLogger } from '../core/logger.js';
import { providerManager } from '../ai/providerManager.js';
import { secretsManager } from './SecretsManager.js';
import { capabilityRegistry } from './CapabilityRegistry.js';
import { mcpManager } from './MCPManager.js';
import { pluginManager } from './PluginManager.js';

const log = aegisLogger.child('Platform:Kernel');

export class PlatformKernel {
  getDiagnostics() {
    return {
      kernelVersion: 'AEGISOS-Platform-v1.0.0',
      status: 'healthy',
      secrets: secretsManager.listSecretStatus(),
      capabilities: capabilityRegistry.listCapabilities(),
      mcpServers: mcpManager.listServers(),
      plugins: pluginManager.listPlugins(),
      telemetry: providerManager.getTelemetry(),
    };
  }
}

export const platformKernel = new PlatformKernel();
