import React from 'react';
import { useAppState } from '../../core/StateStore';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export function HeaderTelemetryBar() {
  const { state, dispatch } = useAppState();
  const { workspace, ai, system } = state;

  const aiStateMap = {
    IDLE: { label: 'AEGISOS NOMINAL', status: 'nominal' },
    PERCEIVING: { label: 'SENTINEL PERCEIVING', status: 'active' },
    THINKING: { label: 'REASONING ACTIVE', status: 'active' },
    PLANNING: { label: 'DECOMPOSING GOAL', status: 'active' },
    EXECUTING: { label: 'EXECUTING TASK', status: 'active' },
    LEARNING: { label: 'CONSOLIDATING MEMORY', status: 'warning' },
    REVIEWING: { label: 'SYSTEM AUDIT', status: 'warning' },
  };

  const currentAI = aiStateMap[ai.aiState] || aiStateMap.IDLE;

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--color-surface-base)',
        borderBottom: '1px solid var(--color-outline)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        boxSizing: 'border-box',
        userSelect: 'none',
        zIndex: 50,
      }}
    >
      {/* Left Branding & Mode Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-family-mono)', fontWeight: '700', fontSize: '14px', letterSpacing: '0.1em', color: '#FFFFFF' }}>
            AEGIS<span style={{ color: 'var(--color-primary-blue)' }}>OS</span>
          </span>
          <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '10px', color: 'var(--color-on-surface-variant)', border: '1px solid var(--color-outline-subtle)', padding: '1px 4px' }}>
            v1.5.0
          </span>
        </div>

        <div style={{ height: '16px', width: '1px', backgroundColor: 'var(--color-outline-subtle)' }} />

        {/* Cognitive Mode Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="label-caps">MODE:</span>
          <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '12px', fontWeight: '700', color: 'var(--color-primary-blue)' }}>
            {workspace.activeMode}
          </span>
        </div>
      </div>

      {/* Center Command Palette Search Trigger */}
      <div style={{ flex: 1, maxWidth: '400px', margin: '0 16px' }}>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_COMMAND_PALETTE' })}
          style={{
            width: '100%',
            height: '32px',
            backgroundColor: 'var(--color-surface-panel)',
            border: '1px solid var(--color-outline)',
            borderRadius: '0px',
            padding: '0 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'var(--color-on-surface-variant)',
            fontFamily: 'var(--font-family-mono)',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          <span>Search projects, knowledge, agents, commands...</span>
          <kbd style={{ backgroundColor: 'var(--color-surface-container)', padding: '2px 6px', border: '1px solid var(--color-outline-subtle)', fontSize: '10px' }}>
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right Telemetry & Provider Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* AI Presence Badge */}
        <Badge status={currentAI.status}>
          {currentAI.label}
        </Badge>

        {/* MPAL Active Provider Badge */}
        <Badge status="info">
          MPAL: {ai.activeProvider.toUpperCase()} ({ai.activeModel})
        </Badge>

        {/* SSE Connectivity Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Server-Sent Events Telemetry Stream">
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: system.sseConnected ? 'var(--color-status-success)' : 'var(--color-status-error)' }} />
        </div>

        {/* Inspector Toggle */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => dispatch({ type: 'TOGGLE_INSPECTOR' })}
          title="Toggle Context Inspector (Ctrl+B)"
        >
          INSPECTOR {workspace.inspectorOpen ? '[ON]' : '[OFF]'}
        </Button>
      </div>
    </header>
  );
}

export default HeaderTelemetryBar;
