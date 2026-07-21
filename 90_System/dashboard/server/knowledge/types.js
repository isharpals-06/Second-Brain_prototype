/**
 * AEGISOS Knowledge Graph & Semantic Index — Type Definitions
 */

export const EntityType = Object.freeze({
  PROJECT: 'project',
  REPOSITORY: 'repository',
  WORKSPACE: 'workspace',
  DIRECTORY: 'directory',
  FILE: 'file',
  PDF: 'pdf',
  NOTE: 'note',
  CONVERSATION: 'conversation',
  SESSION: 'session',
  FLASHCARD_DECK: 'flashcard_deck',
  FLASHCARD: 'flashcard',
  TASK: 'task',
  GOAL: 'goal',
  COMMIT: 'commit',
  BRANCH: 'branch',
  SKILL: 'skill',
  TOOL: 'tool',
  AGENT: 'agent',
  DOCUMENT: 'document',
  FOLDER: 'folder'
});

export const KnowledgeRelation = Object.freeze({
  BELONGS_TO: 'BELONGS_TO',
  GENERATED_FROM: 'GENERATED_FROM',
  RELATED_TO: 'RELATED_TO',
  REFERENCES: 'REFERENCES',
  DEPENDS_ON: 'DEPENDS_ON',
  CREATED_BY: 'CREATED_BY',
  MODIFIED_BY: 'MODIFIED_BY',
  INDEXED_AS: 'INDEXED_AS',
  PART_OF: 'PART_OF',
  USES: 'USES',
  OPENED_IN: 'OPENED_IN',
  LOCATED_IN: 'LOCATED_IN',
  CONNECTED_TO: 'CONNECTED_TO',
  MENTIONS: 'MENTIONS',
  IMPLEMENTS: 'IMPLEMENTS',
  TRIGGERED_BY: 'TRIGGERED_BY'
});
