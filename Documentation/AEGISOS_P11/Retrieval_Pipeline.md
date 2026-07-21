# AEGISOS Memory Retrieval Pipeline Specification

## Overview

The Retrieval Engine combines multi-factor scoring, keyword filtering, type constraints, and recency ranking.

---

## Retrieval Scoring Formula

$$\text{Score} = (I \times 0.35) + (C \times 0.25) + (R \times 0.25) + (F \times 0.15)$$

Where:
- $I$: Importance score $[0.0 - 1.0]$
- $C$: Confidence score $[0.0 - 1.0]$
- $R$: Recency decay score $\frac{1}{1 + \text{AgeHours} \times 0.05}$
- $F$: Usage frequency score $\min(1.0, \text{AccessCount} \times 0.1)$

---

## Retrieval Flow

```
User / Subsystem Query
       │
       ▼
Filter Lifecycle Status (exclude DELETED)
       │
       ▼
Apply Type & Importance Threshold Filters
       │
       ▼
Match Text (Title, Summary, Tags)
       │
       ▼
Sort by Composite Score Descending
       │
       ▼
Return Top N Ranked Memories
```
