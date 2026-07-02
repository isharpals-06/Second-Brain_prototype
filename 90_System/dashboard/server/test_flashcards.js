import fs from 'fs/promises';
import path from 'path';

const VAULT_ROOT = 'C:\\Users\\ishar\\SecondBrain';
const REFINED_NOTES_DIR = path.join(VAULT_ROOT, 'Refined notes');

async function getMarkdownFiles(dir) {
  let results = [];
  try {
    const list = await fs.readdir(dir, { withFileTypes: true });
    for (const file of list) {
      const resPath = path.resolve(dir, file.name);
      if (file.isDirectory()) {
        const nameLower = file.name.toLowerCase();
        if (
          nameLower === 'node_modules' ||
          nameLower === '.git' ||
          nameLower === '.obsidian' ||
          nameLower === 'dashboard' ||
          nameLower === 'graphify-out'
        ) {
          continue;
        }
        results = results.concat(await getMarkdownFiles(resPath));
      } else if (file.name.endsWith('.md')) {
        results.push(resPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  return results;
}

function getSubjectFromPath(filePath) {
  const relative = path.relative(REFINED_NOTES_DIR, filePath);
  const parts = relative.split(path.sep);
  if (parts.length > 1) {
    return parts[0].replace('_notes', '').toUpperCase();
  }
  return 'GENERAL';
}

async function test() {
  console.log('REFINED_NOTES_DIR:', REFINED_NOTES_DIR);
  const files = await getMarkdownFiles(REFINED_NOTES_DIR);
  console.log('Total files found:', files.length);
  
  // Test parser on Virtual Memory.md
  const vmFile = files.find(f => f.includes('Virtual Memory.md'));
  if (vmFile) {
    console.log('Found Virtual Memory.md at:', vmFile);
    console.log('Subject parsed:', getSubjectFromPath(vmFile));
    
    const content = await fs.readFile(vmFile, 'utf-8');
    const lines = content.split('\n');
    console.log('Lines in file:', lines.length);
    
    let count = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('::') && i > 0) {
        let questionIdx = i - 1;
        while (questionIdx >= 0 && lines[questionIdx].trim() === '') {
          questionIdx--;
        }
        if (questionIdx >= 0) {
          const question = lines[questionIdx].replace('#flashcards', '').trim();
          const answer = line.substring(2).trim();
          console.log(`[nextline-inline] Q: "${question}" -> A: "${answer}"`);
          count++;
        }
      } else if (line.includes('::')) {
        const parts = line.split('::');
        const question = parts[0].replace('#flashcards', '').trim();
        const answer = parts[1].trim();
        console.log(`[inline] Q: "${question}" -> A: "${answer}"`);
        count++;
      } else if (line === '??' && i > 0 && i + 1 < lines.length) {
        let questionIdx = i - 1;
        while (questionIdx >= 0 && lines[questionIdx].trim() === '') {
          questionIdx--;
        }
        if (questionIdx >= 0) {
          const question = lines[questionIdx].replace('#flashcards', '').trim();
          let answerLines = [];
          let j = i + 1;
          while (j < lines.length) {
            const nextLine = lines[j].trim();
            if (nextLine === '' || nextLine.includes('::') || nextLine.startsWith('::') || nextLine.endsWith('??') || nextLine === '??' || nextLine.startsWith('#') || nextLine.startsWith('---')) {
              break;
            }
            answerLines.push(lines[j]);
            j++;
          }
          const answer = answerLines.join('\n').trim();
          console.log(`[nextline-multiline] Q: "${question}" -> A: "${answer}"`);
          count++;
        }
      }
    }
    console.log('Total flashcards found in file:', count);
  } else {
    console.log('Could not find Virtual Memory.md in file list');
  }
}

test();
