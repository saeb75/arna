# Speakly Backend Architecture — Node.js Research & Recommendation

**Scope:** framework, data layer, async jobs, realtime transport, API design, auth, LLM gateway, deployment — for a small team shipping a Praktika-style AI English tutor MVP with a voice-driven avatar loop and a long-term memory system.

**Recommended stack (TL;DR):** Fastify 5 + TypeScript monolith · Postgres (Neon) + Drizzle ORM + pgvector · Redis (dedicated instance, not per-command serverless) + BullMQ · WebSocket for the lesson session channel, SSE for plain chat streaming · JWT access + rotating refresh tokens via Better Auth (Apple/Google OIDC) · in-process LLM gateway module (Anthropic primary, provider-abstracted) instrumented with Langfuse · single Docker image on Railway with `web` and `worker` processes, three environments.

---

## 1. Framework: NestJS vs Fastify vs Express vs Hono

| | Fastify 5 | NestJS 11 | Hono | Express 5 |
|---|---|---|---|---|
| Throughput (JSON) | ~2–3× Express | Fastify-adapter ≈ Fastify minus DI overhead | ≈ Fastify | baseline |
| WebSockets | `@fastify/websocket` (ws-based), first-class | `@nestjs/websockets` gateways (socket.io or ws) | `hono/ws` on Node is young; strongest on Bun/Workers | `ws` bolted on manually |
| SSE / streaming | native `reply.raw` + `reply.sse` plugins, backpressure-aware | needs interceptor gymnastics for token streaming | fine | manual |
| Validation | JSON-schema native + `fastify-type-provider-zod` → compile-time + runtime types from one Zod schema | class-validator decorators | Zod middleware | manual |
| Ceremony for a 2–4 person team | Low: plugins + route files | High: modules/providers/decorators, DI container, learning curve | Lowest | Low but legacy |
| Ecosystem for this app | `@fastify/jwt`, `@fastify/rate-limit`, `@fastify/cors`, `@fastify/multipart` (audio upload) all official | large but heavier | thinner on Node-specific infra plugins | huge but aging |

**Recommendation: Fastify.**
- The hot path of this product is *streaming*: LLM tokens over SSE/WS, audio chunks over WS. Fastify gives direct, backpressure-aware access to the raw socket without fighting a framework abstraction, and its `ws` integration is production-standard.
- NestJS's value is enforced structure for 10+ engineer teams; for 2–4 people its DI ceremony slows the MVP and its default Express adapter is the slowest option (you'd switch to the Fastify adapter anyway — so just use Fastify).
- Hono is excellent but its center of gravity is edge runtimes; BullMQ workers, `ws`, and long-lived stateful voice sessions are Node-server-shaped workloads, and Hono's Node WebSocket story is the least battle-tested of the three.
- Express 5 offers nothing over Fastify here except familiarity.

**Structure discipline without NestJS:** organize as `src/modules/{auth,onboarding,program,lesson,session,memory,gamification,llm,voice}` where each module exports a Fastify plugin (routes) + a service layer + Drizzle queries. Zod schemas shared between route validation and the mobile client via a `packages/contracts` workspace. This gives 80% of Nest's structure at 0% of its ceremony.

---

## 2. Data Layer

### Postgres + Drizzle (recommended) vs Prisma

- **Prisma 7** (Rust-free, no engine binary since late 2025) closed the old performance/cold-start gap and has the more polished migration DX. It remains the safer pick for teams who want a declarative schema and never want to see SQL.
- **Drizzle** is SQL-first, ~7 kB, zero codegen step (types update as you edit the schema), and — decisive here — has **first-class pgvector support**: `vector({ dimensions: 1536 })` column type, `cosineDistance()` / `l2Distance()` helpers, and HNSW index definitions in the schema file. With Prisma, pgvector still means `Unsupported("vector")` columns and `$queryRaw` for every similarity query, which is exactly the query your memory system runs on every lesson turn.
- The memory retrieval queries (hybrid vector + metadata filters + recency decay) are hand-tuned SQL; Drizzle lets you write them as typed SQL instead of escaping the ORM.

