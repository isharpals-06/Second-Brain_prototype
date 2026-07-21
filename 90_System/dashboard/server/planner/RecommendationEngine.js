import { contextAPI } from '../worldModel/ContextAPI.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Planner:RecommendationEngine');

export class RecommendationEngine {
  generateRecommendations() {
    const recommendations = [];
    const sessionData = contextAPI.getSession();
    const activeSession = sessionData.currentSession;

    if (activeSession && activeSession.type === 'Coding Session') {
      const durationHours = (activeSession.durationMs || 0) / (1000 * 60 * 60);
      if (durationHours > 2) {
        recommendations.push({
          id: 'rec_break',
          type: 'health',
          title: 'Take a Short Break',
          description: 'You have been in a Coding Session for over 2 hours. Consider taking a 5-minute break.',
          priority: 'medium'
        });
      }

      recommendations.push({
        id: 'rec_git_commit',
        type: 'git',
        title: 'Commit Unsaved Progress',
        description: 'Multiple files updated in current session. Consider saving progress with a Git commit.',
        priority: 'high'
      });
    }

    recommendations.push({
      id: 'rec_flashcards',
      type: 'study',
      title: 'Pending Flashcard Review',
      description: 'You have 12 spaced repetition flashcards due for review today.',
      priority: 'medium'
    });

    return recommendations;
  }
}

export const recommendationEngine = new RecommendationEngine();
