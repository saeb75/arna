# Long-Term Memory Architecture for LLM Applications (2025–2026 State of the Art)
### Research report for Speakly — an AI English-tutor app on Node.js + Postgres

---

## 0. TL;DR Recommendation

Build a **custom memory pipeline on Postgres + pgvector** (you already run Postgres; per-user memory sets are tiny by vector-DB standards), modeled on **mem0's two-phase extract→update pipeline** and **Zep/Graphiti's temporal validity model**, with:

- **4 memory surfaces:** structured `user_profile` (slot-based), `memories` (atomic semantic facts + preferences, embedded), `session_summaries` (episodic), and a **separate relational learner model** (vocab/grammar mastery with SRS state — *not* vector memory).
- **Async post-session extraction** as the primary path (cheap LLM, strict JSON schema, ADD/UPDATE/INVALIDATE/NOOP operations against retrieved neighbors), plus an optional inline `remember` tool for explicit "remember that…" statements.
- **Two-tier injection:** a stable ~250-token profile block in the system prompt (prompt-cache-friendly) + per-turn top-k fact retrieval injected in the *user turn* (never the system prompt, to preserve cache), + heavy retrieval at lesson-generation time.
- **Soft forgetting:** exponential strength decay, reinforcement on re-observation, nightly consolidation, hard caps per user. Supersede, don't delete — except for GDPR erasure, which hard-deletes.
- **Don't buy** mem0 Platform or Zep Cloud for the MVP; both are good products but add vendor lock-in, per-request cost, and a second data store for a workload Postgres handles trivially. Re-evaluate Zep if you later need multi-entity graph reasoning.

The rest of this report justifies every clause of that paragraph.

---

## 1. Landscape: what production systems do in 2025–2026

### 1.1 mem0 (mem0.ai) — the reference pipeline architecture

mem0 is the most-copied design and the right *conceptual* template even if you don't use the product. Its pipeline (described in the Apr 2025 paper "Mem0: Building Production-Ready AI Agents with Scalable Long-Term Memory") is two-phase:

1. **Extraction phase.** After an exchange, an LLM sees (a) the new messages, (b) a rolling conversation summary, (c) the last ~10 messages, and emits a list of **candidate atomic facts**.
2. **Update phase.** For each candidate, the system retrieves the top-k most similar existing memories (vector search) and asks an LLM to choose one of four operations: **ADD** (new fact), **UPDATE** (augment/replace an existing memory, e.g. "likes coffee" → "likes strong black coffee"), **DELETE** (new info contradicts old — "no longer works at X"), **NOOP** (duplicate/irrelevant). Operations are applied to the store.

This "LLM adjudicates against retrieved neighbors" trick is the core of dedup and conflict resolution everywhere in 2025-era systems; steal it regardless of stack. mem0's paper claims +26% accuracy over OpenAI's built-in memory on LOCOMO, ~90% token savings and much lower p95 latency versus full-context replay.

- **OSS:** Apache-2.0 Python + **TypeScript SDK**; self-host with any vector store (pgvector supported) + optional graph layer (Neo4j/Memgraph) in `mem0ᵍ`.
- **Managed platform pricing (2026):** Free "Hobby" tier (10K add-requests / 1K retrievals per month after the 2026 limit increase), **Starter $19/mo**, **Pro $249/mo** (graph memory is Pro-gated), Enterprise custom. A $79 Growth tier existed briefly and was retired in July 2026.
- **Trade-offs:** excellent DX, but your users' personal data lives in a third-party US SaaS (GDPR processor chain), retrieval is another network hop in your voice-latency budget, and the fact schema is theirs, not yours — awkward when memory must join against your lesson engine and SRS tables.

### 1.2 Zep + Graphiti — temporal knowledge graphs

Zep (paper: "Zep: A Temporal Knowledge Graph Architecture for Agent Memory", Jan 2025) ingests conversation "episodes" into **Graphiti**, its MIT-licensed temporal-knowledge-graph engine (20K+ GitHub stars, backends: Neo4j, FalkorDB, Kuzu). Every extracted fact becomes an edge with **bi-temporal metadata**: `valid_at`, `invalid_at` (when the fact was true in the world) plus ingestion timestamps. New contradicting facts don't overwrite; they **invalidate** the old edge's validity window. Retrieval fuses semantic search, BM25, and graph traversal, and can answer "what was true as of date X".