**Recommendation: Drizzle + drizzle-kit migrations.** Trade-off accepted: fewer guardrails than Prisma, so enforce one rule — all queries live in per-module `*.queries.ts` files, reviewed like SQL.

### Where pgvector fits

One extension, inside the same Postgres — **do not add a dedicated vector DB (Pinecone/Qdrant) for an MVP**. Scale math: 10k users × ~200 memory facts × 1536-dim embeddings ≈ 12 GB — trivial for pgvector with HNSW (`m=16, ef_construction=64`), and you get transactional consistency between a memory row and its embedding for free. Used for:
- `memories.embedding` — semantic retrieval of user facts for lesson personalization.
- `lesson_transcripts.embedding` (chunked) — "what did we talk about before" recall and anti-repetition in lesson generation.

Embeddings: Voyage AI `voyage-3.5-lite` (~$0.02/1M tokens) or OpenAI `text-embedding-3-small` ($0.02/1M) — cost is a rounding error either way.

**Hosting:** **Neon** (post-Databricks price cuts: storage $0.35/GB-mo, free tier 100 CU-hours/mo, scale-to-zero) — branches per PR are genuinely useful for a small team, pgvector + HNSW ships out of the box. Supabase ($25/mo Pro, always-on compute) is the alternative if you want its Auth/Storage bundled, but we're recommending Better Auth (see §6), so Neon's usage-based model fits the MVP's idle-heavy traffic better. If you deploy on Railway, Railway Postgres is acceptable but you lose branching and PITR polish.

### Redis: two distinct roles, one instance (MVP)

1. **Hot state & rate limiting:** voice-session state (current lesson step, streaming cursors), per-user LLM token buckets, WS pub/sub for multi-node fan-out later. TTL'd keys, tolerant of eviction.
2. **BullMQ queues:** requires `maxmemory-policy=noeviction` and is chatty (polling, locks). **Do not run BullMQ on Upstash pay-as-you-go** — $0.20/100k commands looks cheap until BullMQ's polling generates millions of commands/month for a near-idle queue; Upstash's own guidance is fixed plans for queue workloads. Run a **dedicated Redis container on Railway (~$5–10/mo)** or an Upstash fixed plan ($10/mo+). At MVP scale one instance serves both roles; split when queue latency starts affecting session state reads (a config change, not a refactor).

Sessions themselves are JWT-stateless (§6) — Redis is not a session store here.

### Core data model (sketch)

```
users(id, email, auth_provider, cefr_level, native_lang, created_at)
user_profiles(user_id, display_name, interests jsonb, track enum[business|conversation|exam], goals jsonb)
programs(id, user_id, track, level, status, generated_by_model, prompt_version, created_at)
program_units(id, program_id, position, title, objective, status)
lessons(id, unit_id, position, type enum[roleplay|vocab|grammar|review], spec jsonb, status enum[locked|ready|pregen|completed], pregen_content jsonb)
lesson_sessions(id, lesson_id, user_id, started_at, ended_at, state jsonb, score jsonb)
transcript_turns(id, session_id, role, text, audio_ref, latency_ms, created_at)
memories(id, user_id, kind enum[identity|preference|knowledge|event|struggle], content text,
         embedding vector(1536), confidence real, source_session_id, last_used_at,
         supersedes_id nullable, status enum[active|superseded|expired])
memory_index: HNSW on embedding + btree(user_id, kind, status)
gamification(user_id, streak_days, last_active_date, xp, league)
trophies(id, user_id, kind, earned_at)
llm_calls(id, user_id, session_id, provider, model, prompt_version, input_tokens, output_tokens,
          cache_read_tokens, cost_usd numeric, latency_ms, purpose enum[chat|memory_extract|lesson_gen|grade], created_at)
refresh_tokens(id, user_id, token_hash, expires_at, rotated_from, revoked_at, device_info)
```

---

## 3. Async Jobs: BullMQ Patterns

All heavy AI work happens **off the request path**. Queues (one BullMQ `Queue` each, workers colocated in the `worker` process):

