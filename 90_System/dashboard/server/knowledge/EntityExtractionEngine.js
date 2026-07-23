import { aegisLogger } from '../core/logger.js';
import { dynamicKnowledgeGraph } from './DynamicKnowledgeGraph.js';
import { worldModelEngine } from '../worldModel/WorldModelEngine.js';

const log = aegisLogger.child('Knowledge:EntityExtraction');

export class EntityExtractionEngine {
  constructor() {
    this.entityPatterns = [
      { type: 'Project', regex: /\b(AEGISOS|SecondBrain|Stitch|Project\s+[A-Z0-9_-]+)\b/gi },
      { type: 'Language', regex: /\b(JavaScript|TypeScript|Python|Rust|C\+\+|SQL|HTML|CSS|Go)\b/gi },
      { type: 'Framework', regex: /\b(React|Express|Vite|Node\.js|Next\.js|TailwindCSS|Svelte)\b/gi },
      { type: 'Model', regex: /\b(gemini-1\.5-flash|gemini-1\.5-pro|llama3|mistral|nomic-embed-text)\b/gi },
      { type: 'Provider', regex: /\b(Ollama|Gemini|OpenRouter|Hugging Face|Anthropic|OpenAI)\b/gi },
      { type: 'Tool', regex: /\b(tool_[a-z0-9_]+|graphify|ripgrep|git|npm|node)\b/gi },
    ];
  }

  extractAndIndex(text, source = 'observation') {
    if (!text || typeof text !== 'string') return [];

    const extracted = [];
    const foundEntities = new Set();

    for (const pattern of this.entityPatterns) {
      const matches = text.matchAll(pattern.regex);
      for (const match of matches) {
        const entityLabel = match[0];
        const entityId = `entity_${pattern.type.toLowerCase()}_${entityLabel.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;

        if (!foundEntities.has(entityId)) {
          foundEntities.add(entityId);
          const entity = {
            id: entityId,
            label: entityLabel,
            type: pattern.type,
            source,
            timestamp: new Date().toISOString(),
          };

          // Index into Knowledge Graph
          dynamicKnowledgeGraph.addNode(entity.id, entity.label, entity.type, { source });

          // Index into World Model
          worldModelEngine.observe(entity.id, entity.type, entity.label, { source }, source);

          extracted.push(entity);
        }
      }
    }

    if (extracted.length > 0) {
      log.info(`Extracted & indexed ${extracted.length} entities from source "${source}".`);
    }

    return extracted;
  }
}

export const entityExtractionEngine = new EntityExtractionEngine();
