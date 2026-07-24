import { intentClassifier } from './IntentClassifier.js';
import { goalExtractor } from './GoalExtractor.js';
import { taskDecomposer } from './TaskDecomposer.js';
import { missionBuilder } from './MissionBuilder.js';
import { missionValidator } from './MissionValidator.js';
import { intentEvents } from './IntentEvents.js';
import { IntentEventTypes } from './IntentTypes.js';
import { missionRuntime } from '../MissionRuntime.js';
import { runtimeStore } from '../RuntimeStore.js';
import { aegisLogger } from '../../core/logger.js';

const log = aegisLogger.child('Intent:Runtime');

export class IntentRuntimeEngine {
  processIntent(rawIntentText) {
    log.info(`Processing raw intent: "${rawIntentText}"`);
    intentEvents.emit(IntentEventTypes.INTENT_RECEIVED, { intent: rawIntentText });

    // Step 1: Classify Intent
    const classification = intentClassifier.classify(rawIntentText);
    intentEvents.emit(IntentEventTypes.INTENT_CLASSIFIED, classification);

    // Step 2: Extract Goals
    const goals = goalExtractor.extractGoals(rawIntentText, classification.category);
    intentEvents.emit(IntentEventTypes.GOAL_EXTRACTED, goals);

    // Step 3: Decompose Tasks
    const taskGraph = taskDecomposer.decompose(rawIntentText, classification.category);
    intentEvents.emit(IntentEventTypes.TASK_GRAPH_CREATED, taskGraph);

    // Step 4: Draft Mission
    const draftPayload = { intent: rawIntentText, classification, goals, taskGraph };
    intentEvents.emit(IntentEventTypes.MISSION_DRAFTED, draftPayload);

    // Step 5: Validate Mission
    const validation = missionValidator.validate(draftPayload);
    intentEvents.emit(IntentEventTypes.MISSION_VALIDATED, validation);

    if (!validation.isValid) {
      intentEvents.emit(IntentEventTypes.MISSION_REJECTED, validation);
      return { success: false, validation };
    }

    // Step 6: Build Immutable Mission
    const mission = missionBuilder.buildMission({ ...draftPayload, validation });
    missionRuntime.missions.set(mission.id, mission);
    intentEvents.emit(IntentEventTypes.MISSION_READY, mission);

    // Update Store
    runtimeStore.updateState('intentState', { lastIntent: rawIntentText, category: classification.category });
    runtimeStore.updateState('missionState', { currentMission: mission });
    runtimeStore.updateState('goalState', { activeGoals: goals });
    runtimeStore.updateState('taskGraphState', taskGraph);
    runtimeStore.updateState('validationState', validation);

    return {
      success: true,
      mission,
    };
  }
}

export const intentRuntimeEngine = new IntentRuntimeEngine();
