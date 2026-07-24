export class GoalExtractor {
  extractGoals(intentText, category) {
    const raw = intentText || '';
    
    return {
      primaryGoal: raw,
      secondaryGoals: [
        `Verify requirements for ${category}`,
        'Ensure system safety and resource budget constraints',
      ],
      constraints: [
        'Zero breaking changes to existing APIs',
        'Strict execution security policies',
      ],
      resourcesMentioned: [],
      expectedOutput: `Executable ${category} artifact`,
      urgency: raw.toLowerCase().includes('urgent') || raw.toLowerCase().includes('immediately') ? 'high' : 'normal',
      priority: 1,
      dependencies: [],
      unknownInformation: [],
    };
  }
}

export const goalExtractor = new GoalExtractor();
