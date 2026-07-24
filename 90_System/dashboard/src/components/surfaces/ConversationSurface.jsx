import React, { useState } from 'react';
import { useAppState } from '../../core/StateStore';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Input from '../ui/Input';

export function ConversationSurface() {
  const { state, dispatch } = useAppState();
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    { role: 'system', text: 'AEGISOS Cognitive Kernel online. Ready to perceive human intent.' },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleSend() {
    if (!prompt.trim()) return;
    const userMsg = { role: 'user', text: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setIsProcessing(true);

    try {
      const res = await fetch('/api/cognitive/kernel/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg.text }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: `Intent Classified: [${data.classifiedIntent || 'GENERAL'}]. Executed via Cognitive Pipeline Layer 1-10.`,
            meta: data,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', text: `Error processing intent: ${err.message}` }]);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-family-ui)', fontSize: '18px', color: '#FFFFFF', margin: 0 }}>
            LIVING COGNITIVE CONVERSATION ENGINE
          </h2>
          <p style={{ fontFamily: 'var(--font-family-mono)', fontSize: '11px', color: 'var(--color-on-surface-variant)', margin: '2px 0 0 0' }}>
            Connected to Provider: {state.ai.activeProvider} ({state.ai.activeModel})
          </p>
        </div>
        <Badge status={isProcessing ? 'warning' : 'nominal'}>
          {isProcessing ? 'PROCESSING INTENT...' : 'KERNEL READY'}
        </Badge>
      </div>

      {/* Message Stream Viewport */}
      <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--color-outline-subtle)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'var(--color-surface-base)' }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              padding: '12px 16px',
              backgroundColor: msg.role === 'user' ? '#1E293B' : 'var(--color-surface-card)',
              border: '1px solid var(--color-outline-subtle)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '10px', color: 'var(--color-on-surface-variant)', display: 'block', marginBottom: '4px' }}>
              {msg.role.toUpperCase()}
            </span>
            <p style={{ fontFamily: 'var(--font-family-ui)', fontSize: '13px', color: '#FFFFFF', margin: 0, whiteSpace: 'pre-wrap' }}>
              {msg.text}
            </p>
          </div>
        ))}
      </div>

      {/* Input & Dispatch Dock */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <Input
          placeholder="State your goal or intent (e.g., 'Refactor storage adapter for sqlite')..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          style={{ flex: 1 }}
        />
        <Button variant="primary" onClick={handleSend} disabled={isProcessing}>
          DISPATCH INTENT
        </Button>
      </div>
    </div>
  );
}

export default ConversationSurface;
