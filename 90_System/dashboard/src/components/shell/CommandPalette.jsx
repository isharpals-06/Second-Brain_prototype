import React, { useState, useEffect } from 'react';
import { useAppState } from '../../core/StateStore';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { detectIntent } from '../../core/ccl/IntentDetector';
import { commandRegistry } from '../../core/ccl/CommandRegistry';
import { cognitiveHistoryManager } from '../../core/ccl/CognitiveHistoryManager';

export function CommandPalette() {
  const { state, dispatch } = useAppState();
  const { workspace } = state;
  const [query, setQuery] = useState('');
  const [intent, setIntent] = useState(null);
  const [preview, setPreview] = useState(null);
  const [executionState, setExecutionState] = useState(null); // 'thinking' | 'executing' | 'completed'

  useEffect(() => {
    if (query.trim()) {
      const detected = detectIntent(query);
      setIntent(detected);

      // Generate preview payload for delegation intents
      if (detected.type === 'DELEGATE_AGENT') {
        setPreview({
          targetAgent: detected.target,
          affectedFiles: ['Project Root Workspace'],
          toolsRequired: ['ripgrep', 'read_file', 'write_to_file'],
          estimatedDuration: '~ 15 - 45s',
          permissions: 'Read/Write (Standard Sandbox)',
        });
      } else {
        setPreview(null);
      }
    } else {
      setIntent(null);
      setPreview(null);
    }
  }, [query]);

  if (!workspace.commandPaletteOpen) return null;

  const filteredCommands = commandRegistry.search(query);
  const recentHistory = cognitiveHistoryManager.getRecent(5);

  async function handleExecute(cmd) {
    setExecutionState('executing');
    cognitiveHistoryManager.add({ query: cmd?.label || query, intent: intent?.type || 'COMMAND' });

    if (cmd && cmd.action) {
      await cmd.action(dispatch, query);
    } else if (intent?.type === 'NAVIGATION' && intent.targetMode) {
      dispatch({ type: 'SET_ACTIVE_MODE', payload: intent.targetMode });
    }

    setExecutionState('completed');
    setTimeout(() => {
      dispatch({ type: 'TOGGLE_COMMAND_PALETTE', payload: false });
      setQuery('');
      setExecutionState(null);
    }, 400);
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 5, 7, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
      }}
      onClick={() => dispatch({ type: 'TOGGLE_COMMAND_PALETTE', payload: false })}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          backgroundColor: 'var(--color-surface-panel)',
          border: '1px solid var(--color-outline)',
          borderRadius: '0px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Input Box */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--color-outline-subtle)', backgroundColor: 'var(--color-surface-base)' }}>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your intent (e.g. 'research project architecture', 'switch to THINK mode')..."
            autoFocus
          />

          {/* Live Intent Classification Tag */}
          {intent && (
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '11px', color: 'var(--color-on-surface-variant)' }}>
                INTENT CLASSIFIED:
              </span>
              <Badge status="nominal">{intent.category.toUpperCase()}</Badge>
              <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '11px', color: 'var(--color-primary-blue)' }}>
                ➔ {intent.type} ({(intent.confidence * 100).toFixed(0)}% CONFIDENCE)
              </span>
            </div>
          )}
        </div>

        {/* Execution Preview Area */}
        {preview && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#0F172A',
              borderBottom: '1px solid var(--color-primary-blue)',
              fontFamily: 'var(--font-family-mono)',
              fontSize: '12px',
            }}
          >
            <div style={{ color: 'var(--color-primary-blue)', fontWeight: '700', marginBottom: '6px' }}>
              ⚡ EXECUTION PREVIEW CHECKPOINT
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', color: 'var(--color-on-surface)' }}>
              <div>Target Agent: <strong>{preview.targetAgent}</strong></div>
              <div>Estimated Time: <strong>{preview.estimatedDuration}</strong></div>
              <div>Tools: <strong>{preview.toolsRequired.join(', ')}</strong></div>
              <div>Permissions: <strong>{preview.permissions}</strong></div>
            </div>
            <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
              <Button variant="primary" size="sm" onClick={() => handleExecute(null)}>
                APPROVE & EXECUTE DELEGATION
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setPreview(null)}>
                DISMISS PREVIEW
              </Button>
            </div>
          </div>
        )}

        {/* Execution Feedback State */}
        {executionState && (
          <div style={{ padding: '16px', backgroundColor: 'var(--color-surface-container)', textStyle: 'center', fontFamily: 'var(--font-family-mono)', fontSize: '12px', color: 'var(--color-secondary-purple)' }}>
            [CCL Pipeline] Status: {executionState.toUpperCase()}... Dispatching to cognitive runtime.
          </div>
        )}

        {/* Command & Results List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '8px 0' }}>
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd) => (
              <div
                key={cmd.id}
                onClick={() => handleExecute(cmd)}
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
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontFamily: 'var(--font-family-ui)', fontSize: '13px', color: 'var(--color-on-surface)' }}>
                    {cmd.label}
                  </span>
                  {cmd.keywords && (
                    <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '10px', color: 'var(--color-on-surface-variant)' }}>
                      keywords: {cmd.keywords.join(', ')}
                    </span>
                  )}
                </div>
                <Badge status="info">{cmd.category}</Badge>
              </div>
            ))
          ) : (
            <div style={{ padding: '16px', textStyle: 'center', fontFamily: 'var(--font-family-mono)', fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
              No matching rigid commands. Natural language intent active. Press Enter to dispatch.
            </div>
          )}
        </div>

        {/* Cognitive History Footer */}
        {!query && recentHistory.length > 0 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-outline-subtle)', backgroundColor: 'var(--color-surface-base)' }}>
            <span className="label-caps" style={{ color: 'var(--color-on-surface-variant)', fontSize: '10px' }}>
              RECENT COGNITIVE INTENTS:
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
              {recentHistory.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setQuery(h.query)}
                  style={{
                    fontFamily: 'var(--font-family-mono)',
                    fontSize: '11px',
                    padding: '2px 8px',
                    backgroundColor: 'var(--color-surface-panel)',
                    color: 'var(--color-on-surface)',
                    border: '1px solid var(--color-outline-subtle)',
                    borderRadius: '0px',
                    cursor: 'pointer',
                  }}
                >
                  {h.query}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CommandPalette;
