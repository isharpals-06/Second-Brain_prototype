import { clientEventBus } from '../eventBus/EventBus.js';
import { SystemEvents } from '../../types/index.js';

class ClientSkillRegistry {
  constructor() {
    this.skills = new Map();
  }

  registerSkill(skillDef) {
    if (!skillDef || !skillDef.id || !skillDef.name) {
      throw new Error('[ClientSkillRegistry] Skill must include id and name.');
    }

    const record = {
      id: skillDef.id,
      name: skillDef.name,
      description: skillDef.description || '',
      category: skillDef.category || 'General',
      handler: skillDef.handler || null
    };

    this.skills.set(skillDef.id, record);
    return record;
  }

  getSkill(id) {
    return this.skills.get(id) || null;
  }

  async executeSkill(id, params = {}, context = {}) {
    const skill = this.getSkill(id);
    if (!skill) {
      throw new Error(`[ClientSkillRegistry] Skill "${id}" is not registered.`);
    }

    let result = null;
    if (typeof skill.handler === 'function') {
      result = await skill.handler(params, context);
    } else {
      result = { status: 'executed_stub', skillId: id, params };
    }

    clientEventBus.publish(SystemEvents.SKILL_EXECUTED, {
      skillId: id,
      skillName: skill.name,
      params,
      timestamp: new Date().toISOString()
    });

    return result;
  }

  listSkills() {
    return Array.from(this.skills.values());
  }
}

export const clientSkillRegistry = new ClientSkillRegistry();
export { ClientSkillRegistry };
