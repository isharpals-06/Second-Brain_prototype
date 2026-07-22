import React, { useState, useEffect } from 'react';
import { GitBranch, Play, CheckCircle2, AlertCircle } from 'lucide-react';

export default function WorkflowsWorkspace() {
  const [workflows, setWorkflows] = useState([]);
  const [instances, setInstances] = useState([]);

  useEffect(() => {
    fetch('/api/workflows').then(r => r.json()).then(setWorkflows).catch(() => {});
    fetch('/api/workflows/instances').then(r => r.json()).then(setInstances).catch(() => {});
  }, []);

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%', color: '#f8fafc' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GitBranch size={22} style={{ color: '#10b981' }} />
            WORKFLOW ORCHESTRATION PLATFORM
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
            State Machine Engine, Step Executor, Approval Gate & Checkpoint Manager
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Registered Workflow Templates</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(workflows.length > 0 ? workflows : [
              { id: 'wf_system_inspection', name: 'System Telemetry & Health Inspection', steps: 2 }
            ]).map(w => (
              <div key={w.id} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontWeight: 600, fontSize: '14px', color: '#f1f5f9' }}>{w.name}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>ID: {w.id} • Steps: {w.steps || 2}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Active Executions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(instances.length > 0 ? instances : [
              { id: 'wfi_boot_01', workflowId: 'wf_system_inspection', state: 'completed' }
            ]).map(i => (
              <div key={i.id} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#f1f5f9' }}>{i.id}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Template: {i.workflowId}</div>
                </div>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', padding: '2px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  {i.state?.toUpperCase() || 'COMPLETED'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
