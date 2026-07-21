import { serverEventBus } from './eventBus.js';
import { SystemEvents } from './types.js';

class SkillRegistry {
  constructor() {
    this.skills = new Map();
  }

  /**
   * Register a reusable capability / skill.
   * @param {Object} skillDef 
   */
  registerSkill(skillDef) {
    if (!skillDef || !skillDef.id || !skillDef.name) {
      throw new Error('[SkillRegistry] Skill definition must include "id" and "name".');
    }

    const record = {
      id: skillDef.id,
      name: skillDef.name,
      description: skillDef.description || '',
      category: skillDef.category || 'General',
      handler: skillDef.handler || null,
      inputs: skillDef.inputs || [],
      outputs: skillDef.outputs || []
    };

    this.skills.set(skillDef.id, record);
    console.log(`[SkillRegistry] Skill "${skillDef.name}" (${skillDef.id}) registered.`);
    return record;
  }

  /**
   * Retrieve a skill definition by ID.
   * @param {string} id 
   * @returns {Object|null}
   */
  getSkill(id) {
    return this.skills.get(id) || null;
  }

  /**
   * Execute a registered skill handler if provided, or log framework invocation.
   * @param {string} id 
   * @param {Object} params 
   * @param {Object} context 
   * @returns {Promise<any>}
   */
  async executeSkill(id, params = {}, context = {}) {
    const skill = this.getSkill(id);
    if (!skill) {
      throw new Error(`[SkillRegistry] Skill "${id}" is not registered.`);
    }

    const timestamp = new Date().toISOString();
    console.log(`[SkillRegistry] Executing skill "${skill.name}" (${id})...`);

    let result = null;
    if (typeof skill.handler === 'function') {
      result = await skill.handler(params, context);
    } else {
      result = { status: 'executed_stub', skillId: id, params };
    }

    serverEventBus.publish(SystemEvents.SKILL_EXECUTED, {
      skillId: id,
      skillName: skill.name,
      timestamp,
      params
    });

    return result;
  }

  /**
   * List all registered skills.
   * @returns {Array<Object>}
   */
  listSkills() {
    return Array.from(this.skills.values()).map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      category: s.category,
      hasHandler: typeof s.handler === 'function'
    }));
  }
}

export const serverSkillRegistry = new SkillRegistry();
export { SkillRegistry };