- **Pricing (2026):** Free tier 1,000 credits/mo (1 credit ≈ 1 episode ≤ 350 bytes); paid plans from **~$125/mo**; a Flex plan at **$1,250/yr with 50K monthly credits, +$25 per extra 10K**. Important: the self-hostable **Zep Community Edition was deprecated in April 2025** — self-hosting now means running raw Graphiti yourself against Neo4j/FalkorDB.
- **Node story:** Zep Cloud has a first-class TypeScript SDK; Graphiti itself is Python.
- **Trade-offs:** the temporal-invalidation model is the best in the industry and worth copying (we do, in §4.4). The graph itself pays off when facts are *relational across entities* ("Alice's manager moved to the Berlin office"). A language tutor's memory is overwhelmingly single-entity ("the user …"), so a graph adds Neo4j ops + per-episode LLM graph-construction cost for little retrieval gain.

### 1.3 LangMem / LangGraph memory

LangChain's **LangMem SDK** (launched Feb 2025) popularized the taxonomy this report uses (semantic / episodic / procedural) and two integration modes: **hot-path memory tools** the agent calls mid-conversation, and **background memory managers** that extract asynchronously after activity settles (with debouncing so you don't extract on every turn). It's built over LangGraph's `BaseStore` (pluggable; Postgres implementation exists). Caveats for you: LangMem is **Python-only** (latest release 0.0.30, Oct 2025 — repo active but release cadence stalled); LangGraph JS exposes `BaseStore` but not LangMem's extraction managers. Treat LangMem as design documentation, not a dependency.

### 1.4 OpenAI patterns

Two distinct things get conflated:

- **ChatGPT product memory** (not an API): two tiers — explicit "saved memories" (user-visible, editable, extracted from statements like "remember that I'm vegetarian") and "reference chat history" (opaque retrieval over past conversations). The product lesson worth copying is the **user-facing memory manager UI** — visibility and one-click deletion per memory. This is also your cheapest GDPR compliance asset (§8).
- **Assistants API "memory"** was never memory — Threads just persisted raw message history with truncation. OpenAI deprecated the Assistants API (shutdown Aug 26, 2026) in favor of the **Responses API + Conversations**, which likewise persist state but do not extract or consolidate anything. Conclusion: **no provider gives you cross-session semantic memory via API in 2026; everyone building a Praktika-class product runs their own extraction pipeline.**

### 1.5 Anthropic memory tool (agentic file memory)

Anthropic ships a client-side **memory tool** (`memory_20250818`): the model itself reads/writes files under a `/memories` directory that *your backend* stores (per-user directory). It's the pattern behind Claude Code's memory. It's genuinely interesting — the model curates its own notes, no extraction pipeline needed — but for Speakly it fails two requirements: (a) memory must be *queryable by your lesson-generation service* (structured, categorized, joinable), and (b) tool-calling mid-conversation costs latency in a voice loop. Keep it in mind for an internal "tutor scratchpad", not as the system of record.

### 1.6 Research anchors you should know

- **MemGPT / Letta** (2023→ product 2025): OS-style memory — small always-in-context "core memory" blocks the agent can self-edit + paged "archival memory" behind search tools. Its lasting contribution: the **always-visible editable profile block**, which we adopt.
- **Generative Agents** (Park et al., 2023): retrieval score = α·relevance + β·recency + γ·importance — still the standard scoring formula; we use it in §5.2.
- **LongMemEval** (ICLR 2025) and **LOCOMO**: the benchmarks everyone quotes; both show full-history-in-context degrades quality *and* cost past a few sessions, and that extraction+retrieval beats naive RAG over raw transcripts.

---

## 2. Memory taxonomy (what to store)

Four stores with different shapes, lifecycles, and injection rules. Resist the temptation to make "one memories table" do all four jobs.

| Type | Shape | Examples (Speakly) | Written by | Injected |
|---|---|---|---|---|
| **1. User profile** | One row, fixed slots + small JSONB | name, L1 (native language), CEFR level, track, job="software developer", goals, interests[], correction-style preference | Onboarding + extraction pipeline (slot updates) | Always, every prompt (stable block) |
| **2. Semantic facts** | Unbounded atomic sentences, categorized, embedded | "Has a daughter named Mia", "Works on a React Native app", "Traveled to Berlin in June", "Dislikes roleplay exercises" | Extraction pipeline | Top-k per turn / per lesson-gen |
| **3. Episodic summaries** | One per session + rolling narrative | "Session 41: practiced job-interview roleplay; struggled with past perfect; new vocab: negotiate, salary, benefits; mood: tired" | End-of-session summarizer | Last 1–3 at session start; searchable for "as we discussed last week" |
| **4. Procedural / pedagogy** | Small set of directives | "Correct grammar inline, don't interrupt fluency", "Use programming metaphors", "Keep TTS speed 0.9×" | Extraction + explicit settings | Always (part of profile block) |

