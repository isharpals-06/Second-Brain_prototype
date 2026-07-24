export class MissionValidator {
  validate(missionDraft) {
    const warnings = [];
    const errors = [];

    if (!missionDraft.intent || missionDraft.intent.trim().length === 0) {
      errors.push('Mission intent cannot be empty.');
    }

    if (!missionDraft.goals || !missionDraft.goals.primaryGoal) {
      warnings.push('Mission primary goal is missing or incomplete.');
    }

    if (!missionDraft.taskGraph || missionDraft.taskGraph.nodeCount === 0) {
      errors.push('Task graph cannot be empty.');
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
      warnings,
      checkedAt: new Date().toISOString(),
    };
  }
}

export const missionValidator = new MissionValidator();
