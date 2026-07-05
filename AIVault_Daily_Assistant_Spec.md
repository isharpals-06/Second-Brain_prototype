# AIVault → Daily Assistant Upgrade Spec

## Context

**Project:** AIVault (`secondbrain` repo) — local, privacy-first Obsidian-based second brain with an Express + React "A.R.C." dashboard (STARK/J.A.R.V.I.S.-inspired UI).

**Problem:** The system currently works as a **knowledge base**, not an **assistant**. It only responds when the user types a query into the chat textbox (RAG pull model). It has zero proactive behavior, zero persistent state, and zero background processing. Nothing runs unless the user initiates it.

**Goal of this build:** Add a **push/proactive layer** on top of the existing retrieval system so the app has a reason to be opened daily, without rebuilding the existing pipeline.

**Non-goal:** This is a separate project from the AMD hackathon's Multi-Model Fallback Router. No shared code between the two.

---

## Current Repository Structure (for reference)

```
C:\Users\ishar\projects\secondbrain
├── 00_Inbox/                   <- raw incoming notes/drafts
├── 10_Subjects/                <- refined study vault
│   ├── 00_MOCs/                <- subject maps (OS MOC.md, DSA MOC.md, etc.)
│   └── [subject subfolders]
├── 20_Sources/                 <- raw PDFs, slides
├── 90_System/
│   └── dashboard/
│       ├── server/
│       │   └── server.js       <- Express backend: intent classifier + model router (Ollama/Gemini fallback)
│       └── src/                <- Vite React frontend (AIChatConsole, NotesExplorer, etc.)
├── graphify-out/                <- local AST code graph index
└── start_second_brain.bat
```

Existing orchestration lives inside `server.js`: an intent classifier routes prompts to local Ollama models (qwen, mixtral, etc.) with Gemini 2.5-flash fallback for high-context/PDF tasks. PDF ingestion uses `multer` + `pdf-parse`, and Gemini slices lecture content into markdown notes with YAML frontmatter, LaTeX, and `#flashcards`-tagged flashcards, appended into MOC files.

**None of this currently runs on a schedule or file-watch trigger — only on HTTP request from the chat UI.**

---

## Build Plan — 1 Weekend

### Day 1: Daily Briefing + State Layer

The briefing is only meaningful if there's real persistent state behind it — currently there is none. This adds it.

#### 1. New SQLite tables

```sql
CREATE TABLE flashcards (
  id INTEGER PRIMARY KEY,
  note_path TEXT,
  question TEXT,
  answer TEXT,
  easiness REAL DEFAULT 2.5,   -- SM-2 EF
  interval INTEGER DEFAULT 1,  -- days
  repetitions INTEGER DEFAULT 0,
  due_date TEXT,
  last_reviewed TEXT
);

CREATE TABLE inbox_log (
  id INTEGER PRIMARY KEY,
  note_path TEXT,
  detected_at TEXT,
  status TEXT  -- 'unfiled' | 'filed' | 'ignored'
);
```

#### 2. Migration script

One-time script to scan existing `#flashcards`-tagged content across `10_Subjects/`, parse `::` / `??` flashcard syntax, and seed the `flashcards` table with `due_date = today`.

#### 3. New Express routes in `server.js`

- **`POST /api/review`** — body: `{ card_id, quality }` (quality 0–5, user-rated after seeing the answer). Runs standard SM-2 algorithm to update `easiness`, `interval`, `repetitions`, `due_date`.
- **`GET /api/daily-brief`** — returns a single JSON payload with three sections:
  - `cards_due`: flashcards where `due_date <= today`
  - `unfiled_notes`: rows from `inbox_log` where `status = 'unfiled'` and `detected_at` within last 24h
  - `unlinked_notes`: notes in `10_Subjects/` not referenced in any `00_MOCs/*.md` file

**SM-2 algorithm reference** (standard implementation):
```
EF' = EF + (0.1 - (5-q)*(0.08+(5-q)*0.02))
if EF' < 1.3: EF' = 1.3
if q < 3: repetitions = 0, interval = 1
else:
  repetitions += 1
  if repetitions == 1: interval = 1
  elif repetitions == 2: interval = 6
  else: interval = round(interval * EF')
due_date = today + interval days
```

#### 4. Frontend: `DailyBrief.jsx`

Replaces the current blank/static landing view of the dashboard. On mount, calls `GET /api/daily-brief` and renders three cards:
- "N flashcards due today" → button opens review flow (feeds `POST /api/review`)
- "N new notes in Inbox from last night" → button to file/review each
- "N unlinked notes detected" → button to link into a MOC

**Manual review quality input** — the user rates recall quality (0–5) themselves after seeing the answer. No automatic inference from time-to-reveal for this build (keeps scope contained).

---

### Day 2: Capture Gate + Librarian Filing

#### 1. Capture Gate — AutoHotkey script (Windows, zero extra runtime needed)

```ahk
^!Space::
InputBox, thought, Quick Capture, Type your thought:
FileAppend, %thought%`n---`n%A_Now%`n`n, C:\Users\ishar\projects\secondbrain\00_Inbox\quick_capture.md
return
```

- Bound to `Ctrl+Alt+Space`
- Runs at startup via a shortcut in `shell:startup`
- Appends timestamped raw text directly to `00_Inbox/quick_capture.md`

#### 2. Librarian — file watcher, not a new agent framework

Add `chokidar` to `server.js` watching `00_Inbox/` for new/changed files.

**On file event:**
1. Read file content.
2. Send to the **existing** intent-classifier/model-router pipeline in `server.js` with a "classify and file" system prompt — reuse current Ollama/Gemini routing, do not build a separate agent.
3. Expected model output: `{ subject, filename, tags }`
4. Move/rename file into `10_Subjects/<subject>/`.
5. Append entry to the relevant `00_MOCs/<subject> MOC.md`.
6. Insert row into `inbox_log` with `status = 'filed'`.

This closes the loop: capture via hotkey → background filing → next morning's Daily Brief reflects what was filed overnight.

---

## Explicitly Out of Scope for This Build

- Sentinel agent (background note-writing observer that fetches related context in real time) — deferred, higher cost/complexity, revisit after this MVP is validated.
- Automatic flashcard quality inference (time-to-reveal, etc.) — manual rating only for now.
- Any multi-agent framework/orchestration library — reuse existing `server.js` routing logic; do not introduce new agent abstractions this weekend.
- Any code sharing with the AMD hackathon Multi-Model Fallback Router project — fully separate codebases.

## Definition of Done

- [ ] SQLite tables created and migration script seeds existing flashcards
- [ ] `/api/review` correctly updates SM-2 state on a test card across multiple reviews
- [ ] `/api/daily-brief` returns real data from the vault (not mocked)
- [ ] `DailyBrief.jsx` is the landing view and renders all three sections
- [ ] AHK hotkey capture writes to `quick_capture.md` and survives reboot (startup shortcut)
- [ ] Chokidar watcher detects new inbox files and files them via existing model router
- [ ] `inbox_log` correctly reflects `unfiled` → `filed` transitions
- [ ] End-to-end test: capture a thought via hotkey → confirm it's auto-filed → confirm next `/api/daily-brief` call reflects it as filed, not unfiled
