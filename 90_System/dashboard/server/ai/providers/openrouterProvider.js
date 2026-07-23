import { BaseProvider } from '../baseProvider.js';

export class OpenRouterProvider extends BaseProvider {
  constructor(options = {}) {
    super('openrouter', 'OpenRouter Unified Models', options);
    this.apiKey = process.env.OPENROUTER_API_KEY || options.apiKey || '';
    this.baseUrl = 'https://openrouter.ai/api/v1';
    this.cachedModels = [];
  }

  async initialize() {
    this.apiKey = process.env.OPENROUTER_API_KEY || this.options.apiKey || '';
    if (!this.apiKey) {
      this.available = false;
      this.lastError = 'Missing OPENROUTER_API_KEY in environment';
      this.log.info('OpenRouter Provider offline: No OPENROUTER_API_KEY configured.');
      this.lastChecked = new Date().toISOString();
      return;
    }

    const startTime = Date.now();
    try {
      const res = await fetch(`${this.baseUrl}/models`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        signal: AbortSignal.timeout(5000)
      });

      if (res.ok) {
        const data = await res.json();
        this.available = true;
        this.lastError = null;
        this.latencyMs = Date.now() - startTime;
        this.cachedModels = (data.data || []).map(m => ({
          id: m.id,
          name: m.name || m.id,
          provider: this.id,
          capabilities: this.inferCapabilities(m.id, m.description),
          contextWindow: m.context_length || 128000,
          streaming: true
        }));
        this.log.info(`OpenRouter API connected successfully (${this.cachedModels.length} models, ${this.latencyMs}ms)`);
      } else {
        this.available = false;
        this.lastError = `API check failed: HTTP ${res.status}`;
        this.log.warn(`OpenRouter check failed with HTTP ${res.status}`);
      }
    } catch (err) {
      this.available = false;
      this.lastError = err.message;
      this.log.warn(`OpenRouter provider check failed: ${err.message}`);
    }
    this.lastChecked = new Date().toISOString();
  }

  inferCapabilities(id, desc = '') {
    const caps = ['conversation'];
    const lower = (id + ' ' + desc).toLowerCase();
    if (lower.includes('code') || lower.includes('coder') || lower.includes('claude') || lower.includes('gpt-4')) caps.push('coding');
    if (lower.includes('deepseek-r1') || lower.includes('o1') || lower.includes('o3') || lower.includes('reasoning')) caps.push('reasoning');
    if (lower.includes('vision') || lower.includes('4o') || lower.includes('sonnet')) caps.push('vision');
    if (lower.includes('70b') || lower.includes('405b') || lower.includes('pro')) caps.push('planning');
    return caps;
  }

  async listModels() {
    if (!this.available) return [];
    if (this.cachedModels.length > 0) return this.cachedModels;
    return [
      { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1 (Deep Reasoning)', provider: this.id, capabilities: ['reasoning', 'coding', 'planning'], contextWindow: 64000, streaming: true },
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: this.id, capabilities: ['coding', 'reasoning', 'vision', 'conversation'], contextWindow: 200000, streaming: true },
      { id: 'openai/gpt-4o', name: 'GPT-4o (Omni)', provider: this.id, capabilities: ['coding', 'vision', 'conversation'], contextWindow: 128000, streaming: true },
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B Instruct', provider: this.id, capabilities: ['conversation', 'coding', 'planning'], contextWindow: 128000, streaming: true }
    ];
  }

  async generate(options = {}) {
    if (!this.apiKey) throw new Error('OpenRouter API key is not configured.');
    const { model = 'anthropic/claude-3.5-sonnet', prompt, messages, systemPrompt, temperature = 0.7, maxTokens } = options;
    const startTime = Date.now();

    const formattedMessages = messages || [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      { role: 'user', content: prompt || '' }
    ];

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'http://localhost:3010',
        'X-Title': 'AEGISOS AI Operating System',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        temperature,
        ...(maxTokens ? { max_tokens: maxTokens } : {})
      })
    });

    if (!res.ok) {
      throw new Error(`OpenRouter API error (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    const latencyMs = Date.now() - startTime;

    return {
      text,
      model,
      provider: this.id,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0
      },
      latencyMs
    };
  }

  async stream(options = {}) {
    if (!this.apiKey) throw new Error('OpenRouter API key is not configured.');
    const { model = 'anthropic/claude-3.5-sonnet', prompt, messages, systemPrompt, temperature = 0.7, maxTokens, onChunk } = options;

    const formattedMessages = messages || [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      { role: 'user', content: prompt || '' }
    ];

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'http://localhost:3010',
        'X-Title': 'AEGISOS AI Operating System',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        temperature,
        stream: true,
        ...(maxTokens ? { max_tokens: maxTokens } : {})
      })
    });

    if (!res.ok) {
      throw new Error(`OpenRouter Streaming error (${res.status}): ${await res.text()}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
      for (const line of lines) {
        const jsonStr = line.replace(/^data:\s*/, '').trim();
        if (jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const text = parsed.choices?.[0]?.delta?.content || '';
          if (text && typeof onChunk === 'function') {
            onChunk({ text, done: false });
          }
        } catch (_) {}
      }
    }
  }

  async embeddings(options = {}) {
    throw new Error('OpenRouter does not provide embeddings endpoints; routing to secondary provider.');
  }
}
