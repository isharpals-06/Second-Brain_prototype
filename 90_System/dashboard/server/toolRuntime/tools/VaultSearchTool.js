import { ToolBase } from '../ToolBase.js';
import { ToolCategory } from '../types.js';
import { knowledgeAPI } from '../../knowledge/KnowledgeAPI.js';

export class VaultSearchTool extends ToolBase {
  constructor() {
    super({
      id: 'tool_vault_search',
      name: 'Vault Note Search',
      category: ToolCategory.RAG,
      description: 'Searches Obsidian vault notes using Knowledge Graph and Semantic Index',
      version: '1.0.0',
      permissions: ['search_vault']
    });
  }

  async execute(input = {}) {
    const queryText = input.query || '';
    const results = await knowledgeAPI.search(queryText, 5);
    return {
      query: queryText,
      matchCount: results.length,
      results
    };
  }
}
