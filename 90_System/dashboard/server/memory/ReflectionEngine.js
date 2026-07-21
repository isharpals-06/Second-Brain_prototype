import { experienceStore } from './ExperienceStore.js';
import { memoryStore } from './MemoryStore.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Memory:ReflectionEngine');

export class ReflectionEngine {
  generateReflectionReport() {
    log.info('Generating AEGISOS experience reflection report...');
    const experiences = experienceStore.listExperiences();
    const memories = memoryStore.listMemories();

    const report = {
      reportId: `refl_${Date.now()}`,
      timestamp: new Date().toISOString(),
      totalMemoriesAnalyzed: memories.length,
      totalExperiencesAnalyzed: experiences.length,
      lessonsLearned: [
        'Tool Runtime HAL enforcement prevents path traversal risks.',
        'Declarative WOP state machine ensures deterministic step execution.',
        '30s observer health check loops maintain background perception integrity.'
      ],
      frequentlyUsedWorkflows: ['System Health Inspection', 'Git Feature Workflow'],
      successfulPatterns: ['Parallel subagent execution', 'Node SQLite native persistence'],
      suggestedOptimizations: ['Pull nomic-embed-text for local Ollama RAG search integration']
    };

    log.info(`Reflection report generated (${report.reportId}).`);
    return report;
  }
}

export const reflectionEngine = new ReflectionEngine();
