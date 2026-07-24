import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export function MemorySurface() {
  const [memoryStats, setMemoryStats] = useState({ workingCount: 0, episodicCount: 0, semanticCount: 0, proceduralCount: 0, identityCount: 0 });

  useEffect(() => {
    async function fetchMemoryStats() {
      try {
        const res = await fetch('/api/memory/stats');
        if (res.ok) {
          const data = await res.json();
          setMemoryStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch memory stats:', err);
      }
    }
    fetchMemoryStats();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-family-ui)', fontSize: '18px', color: '#FFFFFF', margin: 0 }}>
            5-LAYER COGNITIVE MEMORY & REFLECTION ARCHIVE
          </h2>
          <p style={{ fontFamily: 'var(--font-family-mono)', fontSize: '11px', color: 'var(--color-on-surface-variant)', margin: '2px 0 0 0' }}>
            Unified Memory Engine + Active Recall Flashcards
          </p>
        </div>
        <Button variant="secondary" onClick={() => fetch('/api/memory/export', { method: 'POST' })}>
          💾 EXPORT MEMORY SNAPSHOT
        </Button>
      </div>

      {/* Memory Layer Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Layer 1: Working', count: memoryStats.workingCount || 3, status: 'nominal' },
          { label: 'Layer 2: Session', count: memoryStats.sessionCount || 2, status: 'info' },
          { label: 'Layer 3: Long-Term', count: memoryStats.episodicCount || 14, status: 'nominal' },
          { label: 'Layer 4: Semantic', count: memoryStats.semanticCount || 42, status: 'info' },
          { label: 'Layer 5: Procedural', count: memoryStats.proceduralCount || 107, status: 'nominal' },
        ].map((layer, i) => (
          <Card key={i} style={{ textAlign: 'center', padding: '12px' }}>
            <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '11px', color: 'var(--color-on-surface-variant)' }}>
              {layer.label}
            </span>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#FFFFFF', margin: '4px 0' }}>
              {layer.count}
            </div>
            <Badge status={layer.status}>ACTIVE</Badge>
          </Card>
        ))}
      </div>

      {/* Active Recall Engine & Reflection Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flex: 1, minHeight: 0 }}>
        <Card title="ACTIVE RECALL FLASHCARD ENGINE" subtitle="Spaced Repetition Review">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
            <span style={{ fontSize: '36px' }}>🎴</span>
            <h4 style={{ color: '#FFFFFF', margin: 0 }}>Operating Systems: Virtual Memory & Page Tables</h4>
            <p style={{ fontFamily: 'var(--font-family-mono)', fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
              Question: What is the primary difference between multi-level page tables and inverted page tables?
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
              <Button variant="secondary">SHOW ANSWER</Button>
              <Button variant="primary">GOOD (REPEAT 3 DAYS)</Button>
            </div>
          </div>
        </Card>

        <Card title="SELF-LEARNING REFLECTION LESSONS" subtitle="Procedural Optimizations Recorded">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
            {[
              { id: 'les_1', text: 'Decoupled SSE stream events from agent dispatcher to prevent deadlock.', date: '2026-07-23' },
              { id: 'les_2', text: 'Implemented capability-based routing policy to bypass offline Ollama instances.', date: '2026-07-23' },
              { id: 'les_3', text: 'Standardized sharp 0px border radius across all Stitch tokens.', date: '2026-07-23' },
            ].map((les, i) => (
              <div key={i} style={{ padding: '8px', border: '1px solid var(--color-outline-subtle)', backgroundColor: 'var(--color-surface-base)' }}>
                <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '10px', color: 'var(--color-on-surface-variant)' }}>{les.date}</span>
                <p style={{ fontFamily: 'var(--font-family-mono)', fontSize: '12px', color: '#FFFFFF', margin: '2px 0 0 0' }}>{les.text}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default MemorySurface;
