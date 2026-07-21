import { serverEventBus } from './eventBus.js';
import { SystemEvents } from './types.js';
import { aegisLogger } from './logger.js';
import { AegisError, ErrorCodes } from './errors.js';

const log = aegisLogger.child('SkillRegistry');

class SkillRegistry {
  constructor() {
    this.skills = new Map();
  }

  /**
   * Register a capability / skill with versioning and permission metadata.
   * @param {Object} skillDef 
   */
  registerSkill(skillDef) {
    if (!skillDef || !skillDef.id || !skillDef.name) {
      throw new AegisError(ErrorCodes.SKILL_ERROR, 'Skill definition must include "id" and "name".');
    }

    const record = {
      id: skillDef.id,
      name: skillDef.name,
      version: skillDef.version || '1.0.0',
      description: skillDef.description || '',
      category: skillDef.category || 'General',
      handler: skillDef.handler || null,
      requiredPermissions: skillDef.requiredPermissions || [],
      inputs: skillDef.inputs || [],
      outputs: skillDef.outputs || []
    };

    this.skills.set(skillDef.id, record);
    log.info(`Skill "${skillDef.name}" v${record.version} (${skillDef.id}) registered.`);
    return record;
  }

  getSkill(id) {
    return this.skills.get(id) || null;
  }

  /**
   * Validate if granted permissions satisfy skill's required permissions.
   * @param {string} id 
   * @param {Array<string>} grantedPermissions 
   * @returns {boolean}
   */
  validatePermissions(id, grantedPermissions = []) {
    const skill = this.getSkill(id);
    if (!skill) return false;
    if (!skill.requiredPermissions || skill.requiredPermissions.length === 0) return true;

    return skill.requiredPermissions.every(req => grantedPermissions.includes(req));
  }

  /**
   * Search skills by category.
   * @param {string} category 
   * @returns {Array<Object>}
   */
  findByCategory(category) {
    return Array.from(this.skills.values()).filter(s =>
      s.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Execute a registered skill.
   * @param {string} id 
   * @param {Object} params 
   * @param {Object} context 
   * @param {Array<string>} userPermissions 
   * @returns {Promise<any>}
   */
  async executeSkill(id, params = {}, context = {}, userPermissions = ['*']) {
    const skill = this.getSkill(id);
    if (!skill) {
      throw new AegisError(ErrorCodes.SKILL_ERROR, `Skill "${id}" is not registered.`);
    }

    if (!userPermissions.includes('*') && !this.validatePermissions(id, userPermissions)) {
      throw new AegisError(ErrorCodes.PERMISSION_DENIED, `Permission denied to execute skill "${id}". Required: [${skill.requiredPermissions.join(', ')}]`);
    }

    const timestamp = new Date().toISOString();
    log.info(`Executing skill "${skill.name}" (${id})...`);

    let result = null;
    if (typeof skill.handler === 'function') {
      result = await skill.handler(params, context);
    } else {
      result = { status: 'executed_stub', skillId: id, params };
    }

    serverEventBus.publish(SystemEvents.SKILL_EXECUTED, {
      skillId: id,
      skillName: skill.name,
      version: skill.version,
      timestamp,
      params
    });

    return result;
  }

  listSkills() {
    return Array.from(this.skills.values()).map(s => ({
      id: s.id,
      name: s.name,
      version: s.version,
      description: s.description,
      category: s.category,
      requiredPermissions: s.requiredPermissions,
      hasHandler: typeof s.handler === 'function'
    }));
  }
}

export const serverSkillRegistry = new SkillRegistry();
export { SkillRegistry };
