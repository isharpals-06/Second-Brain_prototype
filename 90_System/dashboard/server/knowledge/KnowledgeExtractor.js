import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Knowledge:Extractor');

export class KnowledgeExtractor {
  extractEntities(text = '') {
    if (!text || typeof text !== 'string') return [];
    const entities = [];
    const lower = text.toLowerCase();

    // 1. Technologies
    const techKeywords = ['react', 'node.js', 'sqlite', 'express', 'python', 'docker', 'vite', 'ollama', 'gemini', 'openrouter', 'huggingface', 'git', 'powershell', 'rest api'];
    techKeywords.forEach(tech => {
      if (lower.includes(tech)) {
        entities.push({ name: tech.toUpperCase(), type: 'Technology', confidence: 0.9 });
      }
    });

    // 2. Projects & Systems
    const projKeywords = ['aegisos', 'second brain', 'cockpit', 'sentinel', 'memory os', 'mpal', 'knowledge engine'];
    projKeywords.forEach(proj => {
      if (lower.includes(proj)) {
        entities.push({ name: proj.toUpperCase(), type: 'Project', confidence: 0.95 });
      }
    });

    // 3. Concepts
    const conceptKeywords = ['architecture', 'reasoning', 'planning', 'cognitive memory', 'reflection', 'event-driven', 'security', 'governance'];
    conceptKeywords.forEach(concept => {
      if (lower.includes(concept)) {
        entities.push({ name: concept.toUpperCase(), type: 'Concept', confidence: 0.85 });
      }
    });

    // 4. Tasks & Procedures
    if (lower.includes('fix') || lower.includes('implement') || lower.includes('upgrade') || lower.includes('build')) {
      entities.push({ name: 'Development Task', type: 'Task', confidence: 0.8 });
    }

    log.debug(`Extracted ${entities.length} entities from text input.`);
    return entities;
  }

  extractRelationships(entities = []) {
    const relationships = [];
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const e1 = entities[i];
        const e2 = entities[j];
        if (e1.type !== e2.type) {
          relationships.push({
            source: e1.name,
            target: e2.name,
            relation: 'ASSOCIATED_WITH',
            weight: 0.8
          });
        }
      }
    }
    return relationships;
  }
}

export const knowledgeExtractor = new KnowledgeExtractor();
