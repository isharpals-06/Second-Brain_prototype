import { ToolBase } from '../ToolBase.js';
import { ToolCategory } from '../types.js';
import fs from 'fs/promises';

export class FileReadTool extends ToolBase {
  constructor() {
    super({
      id: 'tool_file_read',
      name: 'Read File',
      category: ToolCategory.FILESYSTEM,
      description: 'Reads contents from a local file',
      version: '1.0.0',
      permissions: ['read_file']
    });
  }

  validate(input) {
    if (!input || !input.filePath) {
      return { isValid: false, errors: ['filePath parameter is required'] };
    }
    return { isValid: true, errors: [] };
  }

  async execute(input) {
    const content = await fs.readFile(input.filePath, 'utf-8');
    return {
      filePath: input.filePath,
      content: content.substring(0, 10000), // capped
      sizeBytes: Buffer.byteLength(content)
    };
  }
}
