# Research Report: Designing an LLM-Driven Personalized Curriculum Engine for Speakly

Scope: CEFR grounding, curriculum representation, lesson-generation pipeline, lesson anatomy (JSON), adaptive progression — with a concrete recommended design, real resources/APIs, and 2025–2026 pricing. Written as input to the full Speakly architecture doc (Node.js backend, Next.js + Three.js avatar frontend, `/api/chat`, `/api/tts`, `/api/stt`, JSON lesson engine, long-term memory system).

---

## 1. CEFR: What A1–C2 Concretely Means, and What to Build On

### 1.1 The three layers of a CEFR-grounded curriculum

A usable machine-readable curriculum needs three parallel inventories per level: **can-do statements** (functional goals), **grammar features** (criterial structures), and **graded vocabulary** (sense-level, not word-level). CEFR itself only publishes the first layer; the other two come from derived corpora projects.

**Can-do statements.** The Council of Europe's CEFR 2001 + Companion Volume (2020) descriptors are free to use with attribution and are the canonical functional layer (e.g., A1 spoken interaction: "Can ask and answer questions about where they live, people they know, things they have"). Every serious product anchors to these — Duolingo explicitly aligns each unit to a CEFR can-do (e.g., A1 = "ask and answer questions about where you live").

**Grammar features (criterial features).** The [English Grammar Profile](http://www.englishprofile.org/resources) (Cambridge, built on the 50M-word Cambridge Learner Corpus) lists hundreds of *criterial* grammar features — structures whose emergence distinguishes one level from the one below, evidenced by what learners actually produce, not prescription. Representative per-level anchors (cross-checked against [Tracktest's CEFR grammar inventory](https://tracktest.eu/english-grammar-cef-level-requirements/)):

| Level | Criterial grammar (illustrative, not exhaustive) |
|---|---|
| **A1** | Present simple (habits), past simple regular/irregular, `can/can't` (ability), articles a/an/the, personal & demonstrative pronouns, zero conditional, basic `there is/are`, imperatives |
| **A2** | First conditional, comparatives/superlatives, past progressive, `going to` + `will` futures, `should` (advice), reflexive pronouns, core phrasal verbs (get up, put on), present perfect (experience) |
| **B1** | Past perfect (+ progressive), `used to`, reported speech, second conditional, `may/might` (probability), gerund/infinitive patterns, relative clauses (defining), complex conjunctions (although, unless) |
| **B2** | Past modals (`could/must/needn't have done`), all conditionals incl. mixed, future perfect (+ progressive), passive across tenses, non-defining relatives, extended phrasal verbs, hedging/discourse markers |
| **C1** | Inversion (conditional & negative adverbial), `wish/if only` for regret, cleft sentences, full modal-in-past control, nominalization, separable phrasal verb manipulation, ellipsis/substitution |
| **C2** | Full stylistic range: fronting, subjunctive remnants, complex embedding, register shifting, idiomatic and figurative control (EGP's C2 features are mostly precision/appropriacy rather than new forms) |

**Vocabulary.** The [English Vocabulary Profile](https://textinspector.com/help/lexis-evp/) grades ~6,750 headwords **at the sense level** — critical detail: "degree" is A2 for TEMPERATURE, B1 for QUALIFICATION, B2 for AMOUNT, C2 for "a degree of" ([Cambridge, C1/C2 completion paper](https://www.cambridge.org/core/journals/english-profile-journal/article/completing-the-english-vocabulary-profile-c1-and-c2-vocabulary/418955FC7ED2455E98A499BC40C2C816)). Vocabulary *size* benchmarks per level ([Milton & Alexiou, EUROSLA monograph](http://www.eurosla.org/monographs/EM01/211-232Milton.pdf)): A1 <1,500; A2 1,500–2,500; B1 2,750–3,250; B2 3,250–3,750; C1 3,750–4,500; C2 4,500–5,000 lemmas (receptive estimates; other traditions — Nation's word families — put C1/C2 at 8–9k families; the point is the *ordering and pacing*, not the absolute number: expect roughly 600–1,000 new lemmas per level through B1, thinning to precision/collocation work at C1+).

### 1.2 Public resources to base the curriculum graph on — with licensing reality

| Resource | What it gives you | License / commercial use |
|---|---|---|
| **CEFR Companion Volume descriptors** (Council of Europe) | ~2,000 can-do descriptors incl. mediation, phonology scale | Free with attribution. **Use directly.** |
| **British Council–EAQUALS Core Inventory for General English** | Per-level mapping of functions ↔ grammar ↔ vocab topics ↔ discourse markers — the closest thing to a ready-made A1–C1 syllabus skeleton | Free PDF. **Best single skeleton source.** |
| **English Grammar Profile / English Vocabulary Profile** | Criterial grammar features; sense-level graded vocab | Free to *search* online after registration; **not licensed for bulk extraction/redistribution**. Use as design reference + validation oracle; contact Cambridge for data licensing if you want it in-product. |
| **[Pearson GSE Teacher Toolkit](https://www.pearson.com/languages/en-us/why-pearson/the-global-scale-of-english.html)** | 1,600+ learning objectives, 300+ grammar objectives, 36,000 vocab items on a **granular 10–90 numeric scale** mapped to CEFR ([toolkit overview](https://www.pearson.com/content/dam/one-dot-com/one-dot-com/pearson-languages/en-gb/pdfs/gse/gse-resources/introduction-to-the-global-scale-of-english-teacher-toolkit-new.pdf)) | Free to browse; content © Pearson. The 10–90 scale idea (fine-grained progress *within* a CEFR band) is worth copying as a concept even if you don't license the data. |
| **[EFLLex / CEFRLex](https://cental.uclouvain.be/cefrlex/efllex/)** (UCLouvain) | Machine-readable TSV: 15,280 English lemmas + MWEs with normalized frequency per CEFR level A1–C1 | **CC BY-NC-SA 4.0 — non-commercial.** Perfect for prototyping and internal validation; needs a license or replacement (e.g., your own list built from SUBTLEX/COCA frequency + LLM level-labeling validated against EVP spot checks) before commercial launch. |
| **Oxford 3000/5000** | CEFR-labeled core word lists | Browsable free, © OUP — reference only. |
| **CEFR-J** (Tokyo Univ. of Foreign Studies) | Free downloadable CEFR-graded wordlist + finer-grained can-do sublevels (A1.1–A1.3 etc.) | Free for research/education with attribution; check terms for commercial. Sublevel idea is useful for pacing. |

**Practical recommendation:** hand-author (with LLM assistance) an *internal* syllabus DB: ~40–60 objectives per level × 6 levels, each objective = {can-do statement (own wording), grammar feature refs, target vocab senses, functions}. Facts and level assignments are not copyrightable; wholesale copying of Cambridge/Pearson lists is. Seed from the free Core Inventory + CEFR descriptors, validate vocab grading against EFLLex during development (non-commercial use = internal R&D is defensible, but get sign-off or rebuild the list from open frequency data for shipping).

---

## 2. Curriculum Representation: Static Tree vs. LLM-Generated vs. Hybrid

### 2.1 The three options

**A. Static hand-authored skill tree** (classic Duolingo, Babbel). Pedagogy team authors every unit/lesson. Duolingo's process: experts develop lists of communicative goals, the words/phrases per goal, and every grammar concept, organized by level ([Duolingo course-creation blog](https://blog.duolingo.com/the-nuts-and-bolts-of-course-creation-at-duolingo/)); sections/units cover A1→B2 with per-unit guidebooks. Personalization happens only at the *exercise-selection* layer (Birdbrain, §5).
- *Pros:* quality-controlled, cheap at runtime, testable, CEFR-auditable.
- *Cons:* zero content personalization — a lawyer and a nurse get the same "at the restaurant" unit; enormous authoring cost; this is precisely the gap Speakly's memory system is meant to exploit.

**B. Fully LLM-generated program at onboarding.** One mega-prompt produces the entire curriculum from the user profile.
- *Pros:* maximally personal; trivial to build.
- *Cons:* no pedagogical guarantees (LLMs drift on level-appropriateness, skip prerequisite ordering, over-index on the stated interest), no cross-user reuse (every lesson is a cold generation → cost), no stable progress semantics (what does "finished B1" mean if every user's B1 is different?), hard to QA, and regenerating a plan after the user's goals shift breaks continuity.

**C. Hybrid: hand-authored pedagogical skeleton + LLM surface realization.** The curriculum *graph* (levels → units → objectives with prerequisite edges, grammar/vocab/function payloads) is static and CEFR-anchored. The LLM fills the *skin*: topics, scenarios, dialogue scripts, example sentences, roleplay personas — parameterized by user interests, job, track, and memory facts.

### 2.2 What production apps actually do

- **Duolingo**: static CEFR curriculum + ML exercise selection (Birdbrain) + **LLMs to draft lesson content faster, with human expert review before shipping** ([Duolingo LLM lesson-creation blog](https://blog.duolingo.com/large-language-model-duolingo-lessons/)). Personalization = sequencing/difficulty, not content themes.
- **Praktika**: a fixed learning-path structure (goal choice: Travel / Living Abroad / Career Growth; ~1,000+ lessons, 150+ topics) plus a **multi-agent runtime**: a Learning Planning Agent (GPT-5 Pro) sequences what to learn next using a Student Progress Agent's signals; a Lesson Agent adapts in-session; **all agents share a persistent memory layer storing goals, preferences, and past mistakes** ([OpenAI case study](https://openai.com/index/praktika/)). I.e., Praktika is hybrid: curated lesson/topic library + LLM planning + memory-driven adaptation — the closest published analog to what Speakly wants.
- **Speak**: curated course spine (methodology-first), LLM-driven open conversation practice layered on top.

Nobody successful ships option B. The market answer is C, and it matches Speakly's memory-system requirement exactly.

### 2.3 Recommended representation (concrete)

```
CurriculumNode (static, ~300–400 nodes total for A1–C2)
  id, level (A1..C2), sublevel (e.g., B1.2), unit_index
  objective: { canDo: "...", functions: [...], grammar: [egp-ish ids], vocab_senses: [lexeme+sense+level], phonology: [...] }
  prerequisites: [node_ids]           // DAG, not a strict chain
  track_weights: { business: 0.9, conversation: 0.5, exam: 0.7 }  // node relevance per track
  assessment_blueprint: { item_types, pass_threshold }

ProgramInstance (per user, LLM-generated at onboarding, regenerable)
  user_id, track, start_level, target_level, weekly_cadence
  path: [ { node_id, theme, scenario_seed, status } ]   // ordered walk over the DAG
  // theme/scenario_seed are the ONLY LLM-personalized fields at this layer:
  // node B1.2-07 ("narrate past events; past perfect") → theme "post-mortem of a production incident" for a software developer on the Business track

LessonInstance (per user per node, generated lazily — §3)
  node_id, user_id, version, steps: [ ...JSON steps §4... ], validation_report, source: generated|template+skinned
```

**Why the DAG walk matters:** track selection (Business/Conversation/Exam) re-weights node selection and ordering rather than requiring three authored curricula; exam track adds exam-format nodes (essay frames, listening part-types); the LLM never decides *what grammar comes next* — only *what it's about*. This gives you Praktika-style personalization with Duolingo-style auditability.

---

## 3. Lesson Generation Pipeline

### 3.1 When to generate — the three options

| Strategy | Latency UX | Cost | Adaptivity | Failure blast radius |
|---|---|---|---|---|
| **Pre-generate whole program at onboarding** (60–150 lessons) | Great after a long onboarding wait | Worst: typical consumer-app D30 retention means most generated lessons are never opened; also stale vs. memory (lesson 40 generated before the system knows the user) | None — can't use week-6 memory in week-6 lessons | One bad run poisons the whole program |
| **Generate at lesson start** | 10–30 s spinner before every lesson; retries visible to user | Fine | Best | User-facing failures |
| **Lazy-generate next N ahead (recommended, N = 2–3)** | Zero perceived latency (always ready) | Near-optimal (only ~N wasted per churned user) | Near-best: each lesson generated *after* the previous one's results and memory writes | Failures retried silently in background |

**Recommendation:** at onboarding, generate synchronously only (a) the ProgramInstance path (one structured-output call, <10 s) and (b) lesson #1. A background worker (BullMQ on Node.js + Redis is the standard choice) keeps a per-user buffer of 2–3 validated lessons, triggered on lesson completion and on significant memory updates (new job info → regenerate un-started buffered lessons). Nightly batch top-ups can run through the **Claude Batch API at 50% off** for non-urgent regeneration.

### 3.2 Caching & reuse across similar users

Two-layer reuse:

1. **Global core-lesson cache.** Key = `(node_id, track, level_band, interest_cluster)` where interest_cluster buckets interests into ~20–30 clusters (tech, healthcare, finance, travel…). The expensive full-lesson generation happens once per key; per-user delivery applies a **cheap "skinning" pass** (names, city, references to the user's own memory facts injected into warm-up and roleplay steps) or pure template slot-filling with no LLM call at all. This converts marginal lesson cost from ~1 full generation to ~0.1 generation for the majority of users. Praktika's "150 topics × 1,000 lessons" library is effectively this cache, pre-built.
2. **Prompt caching.** The generation prompt = [static system prompt + curriculum node spec + JSON schema + few-shot exemplars] (stable, cacheable prefix, ~5–10K tokens) + [user profile/memory] (volatile suffix). With Anthropic prompt caching (reads ≈ 0.1× input price, 5-min TTL writes 1.25×), batch-generating many users' lessons for the same node in bursts makes the big prefix nearly free. Keep the system prompt byte-stable; put user data after the cache breakpoint.

### 3.3 Model choice and cost (Anthropic first-party pricing, cached 2026-06)

| Model | Input $/MTok | Output $/MTok | Role |
|---|---|---|---|
| `claude-opus-5` | $5.00 | $25.00 | **Default for lesson/program generation and roleplay grading** — best instruction-following for schema + pedagogy constraints |
| `claude-sonnet-5` | $3.00 ($2.00 intro thru 2026-08-31) | $15.00 ($10 intro) | Real-time tutor chat turns if Opus latency is an issue |
| `claude-haiku-4-5` | $1.00 | $5.00 | Validators/judges, skinning pass, per-utterance error tagging |

A full lesson generation ≈ 8K in (mostly cached) + 4K out ≈ **$0.11 on Opus 5** uncached, ~$0.10 with warm cache, **~$0.055 via Batch API**; amortized over the reuse cache, per-user marginal cost lands around **$0.01–0.03/lesson**. A 15-minute avatar session ≈ 20 chat turns × (3K in cached + 150 out) ≈ **$0.09–0.15 on Opus 5** for the LLM. Recommendation: run everything on `claude-opus-5` initially; only after evals are in place, consider tiering utility calls down to Haiku 4.5 (quality delta is measurable then, not guessed).

Speech stack per 15-min session (current list prices):

| Service | Price | Session estimate |
|---|---|---|
| **STT — Deepgram Nova-3 streaming** | ~$0.0058–0.0077/min ([Deepgram pricing](https://diyai.io/ai-tools/speech-to-text/deepgram-pricing-2026/)) | ~7 min user speech ≈ **$0.04–0.05** |
| STT alt — OpenAI `gpt-4o-mini-transcribe` $0.003/min, `gpt-4o-transcribe`/Whisper $0.006/min ([OpenAI STT pricing](https://costgoat.com/pricing/openai-transcription)) | | ~$0.02–0.04 |
| **TTS — Deepgram Aura-2** $0.030/1K chars ([TextToLab](https://texttolab.com/blog/deepgram-pricing)) | ~6K chars avatar speech | **$0.18** |
| TTS alt — ElevenLabs Flash v2.5 $0.05/1K chars ([ElevenLabs API pricing](https://developer.puter.com/tutorials/elevenlabs-api-pricing/)); OpenAI `gpt-4o-mini-tts` ~$0.015/min ([Holori guide](https://holori.com/openai-pricing-guide/)) | | $0.30 / ~$0.12 |
| **Pronunciation scoring — Azure Speech Pronunciation Assessment** (phoneme-level accuracy/fluency/completeness/prosody scores; billed as standard STT, ≈$1/audio-hour ≈ $0.017/min; [Azure pricing](https://azure.microsoft.com/en-us/pricing/details/speech/)) | only on `repeat_after`/reading steps, ~2 min | **$0.03** |
| Pronunciation alt — [SpeechAce](https://www.speechace.com/api-plans/) (usage-based plans, free trial; IELTS/PTE-style sub-scores) or [ELSA API](https://elsaspeak.com/en/elsa-api/) (phoneme + intonation + fluency) | | quote-based |

**Total ≈ $0.35–0.45/session all-in** — the dominant cost is TTS, not the LLM. (Cache TTS audio for fixed lesson script lines keyed by `(text, voice)` — instantly cuts TTS spend 40–60% since presentation/vocab audio repeats across users. Word-level timestamps from TTS drive your existing ARKit viseme lip-sync.)

### 3.4 QA / validation of generated content (the part that makes or breaks option C)

Five gates, in order, cheapest first:

1. **Schema enforcement at the source.** Use Claude structured outputs (`output_config.format` with `json_schema`) so the lesson JSON *cannot* be malformed — no regex extraction, no parse-retry loops. Mirror the schema in Zod (frontend) and AJV/Zod (Node backend) as defense in depth.
2. **Deterministic lint (pure code, free).** Answer-key integrity: MCQ `correct_index` in range, distractors unique and ≠ answer; fill-blank answer actually fits the sentence slot; reorder solution is a permutation of the tokens; every referenced vocab item appears ≥2 more times later in the lesson (recycling rule); TTS line lengths < limit; banned-topic list; est. duration within band.
3. **CEFR level lint (code + graded lexicon).** Run all learner-facing text through the graded lexicon (EFLLex in dev; your own list in prod): flag lessons where >X% of tokens exceed target level +1 (standard "95–98% coverage" comprehensibility heuristic). Same for grammar: a lightweight parser or LLM tagger flags above-level structures in A1/A2 content.
4. **LLM self-critique / judge pass** (Haiku 4.5, ~$0.005/lesson): a *separate call* with a rubric — "Is every exercise solvable from information given? Is the roleplay goal achievable in ≤8 turns at level X? Are instructions unambiguous? Verify each answer key independently." Judge returns structured verdicts; failures feed an **auto-repair loop** (return validator errors to the generator, max 2 retries, then fall back to the last known-good cached core lesson for that node — never block the user).
5. **Human review, sampled, at the template layer only.** Duolingo's model: LLM drafts, humans review before shipping ([Duolingo](https://blog.duolingo.com/large-language-model-duolingo-lessons/)). For Speakly: human-review every *core cached lesson* (a few hundred per track — tractable), never per-user skins. Plus **telemetry quarantine**: per-exercise error rate and skip rate monitored; an exercise where >70% of users fail or that gets skipped disproportionately is auto-flagged and its lesson regenerated — this is Birdbrain's difficulty signal repurposed as a QA net.

---

## 4. Lesson Anatomy & JSON Encoding for an Avatar Tutor

### 4.1 Pedagogical shape (PPP + task-based hybrid, 12–18 min)

1. **Warm-up** (1–2 min): avatar small talk *seeded from memory* ("Last time you said your demo went badly — how did the retry go?") — this is where the memory system becomes visible product value; sneaks in review of 2–3 due spaced-repetition items.
2. **Presentation** (2–3 min): the target structure/function, 3–4 examples in the lesson's theme, brief L1-available explanation card.
3. **Vocabulary** (2 min): 5–8 sense-graded items: audio, IPA, L1 gloss, themed example.
4. **Controlled practice** (3–4 min): MCQ, fill-blank, reorder, translation, listening comprehension — auto-graded, Birdbrain-style difficulty-selected.
5. **Speaking / pronunciation** (2 min): repeat-after-me scored by pronunciation API; short prompted answers.
6. **Roleplay task** (4–6 min): multi-turn free conversation with the avatar in persona, with a concrete goal + hidden rubric; the core differentiator.
7. **Recap/assessment** (1–2 min): rubric feedback, error summary, XP/streak, items pushed to spaced-review queue, memory writes.

### 4.2 JSON step schema (extends your existing lesson engine)

```jsonc
{
  "lesson_id": "b1.2-07__u123__v2",
  "node_id": "b1.2-07",
  "objective_refs": ["cando:b1.narrate-past", "gram:past-perfect", "vocab:incident.b1"],
  "theme": "Debugging a production incident",           // LLM-personalized
  "est_minutes": 15,
  "steps": [
    { "id": "s1", "type": "warmup_chat",
      "avatar_script": { "text": "...", "ssml": "...", "emotion": "friendly" },
      "memory_probes": ["fact:job=software_developer", "fact:last_lesson_struggle=past_perfect"],
      "max_turns": 4, "exit": { "on_turns": 4 } },
    { "id": "s2", "type": "present",
      "card": { "title": "...", "explanation_l1": "...", "examples": [{ "en": "...", "l1": "...", "audio_ref": "tts:..." }] } },
    { "id": "s3", "type": "vocab",
      "items": [{ "lemma": "roll back", "sense": "revert software", "cefr": "B2", "ipa": "...", "gloss_l1": "...", "example": "...", "srs": true }] },
    { "id": "s4", "type": "mcq",
      "stem": "By the time we noticed, the bug ___ for hours.",
      "options": ["had been live", "was living", "has lived", "lived"],
      "correct_index": 0, "feedback_per_option": ["...", "...", "...", "..."],
      "objective_refs": ["gram:past-perfect"], "difficulty": 0.55 },
    { "id": "s5", "type": "fill_blank", "text": "We ___ (deploy) before we ___ (test).", "answers": [["had deployed"], ["had tested","tested"]] },
    { "id": "s6", "type": "repeat_after",
      "target_text": "We had already shipped the fix.",
      "scoring": { "provider": "azure_pron", "pass": { "accuracy": 70, "fluency": 60 }, "focus_phonemes": ["ʃ", "ɪ"] } },
    { "id": "s7", "type": "roleplay",
      "persona": { "name": "Maya", "role": "your engineering manager", "mood": "concerned" },
      "user_goal": "Explain what had happened before the outage and what you had already tried.",
      "must_elicit": ["past perfect ×3", "vocab: roll back, root cause"],
      "hidden_rubric": { "task_completion": "...", "grammar_target_use": "...", "fluency": "..." },
      "exit": { "on_goal_met": true, "max_turns": 10 },
      "assistance": { "hint_after_silence_ms": 8000, "translation_on_tap": true, "rephrase_button": true } },
    { "id": "s8", "type": "recap",
      "grading_summary_prompt": "...",           // LLM composes feedback from step results
      "srs_enqueue": ["s3.items[*]", "errors[*]"], "xp": 40 }
  ]
}
```

Design notes: every step carries `objective_refs` (this is what makes mastery tracking possible, §5); `avatar_script.ssml` + `audio_ref` decouple lip-sync/TTS from content; grading spec is *data*, so the client engine stays dumb and the same JSON drives web now and mobile later; open-response and roleplay grading are server-side LLM calls against the `hidden_rubric` with structured output `{scores, errors[{utterance, error_type, correction, objective_ref}], memory_candidates[]}` — the `errors` array feeds both remediation and the memory system.

---

## 5. Adaptive Progression

### 5.1 Placement (onboarding, 3–5 minutes max)

Full CAT rigor (IRT-calibrated item banks, as in [CEFR-based CAT systems](https://files.eric.ed.gov/fulltext/EJ989251.pdf)) needs response data you won't have at launch. Ship a pragmatic three-stage funnel:

1. **Self-report + goal** (30 s): "beginner / can order food / can hold a conversation / work in English" → prior over levels.
2. **Adaptive vocab + grammar screen** (2 min): Yes/No vocabulary check à la DIALANG/X_Lex — show 20–30 words sampled across level bands **including 4–5 pseudo-words** (guessing penalty), then 6–10 grammar MCQs chosen by a simple staircase (start at prior, step up on correct, down on wrong). Vocab size is the single best cheap proxy for CEFR level (Milton & Alexiou).
3. **Speaking sample** (60–90 s): one open prompt at estimated level; score with LLM rubric (grammar range/accuracy, lexical range, coherence vs. CEFR descriptors) + pronunciation API fluency metrics. LLM output = level ± confidence.

Combine: final level = median of (self-report, screen estimate, speaking estimate); when they disagree by ≥1 level, start at the *lower* and let in-course adaptation promote quickly (starting too hard churns worse than too easy). Persist the full placement transcript into memory ("already knows: present perfect; gap: articles").

### 5.2 In-course mastery model

Per-user, per-objective **Elo/Bayesian skill estimate** — exactly Birdbrain's architecture: a logistic model P(correct) = f(user ability on objective, exercise difficulty); each graded step updates both the user's ability and the exercise's difficulty estimate ([Duolingo Birdbrain](https://blog.duolingo.com/how-duolingo-uses-ai-in-every-part-of-its-app/), [VentureBeat](https://venturebeat.com/ai/how-duolingo-uses-ai-in-every-part-of-its-app)). The lesson generator consumes this: target the "Goldilocks" band (~70–85% expected success), which is what Duolingo's session generator optimizes for. Store as `mastery(user, objective_ref) ∈ [0,1]` + last-seen timestamp.

**Vocabulary retention:** run a spaced-repetition queue on **FSRS** (open-source, MIT-licensed, `ts-fsrs` on npm; measurably better retention-per-review than SM-2). Due items get injected into warm-ups and controlled practice rather than a separate flashcard grind — keeps the "tutor session" feel.

### 5.3 Advancement and remediation

- **Advance a level when**: ≥80% of the level's objectives at mastery ≥0.85, **and** a checkpoint lesson passed — checkpoint is generated from a *fixed assessment blueprint* per level (item types + counts locked; only surface content generated), including a roleplay scored against level descriptors. Also offer a "test out" checkpoint anytime (Duolingo-style) for misplaced users.
- **Remediate when**: an objective's mastery drops <0.5 after ≥2 encounters → inject a short (5-min) auto-generated remedial lesson targeting exactly that objective with a *new theme* (re-teaching with the same examples reads as punishment); persistent error types from roleplay grading (e.g., article omission) become standing memory facts that bias future lesson generation ("include 2 article-focused exercises until cleared").
- **Down-shift silently**: if session-level expected-success drops below ~50% across two lessons, regenerate the buffer one sublevel easier; never announce demotion.

---

## 6. Recommended Design — Summary & End-to-End Data Flow

**Architecture in one paragraph:** Static hand-authored CEFR curriculum DAG (~300–400 nodes seeded from the Core Inventory/CEFR descriptors, validated against EVP/EFLLex) → onboarding produces a per-user ProgramInstance (one `claude-opus-5` structured-output call choosing a track-weighted walk + personal themes per node) → background worker lazily generates the next 2–3 LessonInstances (global core-lesson cache keyed by node×track×interest-cluster + cheap per-user skinning; strict JSON schema → deterministic lint → CEFR lint → Haiku judge → auto-repair) → the existing JSON lesson engine plays steps through the avatar (Deepgram Nova-3 STT, Aura-2 or gpt-4o-mini-tts TTS with cached audio, Azure Pronunciation Assessment on speaking drills, Opus 5 for roleplay turns and rubric grading) → every graded step updates per-objective Elo mastery + FSRS queue + memory store → mastery gates level advancement via blueprint checkpoints, and memory/error facts feed the next generation cycle.

**Onboarding flow (step by step):** (1) client posts interests/track/self-report → (2) placement screen items served from a small static calibrated bank → (3) speaking sample → STT → LLM level-scorer (structured output) → (4) level + profile persisted; memory seeded → (5) sync call: ProgramInstance generated + lesson #1 generated & validated (show a 15–20 s "building your program" moment — acceptable once) → (6) worker fills the buffer.

**Per-lesson loop:** deliver buffered lesson → client engine streams steps → speech events hit `/api/stt` (streaming WS) → tutor turns hit `/api/chat` with cached prefix (persona + lesson context + relevant memory slice) → step results posted to `/api/progress` → server updates mastery/FSRS, extracts `memory_candidates` from roleplay grading into the memory store (with dedup + user-visible review) → completion event triggers buffer top-up generation using the *fresh* mastery + memory state.

**Key trade-off calls made:** hybrid over fully-generated (auditability + cost + what Praktika/Duolingo converged on); lazy-N over both extremes (latency invisible, adaptivity preserved, waste bounded); personalization at the theme/skin layer, never the pedagogy layer; QA as layered gates with human review only at the cached-template tier; Elo/FSRS (cheap, proven) over end-to-end learned models until you have response volume; TTS identified as the real unit-cost driver → audio caching is a day-one requirement, not an optimization.

---

### Sources

- [English Profile — resources (EGP/EVP)](http://www.englishprofile.org/resources) · [EVP levels — Text Inspector](https://textinspector.com/help/lexis-evp/) · [Completing the EVP: C1–C2 — Cambridge Core](https://www.cambridge.org/core/journals/english-profile-journal/article/completing-the-english-vocabulary-profile-c1-and-c2-vocabulary/418955FC7ED2455E98A499BC40C2C816) · [CEFR criterial features — Cambridge blog](https://www.cambridge.org/elt/blog/2021/06/23/using-cefr-criterial-features-for-grammar-instruction/)
- [Tracktest — English grammar CEFR requirements](https://tracktest.eu/english-grammar-cef-level-requirements/)
- [Milton — vocabulary breadth across CEFR levels (EUROSLA)](http://www.eurosla.org/monographs/EM01/211-232Milton.pdf) · [Milton & Alexiou vocabulary size & CEFR (ResearchGate)](https://www.researchgate.net/publication/312063998_Vocabulary_size_and_the_common_European_framework_of_reference_for_languages)
- [Duolingo — course creation](https://blog.duolingo.com/the-nuts-and-bolts-of-course-creation-at-duolingo/) · [Duolingo — LLM-assisted lesson creation](https://blog.duolingo.com/large-language-model-duolingo-lessons/) · [Duolingo AI / Birdbrain — VentureBeat](https://venturebeat.com/ai/how-duolingo-uses-ai-in-every-part-of-its-app) · [Birdbrain personalization overview](https://www.tomdaccord.com/blog/ai-and-duolingo) · [Duolingo intermediate efficacy whitepaper](https://duolingo-papers.s3.amazonaws.com/reports/duolingo-intermediate-efficacy-whitepaper.pdf)
- [Praktika — OpenAI case study (multi-agent, memory layer)](https://openai.com/index/praktika/) · [Praktika review — Languatalk](https://languatalk.com/blog/praktika-review/)
- [Pearson GSE](https://www.pearson.com/languages/en-us/why-pearson/the-global-scale-of-english.html) · [GSE Teacher Toolkit intro (PDF)](https://www.pearson.com/content/dam/one-dot-com/one-dot-com/pearson-languages/en-gb/pdfs/gse/gse-resources/introduction-to-the-global-scale-of-english-teacher-toolkit-new.pdf) · [GSE Learning Objectives whitepaper](https://www.pearson.com/content/dam/one-dot-com/one-dot-com/english/TeacherResources/GSE/GSE-WhitePaper-Developing-LOs.pdf)
- [EFLLex](https://cental.uclouvain.be/cefrlex/efllex/) · [CEFRLex project](https://cental.uclouvain.be/cefrlex/) · [Evaluating CEFRLex for learner applications (LREC)](https://aclanthology.org/2020.lrec-1.43.pdf)
- [CEFR-based CAT for Chinese proficiency (ERIC)](https://files.eric.ed.gov/fulltext/EJ989251.pdf) · [BOOKR adaptive English placement test](https://bookrclass.com/blog/english-placement-test/) · [ACTFL L&Rcat](https://www.languagetesting.com/listening-and-reading-computer-adaptive-test)
- [Adaptive & personalized exercise generation (arXiv)](https://arxiv.org/pdf/2306.02457) · [LLM-augmented exercise retrieval (arXiv)](https://arxiv.org/pdf/2402.16877) · [Structured outputs & schema validation in pipelines](https://collinwilkins.com/articles/structured-output)
- Pricing: [Deepgram 2026 pricing](https://diyai.io/ai-tools/speech-to-text/deepgram-pricing-2026/) · [Deepgram Aura-2 — TextToLab](https://texttolab.com/blog/deepgram-pricing) · [ElevenLabs API pricing](https://developer.puter.com/tutorials/elevenlabs-api-pricing/) · [OpenAI transcription pricing](https://costgoat.com/pricing/openai-transcription) · [OpenAI pricing guide — Holori](https://holori.com/openai-pricing-guide/) · [Azure Speech pricing](https://azure.microsoft.com/en-us/pricing/details/speech/) · [SpeechAce API plans](https://www.speechace.com/api-plans/) · [ELSA API](https://elsaspeak.com/en/elsa-api/) · Anthropic model pricing from the claude-api skill's current-models table (cached 2026-06-24)