import { BaseProvider } from '../baseProvider.js';

export class HuggingFaceProvider extends BaseProvider {
  constructor(options = {}) {
    super('huggingface', 'Hugging Face Inference', options);
    this.apiKey = process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY || options.apiKey || '';
    this.baseUrl = 'https://api-inference.huggingface.co/models';
  }

  async initialize() {
    this.apiKey = process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY || this.options.apiKey || '';
    if (!this.apiKey) {
      this.available = false;
      this.lastError = 'Missing HF_API_KEY in environment';
      this.log.info('Hugging Face Provider offline: No HF_API_KEY configured.');
      this.lastChecked = new Date().toISOString();
      return;
    }

    const startTime = Date.now();
    try {
      const testModel = 'sentence-transformers/all-MiniLM-L6-v2';
      const res = await fetch(`${this.baseUrl}/${testModel}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputs: 'AEGISOS Health Check' }),
        signal: AbortSignal.timeout(5000)
      });

      if (res.ok) {
        this.available = true;
        this.lastError = null;
        this.latencyMs = Date.now() - startTime;
        this.log.info(`Hugging Face API key verified successfully (${this.latencyMs}ms)`);
      } else {
        this.available = false;
        this.lastError = `HTTP ${res.status}`;
        this.log.warn(`Hugging Face check returned HTTP ${res.status}`);
      }
    } catch (err) {
      this.available = false;
      this.lastError = err.message;
      this.log.warn(`Hugging Face check failed: ${err.message}`);
    }
    this.lastChecked = new Date().toISOString();
  }

  async listModels() {
    return [
      {
        id: 'meta-llama/Llama-3.2-3B-Instruct',
        name: 'Llama 3.2 3B Instruct (HF Inference)',
        provider: this.id,
        capabilities: ['conversation', 'fast', 'summarization'],
        contextWindow: 128000,
        streaming: true
      },
      {
        id: 'Qwen/Qwen2.5-72B-Instruct',
        name: 'Qwen 2.5 72B Instruct (HF Inference)',
        provider: this.id,
        capabilities: ['coding', 'reasoning', 'conversation'],
        contextWindow: 32000,
        streaming: true
      },
      {
        id: 'sentence-transformers/all-MiniLM-L6-v2',
        name: 'Sentence Transformers all-MiniLM-L6-v2',
        provider: this.id,
        capabilities: ['embeddings'],
        contextWindow: 512,
        streaming: false
      },
      {
        id: 'BAAI/bge-large-en-v1.5',
        name: 'BAAI BGE Large English v1.5 (High Density)',
        provider: this.id,
        capabilities: ['embeddings'],
        contextWindow: 512,
        streaming: false
      }
    ];
  }

  async generate(options = {}) {
    if (!this.apiKey) throw new Error('Hugging Face API key is not configured.');
    const { model = 'meta-llama/Llama-3.2-3B-Instruct', prompt, messages, systemPrompt, temperature = 0.7, maxTokens = 512 } = options;
    const startTime = Date.now();

    let fullPrompt = '';
    if (systemPrompt) fullPrompt += `System: ${systemPrompt}\n\n`;
    if (messages && messages.length > 0) {
      messages.forEach(m => {
        fullPrompt += `${m.role}: ${m.content}\n`;
      });
      fullPrompt += `assistant: `;
    } else {
      fullPrompt += `User: ${prompt}\nAssistant: `;
    }

    const res = await fetch(`${this.baseUrl}/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: fullPrompt,
        parameters: {
          temperature,
          max_new_tokens: maxTokens,
          return_full_text: false
        }
      })
    });

    if (!res.ok) {
      throw new Error(`Hugging Face API error (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    let text = '';
    if (Array.isArray(data) && data[0]?.generated_text) {
      text = data[0].generated_text;
    } else if (typeof data === 'object' && data.generated_text) {
      text = data.generated_text;
    }

    const latencyMs = Date.now() - startTime;
    return {
      text,
      model,
      provider: this.id,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      latencyMs
    };
  }

  async stream(options = {}) {
    // Fallback to generate for HF serverless endpoints when streaming is not chunked
    const result = await this.generate(options);
    if (typeof options.onChunk === 'function') {
      options.onChunk({ text: result.text, done: true });
    }
  }

  async embeddings(options = {}) {
    if (!this.apiKey) throw new Error('Hugging Face API key is not configured.');
    const { model = 'sentence-transformers/all-MiniLM-L6-v2', text } = options;
    const startTime = Date.now();

    const res = await fetch(`${this.baseUrl}/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: text })
    });

    if (!res.ok) {
      throw new Error(`Hugging Face Embedding error (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    const embedding = Array.isArray(data) ? (Array.isArray(data[0]) ? data[0] : data) : [];

    return {
      embedding,
      model,
      provider: this.id,
      latencyMs: Date.now() - startTime
    };
  }
}
