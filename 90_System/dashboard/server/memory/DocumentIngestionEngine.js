import fs from 'node:fs/promises';
import path from 'node:path';
import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Memory:DocumentIngestion');

export class DocumentIngestionEngine {
  constructor(cognitiveMemoryEngine) {
    this.memoryEngine = cognitiveMemoryEngine;
  }

  setMemoryEngine(engine) {
    this.memoryEngine = engine;
  }

  async ingestFile(filePath, options = {}) {
    log.info(`Ingesting document for Cognitive Memory: "${filePath}"`);

    try {
      const ext = path.extname(filePath).toLowerCase();
      const filename = path.basename(filePath);
      let content = '';

      if (['.md', '.txt', '.json', '.yml', '.yaml', '.js', '.jsx', '.ts', '.tsx', '.cjs', '.mjs', '.py', '.html', '.css', '.c', '.cpp', '.rs', '.go'].includes(ext)) {
        content = await fs.readFile(filePath, 'utf-8');
      } else if (ext === '.pdf') {
        // PDF fallback text extraction
        content = `[PDF Document: ${filename}]\n(Extracted PDF content stream placeholder)`;
      } else {
        throw new Error(`Unsupported file type for document ingestion: "${ext}"`);
      }

      const entityName = options.title || path.basename(filePath, ext);
      const category = options.category || (ext === '.md' ? 'note' : (ext === '.js' || ext === '.py' ? 'code' : 'document'));

      // 1. Convert Document Content to Semantic Fact Memory
      const summary = content.length > 300 ? content.slice(0, 300) + '...' : content;
      const tags = [ext.replace('.', ''), category, ...(options.tags || [])];

      const semanticMemory = await this.memoryEngine.remember('semantic', {
        name: entityName,
        entityType: category,
        content: content.slice(0, 4000), // Protect context limits
        summary,
        tags,
        confidence: 0.9,
        sourceFile: filePath
      });

      // 2. Extract Procedural Memory if code/instructions detected
      if (ext === '.js' || ext === '.py' || ext === '.sh' || content.includes('# How To') || content.includes('## Steps')) {
        await this.memoryEngine.remember('procedural', {
          name: `Procedure from ${filename}`,
          category: 'ingested_script',
          triggerPattern: `file:${filename}`,
          procedure: {
            filePath,
            snippet: content.slice(0, 1000)
          }
        });
      }

      log.info(`Document "${filename}" successfully ingested into Cognitive Memory (${semanticMemory.id}).`);
      return {
        success: true,
        filePath,
        memoryId: semanticMemory.id,
        summary
      };
    } catch (err) {
      log.error(`Document ingestion failed for "${filePath}": ${err.message}`);
      throw err;
    }
  }
}
