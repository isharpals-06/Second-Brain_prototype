import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Knowledge:EntityResolver');

export class EntityResolver {
  constructor() {
    this.aliases = new Map(); // alias -> canonicalId
  }

  registerAlias(aliasId, canonicalId) {
    if (!aliasId || !canonicalId || aliasId === canonicalId) return;
    this.aliases.set(aliasId, canonicalId);
    log.info(`Mapped entity alias "${aliasId}" -> canonical "${canonicalId}"`);
  }

  resolve(entityId) {
    let current = entityId;
    let depth = 0;
    while (this.aliases.has(current) && depth < 10) {
      current = this.aliases.get(current);
      depth += 1;
    }
    return current;
  }

  detectDuplicate(pathOrUri, existingEntities) {
    if (!pathOrUri) return null;
    const cleanName = pathOrUri.replace(/\\/g, '/').split('/').pop().toLowerCase();

    for (const entity of existingEntities) {
      const entityClean = entity.id.replace(/\\/g, '/').split('/').pop().toLowerCase();
      if (entityClean === cleanName) {
        return entity;
      }
    }
    return null;
  }
}

export const entityResolver = new EntityResolver();
