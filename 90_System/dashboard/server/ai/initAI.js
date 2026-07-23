import { providerRegistry } from './providerRegistry.js';
import { providerManager } from './providerManager.js';
import { modelManager } from './modelManager.js';
import { aiRouter } from './router.js';
import { OllamaProvider } from './providers/ollamaProvider.js';
import { GeminiProvider } from './providers/geminiProvider.js';
import { OpenRouterProvider } from './providers/openrouterProvider.js';
import { HuggingFaceProvider } from './providers/huggingfaceProvider.js';
import { serverServiceRegistry } from '../core/serviceRegistry.js';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('AI:Bootstrapper');

export async function initializeModelProviderLayer() {
  console.log('----------------------------------------------------');
  console.log('🤖 Initializing AEGISOS Model Provider Abstraction Layer (MPAL v1.2.0)...');
  console.log('----------------------------------------------------');

  // 1. Instantiate Providers
  const ollama = new OllamaProvider();
  const gemini = new GeminiProvider();
  const openrouter = new OpenRouterProvider();
  const huggingface = new HuggingFaceProvider();

  // 2. Register Providers
  providerRegistry.registerProvider(ollama);
  providerRegistry.registerProvider(gemini);
  providerRegistry.registerProvider(openrouter);
  providerRegistry.registerProvider(huggingface);

  // 3. Perform Initial Health & Connection Verification
  await providerRegistry.checkAllHealth();

  // 4. Register MPAL Service in ServiceRegistry
  serverServiceRegistry.register('ModelProviderLayer', {
    name: 'Model Provider Abstraction Layer (MPAL)',
    status: 'running',
    providerRegistry,
    providerManager,
    modelManager,
    aiRouter
  });

  const availableCount = providerRegistry.getAvailableProviders().length;
  log.info(`[MPAL] ${availableCount} of 4 Providers online (Ollama, Gemini, OpenRouter, Hugging Face).`);

  return {
    providerRegistry,
    providerManager,
    modelManager,
    aiRouter
  };
}
