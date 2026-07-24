export const tokens = {
  colors: {
    mission: 'var(--color-semantic-mission)',
    execution: 'var(--color-semantic-execution)',
    reasoning: 'var(--color-semantic-reasoning)',
    planning: 'var(--color-semantic-planning)',
    memory: 'var(--color-semantic-memory)',
    knowledge: 'var(--color-semantic-knowledge)',
    agent: 'var(--color-semantic-agent)',
    warning: 'var(--color-semantic-warning)',
    error: 'var(--color-semantic-error)',
    success: 'var(--color-semantic-success)',
    passive: 'var(--color-semantic-passive)',
    surfaceBase: 'var(--color-surface-base)',
    surfacePanel: 'var(--color-surface-panel)',
    surfaceCard: 'var(--color-surface-card)',
  },
  radius: {
    sharp: 'var(--radius-sharp)',
  },
  typography: {
    mono: 'var(--font-family-mono)',
    ui: 'var(--font-family-ui)',
  },
  motion: {
    snappy: 'var(--motion-snappy)',
    smooth: 'var(--motion-smooth)',
  },
};

export function getSemanticColor(domain) {
  return tokens.colors[domain] || tokens.colors.passive;
}