**`post-lesson` — a BullMQ Flow (parent/child DAG), enqueued on session end:**

```
finalize-lesson (parent)
├── extract-memories        (child) — LLM pass over transcript
├── grade-session           (child) — CEFR-aligned scoring, error patterns
└── update-progress         (child) — deterministic: XP, streak, unlock next lesson
        └── pregenerate-next-lesson (runs after parent completes, reads fresh memories)
```

Step-by-step for `extract-memories`:
1. Load full transcript turns for the session.
2. One structured-output LLM call (Claude with a JSON schema via `output_config.format`): emit candidate facts `{kind, content, confidence, evidence_turn_ids}`.
3. For each candidate: embed → cosine search against existing `memories` (threshold ~0.85) → **reconcile**: exact-dup → bump `last_used_at`/confidence; contradiction ("works at X" vs "now works at Y") → insert new row, mark old `superseded` (keeps an audit trail; nothing is destructively overwritten); novel → insert.
4. Write all rows in one transaction; record the LLM call in `llm_calls`.

**Patterns that matter:**
- **Idempotency:** `jobId = ` `` `post-lesson:${sessionId}` `` — duplicate "lesson ended" events (mobile retries!) dedupe at the queue.
- **Retries:** `attempts: 3, backoff: {type: 'exponential', delay: 5000}`; memory extraction is safe to retry because reconciliation is idempotent-by-design (dup check runs before insert).
- **Dead letters:** a `failed`-event listener moves exhausted jobs into a `dead-letter` queue + Sentry alert; a lesson still completes for the user even if extraction fails (UX never blocks on the pipeline).
- **Per-queue rate limiting:** `limiter: { max: 20, duration: 1000 }` on LLM-calling queues so a burst of lesson completions can't blow your Anthropic rate tier; deterministic queues (progress) run unthrottled.
- **Pregeneration:** `pregenerate-next-lesson` writes `lessons.pregen_content` so the next lesson opens instantly. Also a nightly repeatable job (`pattern: '0 3 * * *'`) pregenerates for users whose streak predicts a session tomorrow, and a weekly job decays stale memories (`last_used_at > 90d → expired`).
- **Priority lanes:** interactive-adjacent jobs (translation help requested mid-lesson but overflowed the request budget) get `priority: 1`; nightly pregen `priority: 10`.
- Use **`QueueEvents`** + WS push to tell the client "your program is ready" after onboarding generation (see §5 flow), rather than client polling.

---

## 4. Realtime Transport for the Voice Loop

Three candidate transports:

