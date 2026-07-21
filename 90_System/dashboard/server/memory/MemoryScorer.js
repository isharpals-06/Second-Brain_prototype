import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Memory:Scorer');

export class MemoryScorer {
  computeCompositeScore(memory) {
    const importance = memory.importance || 0.5;
    const confidence = memory.confidence || 0.8;
    const accessCount = memory.accessCount || 1;

    // Recency decay calculation
    const ageHours = (Date.now() - new Date(memory.timestamp).getTime()) / (1000 * 60 * 60);
    const recencyScore = Math.max(0.1, 1 / (1 + ageHours * 0.05));

    // Usage frequency score
    const frequencyScore = Math.min(1.0, accessCount * 0.1);

    // Weighted composite formula
    const compositeScore = (importance * 0.35) + (confidence * 0.25) + (recencyScore * 0.25) + (frequencyScore * 0.15);

    log.debug(`Scored memory "${memory.id}": Composite ${compositeScore.toFixed(3)} (Importance: ${importance}, Recency: ${recencyScore.toFixed(2)})`);

    return Math.round(compositeScore * 100) / 100;
  }
}

export const memoryScorer = new MemoryScorer();
