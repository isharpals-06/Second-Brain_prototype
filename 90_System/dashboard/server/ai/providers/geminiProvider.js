import { BaseProvider } from '../baseProvider.js';

export class GeminiProvider extends BaseProvider {
  constructor(options = {}) {
    super('gemini', 'Google Gemini AI', options);
    this.apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || options.apiKey || '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  async initialize() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || this.options.apiKey || '';
    if (!this.apiKey) {
      this.available = false;
      this.lastError = 'Missing GEMINI_API_KEY or GOOGLE_API_KEY in environment';
      this.log.info('Gemini Provider offline: No API key configured.');
      this.lastChecked = new Date().toISOString();
      return;
    }

    const startTime = Date.now();
    try {
      const res = await fetch(`${this.baseUrl}/models?key=${this.apiKey}`, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        this.available = true;
        this.lastError = null;
        this.latencyMs = Date.now() - startTime;
        this.log.info(`Gemini API key verified successfully (${this.latencyMs}ms)`);
      } else {
        this.available = false;
        this.lastError = `API Key check failed: HTTP ${res.status}`;
        this.log.warn(`Gemini API check failed with HTTP ${res.status}`);
      }
    } catch (err) {
      this.available = false;
      this.lastError = err.message;
      this.log.warn(`Gemini API check failed: ${err.message}`);
    }
    this.lastChecked = new Date().toISOString();
  }

  formatModelName(model) {
    if (!model || model === 'gemini-1.5-flash' || model === 'gemini-1.5-flash-latest') return 'gemini-2.5-flash';
    if (model === 'gemini-1.5-pro' || model === 'gemini-1.5-pro-latest') return 'gemini-2.5-pro';
    if (model === 'text-embedding-004') return 'gemini-embedding-2';
    return model;
  }

  async listModels() {
    if (!this.apiKey) return [];
    return [
      {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash (Ultra-Fast & High Intelligence)',
        provider: this.id,
        capabilities: ['conversation', 'coding', 'summarization', 'fast', 'brainstorming'],
        contextWindow: 1048576,
        streaming: true
      },
      {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro (Deep Reasoning & Long-Context)',
        provider: this.id,
        capabilities: ['reasoning', 'coding', 'long-context', 'vision', 'planning', 'conversation'],
        contextWindow: 1048576,
        streaming: true
      },
      {
        id: 'gemini-3.6-flash',
        name: 'Gemini 3.6 Flash (Flagship Performance)',
        provider: this.id,
        capabilities: ['conversation', 'coding', 'vision', 'reasoning', 'fast'],
        contextWindow: 1048576,
        streaming: true
      },
      {
        id: 'gemini-embedding-2',
        name: 'Gemini Embedding 2',
        provider: this.id,
        capabilities: ['embeddings'],
        contextWindow: 2048,
        streaming: false
      }
    ];
  }

  async generate(options = {}) {
    if (!this.apiKey) throw new Error('Gemini API key is not configured.');
    let { model = 'gemini-2.5-flash', prompt, messages, systemPrompt, temperature = 0.7, maxTokens } = options;
    model = this.formatModelName(model);
    const startTime = Date.now();

    const contents = [];
    if (messages && messages.length > 0) {
      messages.forEach(m => {
        if (m.role !== 'system') {
          contents.push({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          });
        }
      });
    } else {
      contents.push({ role: 'user', parts: [{ text: prompt || '' }] });
    }

    const body = {
      contents,
      generationConfig: {
        temperature,
        ...(maxTokens ? { maxOutputTokens: maxTokens } : {})
      }
    };

    if (systemPrompt) {
      body.systemInstruction = { parts: [{ text: systemPrompt }] };
    }

    const endpoint = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`Gemini API error (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const latencyMs = Date.now() - startTime;

    return {
      text,
      model,
      provider: this.id,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0
      },
      latencyMs
    };
  }

  async stream(options = {}) {
    if (!this.apiKey) throw new Error('Gemini API key is not configured.');
    let { model = 'gemini-2.5-flash', prompt, messages, systemPrompt, temperature = 0.7, maxTokens, onChunk } = options;
    model = this.formatModelName(model);

    const contents = [];
    if (messages && messages.length > 0) {
      messages.forEach(m => {
        if (m.role !== 'system') {
          contents.push({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          });
        }
      });
    } else {
      contents.push({ role: 'user', parts: [{ text: prompt || '' }] });
    }

    const body = {
      contents,
      generationConfig: {
        temperature,
        ...(maxTokens ? { maxOutputTokens: maxTokens } : {})
      }
    };

    if (systemPrompt) {
      body.systemInstruction = { parts: [{ text: systemPrompt }] };
    }

    const endpoint = `${this.baseUrl}/models/${model}:streamGenerateContent?alt=sse&key=${this.apiKey}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`Gemini Streaming error (${res.status}): ${await res.text()}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
      for (const line of lines) {
        try {
          const jsonStr = line.replace(/^data:\s*/, '').trim();
          if (!jsonStr) continue;
          const parsed = JSON.parse(jsonStr);
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (text && typeof onChunk === 'function') {
            onChunk({ text, done: false });
          }
        } catch (_) {}
      }
    }
  }

  async embeddings(options = {}) {
    if (!this.apiKey) throw new Error('Gemini API key is not configured.');
    let { model = 'gemini-embedding-2', text } = options;
    model = this.formatModelName(model);
    const startTime = Date.now();

    const endpoint = `${this.baseUrl}/models/${model}:embedContent?key=${this.apiKey}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: `models/${model}`,
        content: { parts: [{ text }] }
      })
    });

    if (!res.ok) {
      throw new Error(`Gemini Embedding error (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    return {
      embedding: data.embedding?.values || [],
      model,
      provider: this.id,
      latencyMs: Date.now() - startTime
    };
  }
}