| | SSE | WebSocket | WebRTC (via LiveKit/Daily) |
|---|---|---|---|
| Direction | server→client only | bidirectional | bidirectional, UDP |
| Binary audio | base64 hack | native binary frames | native, jitter-buffered, echo-cancelled |
| Latency | fine for tokens | ~good (TCP) | best (packet-loss tolerant) |
| Infra complexity | none | low | SFU/TURN, or a vendor |
| Mobile background/reconnect | trivial (it's HTTP) | manual heartbeat + resume | SDK-handled |

**Recommendation: one WebSocket per lesson session as the MVP transport; SSE for the non-voice chat endpoint; WebRTC as a deliberate v2 upgrade, not now.**

Why not WebRTC yet: it is objectively the right transport for full-duplex voice (echo cancellation, barge-in, ~75 ms vs ~200–300 ms), but it forces an SFU (self-hosted LiveKit) or a vendor bill (LiveKit Cloud/Daily, per-participant-minute) plus a second signaling layer — heavy for an MVP whose interaction is *turn-based tutoring*, not free-form conversation. A push-to-talk / VAD-gated turn loop over WS is indistinguishable to users at this stage. Design the session protocol as transport-agnostic JSON events so the media plane can move to WebRTC later without touching lesson logic.

**The voice loop, step by step (one WS connection, multiplexed JSON + binary frames):**

1. Client opens `wss://api.speakly.app/v1/sessions/:id/stream` (JWT in first auth message, not query string).
2. Server loads lesson state + top-K memories, sends `{type:"lesson.step", ...}` with avatar script; TTS for scripted lines is pre-generated during lesson pregen (cost + latency win).
3. User speaks → client streams 16 kHz PCM/Opus binary frames (VAD on-device trims silence).
4. Server pipes frames to **Deepgram Nova-3 streaming STT** ($0.0077/min streaming); interim transcripts forwarded as `{type:"stt.partial"}` for live captions; Deepgram `speech_final` closes the turn.
5. Final transcript → LLM gateway (§7) → tokens stream back as `{type:"assistant.delta"}` (chat bubble renders immediately).
6. Sentence-boundary chunker feeds completed sentences to TTS — **ElevenLabs Flash v2.5** (~$50/1M chars, ~75 ms model latency, `eleven_flash_v2_5` supports viseme-friendly char timestamps) or **Cartesia Sonic Turbo** (~40 ms, aggressive pricing, credits ≈ characters) — audio chunks return as binary frames tagged with turn/sentence IDs + timestamp alignment for ARKit viseme lip-sync (your existing frontend already consumes phoneme/viseme timing).
7. First audio byte reaches the client while the LLM is still generating sentence 3 — this pipelining is the entire latency budget: target ≤1.2 s speech-end→avatar-speaks (STT finalize ~300 ms + LLM TTFT ~400 ms + TTS TTFB ~200 ms + network).
8. Turn events appended to `transcript_turns`; on `{type:"session.end"}` the `post-lesson` flow enqueues (§3).

Alternative for step 4–6 later: OpenAI Realtime API collapses STT+LLM+TTS (~$0.06/min in, $0.24/min out ≈ **$0.30+/lesson-minute**) — 5–10× the composed pipeline's cost (~$0.03–0.05/min) and it locks you out of your own memory-injection prompting mid-pipeline. Stay composed.

**Scaling WebSockets:** a single Node process comfortably holds 10k+ mostly-idle connections. Rules from day one so multi-node is a non-event: (a) all session state in Redis, never in the process — a reconnect can land anywhere; (b) server→user pushes go through Redis pub/sub (`channel user:{id}`), not direct socket references; (c) heartbeat ping/pong every 25 s + client resume protocol (`session.resume` with last event seq); (d) sticky sessions only matter for the *duration of one socket*, which every LB (Railway/Fly anycast) provides implicitly; when you move to multiple replicas, the Redis adapter is already there.

---

## 5. API Design (REST + streaming endpoints)

Versioned under `/v1`. Zod-validated, OpenAPI generated from schemas (`fastify-zod-openapi`).

```
AUTH
POST /v1/auth/register            email+password
POST /v1/auth/login
POST /v1/auth/oauth/apple         { identityToken }   → verifies Apple JWT
POST /v1/auth/oauth/google        { idToken }
POST /v1/auth/refresh             { refreshToken }    → rotates
POST /v1/auth/logout              revokes refresh token
GET  /v1/me

ONBOARDING
GET  /v1/onboarding/options                    interests/tracks/levels catalog
POST /v1/onboarding                            { interests[], track, cefrLevel } → 202 + programId
                                               (enqueues generate-program job)
GET  /v1/programs/:id                          status: generating|ready + full unit/lesson tree

PROGRAM & LESSONS
GET  /v1/programs/current
GET  /v1/lessons/:id                           spec + pregen content if ready
POST /v1/lessons/:id/sessions                  → { sessionId, wsUrl }   (starts a lesson)

SESSIONS (lesson runtime)
WS   /v1/sessions/:id/stream                   voice+event channel (§4)
POST /v1/sessions/:id/end                      idempotent; triggers post-lesson flow
GET  /v1/sessions/:id/summary                  grade, corrections, new memories surfaced
POST /v1/sessions/:id/translate                { text, targetLang } (sync, small model)

CHAT (non-lesson free talk / help)
POST /v1/chat                                  SSE response: token stream
                                               (existing /api/chat migrates here)

MEMORY (user-visible + GDPR)
GET    /v1/memory                              paginated, filter by kind
DELETE /v1/memory/:id                          user right-to-forget
PATCH  /v1/memory/:id                          user correction (sets confidence=1.0)

GAMIFICATION
GET  /v1/gamification                          streak, xp, league
GET  /v1/gamification/trophies

OPS
GET /healthz, /readyz                          LB checks
```

**Where streaming fits:** exactly two endpoints stream — `POST /v1/chat` (SSE: right tool for unidirectional token streams, survives proxies, trivial reconnect via `Last-Event-ID`) and the session WS. Everything else is plain JSON. Long-running generation (program creation, ~20–60 s of LLM work) is **202 + resource-status polling or WS push**, never a hanging HTTP request.

---

## 6. Auth for Mobile + Web

**JWT vs server sessions:** stateless **JWT access tokens (15 min, ES256)** + **opaque rotating refresh tokens (30 days, stored hashed in `refresh_tokens`)**. Rationale: the WS handshake and every mobile request verify locally with zero Redis/DB hit; revocation lives at the refresh boundary (15 min worst-case exposure, acceptable for this threat model). Full server sessions would add a store lookup to every voice-loop message for negligible security gain here.

**Refresh flow:** refresh → verify hash → issue new access + new refresh, mark old `rotated_from` → **reuse detection**: presenting an already-rotated token revokes the whole token family (standard theft mitigation). Web stores refresh in `httpOnly` `SameSite=Lax` cookie; mobile in Keychain/Keystore.

**Apple/Google:** client-side native SDK obtains `identityToken`/`idToken` → backend verifies signature against Apple/Google JWKS (`jose` lib), extracts `sub`+email → upsert user → issue your own token pair. Apple Sign-In is **mandatory** on iOS if any social login exists. Never proxy the OAuth browser dance through your API for native apps.

**Build vs buy:** don't hand-roll the above unless you must. Options: **Better Auth** (open-source, TypeScript-native, owns email/password + Apple/Google + refresh rotation, runs inside your Fastify app against your Postgres — $0, no vendor MAU pricing, sub-agent of your own DB) — *recommended*; Clerk (fastest DX, free ≤10k MAU then ~$0.02/MAU — fine but adds a vendor and webhook sync for user rows); Supabase Auth (only if you'd chosen Supabase for the DB). Better Auth keeps users in *your* `users` table, which the memory system joins against constantly.

