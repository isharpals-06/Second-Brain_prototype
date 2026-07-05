import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VAULT_ROOT = path.resolve(__dirname, '../../../');
const REFINED_NOTES_DIR = path.join(VAULT_ROOT, '10_Subjects');
const dbPath = path.join(__dirname, 'vault_assistant.db');

console.log('Starting Flashcard Migration...');
console.log('Notes directory:', REFINED_NOTES_DIR);
console.log('Database path:', dbPath);

// Initialize DB
const db = new DatabaseSync(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS flashcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    note_path TEXT,
    question TEXT,
    answer TEXT,
    easiness REAL DEFAULT 2.5,
    interval INTEGER DEFAULT 1,
    repetitions INTEGER DEFAULT 0,
    due_date TEXT,
    last_reviewed TEXT
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS inbox_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    note_path TEXT,
    detected_at TEXT,
    status TEXT  -- 'unfiled' | 'filed' | 'ignored'
  );
`);

db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_flashcards_path_q ON flashcards(note_path, question);
`);

db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_inbox_path ON inbox_log(note_path);
`);

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
          nameLower === 'graphify-out' ||
          nameLower === '00_mocs'
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

const insertCardStmt = db.prepare(`
  INSERT OR IGNORE INTO flashcards (note_path, question, answer, due_date)
  VALUES (?, ?, ?, ?)
`);

async function run() {
  const files = await getMarkdownFiles(REFINED_NOTES_DIR);
  console.log(`Scanning ${files.length} markdown files for flashcards...`);

  let cardCount = 0;
  const todayStr = new Date().toISOString().split('T')[0];

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const lines = content.split('\n');
    const relPath = path.relative(VAULT_ROOT, file).replace(/\\/g, '/');

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
          if (question && answer) {
            insertCardStmt.run(relPath, question, answer, todayStr);
            cardCount++;
          }
        }
      } else if (line.includes('::')) {
        const parts = line.split('::');
        const question = parts[0].replace('#flashcards', '').trim();
        const answer = parts[1].trim();
        if (question && answer) {
          insertCardStmt.run(relPath, question, answer, todayStr);
          cardCount++;
        }
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
          if (question && answer) {
            insertCardStmt.run(relPath, question, answer, todayStr);
            cardCount++;
          }
        }
      }
    }
  }

  console.log(`Migration complete! Successfully processed and seeded ${cardCount} flashcard records.`);
}

run().catch(console.error);
