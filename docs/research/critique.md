**(a) Contradictions between reports**

- **TTS/viseme stack:** voice report recommends Azure Neural TTS primary (native ARKit blendshapes, $16/1M chars); codebase has a built, working ElevenLabs Flash + hand-written grapheme→viseme pipeline. One says "eliminate the viseme subsystem," the other has sunk cost in it. Must be resolved explicitly.
- **STT:** codebase uses gpt-4o-mini-transcribe (batch, no timestamps); voice report picks Deepgram Nova-3/Flux streaming and explicitly warns LLM transcribers normalize learner errors — which corrupts the grading pipeline the personalization report builds on **word-level timestamps the current STT never requests**.
- **Primary LLM vendor:** backend report says "Anthropic primary"; codebase uses OpenAI gpt-4o-mini; personalization report grades with claude-haiku; curriculum/competitor reports cite GPT-5-class. No unified model matrix (chat vs grading vs extraction vs lesson-gen).
- **Turn architecture:** voice report's <1.5 s budget assumes streaming WS gateway + sentence-chunked TTS + barge-in; backend report endorses WS but calls push-to-talk turn-based "indistinguishable to users"; codebase is fully non-streaming HTTP. Three different latency philosophies.
- **Memory retrieval timing:** memory report = per-turn top-k injected in user turn (never system prompt, cache-preserving); backend report = load top-K memories once at session open; voice report = prefetch during user speech. Pick one.
- **Extraction cadence:** memory report = async post-session + ~30-turn checkpoint + inline `remember` tool; voice report step 7 = extraction job per turn. Cost/precision implications differ materially.
- **Data model mismatch:** curriculum's `CurriculumNode/ProgramInstance/LessonInstance` (DAG walk, track_weights) vs backend's `programs/program_units/lessons` (linear positions) are incompatible schemas for the same objects; backend `memories.kind` enum ≠ memory report's 4-surface taxonomy, and backend schema has no `session_summaries` or slot-based profile table.
- **Azure pricing:** voice report says PA "~$1/hr"; personalization says $1.32/audio-hour. Minor, but the doc must cite one.
- **Praktika agent naming:** competitors ("supervisory/reasoning agent," GPT-5.2-class) vs curriculum ("Learning Planning Agent, GPT-5 Pro") describe the same case study differently.
- **TTS cost math tension:** ElevenLabs per-lesson cost (~$0.01–0.02 per reply, codebase) can't fit voice report's "$0.02–0.06/min all-in cascaded" claim; that number silently assumes Azure.

**(b) Missing areas the final document must address**

- **Placement test:** every report notes competitors' self-selected CEFR is a flaw; none designs Speakly's onboarding placement (adaptive speaking probe? SpeechAce CEFR score? skip-and-calibrate-in-first-lesson?).
- **App vs web decision:** all successful competitors are native mobile (Flutter+Unity); MVP is Next.js/Three.js web. No report evaluates PWA vs Expo/RN vs Flutter, WebGL avatar perf on mid-range Android, iOS Safari audio constraints, or push-notification dependence of streak mechanics.
- **i18n / Turkish-first UX:** UI language, Turkish translations of feedback/grammar explanations, code-switching policy per CEFR level, RTL-safe design — absent (system prompt hardcodes Turkish L1 but nothing else).
- **Translation-help feature** (tap-a-word, bubble translation — a stated core feature): no pipeline, caching, or cost design anywhere.
- **Content moderation & safety:** user speech → LLM with no abuse filtering, no prompt-injection defense for memory writes (poisoned "facts"), no self-harm/minors policy, no age gate.
- **Privacy/compliance:** GDPR + Turkish KVKK, voice-recording consent/retention, memory visibility+delete UI (memory report gestures at it; no spec), data export, audio storage policy for model improvement.
- **Payments/subscriptions:** zero coverage — store billing (IAP 15–30%) vs Stripe web, trial design, personalized pricing, entitlement service, tier gating of premium voice/PA.
- **Analytics & experimentation:** no event taxonomy, no A/B infra, no north-star metrics, despite reports citing retention lifts (+24% D1, +14% D14) as decision evidence.
- **Admin/content tooling:** curriculum DAG authoring UI, lesson QA/review workflow, prompt version management, generated-lesson audit queue, support tooling to inspect a user's memory/program.
- **Testing/eval strategy:** no plan for pedagogy evals (level-appropriateness regression suite), grading-accuracy evals vs human raters, lip-sync QA, load tests of WS gateway, LLM output schema fuzzing.
- **Offline/degraded behavior:** flaky mobile networks, WS reconnect/session resume, lesson state recovery mid-crash, fallback when a voice vendor is down (no multi-vendor failover design).
- **Cost model gaps:** per-report fragments never composed into $/user/month at target usage (LLM + STT + TTS + PA + embeddings + infra) vs ~$8/mo competitor price point; no free-tier abuse limits.
- **Notifications/re-engagement infra:** streaks require push/email + timezone-correct day boundaries; unaddressed.
- **Avatar asset pipeline:** 26 MB GLB delivery (CDN, compression, LOD), multiple tutors/accents roadmap, low-end device fallback (audio-only mode — competitors' noted gap).
- **Observability/ops:** Langfuse named once; no tracing plan across STT→LLM→TTS turn, no SLOs, no incident story.
- **Curriculum versioning:** what happens to in-flight ProgramInstances when nodes change or user switches track (Praktika's "reset" flaw is called out but no solution specified).

**(c) 5 riskiest decisions + evidence to settle each**

1. **Azure TTS (native visemes) vs ElevenLabs + existing heuristic pipeline.** Evidence: 1-week spike wiring Azure blendshape frames to the Fat Man ARKit rig; blind side-by-side ratings (10–20 target users) on lip-sync fidelity + voice quality; measured TTFB and per-lesson cost for both. Kill criterion: if Azure voice quality is rated acceptable, its $16/1M + free visemes wins.
2. **Streaming WS voice loop vs current HTTP push-to-talk.** Evidence: instrumented prototype measuring p50/p95 end-of-speech→first-audio on Turkish 4G/mid-range Android for both; small retention/engagement pilot (does ~1.2 s vs ~3.5 s change turns-per-session?). Speak's 1.6 s and Praktika's <300 ms STT suggest it matters, but own data should gate the gateway build cost.
3. **Hybrid curriculum (static DAG + LLM skinning) actually producing level-correct lessons.** Evidence: generate 50–100 lessons across A1–B2 nodes, score with EVP/EFLLex vocab-level validator + CEFR-qualified teacher review; measure % needing human fix. Kill criterion: >20% pedagogical defect rate forces more templating/less generation.
4. **Custom Postgres+pgvector memory (build) vs mem0/Zep (buy).** Evidence: run the extract→adjudicate pipeline on 20–30 pilot transcripts; measure fact precision/recall vs human annotation, retrieval hit-rate in next-session prompts, and per-session cost; compare against a mem0 OSS baseline on the same transcripts. Praktika's +24% D1 validates memory, not the build choice.
5. **Web (Next.js/Three.js) vs native mobile app.** Evidence: mobile-web funnel instrumentation — mic permission grant rate, iOS Safari audio unlock success, avatar FPS on 3 representative Android devices, D7 retention without push; compare against known mobile-app benchmarks. If mobile-web mic/audio friction >10–15% drop-off or FPS <30, commit to Expo/Flutter before scaling content spend.