import React, { useState } from 'react';
import { useAppState } from '../../core/StateStore';
import Input from '../ui/Input';
import Badge from '../ui/Badge';

export function CommandPalette() {
  const { state, dispatch } = useAppState();
  const { workspace } = state;
  const [query, setQuery] = useState('');

  if (!workspace.commandPaletteOpen) return null;

  const commands = [
    { id: 'mode_observe', category: 'MODE', label: 'Switch to OBSERVE Mode', action: () => dispatch({ type: 'SET_ACTIVE_MODE', payload: 'OBSERVE' }) },
    { id: 'mode_think', category: 'MODE', label: 'Switch to THINK Mode (Cognitive Canvas)', action: () => dispatch({ type: 'SET_ACTIVE_MODE', payload: 'THINK' }) },
    { id: 'mode_research', category: 'MODE', label: 'Switch to RESEARCH Mode (Knowledge Web)', action: () => dispatch({ type: 'SET_ACTIVE_MODE', payload: 'RESEARCH' }) },
    { id: 'mode_build', category: 'MODE', label: 'Switch to BUILD Mode (Executive Planner)', action: () => dispatch({ type: 'SET_ACTIVE_MODE', payload: 'BUILD' }) },
    { id: 'mode_review', category: 'MODE', label: 'Switch to REVIEW Mode (Reflection & Audit)', action: () => dispatch({ type: 'SET_ACTIVE_MODE', payload: 'REVIEW' }) },
    { id: 'mode_focus', category: 'MODE', label: 'Switch to FOCUS Mode (Single-Intent Synthesis)', action: () => dispatch({ type: 'SET_ACTIVE_MODE', payload: 'FOCUS' }) },
    { id: 'ctrl_center', category: 'SYSTEM', label: 'Open System Control Center', action: () => dispatch({ type: 'SET_ACTIVE_SUBSYSTEM', payload: 'control' }) },
    { id: 'consolidate', category: 'MEMORY', label: 'Trigger Memory Consolidation Pass', action: async () => { await fetch('/api/cognitive/consolidate', { method: 'POST' }); } },
  ];

  const filteredCommands = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()) || c.category.toLowerCase().includes(query.toLowerCase())
  );

  function executeCommand(cmd) {
    cmd.action();
    dispatch({ type: 'TOGGLE_COMMAND_PALETTE', payload: false });
    setQuery('');
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 5, 7, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
      }}
      onClick={() => dispatch({ type: 'TOGGLE_COMMAND_PALETTE', payload: false })}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: 'var(--color-surface-panel)',
          border: '1px solid var(--color-outline)',
          borderRadius: '0px',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-outline-subtle)' }}>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, mode, or memory query..."
            autoFocus
          />
        </div>

        {/* Command List */}
        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px 0' }}>
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd) => (
              <div
                key={cmd.id}
                onClick={() => executeCommand(cmd)}
                style={{
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-container)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span style={{ fontFamily: 'var(--font-family-ui)', fontSize: '13px', color: 'var(--color-on-surface)' }}>
                  {cmd.label}
                </span>
                <Badge status="info">{cmd.category}</Badge>
              </div>
            ))
          ) : (
            <div style={{ padding: '16px', textStyle: 'center', fontFamily: 'var(--font-family-mono)', fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
              No matching commands found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
