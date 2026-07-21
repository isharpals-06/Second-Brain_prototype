# AEGISOS v0.3.8 — ADR-004: Knowledge Graph & Semantic Index Architecture

## Overview

The Knowledge Graph & Semantic Index subsystem is the canonical knowledge substrate of AEGISOS. It discovers, stores, indexes, and exposes semantic relationships between every entity inside the operating system.

**Core Rule**: It is NOT an AI reasoning engine or autonomous planner. It is the structured, queryable knowledge foundation upon which future planners, agents, and automations operate.

---

## Subsystem Architecture

```
                               ┌────────────────────────────────┐
                               │     World Model & EventBus     │
                               │      (Perception Events)       │
                               └───────────────┬────────────────┘
                                               │
                               ┌───────────────▼────────────────┐
                               │    Knowledge Graph Runtime     │
                               └───────────────┬────────────────┘
                                               │
┌──────────────────────────────────────────────┴──────────────────────────────────────────────┐
│                                   Core Knowledge Modules                                    │
├──────────────────────┬──────────────────────┬──────────────────────┬────────────────────────┤
│   Entity Registry    │Relationship Registry │ Entity Resolver      │   Graph Update Engine  │
│(Project, Note, PDF)  │   (Property Graph)   │ (Canonical Dedupe)   │(Event-Driven Ingestion)│
├──────────────────────┼──────────────────────┼──────────────────────┼────────────────────────┤
│ VectorStoreProvider  │   EmbeddingService   │    Semantic Index    │   Graph Query Engine   │
│  (SQLite / Custom)   │(Ollama/Local Vector) │ (Vector Embeddings)  │    (Hybrid Search)     │
└──────────────────────┴──────────────────────┴──────────────────────┴────────────────────────┘
                                               │
                               ┌───────────────▼────────────────┐
                               │      Knowledge API Facade      │
                               │        (/api/knowledge/*)      │
                               └────────────────────────────────┘
```

---

## Core Modules

### 1. Entity Registry (`EntityRegistry.js`)
- Manages canonical entities: `Project`, `Repository`, `Workspace`, `Directory`, `File`, `PDF`, `Markdown Note`, `Conversation`, `Session`, `Flashcard`, `Task`, `Commit`, `Branch`, `Skill`, `Tool`, `Agent`.

### 2. Relationship Registry (`RelationshipRegistry.js`)
- Property Graph edges: `BELONGS_TO`, `GENERATED_FROM`, `RELATED_TO`, `REFERENCES`, `DEPENDS_ON`, `CREATED_BY`, `MODIFIED_BY`, `INDEXED_AS`, `PART_OF`, `USES`, `OPENED_IN`, `LOCATED_IN`, `CONNECTED_TO`, `MENTIONS`, `IMPLEMENTS`, `TRIGGERED_BY`.

### 3. Entity Resolver (`EntityResolver.js`)
- Handles canonical identity resolution and alias mapping (detecting renamed notes, moved files, or duplicate PDFs).

### 4. VectorStore & Embedding Services (`VectorStoreProvider.js` & `EmbeddingService.js`)
- Provider-agnostic vector store abstraction with cosine similarity search.
- Uses local Ollama `nomic-embed-text` embeddings or fallback feature hash vectorizer.

### 5. Graph Query Engine (`GraphQueryEngine.js`)
- Hybrid search pipeline combining:
  1. Structured Graph Search (neighbor traversal)
  2. Semantic Vector Similarity Search
  3. Metadata Filtering (type, category, tags)

### 6. Knowledge Storage (`KnowledgeStorage.js`)
- Persists entities and relationships in SQLite tables `knowledge_entities` and `knowledge_relationships`.