---

## 7. LLM Gateway Layer

**In-process gateway module, not an external proxy, for the MVP.** LiteLLM/Portkey/Kong AI gateway add a network hop + deployable + failure mode; a small team gets the same guarantees from a well-factored `src/modules/llm` with these layers:

1. **Provider abstraction.** `interface LLMProvider { stream(req): AsyncIterable<Delta>; complete(req): Response }` with adapters for Anthropic (`@anthropic-ai/sdk`, primary) and OpenAI (fallback). Internal request shape is your own; adapters translate. Never scatter raw SDK calls through modules.
2. **Model routing by purpose** (config, not code):

   | Purpose | Model | Current pricing (per MTok in/out) |
   |---|---|---|
   | Curriculum/lesson generation, session grading | `claude-opus-5` | $5 / $25 |
   | Realtime lesson dialogue | `claude-sonnet-5` | $3 / $15 (intro $2/$10 through 2026-08-31) |
   | Memory extraction, translation, classification | `claude-haiku-4-5` | $1 / $5 |

   Cost model: a 10-min lesson ≈ 15 dialogue turns × (~2.5k in with prompt-cache reads / 150 out) on Sonnet 5 ≈ **$0.05–0.10/lesson LLM** + ~$0.08 STT + ~$0.05 TTS → **~$0.20/lesson COGS**. Prompt caching matters: system prompt + lesson spec + memories are a stable prefix per session — mark a cache breakpoint after them; cache reads bill at ~0.1×.
