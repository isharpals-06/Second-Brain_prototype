import { AgentStatus } from './types.js';
import { aegisLogger } from '../core/logger.js';

export class AgentBase {
  constructor({ id, name, description = '', version = '1.0.0', capabilities = [], permissions = [] }) {
    if (!id || !name) {
      throw new Error('Agent requires unique "id" and "name"');
    }

    this.id = id;
    this.name = name;
    this.description = description;
    this.version = version;
    this._capabilities = capabilities;
    this._permissions = permissions;
    this._status = AgentStatus.REGISTERED;
    this._health = 'healthy';
    this.lastHeartbeat = new Date().toISOString();
    this.restartCount = 0;
    this.log = aegisLogger.child(`Agent:${id}`);
  }

  register() {
    this._status = AgentStatus.REGISTERED;
    this.log.info(`Registered agent "${this.name}" (${this.id})`);
    return true;
  }

  initialize() {
    this._status = AgentStatus.INITIALIZED;
    this.log.info(`Initialized agent "${this.name}"`);
    return true;
  }

  start() {
    this._status = AgentStatus.RUNNING;
    this.lastHeartbeat = new Date().toISOString();
    this.log.info(`Started agent "${this.name}"`);
    return true;
  }

  pause() {
    this._status = AgentStatus.PAUSED;
    this.log.info(`Paused agent "${this.name}"`);
    return true;
  }

  resume() {
    this._status = AgentStatus.RUNNING;
    this.lastHeartbeat = new Date().toISOString();
    this.log.info(`Resumed agent "${this.name}"`);
    return true;
  }

  stop() {
    this._status = AgentStatus.STOPPED;
    this.log.info(`Stopped agent "${this.name}"`);
    return true;
  }

  dispose() {
    this._status = AgentStatus.DISPOSED;
    this.log.info(`Disposed agent "${this.name}"`);
    return true;
  }

  heartbeat() {
    this.lastHeartbeat = new Date().toISOString();
    return this.lastHeartbeat;
  }

  status() {
    return this._status;
  }

  health() {
    return this._health;
  }

  capabilities() {
    return this._capabilities;
  }

  permissions() {
    return this._permissions;
  }

  getMetrics() {
    return {
      id: this.id,
      name: this.name,
      status: this._status,
      health: this._health,
      lastHeartbeat: this.lastHeartbeat,
      restartCount: this.restartCount
    };
  }
}
