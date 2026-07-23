import React from 'react';
import { useAppState } from '../../core/StateStore';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export function AdaptiveWorkspaceViewport() {
  const { state, dispatch } = useAppState();
  const { workspace, system, ai } = state;

  // Render workspace content according to active cognitive mode
  function renderCognitiveModeContent() {
    switch (workspace.activeMode) {
      case 'OBSERVE':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            <Card title="CONTINUOUS COGNITIVE LOOP TELEMETRY" subtitle="Autonomous Pass Status">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '12px' }}>Pass Cycle Tick Count:</span>
                  <Badge status="nominal"># {system.tickCount}</Badge>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '12px' }}>Active System Observers:</span>
                  <Badge status="info">Sentinel Active</Badge>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '12px' }}>Self-Learning Metrics:</span>
                  <Badge status="nominal">{system.learningMetrics.overallSuccessRate || '100%'}</Badge>
                </div>
                <Button variant="primary" onClick={() => fetch('/api/cognitive/consolidate', { method: 'POST' })}>
                  TRIGGER MEMORY CONSOLIDATION PASS
                </Button>
              </div>
            </Card>

            <Card title="ACTIVE AUTONOMOUS INSIGHTS" subtitle="Calm Proactive Indicators">
              {system.insights && system.insights.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {system.insights.map((ins, i) => (
                    <div key={i} style={{ padding: '8px', border: '1px solid var(--color-outline-subtle)', backgroundColor: 'var(--color-surface-base)' }}>
                      <Badge status={ins.severity === 'CRITICAL' ? 'error' : 'info'}>{ins.type}</Badge>
                      <h4 style={{ fontSize: '13px', marginTop: '4px' }}>{ins.title}</h4>
                      <p style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', marginTop: '2px' }}>{ins.summary}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontFamily: 'var(--font-family-mono)', fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
                  Zero active threats or optimization warnings. Operating system state is healthy.
                </p>
              )}
            </Card>
          </div>
        );

      case 'THINK':
        return (
          <Card title="COGNITIVE CANVAS" subtitle="Multi-modal Reasoning & Idea Expansion">
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
              <span style={{ fontSize: '32px' }}>🧠</span>
              <h3 style={{ fontFamily: 'var(--font-family-ui)', margin: '12px 0 6px 0', color: '#FFFFFF' }}>Cognitive Reasoning Canvas Active</h3>
              <p style={{ fontFamily: 'var(--font-family-mono)', fontSize: '12px', maxWidth: '500px', margin: '0 auto 16px auto' }}>
                Multi-modal streaming context & node graph ideation environment. Connected to MPAL model layer ({ai.activeProvider}).
              </p>
              <Button variant="primary" onClick={() => dispatch({ type: 'SET_ACTIVE_MODE', payload: 'BUILD' })}>
                EVOLVE INTO BUILD & EXECUTE MODE
              </Button>
            </div>
          </Card>
        );

      case 'RESEARCH':
        return (
          <Card title="KNOWLEDGE SYNTHESIS & RELATIONAL MEMORY WEB" subtitle="Vault Ingestion & Graph Analysis">
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
              <span style={{ fontSize: '32px' }}>🔍</span>
              <h3 style={{ fontFamily: 'var(--font-family-ui)', margin: '12px 0 6px 0', color: '#FFFFFF' }}>Relational Knowledge Web Active</h3>
              <p style={{ fontFamily: 'var(--font-family-mono)', fontSize: '12px', maxWidth: '500px', margin: '0 auto 16px auto' }}>
                Unified vault browser, PDF ingestion pipeline, and 2D/3D relational memory graph.
              </p>
            </div>
          </Card>
        );

      case 'BUILD':
        return (
          <Card title="EXECUTIVE PLANNER & SUBAGENT MATRIX" subtitle="Goal Decomposition & Tool Execution">
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
              <span style={{ fontSize: '32px' }}>⚡</span>
              <h3 style={{ fontFamily: 'var(--font-family-ui)', margin: '12px 0 6px 0', color: '#FFFFFF' }}>Executive Planner Matrix Active</h3>
              <p style={{ fontFamily: 'var(--font-family-mono)', fontSize: '12px', maxWidth: '500px', margin: '0 auto 16px auto' }}>
                Dependency graph execution engine with subagent dispatch and risk score scoring.
              </p>
            </div>
          </Card>
        );

      case 'REVIEW':
        return (
          <Card title="REFLECTION ENGINE & SYSTEM AUDIT" subtitle="Procedural Evaluation & Diff Review">
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
              <span style={{ fontSize: '32px' }}>⚖️</span>
              <h3 style={{ fontFamily: 'var(--font-family-ui)', margin: '12px 0 6px 0', color: '#FFFFFF' }}>Procedural Reflection Review Active</h3>
              <p style={{ fontFamily: 'var(--font-family-mono)', fontSize: '12px', maxWidth: '500px', margin: '0 auto 16px auto' }}>
                Side-by-side payload diff inspection, security checkpoint clearance, and procedural learning audits.
              </p>
            </div>
          </Card>
        );

      case 'FOCUS':
        return (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Card style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
              <span style={{ fontSize: '40px' }}>🎯</span>
              <h2 style={{ fontFamily: 'var(--font-family-ui)', margin: '12px 0 8px 0', color: '#FFFFFF' }}>FOCUS MODE — Single-Intent Deep Synthesis</h2>
              <p style={{ fontFamily: 'var(--font-family-mono)', fontSize: '12px', color: 'var(--color-on-surface-variant)', marginBottom: '16px' }}>
                Distraction-free environment. All peripheral panels and monitors are operating at ambient presence.
              </p>
              <Button variant="secondary" onClick={() => dispatch({ type: 'SET_ACTIVE_MODE', payload: 'OBSERVE' })}>
                EXIT FOCUS MODE
              </Button>
            </Card>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <main
      style={{
        flex: 1,
        backgroundColor: 'var(--color-surface-panel)',
        padding: '20px',
        overflowY: 'auto',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {renderCognitiveModeContent()}
    </main>
  );
}

export default AdaptiveWorkspaceViewport;
