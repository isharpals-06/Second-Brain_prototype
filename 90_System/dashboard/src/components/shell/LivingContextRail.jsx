import React from 'react';
import { useAppState } from '../../core/StateStore';

export function LivingContextRail() {
  const { state, dispatch } = useAppState();
  const { workspace } = state;

  const surfaces = [
    { id: 'mission', icon: '🎯', label: 'MISSION', mode: 'OBSERVE', desc: 'Active Goals, Execution & Subagents' },
    { id: 'conversation', icon: '🧠', label: 'CHAT', mode: 'THINK', desc: 'Living Cognitive Conversation Engine' },
    { id: 'knowledge', icon: '🌐', label: 'GRAPH', mode: 'RESEARCH', desc: 'Knowledge Graph & Relational Web' },
    { id: 'memory', icon: '💾', label: 'MEMORY', mode: 'REVIEW', desc: '5-Layer Memory & Active Recall' },
    { id: 'platform', icon: '⚙️', label: 'KERNEL', mode: 'BUILD', desc: 'Platform Kernel, Providers & MCP' },
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
      {/* Surface Triggers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', alignItems: 'center' }}>
        {surfaces.map((s) => {
          const isActive = workspace.activeSubsystem === s.id;
          return (
            <button
              key={s.id}
              onClick={() => {
                dispatch({ type: 'SET_ACTIVE_SUBSYSTEM', payload: s.id });
                dispatch({ type: 'SET_ACTIVE_MODE', payload: s.mode });
              }}
              title={`${s.label}: ${s.desc}`}
              style={{
                width: '100%',
                height: '52px',
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
              <span style={{ fontSize: '18px' }}>{s.icon}</span>
              <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '8px', fontWeight: '700', marginTop: '2px' }}>
                {s.label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export default LivingContextRail;
