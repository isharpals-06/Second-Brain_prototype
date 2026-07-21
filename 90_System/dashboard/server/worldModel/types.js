/**
 * AEGISOS World Model Engine — Type & State Definitions
 */

export const SessionType = Object.freeze({
  CODING: 'Coding Session',
  STUDY: 'Study Session',
  RESEARCH: 'Research Session',
  WRITING: 'Writing Session',
  READING: 'Reading Session',
  BROWSING: 'Browsing Session',
  IDLE: 'Idle Session'
});

export const NodeType = Object.freeze({
  PROJECT: 'project',
  WORKSPACE: 'workspace',
  REPOSITORY: 'repository',
  NOTE: 'note',
  DOCUMENT: 'document',
  CONVERSATION: 'conversation',
  TASK: 'task'
});

export const RelationType = Object.freeze({
  CONTAINS: 'CONTAINS',
  REFERENCES: 'REFERENCES',
  GENERATED_FROM: 'GENERATED_FROM',
  DEPENDS_ON: 'DEPENDS_ON',
  ASSOCIATED_WITH: 'ASSOCIATED_WITH'
});
