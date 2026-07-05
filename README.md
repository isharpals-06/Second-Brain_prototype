# 🧠 Neural Brain

A local-first, AI-augmented academic second brain dashboard that integrates Obsidian Markdown vaults, local LLMs (Ollama), and spaced repetition flashcards.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![Ollama Support](https://img.shields.io/badge/Ollama-Local%20AI-orange)

---

## 🚀 Overview

Neural Brain functions as a local-first personal AI cockpit (J.A.R.V.I.S.-inspired) for university study. It turns a static vault of raw lecture notes into a dynamic, adaptive spaced repetition second brain:

*   **📅 A.R.C. Tactical Briefing HUD**: Serves as the landing dashboard, presenting due active recall cards, unfiled inbox drafts, and orphaned/unlinked subject notes.
*   **⚡ SuperMemo-2 Spaced Repetition**: Integrated scheduling module that rates card recall from 0-5 and calculates optimal intervals and due dates using the SM-2 algorithm.
*   **💾 Local SQLite Storage**: Backed by Node.js's native `node:sqlite` database, housing study card reviews, schedule histories, and file ingest logs.
*   **🕵️ Librarian Ingestion Daemon**: A background filesystem observer (powered by `chokidar`) that watches `00_Inbox/` and automatically Classifies incoming drafts using Gemini, writes cased frontmatter, files notes, and appends reference links to Map of Content (MOC) hubs.
*   **🎯 Global Thought Capture**: AutoHotkey capture script (`Ctrl + Alt + Space`) that pops up a HUD capture modal anywhere on Windows to append drafts straight to the ingestion inbox.
*   **🎨 Stark HUD Cockpit Aesthetics**: Redesigned UI modules inside React using `Orbitron` and `Share Tech Mono` styles, featuring nested bracket folders (e.g. `[OS]`, `[DSA]`), floating frontmatter metadata cards, diagnostic editor tabs, and clicking audio oscillators.

---

## 📺 Dashboard Layout

```text
+-----------------------------------------------------------------------------------+
|  A.R.C. COCKPIT CONSOLE                                               [ACTIVE]    |
+----------------------+------------------------------------------------------------+
|  [DailyBrief HUD]    |  >> TACTICAL DAILY BRIEFING: 42 flashcards due for review   |
|                      |  >> UNFILED INBOX: 3 items pending classification          |
|  [Notes Explorer]    +---------------------------------+--------------------------+
|                      | 🗂️ Subject Sectors              | ⚡ Spaced Cards Study      |
|  [AI Chat Console]   | - [OS]  - [DBMS]                | Q: What is a Semaphore?  |
|                      | - [DSA] - [ML]                  | [0] [1] [2] [3] [4] [5]  |
|  [Coprocessor Core]  +---------------------------------+--------------------------+
|                      | 📝 Unfiled Ingestion Inbox      | 🔗 Unlinked Subject Notes|
|  [Telemetry Status]  | - lec3_draft.md                 | - Lock_Free_Queues.md    |
+-----------------------------------------------------------------------------------+
```

---

## 🛠️ Installation & Setup

### 1. Project Dependencies
Ensure you have Node.js (v20+) installed. Clone the repository and install packages:

```bash
# Clone the repository
git clone https://github.com/isharpals-06/Second-Brain_prototype.git
cd Second-Brain_prototype/90_System/dashboard

# Install dependencies
npm install
```

### 2. Configure Environment variables
Set up your local configuration variables in both the root folder and dashboard subfolder:

```bash
# In the repository root
copy .env.example .env

# In 90_System/dashboard/
copy .env.example .env
```

### 3. Initialize & Seed Database
Scan your Obsidian vaults, extract existing flashcards (delimited by `::` or `??`), and seed the SQLite database:

```bash
# Run migration script
cd 90_System/dashboard
node server/migrate.js
```

### 4. Active thought Capture (Optional Windows Hotkey)
If you are on Windows, compile or double-click the AutoHotkey script:
`00_Inbox/quick_capture.ahk`
Use `Ctrl + Alt + Space` globally to launch the quick capture text popup.

---

## 🚀 Launching the System

### Automated Launch (Windows)
Double-click the batch file in the repository root directory:
```bash
./start_second_brain.bat
```
*This boots the Express backend API, mounts the file watcher, and starts the Vite React server on `http://localhost:5180`.*

### Manual Command Setup
If running manually or on Linux/macOS:
```bash
# Start Ollama engine
ollama serve &

# Launch backend + frontend server
cd 90_System/dashboard
npm run dev
```

---

## 📂 Project Structure

```text
SecondBrain/
├── 00_Inbox/                # Draft folder watched by Librarian
│   ├── inbox_notes/         # Automatic filing destination
│   └── quick_capture.ahk    # AutoHotkey global overlay HUD
├── 10_Subjects/             # Subject note directories
│   └── 00_MOCs/             # Subject Map of Content indexes
├── 90_System/               # Configuration and codebase
│   └── dashboard/           
│       ├── server/          # Express API server
│       │   ├── migrate.js   # DB migration schema & seeding
│       │   └── server.js    # Watcher, SM-2 routing, and backups
│       └── src/             # React dashboard app (Stark HUD)
│           ├── components/  # Chat, Coprocessor, NotesExplorer
│           └── App.jsx      # Navigation routing
└── start_second_brain.bat   # Startup launcher
```

---

## 💻 Tech Stack

*   **Frontend**: React (v19), Vite (v8), Orbitron & Share Tech Mono fonts, audio synth click oscillators.
*   **Backend**: Node.js, Express, Chokidar filesystem watcher.
*   **Database**: Node native SQLite compiler (`node:sqlite`).
*   **AI Engine**: Ollama (local) / Gemini API integrations.
*   **Global Hotkey**: AutoHotkey script for Windows capture overlay.

---

## 🧪 Verification & Diagnostics

Validate the scheduled card indices and tactical brief aggregations:

```bash
# Run backend card indexing diagnostics
node server/test_brief.js
```

---

## 📈 Performance & Scaling Metrics

*   **Obsidian Card Seeder**: Scanned, parsed, and seeded **2,530 memory cards** under `80ms`.
*   **SM-2 Scheduler**: Calculations and due schedules write in `<2ms`.
*   **Backup Eviction**: Startup system compresses folders and evicts old backup zips in background thread.
*   **Classify Watcher**: New text files dropped in the inbox are read, parsed by Gemini, and filed in `<2.2 seconds`.

---

## 🗺️ Roadmap

*   **Wiki-Link Visualizer Canvas**: Custom SVG node map showing vault relationships.
*   **Offline Speech Engine**: Voice command integration using local Whisper API models.
*   **Audio Transcription**: Offline Whisper transcription engine integration.

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1.  Fork the Project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the Branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
