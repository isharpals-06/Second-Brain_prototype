import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Platform:PluginManager');

export class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.registerDefaults();
  }

  registerDefaults() {
    const defaultPlugins = [
      { id: 'android-cli-plugin', name: 'Android CLI Plugin', version: '1.0.0', status: 'active', path: 'C:\\Users\\ishar\\.gemini\\config\\plugins\\android-cli-plugin' },
      { id: 'ponytail', name: 'Ponytail Code Optimizer Plugin', version: '1.2.0', status: 'active', path: 'C:\\Users\\ishar\\.gemini\\config\\plugins\\ponytail' },
      { id: 'science', name: 'Bioinformatics & Science Suite Plugin', version: '2.1.0', status: 'active', path: 'C:\\Users\\ishar\\.gemini\\config\\plugins\\science' },
    ];

    for (const plugin of defaultPlugins) {
      this.plugins.set(plugin.id, plugin);
    }
  }

  registerPlugin(id, config) {
    this.plugins.set(id, { id, status: 'active', ...config });
    log.info(`Plugin "${id}" registered.`);
  }

  listPlugins() {
    return Array.from(this.plugins.values());
  }

  getPlugin(id) {
    return this.plugins.get(id) || null;
  }
}

export const pluginManager = new PluginManager();
