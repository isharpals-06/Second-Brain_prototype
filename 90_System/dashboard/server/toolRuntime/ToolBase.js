import { ToolCategory } from './types.js';
import { aegisLogger } from '../core/logger.js';

export class ToolBase {
  constructor({ id, name, category = ToolCategory.FILESYSTEM, description = '', version = '1.0.0', permissions = [], timeoutMs = 30000 }) {
    if (!id || !name) {
      throw new Error('Tool requires unique "id" and "name"');
    }

    this.id = id;
    this.name = name;
    this.category = category;
    this.description = description;
    this._version = version;
    this._permissions = permissions;
    this.timeoutMs = timeoutMs;
    this._health = 'healthy';
    this.log = aegisLogger.child(`Tool:${id}`);
  }

  register() {
    this.log.info(`Registered tool "${this.name}" (${this.id})`);
    return true;
  }

  initialize() {
    this.log.info(`Initialized tool "${this.name}"`);
    return true;
  }

  validate(input) {
    return { isValid: true, errors: [] };
  }

  prepare(input) {
    return true;
  }

  async execute(input) {
    throw new Error(`Tool ${this.id} must implement execute(input)`);
  }

  cancel() {
    this.log.info(`Cancelled tool "${this.name}" execution`);
    return true;
  }

  cleanup() {
    return true;
  }

  dispose() {
    return true;
  }

  health() {
    return this._health;
  }

  metadata() {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      description: this.description,
      version: this._version,
      permissions: this._permissions,
      timeoutMs: this.timeoutMs,
      health: this._health
    };
  }

  version() {
    return this._version;
  }

  capabilities() {
    return [this.category];
  }

  permissions() {
    return this._permissions;
  }
}
