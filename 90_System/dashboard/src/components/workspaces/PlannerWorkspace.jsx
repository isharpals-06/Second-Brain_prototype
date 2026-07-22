import React, { useState, useEffect } from 'react';
import { Target, Plus, CheckCircle, Clock, AlertTriangle, Layers } from 'lucide-react';

export default function PlannerWorkspace() {
  const [goals, setGoals] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetch('/api/planner/goals').then(r => r.json()).then(setGoals).catch(() => {});
    fetch('/api/planner/priorities').then(r => r.json()).then(setPriorities).catch(() => {});
    fetch('/api/planner/plans').then(r => r.json()).then(setPlans).catch(() => {});
  }, []);

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%', color: '#f8fafc' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Target size={22} style={{ color: '#38bdf8' }} />
            EXECUTIVE PLANNER
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
            Autonomous Intent Decomposition, Strategic Goal Mapping & Task Scheduling
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Active Goals Section */}
        <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Active Goals</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(goals.length > 0 ? goals : [
              { id: 'g1', title: 'Complete AEGISOS Architecture Reconciliation (Phase 18)', priority: 'High', status: 'In Progress' },
              { id: 'g2', title: 'Refine University Course Notes Vault', priority: 'Medium', status: 'Active' }
            ]).map(g => (
              <div key={g.id} style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px', color: '#f1f5f9' }}>{g.title}</span>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', padding: '2px 8px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                    {g.priority}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>Status: {g.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Queue Section */}
        <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Scheduled Plans</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(plans.length > 0 ? plans : [
              { id: 'p1', name: 'System Telemetry Inspection Plan', tasks: 2, status: 'Validated' }
            ]).map(p => (
              <div key={p.id} style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <div style={{ fontWeight: 600, fontSize: '14px', color: '#f1f5f9' }}>{p.name || p.id}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>Tasks: {p.tasks || 2} • Status: {p.status || 'Active'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
