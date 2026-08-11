# Speakly — Personalization & Retention Engine: Research Report

Scope: (1) SRS for vocabulary, (2) adaptive difficulty in conversation, (3) interest-based content injection, (4) gamification, (5) user-facing analytics, (6) error tracking / weakness queue. All recommendations assume the stated stack: Node.js backend, Next.js frontend, LLM chat pipeline, JSON lesson engine.

---

## 0. Executive recommendations (TL;DR)

| Concern | Recommendation | Why |
|---|---|---|
| SRS algorithm | **FSRS-6 via `ts-fsrs`** (open-spaced-repetition, MIT, pure TS, Node ≥20) | 99.6% of users see lower log-loss than SM-2 in the 500M+ review benchmark; 20–30% fewer reviews for the same retention; zero-cost npm dependency in your existing Node stack |
| SRS surfacing | **Hybrid: inject 3–5 due items into lesson warm-up + weave due vocab into avatar dialogue via constrained generation; separate "Practice" tab drains overflow** | Mirrors Duolingo (Birdbrain in-lesson + Practice Hub/Mistakes tab); pure-separate-tab review is skipped by most casual users |
| Utterance grading | **LLM-based grading with `claude-haiku-4-5` per turn ($1/$5 per MTok), ERRANT-style error taxonomy; fluency metrics computed locally from STT word timestamps** | One model call replaces grammar API + vocab profiler + coherence scorer; deterministic fluency features are free |
| Pronunciation/CEFR speech scoring | **Azure AI Speech Pronunciation Assessment ($1.32/audio-hour) for per-phoneme feedback; SpeechAce Premium ($125/mo, 10k×15s reqs) if you want vendor-scored CEFR on spontaneous speech** | Azure is the cheapest per-minute pronunciation scorer at scale; SpeechAce is the only turnkey CEFR-from-speech API |
| CEFR estimation | **Own rolling estimator (EWMA over graded-utterance features, calibrated to Oxford 5000 / CEFR-J bands) + monthly "checkpoint" speaking test scored by SpeechAce or an Opus-tier LLM rubric** | Continuous estimate for adaptation; periodic anchored test for the user-facing progress number |
| Gamification core | **Streak + freeze + daily goal + XP; leagues in v2; streak wager ("Double or Nothing") early — it's cheap and had Duolingo's best measured lift** | Streaks: 7+ day streak users retain ~2.4×; wager: +14% D14 retention; leagues: +25% lesson completion but need liquidity (cohorts of ~30 active users) |
| Weakness queue | **Per-user error-pattern table (ERRANT categories) with exponentially-decayed counts; top-3 weaknesses injected into every lesson-generation prompt; recurring errors converted into FSRS "grammar cards"** | Same scheduler handles vocab and grammar remediation; decay prevents fossilized labels |

---

## 1. Spaced repetition for vocabulary

### 1.1 FSRS vs SM-2 — the decision

**SM-2** (SuperMemo 1987, what classic Anki used): one per-card "ease factor" multiplied on each success, interval reset on lapse. Problems: ease-factor "hell" (cards spiral into short intervals), no explicit memory model, no way to target a retention level, no personalization from data.

