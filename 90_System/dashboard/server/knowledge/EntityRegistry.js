import { aegisLogger } from '../core/logger.js';
import { EntityType } from './types.js';

const log = aegisLogger.child('Knowledge:EntityRegistry');

export class EntityRegistry {
  constructor() {
    this.entities = new Map();
  }

  registerEntity({ id, type = EntityType.NOTE, label = '', uri = '', properties = {} }) {
    if (!id) return null;

    const existing = this.entities.get(id);
    const now = new Date().toISOString();

    if (existing) {
      existing.label = label || existing.label;
      existing.uri = uri || existing.uri;
      existing.properties = { ...existing.properties, ...properties };
      existing.updatedAt = now;
      log.debug(`Updated knowledge entity "${id}" (${type})`);
      return existing;
    }

    const entity = {
      id,
      type,
      label: label || id,
      uri,
      properties,
      createdAt: now,
      updatedAt: now
    };

    this.entities.set(id, entity);
    log.debug(`Registered knowledge entity "${id}" (${type})`);
    return entity;
  }

  getEntity(id) {
    return this.entities.get(id) || null;
  }

  hasEntity(id) {
    return this.entities.has(id);
  }

  findByType(type) {
    return Array.from(this.entities.values()).filter(e => e.type === type);
  }

  listEntities() {
    return Array.from(this.entities.values());
  }
}

export const entityRegistry = new EntityRegistry();
