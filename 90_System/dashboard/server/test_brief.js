import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VAULT_ROOT = path.resolve(__dirname, '../../../');
const REFINED_NOTES_DIR = path.join(VAULT_ROOT, '10_Subjects');
const dbPath = path.join(__dirname, 'vault_assistant.db');

const db = new DatabaseSync(dbPath);

async function getUnlinkedNotes() {
  const mocsDir = path.join(REFINED_NOTES_DIR, '00_MOCs');
  const mocLinks = new Set();
  try {
    const mocFiles = await fs.readdir(mocsDir);
    for (const file of mocFiles) {
      if (file.endsWith('.md')) {
        const content = await fs.readFile(path.join(mocsDir, file), 'utf8');
        const matches = content.match(/\[\[(.*?)\]\]/g) || [];
        for (const match of matches) {
          const cleanLink = match.slice(2, -2).trim();
          mocLinks.add(cleanLink.toLowerCase());
        }
      }
    }
  } catch (err) {
    console.error('Error reading MOCs:', err.message);
  }

  const allNotes = [];
  async function scan(dir) {
    const list = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of list) {
      const resPath = path.resolve(dir, entry.name);
      if (entry.isDirectory()) {
        const nameLower = entry.name.toLowerCase();
        if (nameLower === '00_mocs' || nameLower === 'node_modules' || nameLower === '.git' || nameLower === 'dashboard' || nameLower === 'graphify-out') continue;
        await scan(resPath);
      } else if (entry.name.endsWith('.md')) {
        allNotes.push(resPath);
      }
    }
  }
  
  try {
    await scan(REFINED_NOTES_DIR);
  } catch (err) {
    console.error('Error scanning subjects:', err.message);
  }

  const unlinked = [];
  for (const file of allNotes) {
    const baseName = path.basename(file, '.md');
    if (baseName.toLowerCase().endsWith(' moc')) continue;
    if (!mocLinks.has(baseName.toLowerCase())) {
      unlinked.push({
        title: baseName,
        absolutePath: file,
        relativePath: path.relative(VAULT_ROOT, file).replace(/\\/g, '/')
      });
    }
  }
  return unlinked;
}

async function run() {
  const todayStr = new Date().toISOString().split('T')[0];
  console.log('Querying cards_due...');
  const cardsQuery = db.prepare(`SELECT * FROM flashcards WHERE due_date <= ?`);
  const cardsDue = cardsQuery.all(todayStr);
  console.log('Cards due:', cardsDue.length);

  console.log('Querying unfiled_notes...');
  const unfiledQuery = db.prepare(`SELECT * FROM inbox_log WHERE status = 'unfiled'`);
  const unfiledNotes = unfiledQuery.all();
  console.log('Unfiled notes:', unfiledNotes.length);

  console.log('Querying unlinked...');
  const unlinkedNotes = await getUnlinkedNotes();
  console.log('Unlinked notes:', unlinkedNotes.length);

  console.log('Success!');
}

run().catch(console.error);