3. **Retries & fallbacks.** SDK retries (429/5xx/network, exponential, 2 attempts) for transient errors; a **fallback chain** for hard failures/timeouts: `sonnet-5 → haiku-4-5 → gpt-4.1-mini` (cross-provider last). Per-provider circuit breaker (open after 5 failures/30 s; probe half-open). Streaming responses get a hard TTFT timeout (2.5 s) that triggers fallback before the user notices.
4. **Prompt versioning.** Prompts are files in-repo (`prompts/lesson-dialogue/v7.md`) with a registry mapping `purpose → {version, model, params}`; every `llm_calls` row records `prompt_version` so quality regressions are attributable. Langfuse Prompt Management can take this over later; start with git.
5. **Cost tracking per user.** The gateway computes `cost_usd` from the response `usage` block (incl. cache read/write tokens) and writes `llm_calls` on every request — this powers a per-user daily budget (see 7) and your unit-economics dashboard for free (`SELECT user_id, sum(cost_usd) ... GROUP BY 1`).
6. **Observability: Langfuse** (recommended over Helicone here). It's MIT-licensed/self-hostable, Cloud from **$29/mo** (Helicone Pro $79/mo, free ≤10k req/mo); its trace model (nested spans: session → turn → STT/LLM/TTS) matches multi-step voice pipelines better than Helicone's proxy-log model, and — important — **Langfuse is SDK-side, not a proxy in the request path**, so an observability outage can't take down lessons. Wrap gateway calls with the Langfuse Node SDK; tag traces with `userId, sessionId, promptVersion, purpose`.
7. **Rate limiting & abuse control.** Layered: (a) edge `@fastify/rate-limit` per-IP on auth endpoints; (b) per-user request limits in Redis (sliding window: e.g. 20 chat msgs/min); (c) **per-user daily token/cost budget** (Redis counter incremented by the gateway; exceeded → 402-style soft block with UX message) — this is your defense against "free ChatGPT via the tutor" abuse; (d) prompt hygiene — user text is always interpolated as data inside a fixed instruction frame, translation/roleplay prompts constrain output domain; (e) length caps on user turns (STT already bounds this naturally).

---

## 8. Deployment

**Monolith-first — one repo, one Docker image, two process types:**

```
web:    node dist/server.js      (Fastify HTTP + WS + SSE)
worker: node dist/worker.js      (BullMQ workers; shares modules/, no HTTP)
```

Same image, different entrypoint. This gives independent scaling/restart of AI batch work vs latency-sensitive sockets while remaining one codebase, one deploy, one schema. Do **not** do microservices, serverless functions (long-lived WS + streaming disqualify Lambda/Vercel functions), or a separate "AI service."

