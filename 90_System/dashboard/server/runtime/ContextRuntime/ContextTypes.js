export const ContextPolicyEnum = {
  MINIMAL: 'MINIMAL',
  BALANCED: 'BALANCED',
  MAXIMUM: 'MAXIMUM',
  MISSION_CRITICAL: 'MISSION_CRITICAL',
  COST_OPTIMIZED: 'COST_OPTIMIZED',
  PERFORMANCE_OPTIMIZED: 'PERFORMANCE_OPTIMIZED',
};

export const ContextEventTypes = {
  CONTEXT_REQUESTED: 'ContextRequested',
  CONTEXT_RESOLVED: 'ContextResolved',
  CONTEXT_BUILT: 'ContextBuilt',
  CONTEXT_UPDATED: 'ContextUpdated',
  CONTEXT_COMPRESSED: 'ContextCompressed',
  CONTEXT_OVERFLOW: 'ContextOverflow',
  CONTEXT_INVALIDATED: 'ContextInvalidated',
};
