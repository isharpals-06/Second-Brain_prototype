import React, { useState, useEffect } from 'react';
import { useAppState } from '../../core/StateStore';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export function MissionSurface() {
  const { state, dispatch } = useAppState();
  const [activePlan, setActivePlan] = useState(null);
  const [subagents, setSubagents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchMissionState() {
      try {
        const res = await fetch('/api/cognitive/kernel/health');
        if (res.ok) {
          const data = await res.json();
          setSubagents(data.subagents || []);
        }
      } catch (err) {
        console.error('Failed to fetch mission state:', err);
      }
    }
    fetchMissionState();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', boxSizing: 'border-box' }}>
      {/* 1. Primary Active Mission Banner */}
      <Card style={{ backgroundColor: 'var(--color-surface-card)', border: '1px solid var(--color-outline-subtle)', borderRadius: '0px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <Badge status="nominal">ACTIVE MISSION</Badge>
            <h2 style={{ fontFamily: 'var(--font-family-ui)', fontSize: '20px', color: '#FFFFFF', margin: '8px 0 4px 0' }}>
              AEGISOS Architecture Alignment & System Refactor
            </h2>
            <p style={{ fontFamily: 'var(--font-family-mono)', fontSize: '12px', color: 'var(--color-on-surface-variant)', margin: 0 }}>
              Primary Goal: Transform application into a living, provider-independent Cognitive Operating System.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" onClick={() => dispatch({ type: 'TOGGLE_COMMAND_PALETTE' })}>
              ⚡ DISPATCH INTENT
            </Button>
            <Button variant="primary" onClick={() => dispatch({ type: 'SET_ACTIVE_MODE', payload: 'BUILD' })}>
              VIEW EXECUTION MATRIX
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. Subagent & Execution Matrix Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
        <Card title="ACTIVE SUBAGENT SWARM" subtitle="Quota-Aware Background Execution">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '10px', border: '1px solid var(--color-outline-subtle)', backgroundColor: 'var(--color-surface-base)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '13px', color: '#FFFFFF' }}>Platform Architect</span>
                <Badge status="nominal">ACTIVE</Badge>
              </div>
              <p style={{ fontFamily: 'var(--font-family-mono)', fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>
                Refactoring MCP Runtime & Universal Provider Layer
              </p>
            </div>

            <div style={{ padding: '10px', border: '1px solid var(--color-outline-subtle)', backgroundColor: 'var(--color-surface-base)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '13px', color: '#FFFFFF' }}>Vault Sentinel</span>
                <Badge status="nominal">ACTIVE</Badge>
              </div>
              <p style={{ fontFamily: 'var(--font-family-mono)', fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>
                Monitoring vault file mutations & graph sync
              </p>
            </div>
          </div>
        </Card>

        <Card title="GOAL DECOMPOSITION TREE" subtitle="Phased Pipeline Progress">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { step: 'Phase A1', title: 'Master App Shell & Tokens', status: 'DONE' },
              { step: 'Phase B1-B3', title: 'Cognitive Core, Memory & World Model', status: 'DONE' },
              { step: 'Phase C1-C3', title: 'Platform Kernel, Providers & MCP Runtime', status: 'DONE' },
              { step: 'Refactor v2.0', title: 'Frontend Interaction Architecture Refactor', status: 'IN_PROGRESS' },
            ].map((st, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderBottom: '1px solid var(--color-outline-subtle)' }}>
                <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
                  [{st.step}] <strong style={{ color: '#FFFFFF' }}>{st.title}</strong>
                </span>
                <Badge status={st.status === 'DONE' ? 'nominal' : 'warning'}>{st.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default MissionSurface;
