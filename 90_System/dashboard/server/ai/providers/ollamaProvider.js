import { BaseProvider } from '../baseProvider.js';

export class OllamaProvider extends BaseProvider {
  constructor(options = {}) {
    super('ollama', 'Ollama Local Models', options);
    this.host = process.env.OLLAMA_HOST || options.host || 'http://localhost:11434';
  }

  async initialize() {
    const startTime = Date.now();
    try {
      const res = await fetch(`${this.host}/api/tags`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        this.available = true;
        this.lastError = null;
        this.latencyMs = Date.now() - startTime;
        this.log.info(`Ollama connected successfully at ${this.host} (${this.latencyMs}ms)`);
      } else {
        this.available = false;
        this.lastError = `HTTP ${res.status}`;
        this.log.warn(`Ollama check returned HTTP ${res.status}`);
      }
    } catch (err) {
      this.available = false;
      this.lastError = err.message;
      this.log.warn(`Ollama provider offline: ${err.message}`);
    }
    this.lastChecked = new Date().toISOString();
  }

  async listModels() {
    if (!this.available) return [];
    try {
      const res = await fetch(`${this.host}/api/tags`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.models || []).map(m => ({
        id: m.name,
        name: `${m.name} (${Math.round((m.size || 0) / (1024 * 1024 * 102.4)) / 10} GB)`,
        provider: this.id,
        capabilities: m.name.includes('embed') ? ['embeddings'] : ['conversation', 'coding', 'brainstorming'],
        contextWindow: 8192,
        streaming: true
      }));
    } catch (err) {
      this.log.error(`Failed to list Ollama models: ${err.message}`);
      return [];
    }
  }

  async generate(options = {}) {
    const { model = 'llama3', prompt, messages, systemPrompt, temperature = 0.7, maxTokens } = options;
    const startTime = Date.now();

    const formattedMessages = messages || [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      { role: 'user', content: prompt || '' }
    ];

    const body = {
      model,
      messages: formattedMessages,
      stream: false,
      options: {
        temperature,
        ...(maxTokens ? { num_predict: maxTokens } : {})
      }
    };

    const res = await fetch(`${this.host}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`Ollama API error (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    const responseText = data.message?.content || '';
    const latencyMs = Date.now() - startTime;

    return {
      text: responseText,
      model,
      provider: this.id,
      usage: {
        promptTokens: data.prompt_eval_count || 0,
        completionTokens: data.eval_count || 0,
        totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
      },
      latencyMs
    };
  }

  async stream(options = {}) {
    const { model = 'llama3', prompt, messages, systemPrompt, temperature = 0.7, maxTokens, onChunk } = options;

    const formattedMessages = messages || [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      { role: 'user', content: prompt || '' }
    ];

    const body = {
      model,
      messages: formattedMessages,
      stream: true,
      options: {
        temperature,
        ...(maxTokens ? { num_predict: maxTokens } : {})
      }
    };

    const res = await fetch(`${this.host}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`Ollama Streaming error (${res.status}): ${await res.text()}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          const content = parsed.message?.content || '';
          if (content && typeof onChunk === 'function') {
            onChunk({ text: content, done: parsed.done || false });
          }
        } catch (_) {}
      }
    }
  }

  async embeddings(options = {}) {
    const { model = 'nomic-embed-text', text } = options;
    const startTime = Date.now();

    const res = await fetch(`${this.host}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt: text })
    });

    if (!res.ok) {
      throw new Error(`Ollama Embedding error (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    return {
      embedding: data.embedding,
      model,
      provider: this.id,
      latencyMs: Date.now() - startTime
    };
  }
}
