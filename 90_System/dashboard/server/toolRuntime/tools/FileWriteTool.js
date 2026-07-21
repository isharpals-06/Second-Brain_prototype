import { ToolBase } from '../ToolBase.js';
import { ToolCategory } from '../types.js';
import fs from 'fs/promises';
import path from 'path';

export class FileWriteTool extends ToolBase {
  constructor() {
    super({
      id: 'tool_file_write',
      name: 'Write File',
      category: ToolCategory.FILESYSTEM,
      description: 'Writes content to a file',
      version: '1.0.0',
      permissions: ['write_file']
    });
  }

  validate(input) {
    if (!input || !input.filePath || input.content === undefined) {
      return { isValid: false, errors: ['filePath and content parameters are required'] };
    }
    return { isValid: true, errors: [] };
  }

  async execute(input) {
    await fs.mkdir(path.dirname(input.filePath), { recursive: true });
    await fs.writeFile(input.filePath, input.content, 'utf-8');
    return {
      filePath: input.filePath,
      writtenBytes: Buffer.byteLength(input.content),
      success: true
    };
  }
}