**FSRS** (Free Spaced Repetition Scheduler, now Anki's default): a 3-component memory model per card —

- **Difficulty (D)** ∈ [1,10]: intrinsic hardness of the item, updated from grades.
- **Stability (S)**: days until recall probability decays to 90%. Grows on success (more when retrievability was low — the "desirable difficulty" effect), collapses on lapse via a separate post-lapse formula.
- **Retrievability (R)**: predicted recall probability *right now*, a function of D, S, and elapsed days.

The scheduler inverts the forgetting curve: given a **desired retention** target (default 0.9), it computes the next due date as the day R drops to that target. FSRS-6 has **21 trainable parameters** (w₀…w₂₀), with defaults fit on hundreds of millions of Anki reviews; once a user accumulates ~400–1,000 reviews you can run the optimizer to personalize the weights (the `@open-spaced-repetition/binding` package does parameter optimization; keep it as an offline weekly batch job, not in the request path).

Benchmark facts worth citing in the architecture doc ([open benchmark](https://expertium.github.io/Benchmark.html)): FSRS-6 beats SM-2 on log-loss for **99.6% of users**; practical effect is **20–30% fewer reviews for equal retention**. Duolingo's own trajectory validates the model-based approach: their **Half-Life Regression** (HLR, [ACL 2016 paper](https://research.duolingo.com/papers/settles.acl16.pdf), [code](https://github.com/duolingo/halflife-regression)) — estimate each word's memory "half-life" from features (exposures, correct/incorrect counts, lexeme tags) — **reduced recall-prediction error by 45%+ vs baselines and lifted daily engagement 12% in a large A/B test**. Their successor system **Birdbrain** predicts per-exercise correctness probability and re-picks exercises accordingly (with a Scala session-generator rewrite cutting lesson-generation latency from 750ms to 14ms — a useful precedent: precompute sessions, don't schedule at render time).

**Recommendation: FSRS, not HLR-style regression.** HLR needs your own large review corpus to train; FSRS ships with strong population priors and per-user optimization later. Use [`ts-fsrs`](https://github.com/open-spaced-repetition/ts-fsrs) directly in the Node backend.

### 1.2 Data structures

```
vocab_items                      -- global dictionary
  id, lemma, pos, cefr_level (A1..C1 via Oxford-5000/CEFR-J mapping),
  translations JSONB, ipa, audio_url, tags[]

user_cards                       -- one row per (user, item, direction)
  id, user_id, vocab_item_id,
  direction ENUM('recognition','production'),   -- separate cards; production is what a speaking app cares about
  -- FSRS state (mirrors ts-fsrs Card object)
  due TIMESTAMPTZ, stability REAL, difficulty REAL,
  elapsed_days INT, scheduled_days INT, reps INT, lapses INT,
  state SMALLINT,   -- 0 New, 1 Learning, 2 Review, 3 Relearning
  last_review TIMESTAMPTZ,
  source ENUM('lesson','conversation','manual','weakness_queue'),
  created_at

review_logs                      -- append-only, required for FSRS optimizer
  id, user_card_id, rating SMALLINT,   -- 1 Again, 2 Hard, 3 Good, 4 Easy
  state_before SMALLINT, due_before, stability_before, difficulty_before,
  elapsed_days, review_at, review_channel ENUM('lesson_warmup','conversation','practice_tab')

user_srs_params
  user_id, weights REAL[21], desired_retention REAL DEFAULT 0.9, optimized_at
```

**Grade mapping for a conversation app** (you rarely get an explicit self-grade): implicit grading. If the user *produces* a due word spontaneously and correctly in conversation → `Good` (4 if effortless per LLM judge). If prompted ("How would you say X?") and correct → `Good`; correct after hint → `Hard`; wrong/needed translation → `Again`. Mere *recognition* (avatar used the word, user responded appropriately) should not credit the production card — at most log exposure.

### 1.3 Scheduling & queue construction

Daily review queue per user, built by a cron/queue worker (BullMQ on Redis fits the Node stack):

1. `SELECT ... FROM user_cards WHERE due <= now() ORDER BY due` — cap at daily review limit (default 30; user-tunable).
2. Interleave **new cards** (default 8–12/day) sourced from the current curriculum unit + weakness queue.
3. Partition the queue: first 3–5 due items → tagged `lesson_warmup`; next ~10 with `cefr_level <= user_level` → tagged `conversation_injectable`; remainder → `practice_tab`.

### 1.4 Blending SRS into lessons vs a separate practice tab

What incumbents do: **Duolingo does both** — Birdbrain silently reshuffles in-lesson exercises toward predicted-weak items, *and* the [Practice Hub](https://blog.duolingo.com/guide-to-duolingo-practice-hub/) offers explicit "Mistakes Review" (re-practice exact missed questions) and rotating targeted review sessions. Anki is pure-separate and famously suffers from review-debt churn.

**Recommended blend for an avatar-conversation product:**

- **Warm-up block (60–90s) at lesson start**: 3–5 due cards as quick avatar-led retrieval prompts ("Quick check before we start — how do you say…?"). This guarantees reviews happen even for users who never open a practice tab, and retrieval-before-lesson primes the vocabulary.
- **In-conversation injection**: the lesson-generation prompt receives `conversation_injectable` items with instruction: *"Naturally elicit the user producing these words: [...]. Create situations where each is the obvious word to use. Do not define them unless the user struggles."* Post-session, an LLM pass over the transcript detects which due words the user actually produced and emits implicit FSRS ratings.
- **Practice tab** for overflow + "Mistakes Review" (see §6). Never let the in-lesson quota exceed ~8 review items — lessons must feel like conversation, not flashcards.
- **Review-debt mercy rule**: if backlog > 60 cards, apply FSRS "postpone" (sort by retrievability, delay the highest-R cards) instead of showing a wall of reviews — backlog walls are a top churn driver in SRS apps.

---

## 2. Adaptive difficulty within conversations

### 2.1 Grading a user utterance — the pipeline

Per user speech turn (event-driven, runs in parallel with the tutor's reply so it never blocks conversation latency):

```
audio → STT (word-level timestamps + confidences)
      ├─ (a) fluency features   [local, deterministic, free]
      ├─ (b) LLM grade          [claude-haiku-4-5, structured output]
      └─ (c) pronunciation      [Azure PA, optional per plan tier]
      → utterance_scores row → rolling CEFR estimator → session difficulty controller
```

**(a) Fluency (computed from STT timestamps, no API cost):** speech rate (words/min), articulation rate (excl. pauses), mean pause duration, pauses >1s per 100 words, filler-word rate ("uh/um/like"), mean length of utterance (MLU), repair/restart count. These are the strongest cheap CEFR signals — fluency features alone separate A2/B1/B2 reasonably well in the literature.

**(b) LLM grading call** — one `claude-haiku-4-5` request with a strict JSON schema (structured outputs), input = transcript turn + 2 turns of context:

```json
{
  "grammar_errors": [{"span":"he go","correction":"he goes","type":"SVA","severity":"minor"}],
  "error_types_present": ["SVA","ART"],
  "vocab": {"cefr_max_produced":"B1","rare_words":["negotiate"],"l1_interference": false},
  "task_response": 0.8,          // did the utterance address the prompt
  "coherence": 0.7,
  "complexity": {"subordinate_clauses": 1, "mlu_words": 9},
  "estimated_cefr": "A2+",
  "due_words_produced": ["deadline","schedule"]
}
```

Use the **ERRANT error taxonomy** (~25 types: `ART` articles, `PREP`, `VERB:TENSE`, `SVA`, `NOUN:NUM`, `WO` word order, …) as the enum for `type` — it's the standard in grammatical-error-correction research and gives you stable keys for the weakness queue (§6). Cost: ~600 input + ~150 output tokens ≈ **$0.0013/turn**; a 20-turn session ≈ $0.026. (Alternatives considered: [Sapling grammar API](https://sapling.ai/docs/api/pricing/) at $0.025/1k chars — comparable cost but grammar-only, no CEFR/coherence, so the LLM call wins; [LanguageTool](https://languagetool.org/proofreading-api) can be **self-hosted free (LGPL)** as a deterministic backstop/validator for the LLM's claimed corrections.)

**(c) Pronunciation** — [Azure AI Speech Pronunciation Assessment](https://azure.microsoft.com/en-us/pricing/details/speech/): **$1.32 per audio-hour** (prorated per second), returns accuracy/fluency/completeness/prosody plus per-phoneme scores in both scripted and unscripted mode; it rides on the same real-time STT call, so if you use Azure STT anyway the marginal integration cost is low. [SpeechAce](https://www.speechace.com/api-plans/) is the specialist alternative: **Basic $40/mo (5,000×15s requests), Pro $80/mo (adds fluency + IELTS/CEFR/PTE/TOEIC-scaled scores), Premium $125/mo (10,000×15s, adds vocabulary/grammar/coherence scoring on spontaneous speech up to 2-min audio, i.e. [direct CEFR estimation from a free-speech sample](https://www.speechace.com/automatic-cefr-and-toeic-scoring-for-spoken-languages/))**, overage $0.008–0.0125 per 15s. Recommendation: Azure for always-on per-turn feedback; SpeechAce Premium only for the monthly checkpoint test (low volume → Basic-tier request counts suffice).

### 2.2 CEFR estimation from speech samples

Two-tier design:

1. **Continuous estimator** (drives adaptation): maintain per-user EWMA (half-life ~10 sessions) over a feature vector: LLM `estimated_cefr` (mapped to numeric 1.0–6.0, A1=1…C2=6), vocab sophistication (share of produced lemmas at B2+ per Oxford-5000/CEFR-J bands), grammar error rate per 100 words, speech rate, MLU. Combine with fixed weights initially (0.4 LLM estimate, 0.2 vocab, 0.2 error rate, 0.2 fluency); store as `cefr_estimate REAL` + `cefr_confidence` (inverse of recent variance). Display as sub-bands (A2.1/A2.2 style) — never move the *displayed* level on a single session.
2. **Anchored checkpoint** (drives the user-facing progress number): monthly 3-prompt speaking test (picture description, opinion, roleplay), scored by SpeechAce Premium CEFR **and** an `claude-opus-5` rubric pass (CEFR descriptors embedded in prompt); reconcile (average, flag if they disagree by >1 band). Onboarding placement = self-declared level + a 2-minute version of this test, biased one sub-band *down* (starting too hard churns worse than too easy).

For CEFR word banding, use the [CEFR-J / Open Language Profiles datasets](https://github.com/openlanguageprofiles/olp-en-cefrj) — explicitly **free for commercial use with citation** — as your machine-readable base, cross-checked against the [Oxford 5000 by CEFR level](https://www.oxfordlearnersdictionaries.com/external/pdf/wordlists/oxford-3000-5000/The_Oxford_5000_by_CEFR_level.pdf) (OUP copyright — treat as reference, don't redistribute; the English Vocabulary Profile from Cambridge requires a license).

### 2.3 The difficulty controller

The tutor's system prompt has a **parameterized difficulty block**, re-rendered per session (keep it *after* the cached stable prefix so prompt caching survives — see §3.3):

```
<difficulty>
target_cefr: B1 (user estimate B1.1, confidence 0.72)
tutor_language: use vocabulary up to B1; one B2 word per ~5 turns, glossed in context
sentence_length: ≤ 16 words average
speech_rate: 0.92          → passed to TTS as rate parameter
scaffolding: recast errors implicitly; offer L1 translation only on request
push_level: +1             → occasionally ask follow-ups requiring past tense narration
</difficulty>
```

**Within-session adaptation** (Birdbrain-style, but rule-based first): a small state machine on the rolling last-5-turns grades — 2+ turns with task_response < 0.5 or user says "I don't understand" → step down (shorter tutor turns, slower TTS, more L1 help); 5 clean turns at target → step up one notch. **Between sessions**, the CEFR estimator moves `target_cefr`. Log every controller decision — this is your future training data for a learned policy.

---

## 3. Interest-based content injection

### 3.1 Memory facts → lesson topics

The long-term memory system (already a core requirement) should store facts in a retrievable, *usage-tracked* form:

```
memory_facts
  id, user_id,
  kind ENUM('identity','job','interest','skill','event','preference','relationship','goal'),
  subject, predicate, object_text,          -- ("user","works_as","backend developer at a fintech")
  confidence REAL,                          -- LLM-asserted, decays if contradicted
  salience REAL,                            -- how personalization-worthy (job=high, "likes rain"=low)
  embedding VECTOR(1536),                   -- pgvector, for relevance retrieval
  source_session_id, extracted_at,
  last_used_at, use_count INT,              -- ← the anti-repetition fields
  status ENUM('active','superseded','user_deleted')
```

Extraction: post-session `claude-haiku-4-5` pass over the transcript emitting candidate facts; dedupe by embedding similarity (>0.9 → merge, bump confidence); contradiction check against existing facts on the same (subject, predicate).

**Selection for a new lesson** — score each active fact:
`score = w1·relevance(fact, unit_topic) + w2·salience − w3·recency_penalty(last_used_at) − w4·log(1+use_count)`
Take top 2–3. The recency/use-count penalties are the repetition guardrail at the *fact* level: the user's job shouldn't headline every lesson.

### 3.2 Prompt pattern for lesson generation

Lesson generation (curriculum → concrete lesson JSON) is a batch-able, quality-sensitive task → `claude-opus-5` ($5/$25 per MTok), via the **Batch API at 50% off** for overnight pre-generation of the next day's lesson. Prompt skeleton:

```
[CACHED PREFIX] role, lesson-JSON schema, pedagogy rules, exercise type catalog
[PER-USER BLOCK]
  track: Business English | level: B1.1
  unit_objective: "polite disagreement in meetings"
  due_vocab (must elicit): [...]
  weakness_focus (max 2): ["ART: articles", "VERB:TENSE past simple vs present perfect"]
  personalization_facts: [{fact, last_used}, ...]      ← 2–3 selected facts
  recent_scenarios (DO NOT REPEAT): ["standup meeting about API outage", "salary negotiation", ...]  ← last 10 scenario summaries
  novelty_instruction: "Set the roleplay in a context that uses the facts but differs in
    setting, interlocutor role, and conflict from every recent_scenario. Vary register."
[OUTPUT] lesson JSON (structured outputs, strict schema)
```

Key patterns that work: (a) **facts as raw material, not template slots** — instruct the model to *ground* the scenario in a fact ("user is a backend dev → roleplay: explaining a delayed release to a non-technical PM"), not to name-drop it; (b) **explicit negative list** of recent scenarios — LLMs repeat their favorite setups unless shown what they already produced; (c) **diversity axes named explicitly** (setting / interlocutor / conflict / register) — "be different" alone fails.

### 3.3 Guardrails against repetition & creepiness

- **Scenario fingerprinting**: embed a one-line scenario summary of each generated lesson; reject/regenerate if cosine similarity > 0.85 against the user's last 15 scenarios (one cheap embedding call + pgvector query). This is the hard backstop behind the prompt-level negative list.
- **Interest rotation**: round-robin across the user's onboarding interest areas weighted by engagement (completion rate + speaking seconds per interest tag); force a "wildcard" non-interest topic every ~6th lesson to prevent filter-bubble monotony and harvest new interest signals.
- **Fact hygiene**: cap 3 facts/lesson; never surface `kind='event'` facts older than 60 days without re-confirmation ("Last time you mentioned a job interview — how did it go?" is delightful once, unsettling if the interview was in March); provide user-visible "What Speakly knows about you" screen with per-fact delete (GDPR right-to-erasure also demands this).
- **Prompt-cache discipline**: everything user-specific goes *after* the cached pedagogy prefix; keep the prefix byte-stable (no timestamps) so you pay ~0.1× on the bulk of the lesson-generation prompt.

---

## 4. Gamification mechanics that drive retention

The best public dataset is Duolingo's own disclosed experiments. Measured effects (per [Duolingo's growth case studies](https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth), [Econsultancy's A/B roundup](https://econsultancy.com/six-a-b-tests-used-by-duolingo-to-tap-into-habit-forming-behaviour/), [deconstructor of fun streak analysis](https://duolingo.deconstructoroffun.com/mechanics/streaks), [Trophy case study](https://trophy.so/blog/duolingo-gamification-case-study)):

| Mechanic | Measured effect |
|---|---|
| Streak, always visible at top of app | +3% DAU, +1% D14 retention |
| Streak emphasized after every lesson | +1% DAU, +3% D14 |
| Streak wager ("Double or Nothing": bet gems on a 7-day streak) | **+5% D14 (up to +14% for participants), +600% IAP revenue** |
| Leagues/leaderboards | +25% lesson completion |
| Users holding 7+ day streaks | retain at **~2.4×** the rate of no-streak users |
| Overall gamification program | churn 47% → 28% in major markets; DAU/MAU ≈ 37% (Q2 2025); 50M+ DAU (Q3 2025, +36% YoY) |

**Design implications, priority-ordered for Speakly v1:**

1. **Streak + streak freeze** (v1, week one). Definition: ≥1 completed lesson *or* ≥5 speaking minutes per local-time day. Freezes are essential, not a dilution — they reduce streak anxiety while preserving loss aversion, and Duolingo's data shows they *increase* long-term retention. Give 2 free freezes/month; sell more for gems. Milestone celebrations at 3/7/14/30/100 days (avatar celebrates on-screen — you have a character; use it, Duo's mascot delivery is a large part of why their streak lands emotionally).
2. **Daily goal picker** (v1). "Casual 5 min / Regular 10 / Serious 15" chosen at onboarding — commitment device + sets the streak bar. Praktika and Duolingo both open with this.
3. **XP** (v1): base 10 XP/lesson + bonuses for speaking minutes and review completion. XP is the substrate leagues and quests need later; keep the economy simple (XP ≠ currency; gems = currency for freezes/wagers).
4. **Streak wager** (v1.5): cheapest high-lift mechanic on the list; needs only gems + streak infra.
5. **Daily quests** (v1.5): "Speak 7 minutes", "Use 3 review words in conversation", "Complete 1 pronunciation drill" — quests are how you *launder SRS reviews and weakness drills into gameplay*. This is the crucial integration point between retention mechanics and the learning engine.
6. **Leagues** (v2, only after DAU supports ~30-user weekly cohorts per league tier; ghost/bot fill ruins trust). Weekly XP leaderboard, promotion/demotion zones.
7. **Trophies on the path** (v1): unit-completion chests — your Duolingo-style path already implies these.

Notification strategy (retention lever as large as in-app mechanics): streak-saver push at user's historical practice hour, "your streak expires in 3 hours" only for streaks ≥3 days, and use the memory system for copy personalization ("Ready to practice for your London trip?"). Cap: 1 practice reminder/day; Duolingo's "we'll stop reminding you" self-aware message is itself a retention play.

---

## 5. Progress analytics shown to the user

Users of speaking apps buy *evidence of speaking improvement*. Praktika's headline metric is speaking time; Duolingo's is streak/XP. Show:

1. **Words known** — define honestly from FSRS state: `learning` = card exists, `known` = stability ≥ 21 days, `mastered` = stability ≥ 90 days. Display as stacked counts + weekly delta ("+23 words this week"). This is derivable for free from `user_cards`.
2. **Speaking minutes** — sum of user-audio durations from `utterance_scores` (not session wall-clock: count actual talking). Weekly bar chart + lifetime total ("You've spoken English for 4h 12m"). Praktika-style, highly motivating, trivially computable.
3. **CEFR progress** — sub-band ladder (A2.1 → A2.2 → B1.1 …) fed by the §2.2 continuous estimator, with the monthly checkpoint as the event that *moves* the badge. Show a confidence-styled progress bar toward next sub-band and "what you need next" (top 2 weakness types, phrased positively: "Mastering past-tense storytelling will push you into B1").
4. **Fluency trend** — speech rate and pause-rate trendlines over the last 30 sessions (already computed per-turn). "You speak 18% faster than a month ago, with fewer pauses" is the single most persuasive stat a speaking app can show.
5. **Error-rate trend** — grammar errors per 100 words, by category, trending down (from §6 data).
6. **Weekly report** (push + in-app card, Monday): minutes, words learned, streak, one highlighted improvement, one focus for the coming week. Duolingo's year-in-review virality argues for making these shareable images eventually.

All six render from tables you already need (`user_cards`, `utterance_scores`, `error_patterns`, `xp_events`) — a nightly aggregation job into a `user_stats_daily` rollup table (user_id, date, speaking_seconds, words_known, xp, errors_per_100w JSONB) keeps dashboard queries O(1).

---

## 6. Error tracking → the weakness queue

### 6.1 Data model

```
error_events                         -- append-only, from §2.1 LLM grading
  id, user_id, session_id, utterance_id,
  error_type TEXT,                   -- ERRANT code: 'ART','PREP','SVA','VERB:TENSE',...
  span TEXT, correction TEXT, severity ENUM('minor','major','blocking'),
  cefr_relevance TEXT,               -- which level this structure belongs to
  created_at

user_weaknesses                      -- materialized aggregate, updated per session
  user_id, error_type,
  decayed_count REAL,                -- count with exponential decay, half-life 14 days
  raw_count_30d INT, last_seen_at,
  trend ENUM('worsening','flat','improving'),
  status ENUM('active','remediating','resolved'),
  remediation_card_ids UUID[]        -- links to FSRS grammar cards spawned from this weakness
```

Update rule per session: `decayed_count = decayed_count * 0.5^(Δdays/14) + new_errors`. Decay is what prevents a July article-error binge from haunting October lessons. A weakness flips to `resolved` when decayed_count < 1 and no occurrence in 21 days — then log it as a win in the weekly report ("Articles: fixed 🎉").

Also aggregate **vocab-level errors**: a word the user repeatedly reaches for and fails (wrong word, L1 calque) gets a `user_cards` row with `source='weakness_queue'`, entering the same FSRS loop.

### 6.2 Feeding it back into lesson generation

Three channels, all mechanical:

1. **Lesson-generator prompt slot** (§3.2 `weakness_focus`): top 2 active weaknesses by decayed_count. Instruction pattern: *"Design 2 of the exercises to force production of [past simple vs present perfect]. In conversation, create at least 3 natural openings where the user must narrate a past event. Do not explain the rule unless the user errs."* — elicit, don't lecture.
2. **Grammar cards in FSRS**: for each active weakness, generate 3–5 targeted micro-drills once (fill-the-gap, "say this in English", contrast pairs) as cards typed `grammar`; the same `ts-fsrs` scheduler spaces them. Rating comes from drill correctness. This gives grammar remediation the same forgetting-curve treatment as vocabulary — something almost no competitor does explicitly.
3. **In-conversation recast policy**: the difficulty controller (§2.3) receives the weakness list and instructs the tutor to *always* recast errors matching an active weakness (implicit correction: "Oh, you **went** to the office早?") while ignoring below-threshold error types — correcting everything destroys conversational flow and willingness to speak. Severity `blocking` (communication failed) is always addressed; `minor` outside the focus list is logged silently.

4. **Mistakes Review tab** (Duolingo Practice-Hub pattern): surface the user's actual failed utterances — "You said: *he go to meeting*. Say it correctly." Replaying one's own errors is higher-signal than generic drills and is free content.

### 6.3 End-to-end data flow (one session)

```
1. Session start: queue worker assembles lesson (pre-generated overnight via Batch API)
   ← due cards (ts-fsrs), weakness_focus (user_weaknesses), facts (memory_facts),
     recent_scenarios (anti-repeat), target_cefr (estimator)
2. Per user turn: STT → fluency features + Haiku grade (+ Azure PA) → utterance_scores
3. Turn grade → within-session difficulty state machine → tutor prompt difficulty block
4. Session end (async worker):
   a. transcript → fact extraction → memory_facts upserts
   b. due_words_produced → implicit FSRS ratings → user_cards + review_logs
   c. error_events insert → user_weaknesses decay-update → spawn/retire grammar cards
   d. CEFR EWMA update; user_stats_daily rollup; XP/quest/streak events
5. Nightly: next-day lesson pre-generation (Batch, 50% off); weekly: FSRS parameter
   optimization for users with ≥400 reviews; monthly: checkpoint speaking test
```

### 6.4 Unit economics sanity check (per 15-min session)

| Item | Est. cost |
|---|---|
| STT (Azure standard, ~6 min user audio) | ~$0.10 (or less with Deepgram/Whisper-class pricing) |
| Pronunciation assessment add-on (6 min) | ~$0.13 |
| Tutor conversation LLM (`claude-sonnet-5`, ~20 turns, cached prefix) | ~$0.05–0.10 |
| Per-turn grading (`claude-haiku-4-5` ×20) | ~$0.03 |
| Post-session extraction + FSRS/analytics | ~$0.01 |
| Lesson pre-generation share (`claude-opus-5` Batch) | ~$0.02 |
| **Total AI cost/session** | **≈ $0.35–0.40** + TTS (vendor-dependent; biggest swing factor — budget ElevenLabs vs Azure Neural carefully) |

At a $12–15/mo subscription and ~20 sessions/month, AI COGS lands near 50–60% before TTS optimization — acceptable for MVP, with caching, Haiku-tier routing, and batch generation as the main cost levers.

---

## Sources

- [FSRS vs SM-2 benchmark (Expertium)](https://expertium.github.io/Benchmark.html) · [SuperMemo dethroned by FSRS](https://supermemopedia.com/wiki/SuperMemo_dethroned_by_FSRS) · [FSRS vs SM-2 overview](https://www.antiagent.io/blog/fsrs-vs-sm-2)
- [ts-fsrs (GitHub)](https://github.com/open-spaced-repetition/ts-fsrs) · [ts-fsrs npm](https://www.npmjs.com/package/ts-fsrs) · [ts-fsrs docs](https://open-spaced-repetition.github.io/ts-fsrs/)
- [Duolingo Half-Life Regression paper (ACL 2016)](https://research.duolingo.com/papers/settles.acl16.pdf) · [halflife-regression repo](https://github.com/duolingo/halflife-regression) · [Duolingo Research](https://research.duolingo.com/) · [Adaptive forgetting curves (arXiv)](https://arxiv.org/pdf/2004.11327)
- [How Duolingo reignited user growth — Lenny's Newsletter (Jorge Mazal)](https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth) · [Econsultancy: six Duolingo A/B tests](https://econsultancy.com/six-a-b-tests-used-by-duolingo-to-tap-into-habit-forming-behaviour/) · [Deconstructor of Fun: streak mechanics](https://duolingo.deconstructoroffun.com/mechanics/streaks) · [Trophy: Duolingo gamification case study](https://trophy.so/blog/duolingo-gamification-case-study) · [StriveCloud: Duolingo gamification](https://www.strivecloud.io/blog/gamification-examples-boost-user-retention-duolingo)
- [Duolingo Practice Hub guide](https://blog.duolingo.com/guide-to-duolingo-practice-hub/) · [Duoplanet Practice Hub overview](https://duoplanet.com/duolingo-practice-hub/)
- [SpeechAce API plans](https://www.speechace.com/api-plans/) · [SpeechAce CEFR/TOEIC scoring](https://www.speechace.com/automatic-cefr-and-toeic-scoring-for-spoken-languages/) · [SpeechAce API docs](https://api-docs.speechace.com/)
- [Azure Speech pricing](https://azure.microsoft.com/en-us/pricing/details/speech/) · [Azure pronunciation assessment docs](https://docs.azure.cn/en-us/ai-services/speech-service/how-to-pronunciation-assessment) · [Azure PA pricing Q&A](https://learn.microsoft.com/en-us/answers/questions/5608069/pricing-and-usage-of-pronunciation-assessment-feat)
- [Sapling API pricing](https://sapling.ai/docs/api/pricing/) · [LanguageTool proofreading API](https://languagetool.org/proofreading-api) · [LanguageTool (Wikipedia, licensing)](https://en.wikipedia.org/wiki/LanguageTool)
- [Open Language Profiles — CEFR-J English datasets (commercial-use-permitted)](https://github.com/openlanguageprofiles/olp-en-cefrj) · [Oxford 5000 by CEFR level (OUP)](https://www.oxfordlearnersdictionaries.com/external/pdf/wordlists/oxford-3000-5000/The_Oxford_5000_by_CEFR_level.pdf)