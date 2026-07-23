import React from 'react';
import { useAppState } from '../../core/StateStore';

export function LivingContextRail() {
  const { state, dispatch } = useAppState();
  const { workspace } = state;

  const modes = [
    { id: 'OBSERVE', icon: '👁️', label: 'OBSERVE', desc: 'Telemetry & Environmental Perception' },
    { id: 'THINK', icon: '🧠', label: 'THINK', desc: 'Cognitive Canvas & Multi-modal Reasoning' },
    { id: 'RESEARCH', icon: '🔍', label: 'RESEARCH', desc: 'Knowledge Base & Relational Memory' },
    { id: 'BUILD', icon: '⚡', label: 'BUILD', desc: 'Executive Planning & Subagent Execution' },
    { id: 'REVIEW', icon: '⚖️', label: 'REVIEW', desc: 'Reflection, Diffs & System Audit' },
    { id: 'FOCUS', icon: '🎯', label: 'FOCUS', desc: 'Single-Intent Deep Synthesis' },
  ];

  return (
    <aside
      style={{
        width: 'var(--rail-width)',
        backgroundColor: 'var(--color-surface-base)',
        borderRight: '1px solid var(--color-outline)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 0',
        boxSizing: 'border-box',
        userSelect: 'none',
        zIndex: 40,
      }}
    >
      {/* Top Operating Mode Triggers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', alignItems: 'center' }}>
        {modes.map((m) => {
          const isActive = workspace.activeMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => dispatch({ type: 'SET_ACTIVE_MODE', payload: m.id })}
              title={`${m.label}: ${m.desc}`}
              style={{
                width: '100%',
                height: '48px',
                backgroundColor: isActive ? 'var(--color-surface-panel)' : 'transparent',
                border: 'none',
                borderLeft: isActive ? '3px solid var(--color-primary-blue)' : '3px solid transparent',
                borderRadius: '0px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: isActive ? '#FFFFFF' : 'var(--color-on-surface-variant)',
                transition: 'var(--transition-fast)',
                position: 'relative',
              }}
            >
              <span style={{ fontSize: '16px' }}>{m.icon}</span>
              <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '9px', fontWeight: '700', marginTop: '2px' }}>
                {m.id}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Contextual Indicators & System Control */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', alignItems: 'center' }}>
        <button
          onClick={() => dispatch({ type: 'SET_ACTIVE_SUBSYSTEM', payload: 'control' })}
          title="System Control Center (OS Heart)"
          style={{
            width: '100%',
            height: '44px',
            backgroundColor: workspace.activeSubsystem === 'control' ? 'var(--color-surface-panel)' : 'transparent',
            border: 'none',
            borderLeft: workspace.activeSubsystem === 'control' ? '3px solid var(--color-secondary-purple)' : '3px solid transparent',
            color: 'var(--color-on-surface-variant)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '16px' }}>⚙️</span>
          <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '8px', fontWeight: '700', marginTop: '2px' }}>
            CONTROL
          </span>
        </button>
      </div>
    </aside>
  );
}

export default LivingContextRail;
