import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Memory:ExperienceStore');

export class ExperienceStore {
  constructor() {
    this.experiences = [];
  }

  recordExperience({ category, title, details = {}, outcome = 'success' }) {
    const expId = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const record = {
      expId,
      category, // 'plan', 'workflow', 'simulation', 'tool', 'agent'
      title,
      details,
      outcome,
      timestamp: new Date().toISOString()
    };

    this.experiences.push(record);
    log.info(`Recorded experience [${category}] "${title}" (${outcome})`);
    return record;
  }

  listExperiences() {
    return this.experiences;
  }
}

export const experienceStore = new ExperienceStore();
