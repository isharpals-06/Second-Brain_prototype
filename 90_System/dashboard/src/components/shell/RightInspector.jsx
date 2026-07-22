import React from 'react';
import { X, Activity, Server, Database, Shield, Cpu, Clock, CheckCircle2 } from 'lucide-react';

export default function RightInspector({ isOpen, onClose, activeWorkspace, systemData }) {
  if (!isOpen) return null;

  return (
    <aside className="aegis-inspector" style={{
      width: '300px',
      background: 'rgba(10, 14, 23, 0.98)',
      borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      zIndex: 30,
      flexShrink: 0,
      userSelect: 'none'
    }}>
      {/* Inspector Header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc', fontSize: '13px', fontWeight: 600 }}>
          <Activity size={16} />
          <span>Context Inspector</span>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Inspector Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {/* Workspace Context Section */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: '8px' }}>
            Active Focus
          </div>
          <div style={{
            background: 'rgba(18, 24, 38, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
              {activeWorkspace?.toUpperCase()} WORKSPACE
            </div>
            <div style={{ color: '#94a3b8', fontSize: '11px', lineHeight: 1.4 }}>
              Active telemetry channel monitoring system calls and platform events.
            </div>
          </div>
        </div>

        {/* Runtime Diagnostics */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: '8px' }}>
            System Diagnostics
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Registered Services</span>
              <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600 }}>15 Services</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Sentinel Observers</span>
              <span style={{ color: '#10b981', fontFamily: 'monospace', fontWeight: 600 }}>Active</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Memory OS Store</span>
              <span style={{ color: '#c084fc', fontFamily: 'monospace', fontWeight: 600 }}>InMemory / SQLite</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Planner Queue</span>
              <span style={{ color: '#f59e0b', fontFamily: 'monospace', fontWeight: 600 }}>Ready</span>
            </div>
          </div>
        </div>

        {/* Security & Governance Status */}
        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: '8px' }}>
            Governance Gate
          </div>
          <div style={{
            padding: '12px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <Shield size={16} style={{ color: '#10b981', marginTop: '2px' }} />
            <div>
              <div style={{ color: '#10b981', fontSize: '12px', fontWeight: 600 }}>Policy Enforcer: ALLOW</div>
              <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>
                All tool executions gated through Governance audit engine.
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
