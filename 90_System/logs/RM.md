# 🗺️ Recommendations & Roadmap (RM.md)

This document provides strategic technical recommendations to optimize, scale, and future-proof your Second Brain, along with a roadmap for building new AI-native features.

---

## ⚡ 1. Strategic Recommendations

### 📌 A. Exclude Logs from Knowledge Graph
*   **Recommendation**: Add `meta/agent_chats/` to your `.graphifyignore` file.
*   **Why**: The conversation log notes are highly dense, conversational, and contain duplicate terms. Including them in the semantic graph will create a massive, chaotic central hub that drowns out the clean relationships between your core academic topics (like *Data Structures* and *Operating Systems*).

### 📌 B. Transition to Cached Flashcards
*   **Recommendation**: Implement a simple JSON cache file (`server/flashcard_cache.json`) on the Express backend.
*   **Why**: Instead of recursively reading and parsing all 630+ files on every single page render, the backend should watch the directory and only parse files whose modified timestamp (`mtime`) is newer than the cache index. This ensures the dashboard scale remains instant as notes grow.

### 📌 C. Automate Stale Port Cleanups
*   **Recommendation**: Modify the `package.json` dev script or write a small startup script to clean up ports 3001 and 5173 on launch.
*   **How**:
    ```json
    "dev": "concurrently \"npm run clean-ports && npm run client\" \"npm run server\""
    ```
    This kills any orphaned Node processes before starting the development environment, preventing `EADDRINUSE` failures.

---

## 🚀 2. Proposed Feature Roadmap

### 🎓 Phase 1: Incubator Staging & Graduation UI
*   **Goal**: Connect the backend `/api/incubator/graduate` API to the frontend.
*   **Features**:
    *   **Staging Progress Sidebar**: Render the progress meters for staging topics (e.g. `OS-Scheduling [██████░░░░] 6/10 notes`) based on notes counts in `inbox_notes/`.
    *   **Graduation Wizard Modal**: When the threshold is met (5 for Ollama, 10 for cloud APIs), show a graduation wizard prompting the user to:
        *   Graduate the topic as a new standalone subject folder.
        *   Merge the topic into an existing folder (e.g. merging *Scheduling* into `os_notes/`).
    *   **MOC Integration**: The script will automatically parse the target subject MOC (e.g., `OS MOC.md`) and append wiki-links to the new notes.

### 📝 Phase 2: Active recall Practice Exam Generator
*   **Goal**: Turn your refined concepts and flashcards into interactive study sessions.
*   **Features**:
    *   **Exam Tab**: A new view where you select a subject (e.g. DSA).
    *   **Mock Quiz**: The AI parses your concept notes for that subject, creates a 10-question multiple-choice or short-answer exam, collects your answers, and scores them (giving detailed feedback).
    *   **Performance Metrics**: Track your scores per subject, highlighting topics where your recall is weak.

### 🔍 Phase 3: Local Vector Search (RAG)
*   **Goal**: Query your entire Second Brain with semantic search without paying API costs.
*   **Features**:
    *   Use a lightweight local search library (like `MiniSearch`) or generate embeddings using a local Ollama model (like `nomic-embed-text`) and store them in a local SQLite database inside the dashboard folder.
    *   Add a **Search & Ask** console where you type a question, and the backend retrieves the most semantically relevant snippets from your notes to answer it, linking directly to the source notes.