**Critical Speakly-specific split — the learner model is NOT vector memory.** "Knows 1,240 words", "confuses *since/for*", "present-perfect error rate 34%, seen 12×, next review Tuesday" is high-frequency, structured, per-item state. Put it in plain relational tables (`learner_vocab`, `learner_grammar`) with an SRS scheduler (implement **FSRS** — the modern open-source spaced-repetition algorithm that has largely replaced SM-2; Duolingo's equivalent is its half-life-regression model). Lesson generation *queries* these tables ("due items", "top-5 weakest grammar points") and injects results as structured context. LLM-extracted memory only *feeds* it (the extractor emits `grammar_error` observations; a deterministic reducer updates counters). Mixing this into embedded free-text memory is the single most common architecture mistake in tutor apps — you can't run "SELECT items due for review" against a vector store.

---

## 3. Extraction: when and how facts enter memory

### 3.1 Inline tool-call vs async post-session — use both, weighted async

| | Inline tool (`remember` exposed to the tutor LLM) | Async background job |
|---|---|---|
| Latency impact | Adds tool round-trip inside the voice loop (bad: your chat→TTS budget is ~1–2 s) | Zero — runs after session/turn-batch |
| Recall | Model forgets to call it; roleplay prompts suppress it | Sees the whole transcript; systematically thorough |
| Precision | High for explicit statements | Needs neighbor-adjudication to stay clean |
| Cost | Marginal tokens on the expensive conversation model | One cheap-model call per session; batchable at −50% |
| Availability of memory | Immediate (same session) | Next session (fine — same-session recall is covered by the context window anyway) |

**Recommendation:** async post-session extraction as the system of record; a single lightweight inline tool only for *explicit* memory requests ("remember that my exam is on May 3rd") because users expect instant acknowledgment for those. This mirrors LangMem's hot-path vs background split and what mem0 users converge on in production. Within a session you do not need long-term memory at all — the transcript is in context.

Trigger discipline for the async job: enqueue on `session.ended`, plus a **mid-session checkpoint** every ~30 turns for long sessions (protects against crashes and keeps extraction chunks small), with debouncing so a reconnect doesn't double-fire.

### 3.2 Extraction call design (step-by-step data flow)

1. Worker (Node: **pg-boss** — Postgres-backed job queue, no Redis needed; use BullMQ+Redis only if you already run Redis) dequeues `extract_memories(session_id)`.
2. Load transcript (STT text turns + tutor turns), the session's lesson metadata, and the current profile row.
3. **Call 1 — candidate extraction** (cheap model; on your stack: Claude **Haiku 4.5** at $1/$5 per MTok, or **Sonnet 4.6** at $3/$15 when quality matters; run via the **Batch API for −50%** since results aren't needed for hours). Strict JSON schema output (Anthropic `output_config.format` json_schema / OpenAI structured outputs) — never free-text parsing. Schema per candidate: `{statement, category, memory_type, confidence: high|medium|low, evidence_turn_ids[], is_explicit_request: bool}`. Prompt rules that matter in practice:
   - **Atomicity:** one fact per statement; split compounds ("I'm a developer and I have two kids" → 2 facts).
   - **Third-person canonical form**, present tense, resolved references ("she" → "user's daughter Mia"). Canonical phrasing makes embeddings comparable.
   - **Salience filter with examples:** store durable facts about the user's life, work, preferences, plans, learning behavior; *do not* store lesson content, one-off trivia, the tutor's own statements, or roleplay fiction ("I'm a pirate captain" inside a roleplay exercise — pass the lesson's activity type so the extractor knows a roleplay was active; this is a real failure mode for tutor apps).
   - **STT noise tolerance:** transcripts contain recognition errors; instruct the model to skip garbled candidates rather than guess, and to prefer facts corroborated by ≥2 mentions for `high` confidence.
   - **Category blocklist** for GDPR Art. 9 data (§8): health, religion, politics, sexuality, ethnicity — extract only if pedagogically essential and explicitly volunteered, flagged `sensitive: true` (default product decision: drop them).
   - Also emit **learner observations** on a separate channel: `{type: grammar_error, point: "present_perfect", example}`, `{type: new_vocab_exposed, lemma}` → routed to the SRS reducer, not the memory store.
4. **Per candidate — neighbor retrieval:** embed the statement (OpenAI `text-embedding-3-small`, $0.02/M tokens — at 20-token facts this is statistical noise; Voyage/Cohere equivalents fine), query top-5 similar *active* memories for that user (plus same-category profile slots).
5. **Call 2 — update adjudication** (same cheap model, can be batched across candidates): given candidate + neighbors, emit operation `ADD | UPDATE(target_id, new_statement) | INVALIDATE(target_id, reason) | REINFORCE(target_id) | NOOP`. Cheap pre-filter: cosine ≥ 0.95 → auto-REINFORCE without an LLM call; ≤ 0.65 with no category collision → auto-ADD.
6. **Apply operations transactionally** in Postgres: ADD inserts with `status='active'`; UPDATE inserts a new row and marks the old `superseded_by=new_id` (never mutate in place — audit trail); INVALIDATE sets `valid_to=now(), status='invalidated'`; REINFORCE bumps `strength` and `last_confirmed_at`. Write every operation to `memory_audit`.
7. **Profile slot promotion:** deterministic rules map categories to profile columns (a `high`-confidence `occupation` fact updates `user_profile.occupation`). Slots are single-valued — latest high-confidence wins, previous value archived.
8. **Call 3 — session summary** (one call, ~150-token output): structured episodic record `{topics[], activities[], wins[], struggles[], vocab_introduced[], emotional_note, continuity_hook}` — `continuity_hook` is the one sentence the next session's greeting should reference ("ask how the job interview went").

Total: 2–3 cheap-model calls + ~30 embedding calls per session. At a 6K-token transcript ≈ **$0.01–0.03 per session** on Haiku 4.5, half that via batch.

### 3.3 Confidence and provenance

Every memory carries: `confidence` (extractor-emitted; `explicit` > `stated` > `inferred`), `reinforcement_count` (incremented on REINFORCE — a fact mentioned in 5 sessions outranks a one-off), and `source` (`session_id` + turn ids, so you can show the user *why* the app believes something, and so erasure of a session can cascade). Inferred facts (< stated confidence) should be phrased hedged when injected ("the user may prefer…") or gated to `confidence >= stated` for anything user-visible.

---

## 4. Storage: Postgres+pgvector vs dedicated vector DB vs graph

### 4.1 The scale reality check (do this math before choosing infra)

A heavy user: 5 sessions/week × 8 net-new facts ≈ 2,000 facts/year. Even 100K users → 200M rows *total*, but **every query is filtered to one user's ~10²–10³ rows**. This is the decisive fact: per-user memory search is a *small-k filtered search*, the regime where a plain B-tree on `user_id` + exact cosine scan over that user's rows is milliseconds — you don't even need an ANN index until per-user counts reach ~10⁴⁺. All 2026 pgvector-vs-Qdrant benchmarking drama (HNSW recall, filtered-search post-filtering penalties, >5M-vector index build times) concerns *global* corpus search and is irrelevant here.

### 4.2 Options

- **Postgres + pgvector (recommended).** One database: memories transact with sessions, lessons, SRS tables; joins for free; RLS (`user_id = current_setting(...)`) for tenant isolation; PITR backups cover memory; GDPR erasure is one `DELETE ... CASCADE`. pgvector 0.8+ has HNSW + iterative index scans for filtered queries if you ever need them; halfvec halves storage. Managed options: Neon, Supabase, RDS — all support pgvector; a small instance (~$25–70/mo) carries this workload far past 100K users. Industry consensus in 2026: under ~5M searched vectors, pgvector is a full production solution (<20 ms at >95% recall) — and you're under that per query by 3–4 orders of magnitude.
- **Dedicated vector DB (Qdrant, Pinecone, Weaviate).** Justified for global-corpus semantic search (millions of vectors, heavy filtered ANN, multi-tenant hot paths). Qdrant OSS self-hosted or ~$0+ cloud free tier then usage-based; Pinecone serverless is zero-ops usage-priced with a paid-tier floor (~$50/mo). For Speakly it adds a second store to secure, back up, and keep consistent with Postgres (dual-write problem) for zero retrieval benefit. Skip.
- **Graph DB (Neo4j + Graphiti; Memgraph; mem0ᵍ).** Buys multi-hop relational queries and native temporal edges. Costs: Neo4j ops (or Aura from ~$65/mo), LLM entity/edge extraction per episode, Python-only Graphiti. A tutor's facts are a star graph centered on the user — one hop. Take Graphiti's *bi-temporal validity idea* (below), not its database.

### 4.3 Schema (the concrete recommendation)

```sql
CREATE TABLE user_profile (
  user_id        uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name   text, native_language text, cefr_level text,      -- 'B1'
  track          text,                                             -- business|conversation|exam
  occupation     text, location text,
  goals          jsonb DEFAULT '[]', interests jsonb DEFAULT '[]',
  pedagogy_prefs jsonb DEFAULT '{}',   -- {correction_style, tts_speed, likes_roleplay,...}
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE memories (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  memory_type    text NOT NULL,      -- 'fact' | 'preference' | 'event' | 'procedural'
  category       text NOT NULL,      -- 'work','family','hobby','plan','learning_style',...
  statement      text NOT NULL,      -- canonical third-person atomic sentence
  embedding      vector(1536) NOT NULL,
  confidence     text NOT NULL,      -- 'explicit' | 'stated' | 'inferred'
  strength       real NOT NULL DEFAULT 1.0,          -- decays; reinforced on re-observation
  reinforcement_count int NOT NULL DEFAULT 1,
  status         text NOT NULL DEFAULT 'active',     -- active|superseded|invalidated|archived
  superseded_by  uuid REFERENCES memories(id),
  valid_from     timestamptz NOT NULL DEFAULT now(), -- Graphiti-style bi-temporal
  valid_to       timestamptz,                        -- null = still true
  source_session uuid REFERENCES sessions(id),
  source_turns   int[],
  sensitive      boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now(),
  last_accessed_at timestamptz, last_confirmed_at timestamptz
);
CREATE INDEX ON memories (user_id, status);          -- exact per-user scan; ANN index optional later:
-- CREATE INDEX ON memories USING hnsw (embedding vector_cosine_ops);

CREATE TABLE session_summaries (
  session_id uuid PRIMARY KEY REFERENCES sessions(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  summary    jsonb NOT NULL,        -- {topics, activities, wins, struggles, vocab, continuity_hook}
  embedding  vector(1536),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE memory_audit (          -- every ADD/UPDATE/INVALIDATE/REINFORCE/erasure
  id bigserial PRIMARY KEY, user_id uuid NOT NULL, memory_id uuid,
  op text NOT NULL, detail jsonb, actor text NOT NULL,  -- 'pipeline'|'user'|'admin'
  created_at timestamptz NOT NULL DEFAULT now()
);

-- learner model lives beside, relational, no embeddings:
-- learner_vocab(user_id, lemma, fsrs_stability, fsrs_difficulty, due_at, reps, lapses, last_result)
-- learner_grammar(user_id, grammar_point, error_count, exposure_count, mastery, last_error_example)
```

### 4.4 Staleness = temporal invalidation, not deletion

Copy Zep's model: facts have world-validity windows. "Works at Acme" gets `valid_to` set when "started a new job at Beta" arrives; both rows survive. Benefits: the tutor can say "how's the new job compared to Acme?" (retrieval can include recently invalidated facts flagged `[formerly]`), extraction adjudication sees history, and you have an audit trail. Hard deletion is reserved for user-initiated removal and GDPR erasure.

---

## 5. Retrieval: what goes into which prompt

### 5.1 Three injection points, three budgets

**A. Realtime tutor prompt (every turn, latency-critical).**
- **Profile block** (always, in the system prompt): rendered from `user_profile` + procedural prefs + a 2-line learner-model digest ("CEFR B1; weakest: present perfect, articles; 12 vocab items due"). Budget **~250 tokens**. Render **once per session** and keep byte-stable for the whole session — this matters enormously for **prompt caching** (both Anthropic and OpenAI cache by exact prefix; a profile block that changes mid-session invalidates the cached system prompt + lesson script on every turn and multiplies input cost).
- **Per-turn retrieved facts** (only in free-conversation activities; scripted lesson steps usually don't need them): embed the last user utterance (plus a short rolling topic string), score all active memories for the user with the Generative-Agents formula — `score = 0.6·cosine + 0.25·recency(exp decay over last_accessed) + 0.15·normalized(strength·confidence_weight)` — take top 3–5 above a floor (cosine ≥ ~0.35), dedupe by category. Budget **~150–300 tokens**. **Inject into the user turn** (e.g. a `<relevant_memories>` block prepended to the transcribed utterance) or as a late `role:"system"` message — *never* by editing the system prompt, which would break the cache prefix. Update `last_accessed_at` asynchronously.
- Total memory overhead ≤ ~500 tokens/turn ≈ 10–15% of a typical tutor prompt. Retrieval cost: one embedding call (~50 ms) + one indexed SQL query (<5 ms) — acceptable inside a voice loop; run it concurrently with STT finalization to hide it.

**B. Session opener (once per session).** Last session's `continuity_hook` + 1–3 recent summaries + any facts with imminent dates ("exam on May 3rd" — do a cheap scan for `category='plan'` with parsed dates). This is what makes the product feel alive: "Last time you were preparing for the interview — how did it go?" Budget ~200 tokens.

**C. Lesson/curriculum generation (offline, generous budget).** This is where memory pays for itself. Input: full profile, top ~30 facts by strength grouped by category, aggregated struggles from last N summaries, SRS due-item lists from `learner_vocab`/`learner_grammar`. The generator (your strongest model — e.g. Claude Sonnet 4.6/Sonnet 5 at $3/$15, or Opus 5 at $5/$25 for the initial curriculum) produces lesson JSON whose scenarios are personalized ("code-review meeting roleplay" for your developer user) and whose drills target weak grammar + due vocabulary. Budget 1.5–3K tokens of memory context; it runs once per lesson, not per turn.

### 5.2 Anti-patterns to avoid

- **RAG over raw transcripts** instead of extracted facts: retrieval returns noisy dialogue chunks, wastes tokens, and misses fact updates (both the LongMemEval and mem0 results quantify this).
- **Injecting all memories always**: beyond ~30 facts, relevance collapses and the model starts name-dropping facts unnaturally ("As a software developer with a daughter named Mia…"). Add a system-prompt rule: *use memories only when naturally relevant; never enumerate them.*
- **Retrieving on the tutor model via tools every turn**: a `search_memory` tool doubles round-trips in the voice loop. Tool-based retrieval is fine for a text agent; for voice, pre-retrieve server-side.

---

## 6. Forgetting, summarization, compaction

1. **Strength decay:** `strength = strength₀ · exp(−λ·days_since(last_confirmed_or_accessed))`, λ per type (events decay fast, λ≈0.02/day; preferences slowly, λ≈0.003; profile slots never). Computed lazily at scoring time (no nightly UPDATE storm); REINFORCE resets the clock. Below threshold (e.g. 0.15) → `status='archived'` (excluded from retrieval, still visible in the user's memory manager).
2. **Nightly consolidation job (per active user):** merge near-duplicates the adjudicator missed (pairwise cosine ≥ 0.92 within a category → LLM merge call); collapse event clusters older than 90 days into one summary memory ("traveled frequently for work in 2025"); enforce a **hard cap** (e.g. 400 active memories/user) evicting lowest-score to archive. Batch API, off-peak.
3. **Episodic rollup:** keep per-session summaries for the last ~20 sessions; older ones roll into monthly digests; digests older than a year into a single "history" paragraph. Additionally maintain one continuously-rewritten **learner narrative** (~300 tokens) — regenerate it monthly from the profile + top facts; this is a convenient single artifact for lesson generation and support tooling.
4. **In-session compaction is a separate concern:** if a session's transcript approaches the context limit, use provider-side compaction (Anthropic's `compact-2026-01-12` beta summarizes server-side) or your own rolling summary — don't confuse this with long-term memory.
5. **Never let the model see decay mechanics** (no "you have 400 memory slots" in prompts) — models get weird about scarcity.

---

## 7. Build vs buy — the decision, explicitly

| Criterion | Custom (PG+pgvector) | mem0 Platform | Zep Cloud |
|---|---|---|---|
| Fits Node.js | ✅ native | ✅ TS SDK | ✅ TS SDK |
| Joins with lesson engine / SRS | ✅ same DB | ❌ API-only | ❌ API-only |
| Temporal invalidation | build it (§4.4, ~small) | partial (UPDATE/DELETE ops) | ✅ best-in-class |
| Marginal cost @10K MAU, ~20 sessions/user/mo | ~$0.01–0.03/session LLM + flat DB | Pro $249/mo + overages; graph gated to Pro | ≥$125/mo; credits meter every episode |
| Data control / GDPR surface | your VPC, one DPA (LLM provider) | +1 US processor | +1 US processor |
| Latency (voice loop) | in-DB, <10 ms | network hop | network hop |
| Eng cost | ~2–4 weeks for the pipeline in §3 | days | days |

**Verdict:** the pipeline is ~1,500 lines of Node + prompts, the hard parts (adjudication prompt, temporal model) are published designs you can copy, and the tightest requirement — memory joined with curriculum/SRS state — is exactly what SaaS memory can't do. Build. If you later add multi-party features (tutor marketplace, group classes) where cross-entity graphs matter, revisit Zep; its temporal KG is the strongest managed offering.

---

## 8. Privacy & GDPR

Memory is, by definition, a profile of a natural person — treat the memory subsystem as a **personal-data processing system** from day one.

1. **Lawful basis & transparency:** personalization memory under contract performance (it *is* the product) with clear privacy-policy language; anything beyond (marketing analytics on memories — don't) needs consent. Provide a **per-user memory toggle** (Art. 21 objection to profiling) — off = no extraction jobs enqueued, existing memories frozen or purged per user choice.
2. **Art. 9 special categories:** health, religion, political views, sexual orientation, ethnicity. Extraction blocklist (§3.2) + `sensitive` flag + default-drop. A user saying "I have diabetes" in a conversation exercise must not silently become a queryable record.
3. **Data-subject rights, mapped to features:**
   - *Access/portability* → the **memory manager UI** (list, categories, source session) + JSON export endpoint. ChatGPT normalized this UX; users expect it.
   - *Rectification* → user edit/delete per memory (write to `memory_audit`, actor='user'; deleted memories also excluded from future adjudication context).
   - *Erasure* → hard `DELETE ... ON DELETE CASCADE` across `memories`, `session_summaries`, embeddings, learner tables, audit (or anonymize audit), + purge from backups per your retention schedule, + deletion request to LLM providers if using their retention. **Embeddings are personal data** (re-identification risk) — they cascade too.
4. **Processors:** DPAs with your LLM/embedding providers; prefer zero-retention API tiers (note: Anthropic's Fable 5 *requires* 30-day retention — use Haiku/Sonnet-class models for extraction if you need ZDR; OpenAI API offers ZDR on request). EU users → EU region hosting for Postgres; both Anthropic (`inference_geo`) and OpenAI/Azure offer EU processing options.
5. **Minimization & storage limitation:** the salience filter, category blocklist, decay, and archival cap (§6) are your Art. 5(1)(c,e) story — document them in the DPIA (a DPIA is warranted: systematic profiling + voice data + potentially minors).
6. **Voice:** raw audio is separately sensitive; delete audio after STT (keep text), or make audio retention opt-in for accent analytics. Age-gate: if minors can use the app, tighten everything (parental consent, no inferred facts).
7. **Security:** RLS per `user_id`, memory endpoints scoped to the authenticated user, no memories in application logs, encrypt at rest, audit every read path that exports memories in bulk.

---

## 9. End-to-end data flow (the picture to put in the architecture doc)

```
Turn loop (realtime):
  audio → /api/stt → text ─┬→ [retrieve: embed utterance → score user's active memories → top-k]
                           └→ tutor prompt = [cached: system+persona+lesson script+profile block]
                                            + history + <memories> + user text
                           → /api/chat (LLM) → text → /api/tts → viseme-synced avatar

Session end:
  session.ended event → pg-boss queue
    → extract job: transcript → (1) candidate facts JSON → per-fact embed + neighbor query
                              → (2) ADD/UPDATE/INVALIDATE/REINFORCE/NOOP → apply tx + audit
                              → (3) session summary + continuity_hook
                              → learner observations → FSRS reducer → learner_vocab/grammar
Nightly:
  consolidation job (dedupe/merge/rollup/decay-archive, Batch API)

Lesson generation (on demand / ahead of schedule):
  profile + top-30 facts + struggle aggregates + SRS due lists → curriculum LLM → lesson JSON
Next session start:
  greeting prompt ← continuity_hook + last summaries
User settings:
  memory manager UI ← memories table (list/edit/delete/export/toggle)
```

**Cost envelope** (10K MAU, 20 sessions/user/mo, Haiku 4.5 + text-embedding-3-small, batch where possible): extraction+summary ≈ $0.01–0.02/session → **~$2–4K/mo**, embeddings < $50/mo, consolidation < $200/mo, Postgres < $100/mo. Memory adds roughly 3–5% on top of the realtime conversation LLM/TTS/STT bill — and *reduces* the realtime bill via prompt caching and by replacing long history replay with ~500 tokens of distilled context.

---

## Sources

- [Mem0 vs Zep vs LangMem vs MemoClaw: AI Agent Memory Comparison 2026 (DEV Community)](https://dev.to/anajuliabit/mem0-vs-zep-vs-langmem-vs-memoclaw-ai-agent-memory-comparison-2026-1l1k)
- [Mem0 Review (2026): Pricing, Pros & Alternatives](https://theaiagentindex.com/agents/mem0) · [Mem0 Platform Pricing & Plans](https://aitoolsatlas.ai/tools/mem0-platform/pricing) · [Mem0 Pricing | UsagePricing](https://www.usagepricing.com/blueprint/mem0) · [Mem0 Review 2026 (WeavAI)](https://weavai.app/blog/en/2026/05/09/mem0-review-2026-ai-agent-memory-king-26-accuracy/)
- [Best AI Agent Memory Providers in 2026: Mem0 vs Zep vs Letta vs Cloudflare (Developers Digest)](https://www.developersdigest.tech/blog/best-ai-agent-memory-providers-2026)
- [Zep AI Review 2026: Temporal Knowledge Graphs for Agent Memory](https://baeseokjae.github.io/posts/zep-ai-agent-memory-review-2026/) · [Zep Review (2026)](https://theaiagentindex.com/agents/zep) · [Mem0 vs Zep (Graphiti) — Vectorize](https://vectorize.io/articles/mem0-vs-zep) · [Zep v2 + Graphiti (CallSphere)](https://callsphere.ai/blog/vw3g-zep-memory-v2-temporal-knowledge-graph-graphiti-2026) · [AI Memory Solutions Compared: Q3 2026 (Mnemoverse)](https://mnemoverse.com/docs/library/ai-memory-solutions-2026-q3)
- [LangMem SDK launch (LangChain blog)](https://www.langchain.com/blog/langmem-sdk-launch) · [LangMem research notes (Ry Walker)](https://rywalker.com/research/langmem) · [Long-Term Memory LangChain Agents (Atlan)](https://atlan.com/know/long-term-memory-langchain-agents/) · [LangMem SDK tutorial (DigitalOcean)](https://www.digitalocean.com/community/tutorials/langmem-sdk-agent-long-term-memory)
- [Choosing Your Vector Database: Qdrant vs Pinecone vs pgvector in 2026 (KnowSync)](https://www.knowsync.ai/blog/choosing-vector-database-qdrant-pinecone-pgvector-2026) · [pgvector vs Pinecone vs Qdrant vs Weaviate in production (Kalvium Labs)](https://www.kalviumlabs.ai/blog/vector-databases-compared-pgvector-pinecone-qdrant-weaviate/) · [Vector DB comparison (Tensoria)](https://tensoria.fr/en/blog/vector-database-comparison) · [2026 benchmarks (Vecstore)](https://vecstore.app/blog/vector-database-performance-compared)
- [OpenAI Embedding Pricing 2026 (EmbeddingCost)](https://embeddingcost.com/openai) · [OpenAI API Pricing 2026 (CloudZero)](https://www.cloudzero.com/blog/openai-pricing/) · [Embedding model specs table (PE Collective)](https://pecollective.com/tools/text-embedding-models-compared/)
- Claude model pricing (Haiku 4.5 $1/$5, Sonnet 4.6 $3/$15, Sonnet 5 $3/$15 with $2/$10 intro through 2026-08-31, Opus 5 $5/$25 per MTok; Batch API −50%): Anthropic platform docs, cached 2026-06.
- Papers: *Mem0: Building Production-Ready AI Agents with Scalable Long-Term Memory* (arXiv 2504.19413), *Zep: A Temporal Knowledge Graph Architecture for Agent Memory* (arXiv 2501.13956), *Generative Agents* (Park et al., arXiv 2304.03442), *MemGPT* (arXiv 2310.08560), *LongMemEval* (ICLR 2025).