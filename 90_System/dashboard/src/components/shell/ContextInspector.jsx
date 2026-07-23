import React from 'react';
import { useAppState } from '../../core/StateStore';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

export function ContextInspector() {
  const { state, dispatch } = useAppState();
  const { workspace, system, ai } = state;

  if (!workspace.inspectorOpen) return null;

  const target = workspace.inspectorTarget;

  return (
    <aside
      style={{
        width: 'var(--inspector-width)',
        backgroundColor: 'var(--color-surface-panel)',
        borderLeft: '1px solid var(--color-outline)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        zIndex: 30,
        overflow: 'hidden',
      }}
    >
      {/* Inspector Header */}
      <div
        style={{
          height: '40px',
          backgroundColor: 'var(--color-surface-base)',
          borderBottom: '1px solid var(--color-outline-subtle)',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span className="label-caps" style={{ color: 'var(--color-on-surface)' }}>
          CONTEXT INSPECTOR
        </span>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_INSPECTOR', payload: false })}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-on-surface-variant)',
            cursor: 'pointer',
            fontFamily: 'var(--font-family-mono)',
            fontSize: '12px',
          }}
        >
          [✕]
        </button>
      </div>

      {/* Inspector Body Content */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {target ? (
          <Card title={`INSPECTING: ${target.type.toUpperCase()}`}>
            <pre style={{ fontFamily: 'var(--font-family-mono)', fontSize: '11px', whiteSpace: 'pre-wrap', color: 'var(--color-on-surface)' }}>
              {JSON.stringify(target.data || target, null, 2)}
            </pre>
          </Card>
        ) : (
          <>
            <Card title="SYSTEM REASONING TRACE">
              {ai.reasoningTrace && ai.reasoningTrace.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {ai.reasoningTrace.slice(0, 3).map((r, i) => (
                    <div key={i} style={{ padding: '8px', backgroundColor: 'var(--color-surface-base)', border: '1px solid var(--color-outline-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '10px', color: 'var(--color-secondary-purple)' }}>{r.goal}</span>
                        <Badge status="nominal">{Math.round((r.confidence || 0.99) * 100)}%</Badge>
                      </div>
                      <p style={{ fontFamily: 'var(--font-family-ui)', fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>{r.summary}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontFamily: 'var(--font-family-mono)', fontSize: '11px', color: 'var(--color-on-surface-variant)' }}>
                  No active reasoning session trace available. Select an entity in the workspace to inspect.
                </p>
              )}
            </Card>

            <Card title="ACTIVE INSIGHTS & THREATS">
              {system.insights && system.insights.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {system.insights.map((ins, i) => (
                    <div key={i} style={{ padding: '8px', backgroundColor: 'var(--color-surface-base)', border: '1px solid var(--color-outline-subtle)' }}>
                      <Badge status={ins.severity === 'CRITICAL' ? 'error' : 'info'}>{ins.type}</Badge>
                      <h5 style={{ fontFamily: 'var(--font-family-ui)', fontSize: '12px', color: 'var(--color-on-surface)', marginTop: '4px' }}>{ins.title}</h5>
                      <p style={{ fontFamily: 'var(--font-family-ui)', fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '2px' }}>{ins.summary}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontFamily: 'var(--font-family-mono)', fontSize: '11px', color: 'var(--color-on-surface-variant)' }}>
                  All system observers report nominal operation. Zero threats detected.
                </p>
              )}
            </Card>
          </>
        )}
      </div>
    </aside>
  );
}

export default ContextInspector;