**Host: Railway (recommended for the MVP).**
- Fits: Dockerfile or Nixpacks deploy, private networking, Redis + Postgres as one-click services, per-second metering on the $5 Hobby / $20 Pro plan (Pro includes $20 usage, unlimited seats), PR preview environments.
- WebSockets work unmodified; no cold starts (unlike Render free tier's 15-min spin-down, which is disqualifying for WS).
- Realistic MVP bill: web (1 GB) + worker (512 MB) + Redis + Postgres ≈ **$25–50/mo**.
- **Fly.io** is the upgrade path when latency to non-US learners matters (multi-region Machines near users; keep Postgres primary in one region — Neon stays put regardless). **Render** wins only if you want fixed-price simplicity. **AWS (ECS Fargate + ElastiCache + RDS)** is deliberately deferred: 10× the ops surface for zero MVP benefit; revisit at real scale or for compliance.

**Docker:** multi-stage build (deps → build → `node:22-slim` runtime), `NODE_ENV=production`, non-root user, `HEALTHCHECK /healthz`, graceful shutdown (SIGTERM → stop accepting, drain WS with `session.migrate` event, `worker.close()` waits for in-flight jobs — Railway gives ~30 s).

**Env separation:** three Railway environments (`dev`, `staging`, `prod`) with per-env vars; Neon branches map 1:1 (prod branch, staging branch, ephemeral PR branches). Secrets only in env config, never in the image; separate Anthropic/Deepgram/ElevenLabs keys per env (rate-limit isolation + clean cost attribution). Config validated at boot with a Zod `env.ts` — the process refuses to start half-configured. Migrations run as a release step (`drizzle-kit migrate`) before the new deploy receives traffic.

---

## End-to-end data flows (the three that define the system)

**Onboarding → program:** `POST /v1/onboarding` writes profile → enqueues `generate-program` → 202. Worker: seed memories from picks (`kind=preference`) → Opus 5 generates unit outline (structured output) → Sonnet 5 fans out per-unit lesson specs (parallel child jobs) → program `ready` → WS push. Client polls `GET /programs/:id` as fallback.

**Lesson turn:** WS binary audio → Deepgram stream → final transcript → gateway (cached prefix: system + lesson spec + top-8 memories by `0.7·cosine + 0.2·recency + 0.1·confidence`) → Sonnet 5 stream → sentence chunker → TTS stream → binary frames + viseme timings → avatar. Every stage writes latency to the trace (Langfuse span per stage).

**Post-lesson:** `POST /sessions/:id/end` (idempotent) → BullMQ flow: grade + extract-memories (Haiku, structured output, reconcile-with-supersede) + update-progress → pregenerate next lesson with *fresh* memories → push "next lesson ready".

## Build order (backend)

1. **Week 1:** Fastify skeleton, Drizzle schema + migrations, Better Auth (email + Google/Apple), Railway dev env, CI.
2. **Week 2:** LLM gateway (Anthropic adapter, `llm_calls` logging, Langfuse), onboarding + program generation flow, BullMQ wiring.
3. **Week 3:** session WS protocol, Deepgram + ElevenLabs streaming pipeline, `/v1/chat` SSE (port existing `/api/chat`, `/api/tts`, `/api/stt` routes out of Next.js).
4. **Week 4:** post-lesson flow (grading, memory extraction/reconciliation, progress), memory retrieval in lesson prompts, gamification.
5. **Week 5:** rate limits + budgets, dead-letter alerting, staging/prod envs, load-test WS (k6), latency tuning to the 1.2 s target.

---

Sources: [Render vs Railway vs Fly.io 2026 pricing](https://hostim.dev/blog/render-vs-railway-vs-fly-pricing/), [Railway vs Render vs Fly.io (TECHSY)](https://techsy.io/en/blog/railway-vs-render-vs-fly-io), [Helicone vs Langfuse](https://infrabase.ai/vs/helicone-vs-langfuse), [Helicone vs Langfuse vs LangSmith](https://particula.tech/blog/helicone-vs-langfuse-vs-langsmith-llm-observability), [Deepgram pricing](https://deepgram.com/pricing), [Deepgram pricing explained 2026](https://dynalord.com/blog/deepgram-pricing), [ElevenLabs API pricing calculator](https://www.buildmvpfast.com/tools/api-pricing-estimator/elevenlabs), [Cartesia Sonic 3 pricing](https://www.eesel.ai/blog/cartesia-sonic-3-pricing), [OpenAI Realtime API pricing field data](https://hackernoon.com/openai-realtime-api-pricing-in-2026-real-world-data-from-4000-measured-sessions), [OpenAI transcription pricing](https://costgoat.com/pricing/openai-transcription), [Drizzle vs Prisma 2026 (Bytebase)](https://www.bytebase.com/blog/drizzle-vs-prisma/), [Drizzle vs Prisma (Makerkit)](https://makerkit.dev/blog/tutorials/drizzle-vs-prisma), [Upstash Redis pricing comparison 2026](https://upstash.com/blog/redis-pricing-comparison-every-major-provider-in-2026-with-numbers), [Neon vs Supabase 2026](https://designrevision.com/blog/supabase-vs-neon), [Neon serverless Postgres pricing 2026](https://vela.simplyblock.io/articles/neon-serverless-postgres-pricing-2026/). Claude model pricing from Anthropic's current model catalog (Opus 5 $5/$25, Sonnet 5 $3/$15 with $2/$10 intro through 2026-08-31, Haiku 4.5 $1/$5 per MTok).