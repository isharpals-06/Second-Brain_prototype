import { intentEngine } from './IntentEngine.js';
import { goalEngine } from './GoalEngine.js';
import { priorityEngine } from './PriorityEngine.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Planner:DecisionEngine');

export class DecisionEngine {
  evaluateAlternatives() {
    const intent = intentEngine.getIntent();
    const priorities = priorityEngine.evaluatePriorities();
    const goals = goalEngine.listGoals();

    const alternatives = [
      {
        id: 'alt_coding',
        title: 'Continue AEGISOS Code & Architecture Development',
        score: 92,
        reasoning: 'Active coding session in progress with high priority goal "Complete AEGISOS System Architecture Phases"'
      },
      {
        id: 'alt_study',
        title: 'Review Spaced Repetition Flashcards & OS Notes',
        score: 75,
        reasoning: 'Upcoming university exams require regular flashcard review sessions'
      },
      {
        id: 'alt_research',
        title: 'Read & Index Deep Learning Research Papers',
        score: 60,
        reasoning: 'PDF documents available in vault for semantic indexing'
      }
    ];

    alternatives.sort((a, b) => b.score - a.score);
    log.debug(`Evaluated ${alternatives.length} decision alternatives. Top: "${alternatives[0].title}"`);
    return alternatives;
  }
}

export const decisionEngine = new DecisionEngine();
