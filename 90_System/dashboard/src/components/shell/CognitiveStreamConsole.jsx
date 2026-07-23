import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '../../core/StateStore';
import Button from '../ui/Button';

export function CognitiveStreamConsole() {
  const { state, dispatch } = useAppState();
  const { workspace, system } = state;
  const [filter, setFilter] = useState('ALL');
  const logEndRef = useRef(null);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [system.logs]);

  if (!workspace.consoleOpen) return null;

  const filters = ['ALL', 'REASONING', 'SENTINEL', 'MEMORY', 'AGENT', 'SECURITY'];

  const filteredLogs = (system.logs || []).filter((log) => {
    if (filter === 'ALL') return true;
    return log.category?.toUpperCase() === filter || log.message?.toUpperCase().includes(filter);
  });

  return (
    <footer
      style={{
        height: 'var(--console-height)',
        backgroundColor: 'var(--color-surface-base)',
        borderTop: '1px solid var(--color-outline)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        zIndex: 45,
      }}
    >
      {/* Console Header Bar */}
      <div
        style={{
          height: '36px',
          backgroundColor: 'var(--color-surface-panel)',
          borderBottom: '1px solid var(--color-outline-subtle)',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="label-caps" style={{ color: 'var(--color-primary-blue)' }}>
            COGNITIVE STREAM TELEMETRY
          </span>
          <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '11px', color: 'var(--color-on-surface-variant)' }}>
            ({system.logs.length} EVENTS)
          </span>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '4px', marginLeft: '12px' }}>
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  backgroundColor: filter === f ? 'var(--color-primary-blue-glow)' : 'transparent',
                  color: filter === f ? 'var(--color-primary-blue)' : 'var(--color-on-surface-variant)',
                  border: `1px solid ${filter === f ? 'var(--color-primary-blue)' : 'transparent'}`,
                  borderRadius: '0px',
                  cursor: 'pointer',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: 'TOGGLE_CONSOLE', payload: false })}
          >
            [COLLAPSE ✕]
          </Button>
        </div>
      </div>

      {/* Real-time Monospaced Log Stream */}
      <div
        style={{
          flex: 1,
          padding: '12px 16px',
          overflowY: 'auto',
          fontFamily: 'var(--font-family-mono)',
          fontSize: '12px',
          lineHeight: '1.6',
          backgroundColor: '#050507',
          color: 'var(--color-on-surface)',
        }}
      >
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log, index) => {
            const isError = log.level === 'error' || log.type === 'error';
            const isReasoning = log.category === 'REASONING' || log.event?.includes('reasoning');
            const color = isError ? 'var(--color-status-error)' : isReasoning ? 'var(--color-secondary-purple)' : 'var(--color-on-surface)';

            return (
              <div key={index} style={{ display: 'flex', gap: '12px', color }}>
                <span style={{ color: 'var(--color-on-surface-variant)', userSelect: 'none' }}>
                  [{new Date(log.timestamp || Date.now()).toLocaleTimeString()}]
                </span>
                <span style={{ fontWeight: '700', color: isReasoning ? 'var(--color-secondary-purple)' : 'var(--color-primary-blue)' }}>
                  [{log.category || 'EVENT'}]
                </span>
                <span>{log.message || JSON.stringify(log)}</span>
              </div>
            );
          })
        ) : (
          <div style={{ color: 'var(--color-on-surface-variant)' }}>
            [AEGISOS:Stream] Connected to event pipeline. Listening for cognitive events...
          </div>
        )}
        <div ref={logEndRef} />
      </div>
    </footer>
  );
}

export default CognitiveStreamConsole;
