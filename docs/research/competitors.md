# Competitor Architecture Research: AI English Tutor Apps
**Prepared for Speakly — Praktika.ai, Speak, ELSA Speak, Loora, TalkPal, Univerbal**
*Research date: August 2026. All pricing verified against 2025–2026 sources; app-level details from hands-on third-party reviews, vendor engineering blogs, funding press, and job postings.*

---

## 0. Market snapshot

| Product | HQ / founded | Funding & scale | Core wedge | Consumer price (annualized) |
|---|---|---|---|---|
| **Praktika** | London, 2022 | [$35.5M Series A (Blossom Capital, May 2024)](https://techcrunch.com/2024/05/22/praktika-raises-35-5m-to-use-ai-avatars-to-make-learning-languages-feel-more-natural/); 1.2M MAU, ~$20M ARR at raise; "millions of students" by 2026 | 3D avatar tutors + agentic memory | ~$8/mo (annual); 3-mo & annual only |
| **Speak** | SF, 2016 (YC) | [$78M Series C at $1B valuation (Accel + OpenAI Startup Fund, Dec 2024)](https://techcrunch.com/2024/12/10/openai-backed-speak-raises-78m-at-1b-valuation-to-help-users-learn-languages-by-talking-out-loud) | Speaking-volume method + proprietary ASR + OpenAI partnership | Premium ~$120/yr, Premium Plus ~$180/yr |
| **ELSA Speak** | SF/Vietnam, 2015 | [~$60M total, 9 rounds](https://tracxn.com/d/companies/elsa-speak/__oUqt06y8Fr5r2uVOAaIrTCxiqTQTMJGQoEAHCu57JWE); 50M+ downloads | Phoneme-level pronunciation scoring; B2B API | Pro $74.99/yr; Premium $159.99/yr |
| **Loora** | Tel Aviv, 2020 | [$21.25M total](https://www.crunchbase.com/organization/loora) | Premium spoken English for career professionals | $25.99/mo or $119.99/yr |
| **TalkPal** | 2023 | Bootstrapped-ish, no major rounds disclosed | GPT wrapper breadth: 57 languages, 9 practice modes | $9.99/mo; ~$60/yr prepaid |
| **Univerbal** (ex-Quazel) | Zurich (ETH spinout) | Seed-stage | CEFR-skill study plan + conversation quests, 23 languages | $14.99/mo; $120/yr |

Two strategic clusters: **structured-curriculum + speech-tech owners** (Speak, ELSA — own their ASR, defensible) and **LLM-orchestration + experience owners** (Praktika, Loora, TalkPal, Univerbal — rent models, differentiate on memory, avatars, pedagogy). Speakly's plan (JSON lesson engine + avatar + memory) is squarely in cluster two; the lessons below reflect that.

---

## 1. Praktika.ai — the closest analog to Speakly

### Onboarding (in order, per [LanguaTalk's teardown](https://languatalk.com/blog/praktika-review/))
1. Daily study-time commitment → 2. **Goal**: Travel / Living Abroad / Career Growth → 3. **Skills within that goal** (job interviews, ordering food, small talk) → 4. **CEFR level A1–C1** (self-selected, no placement test) → 5. **Interests** from a preset list. Under 5 minutes; pricing is personalized after the assessment. Critically: **skills cannot be mixed across goals, and changing goals resets path progress** — repeatedly cited as its worst product flaw.

### Curriculum structure
- **Learning Path**: goal-based personalized course, 1,000+ lessons total in the catalog, adaptive study plan.
- **Practice library**: ~140 on-demand conversation topics, dynamically re-ranked by interests/level after 4.0.
- **Grammar**: only surfaced as occasional recommendations inside the path; not browsable — a noted weakness.

### Lesson session anatomy
Guided conversation with an animated 3D avatar (10–30 min): avatar speaks + chat bubbles; **"Feedback" button beside every user utterance** (weakness: appears even when there's no error); tap-a-word definitions → personal dictionary; English scaffolding at beginner levels, full immersion from intermediate. **No end-of-lesson summary or categorized error report** — reviewers flag this constantly. Saved vocabulary never reintegrates into future lessons (no SRS).

### Architecture (the most important intel in this report)
From [OpenAI's Praktika case study](https://openai.com/index/praktika/) and [Baseten's customer story](https://www.baseten.co/resources/customers/praktika/):

- **Multi-agent system**: a **Lesson Agent** (primary conversationalist; blends tutor persona + lesson context + learner goals + recent conversations; frontier model, currently GPT‑5.2-class), a **supervisory/reasoning agent** (higher-tier model), and a **Student Progress Agent** running continuously in the background on a mini-tier model, tracking fluency, accuracy, vocabulary usage, and recurring mistakes across interactions.
- **Shared persistent memory layer** storing goals, preferences, past mistakes. Key design decision: **memory is retrieved immediately after each learner utterance** (query-time retrieval keyed to what was just said), *not* preloaded into the prompt.
- **Measured impact: +24% Day-1 retention and ~2× revenue within months of shipping long-term memory.** This is the single strongest public evidence that Speakly's memory-first thesis is correct.
- **STT**: optimized Whisper on Baseten (TensorRT-LLM, in-flight batching), **p50 latency <300 ms** (down from 1,000–1,500 ms), ~50% infra cost reduction, 9 language pairs.
- **Client**: Flutter app with an **embedded Unity3D layer for avatars** (per [job posts](https://www.remoterocketship.com/company/praktika-ai/jobs/senior-unity-developer-united-kingdom): "Senior Flutter Engineer… experience integrating Flutter with Unity3D", "Senior Unity Developer… avatar-based games and exercises"). Avatars use **proprietary generative animation** (Praktika 4.0's new tutors Skye/Tama); 5 named tutors; multiple accents (American/British/Asian/Indian); TTS relationship with ElevenLabs (ElevenLabs' Carles Reina is an angel investor).

### Gamification
Streaks, badges, in-app challenges, fluency metrics (speaking time, vocabulary mastered, confidence). No leagues/XP economy — lighter than Duolingo.

### Pricing/monetization
~[$8/mo effective on annual](https://www.icanlearn.com/praktika/); 3-month or annual only (no monthly), one tier, free trial without card. Personalized pricing post-onboarding.

### Weaknesses to exploit
Rigid paths that reset; no lesson summary; no SRS/vocab reintegration; uncanny-valley avatar complaints with **no audio-only fallback**; weak grammar library; not suitable for A1 beginners.

---

## 2. Speak (speak.com)

### Curriculum & lesson anatomy (per [LanguaTalk's review](https://languatalk.com/blog/speak-app-review/))
Thematic **units across beginner→advanced levels**, each unit a fixed sequence of five lesson types:
1. **Tutor Lesson** — guided intro (sometimes video) of target phrases/pronunciation.
2. **Speaking Drill** — sentence repetition; words light up as recognized.
3. **Vocab Builder** — matching/fill-in-the-blank.
4. **Roleplay** — scenario ("At a Coffee Shop") with **3 explicit tasks to complete** and post-roleplay error summary.
5. **Tutor Q&A** — structured exchanges with expected responses.
Plus **Free Talk** (define your own role/topic) and **Speak Tutor** (open assistant). Beginner levels are drill-heavy, advanced levels collapse into mostly Roleplay (reviewers call this "limited variety"). **No visible CEFR map, no formal level validation** — a repeated complaint. "Made for You" (Premium Plus) generates personalized lessons from your recurring mistakes — but only as Speaking Drills. Phrasebook exists but has **no spaced repetition and no reintegration** into future content.

### The "learning engine" concept worth copying
From [Speak's Live Roleplays post](https://www.speak.com/blog/live-roleplays): a proprietary **proficiency graph** tracks "the exact state of [the learner's] language knowledge," calibrates roleplay difficulty/vocabulary, sets per-roleplay **goals/objectives**, provides graduated **hints** when the learner struggles, and **updates dynamically alongside the live conversation**. This is the cleanest public description of a knowledge-state model driving live lesson adaptation.

### Speech stack (from [Speak's ASR engineering post](https://www.speak.com/blog/asr-levelup))
- Fine-tuned **Conformer-CTC** ASR on "many thousands of hours of heavily-accented English" from their own learners → **>60% WER reduction** vs pretrained baseline.
- Training on **NVIDIA NeMo**; serving via **NVIDIA Riva + Triton Inference Server on GPU Kubernetes pods on GCP**; **WebSocket** client↔server, **gRPC** server↔Riva.
- **~1.6 s** from speech start to first-word feedback; transcript updates every **≤260 ms** (human-reaction cadence).
- **Live Roleplays** use the **OpenAI Realtime API (speech-to-speech GPT‑4o)** — they explicitly note speech models still underperform text models on instruction following and pronunciation coaching, so Realtime is used for *one feature*, not the whole product.

### Gamification & pricing
Streaks, **leagues**, reminders, progress tracking, AI-sequenced lessons. [Premium ≈ $20/mo or ~$119.99/yr; Premium Plus ~$179.99/yr](https://speakshark.com/blog/speak-app-pricing-per-month-2026) (unlimited "Made for You" + custom lessons). Reviewers call the tier split confusing and limits "unspecified."

### Weaknesses
Overly lenient speech scoring ("false sense of mastery"), shallow post-lesson feedback, no cumulative mistake tracking surfaced, no grammar curriculum, tier confusion.

---

## 3. ELSA Speak

- **Tech**: proprietary DNN ASR scoring **every phoneme** against native models, trained on what they call the largest accented-English corpus (from tens of millions of L2 users); claims **95%+ mispronunciation detection**; color-coded (green/yellow/red) per-phoneme feedback with word stress, intonation, fluency ([overview](https://www.conversation.ai/research/product-spotlight/elsa-teaches-english), [ELSA API](https://elsaspeak.com/en/elsa-api/)).
- **Curriculum**: 3,000+ lessons / 44 topics (Pro); dedicated **IELTS/TOEFL/TOEIC/PTE/EIKEN prep tracks**; **Speech Analyzer** product for long-form spontaneous speech assessment; proficiency mapped to **CEFR/IELTS/TOEIC scores** — the credibility feature Speak lacks.
- **B2B is the real business**: ELSA API sells scripted+unscripted scoring with IELTS/TOEFL prediction; Team plan **$18.20/user/mo (2–50 seats)**; enterprise custom with LMS/HRIS integration ([pricing](https://elsaspeak.com/en/elsa-subscription)).
- **Consumer pricing**: Pro **$11.99/mo or $74.99/yr**; Premium **$159.99/yr**; functional free tier ([SaaSworthy](https://www.saasworthy.com/product/elsa-speak/pricing)).
- **Weakness**: drill-based, low conversational immersion — it's a pronunciation gym, not a tutor. That's why it coexists with Praktika/Speak rather than competing head-on.

## 4. Loora

- **Positioning**: premium spoken-English coach for professionals (meetings, negotiations, interviews) + TOEFL/IELTS prep. Voice-only; **no reading/writing tracks at all** ([review](https://oxfordenglishglobal.com/blog/loora-ai-review/)).
- **Onboarding**: asks professional context + speaking goals before first session; sessions are then work-scenario roleplays, opinion questions, storytelling, open discussion.
- **Session loop**: natural voice conversation (no push-to-talk), instant conversational reply, per-utterance feedback on **pronunciation (sounds + word stress), pace, filler words**; **daily fluency score**, trends, weekly goals. Inconsistent at catching pure grammar errors.
- **Tech** (founding thesis + [job-post signals](https://www.startuphub.ai/startups/loora)): proprietary/fine-tuned LLM optimized for speech-to-speech + real-time pronunciation correction; Python, Kubernetes, Docker, NoSQL.
- **Pricing**: **$25.99/mo, $119.99/yr** — deliberately premium. No gamification to speak of. Best for B1+; beginners are underserved.
- Lesson: a **single scalar "fluency score" updated daily** is a cheap, legible retention mechanic that Speakly can compute from data it already has.

## 5. TalkPal

- **GPT-powered breadth play**: 57 languages, [9 modes](https://testprepinsight.com/reviews/talkpal-review/) — Chat, Word, Dialogue (scripted taxi/hotel scenarios), Sentence (listen-repeat), **Call mode** (hands-free audio), Roleplay, **Character mode** (talk to historical/fictional figures), **Debate mode**, **Photo mode** (describe AI-generated images). 300+ scenario experiences.
- **Session anatomy**: free-form; corrections appear as **clickable caution icons** on each user message with grammar/word-choice/tense detail — reviewable or skippable. No mandatory progression; mid-session the AI asks what you want to focus on.
- **Personalization**: onboarding asks level/goals/frequency; difficulty adapts in-session. No real long-term memory advertised.
- **Gamification: deliberately absent** (only practice-minutes tracking) — reviewers find it *less engaging* than gamified rivals; a useful negative datapoint.
- **Pricing**: free = 10 min/day, basic chat only; Premium **$9.99–15/mo**, prepaid annual ~**$5–7/mo**; 14-day trial. Known accuracy issues: wrong grammar feedback sometimes, pronunciation errors slip through, weak for beginners and low-resource languages.

## 6. Univerbal (formerly Quazel)

- **Onboarding**: registration → **10–12 min initial assessment** → pick top-3 interests → app builds a **study plan that pairs CEFR skill targets with interest topics** ([review](https://www.icanlearn.com/univerbal/)) — structurally the closest to Speakly's "interests × track × CEFR" onboarding.
- **Lessons**: "quests" (practical roleplay scenarios) + free conversation; **lexical translation mid-conversation** to bridge comprehension gaps; real-time grammar/pronunciation corrections; AI response <2 s; difficulty ramps gradually.
- **Gamification**: streaks + conversation goals + per-language progress dashboards (speaking/listening/vocab metrics). Supports simultaneous multi-language learning on one account.
- **Pricing**: $14.99/mo, $39.90/quarter, **$120/yr**; identical features across tiers; limited free chats. Cross-platform (iOS/Android/web) with near parity.
- **Weaknesses**: no test-prep, no community, struggles with strong regional accents, thin for absolute beginners. Seed-stage traction shows CEFR-plan-plus-quests alone isn't enough of a moat without memory/avatar/speech-tech differentiation.

---

## 7. Cross-cutting: the reference voice-lesson data flow (what the winners actually run)

**Cascaded pipeline (Praktika, ELSA, Loora, TalkPal, Speak-core):**
```
mic (client, VAD) ──stream──▶ STT (streaming, partials every ~250ms)
      ├─ partial transcript ──▶ UI chat bubble (live)
      └─ final utterance ──┬──▶ Memory retrieval (keyed on utterance; Praktika does this HERE)
                           ├──▶ Lesson Agent LLM (persona + lesson step + retrieved memory + proficiency state)
                           │        └─ streamed text ──▶ TTS (streamed) ──▶ audio + visemes ──▶ avatar lip-sync
                           ├──▶ Feedback pass (grammar/word-choice per utterance → caution icon / feedback button)
                           └──▶ async: Progress Agent (cheap model) updates error bank / proficiency graph / memory writes
```
Latency budget that matches the leaders: STT final <300 ms after end-of-speech (Praktika/Baseten), LLM first token <500 ms, TTS first audio <300 ms → **~1.0–1.5 s voice-to-voice**, with partial-transcript UI masking the wait.

**Speech-to-speech (Speak Live Roleplays only)**: OpenAI Realtime API removes the cascade for immersion features, understands tone/prosody, but is weaker at instruction-following, gives you no clean text intermediate for chat bubbles/translation/JSON lesson-engine control, and complicates viseme-driven lip-sync. Even the best-funded player uses it as a *feature*, not the architecture.

**Recommended stack for Speakly (Node.js backend), with 2025–2026 prices:**

| Component | Recommended | Price | Alternative & trade-off |
|---|---|---|---|
| STT | **Deepgram Nova-3 streaming** | [$0.0077/min](https://deepgram.com/learn/speech-to-text-api-pricing-breakdown-2025) | Self-hosted optimized Whisper (Baseten-style, <300 ms p50) once volume justifies it — Praktika's path; cut costs ~50% at their scale |
| Tutor chat LLM | **Claude Sonnet 5** | $3/$15 per MTok (intro $2/$10 through 2026-08-31); prompt-cache reads ~0.1× — cache the persona+lesson prefix | Claude Opus 5 ($5/$25) for curriculum generation & supervisory grading; GPT-5-class equivalents comparable |
| Background memory/progress agent | **Claude Haiku 4.5** | $1/$5 per MTok; run extraction async or via Batches (−50%) | Mirrors Praktika's "mini model for continuous progress tracking" |
| TTS | **ElevenLabs Flash v2.5** (~75 ms model latency, 0.5 credits/char) | effectively [~$0.05–0.11 per 1K chars depending on plan](https://elevenlabs.io/pricing/api) | OpenAI TTS or Azure Neural cheaper but weaker voice personality; Praktika's avatar charisma is ElevenLabs-adjacent |
| Pronunciation scoring | **Azure Speech Pronunciation Assessment** (phoneme-level accuracy/fluency/completeness/prosody scores) | [$1.32/audio-hour ≈ $0.022/min, billed as STT Standard](https://azure.microsoft.com/en-us/pricing/details/speech/) | ELSA API (enterprise pricing, IELTS prediction) or SpeechAce; building your own = ELSA's decade + data moat, don't |
| Realtime immersion (later) | **gpt-realtime-mini** | [$10/$20 per 1M audio tokens ≈ $0.02–0.05/min; flagship $32/$64 ≈ $0.06–0.11/min](https://www.layer3labs.io/guides/openai-realtime-api-pricing) | Add as a "Live Roleplay" premium feature exactly as Speak did |
| Memory store | **Own schema: Postgres + pgvector** (facts table + embeddings), LLM-extracted | infra-only | [Mem0 $19→$249/mo, Zep from $25/mo](https://atlan.com/know/zep-vs-mem0/) — faster start, but memory is Speakly's stated moat; don't rent the moat. Zep's temporal graph is the fallback if build stalls |
| Avatar | Keep Three.js + ARKit visemes for web MVP | — | Praktika ships Flutter+Unity; on mobile, Unity-in-Flutter or keep web-view Three.js initially |

Unit economics sanity check (cascaded, 15-min lesson): STT ~$0.12 + TTS (~4K chars) ~$0.3 + LLM (cached) ~$0.05–0.15 + pronunciation ~$0.33 ≈ **$0.55–0.90/lesson-hour-equivalent** → a $10–12/mo user doing 15 min/day costs roughly $2.5–4/mo in COGS. Fine margins; caching and Haiku-tier offloading matter.

---

## 8. The 10 most important lessons for Speakly

1. **Memory is the proven growth lever — copy Praktika's exact shape.** Persistent memory layer shared by all agents (goals, preferences, recurring mistakes, biography facts), with **retrieval triggered per user utterance rather than bulk-preloading**. Praktika's public numbers: **+24% D1 retention, ~2× revenue**. Design memory writes as typed facts (`identity`, `interest`, `known_vocab`, `error_pattern`, `topic_history`) with source-utterance provenance so lessons can cite them ("Last week you said your standup ran long — let's practice interrupting politely").

2. **Split the tutor into 3 agents on 3 model tiers.** Praktika's Lesson Agent (frontier model, live), supervisory agent (frontier+/reasoning, sparse), Student Progress Agent (mini model, continuous background). It parallelizes quality vs. cost and keeps the live path fast. For Speakly: Sonnet-tier conversation, Opus-tier lesson generation/grading, Haiku-tier extraction — with prompt caching on the stable persona+lesson prefix.

3. **Build a proficiency graph, and *show* it as a CEFR map.** Speak's engine (per-item knowledge state → difficulty calibration → roleplay goals → adaptive hints, updated live) is the right internals; Speak's *failure* is hiding it — no CEFR map is its most-cited gap, while ELSA's CEFR/IELTS score mapping is its most-trusted feature. Speakly should track per-skill mastery internally and render it as a visible CEFR progress map with periodic level-check lessons.

4. **Never lock the curriculum: regenerate paths, don't reset them.** Praktika's biggest UX complaint: goals can't be mixed and switching goals wipes path progress. Because Speakly's curriculum is LLM-generated, treat the path as a *view* over durable state (memory + proficiency graph): change of track/goal ⇒ regenerate the path from the same state, losing nothing.

5. **Close the mistake loop — nobody does it well, it's an open win.** Speak's Phrasebook has no SRS and vocab "doesn't reintegrate into future conversations"; Praktika's dictionary is a dead end; reviews punish both. Build an **error bank + saved-vocab store feeding the lesson generator** (next lesson must re-elicit 3 recent errors and 5 due vocab items, SM-2-style scheduling). Speak charges Premium Plus prices for a weak version of this ("Made for You").

6. **Score pronunciation honestly at the phoneme level; don't let the LLM vibe-grade.** Speak's most damaging review line: recognition is "overly lenient… giving a false sense of mastery." ELSA built a $60M company on the opposite. Use Azure Pronunciation Assessment ($1.32/audio-hr) for objective phoneme/stress/prosody scores rendered ELSA-style (green/yellow/red words), and keep the LLM for grammar/word choice feedback only.

7. **Engineer latency as a feature; stay cascaded.** Benchmarks from the field: Praktika <300 ms STT p50 (moved providers to get it), Speak ~1.6 s to first feedback with ≤260 ms transcript updates, Univerbal <2 s replies, Praktika markets "0.1 s response." Stream every stage, show live partial transcripts, prefetch TTS for the lesson's scripted lines. Adopt speech-to-speech (gpt-realtime-mini) later, only for a Live-Roleplay-style premium feature, exactly as Speak did — text-intermediate pipelines are what a JSON lesson engine, chat bubbles, translation help, and viseme lip-sync need.

8. **Standardize lesson anatomy: objective → 3 tasks → hints → per-utterance feedback → summary.** The praised patterns: Speak's roleplays with explicit 3-task completion and post-roleplay error summary; Speak's graduated hints; Praktika's tap-for-definition and per-line feedback affordances. The punished patterns: Praktika's missing end-of-lesson summary and feedback buttons on error-free lines; Speak's "review = same drill again." Speakly's JSON lesson schema should encode objectives/tasks/hints/summary as first-class fields, and only surface feedback affordances when the checker actually found something.

9. **Gamification is table stakes, not strategy — and offer an audio-only mode.** Streaks + daily goal + progress stats appear in every winner (Speak adds leagues; Praktika keeps it light; TalkPal's absence of it is cited as an engagement weakness). Implement streaks/trophies/daily-goal path (already in Speakly's plan) but spend the innovation budget on memory and feedback loops, not a token economy. Also: Praktika gets "uncanny/distracting avatar, no audio-only option" complaints — ship a low-bandwidth audio-only lesson mode from day one.

10. **Price simply; meter the free tier by minutes; respect COGS.** The band is $8–20/mo effective annual (Praktika $8, ELSA ~$6–13, TalkPal ~$5–10, Univerbal $10, Speak ~$10–15, Loora $10 annual / $26 monthly as the premium outlier). Speak's dual-tier "unspecified limits" pricing is repeatedly called confusing — use one paid tier (maybe + a later "Live" tier for realtime roleplays); TalkPal's **10-min/day free tier** is the cleanest top-of-funnel that also caps free-user COGS. Watch per-minute unit costs (§7 table): voice minutes are the COGS driver, so daily free minutes — not lesson counts — are the correct meter. Keep an eye on ELSA's playbook for a future revenue line: the same scoring/memory infra resells as a B2B API/team product at ~$18/user/mo.

---

### Sources
- [OpenAI — Inside Praktika's conversational approach to language learning](https://openai.com/index/praktika/) · [Baseten — Praktika ultra-low-latency transcription](https://www.baseten.co/resources/customers/praktika/) · [TechCrunch — Praktika $35.5M Series A](https://techcrunch.com/2024/05/22/praktika-raises-35-5m-to-use-ai-avatars-to-make-learning-languages-feel-more-natural/) · [Praktika 4.0](https://praktika.ai/blog/praktika-4-0) · [LanguaTalk Praktika review](https://languatalk.com/blog/praktika-review/) · [ICanLearn Praktika review](https://www.icanlearn.com/praktika/) · [Praktika Unity job](https://www.remoterocketship.com/company/praktika-ai/jobs/senior-unity-developer-united-kingdom) · [Praktika Flutter job](https://www.bubble-jobs.co.uk/job/senior-flutter-engineer-praktika-ai-company-10826_dea34749edb232d1ab47ea0a48dc641f/)
- [Speak — ASR level-up engineering post](https://www.speak.com/blog/asr-levelup) · [Speak — Live Roleplays](https://www.speak.com/blog/live-roleplays) · [Speak — Series C](https://www.speak.com/blog/series-c) · [TechCrunch — Speak $78M at $1B](https://techcrunch.com/2024/12/10/openai-backed-speak-raises-78m-at-1b-valuation-to-help-users-learn-languages-by-talking-out-loud) · [LanguaTalk Speak review](https://languatalk.com/blog/speak-app-review/) · [SpeakShark pricing](https://speakshark.com/blog/speak-app-pricing-per-month-2026) · [Speak help center tiers](https://help.speak.com/en/articles/5358417-what-s-the-difference-between-premium-and-premium-plus)
- [ELSA API](https://elsaspeak.com/en/elsa-api/) · [ELSA subscription pricing](https://elsaspeak.com/en/elsa-subscription) · [ELSA speech recognition overview](https://www.conversation.ai/research/product-spotlight/elsa-teaches-english) · [ELSA Speech Analyzer launch](https://prweb.com/releases/2022/10/prweb18982119.htm) · [Tracxn ELSA profile](https://tracxn.com/d/companies/elsa-speak/__oUqt06y8Fr5r2uVOAaIrTCxiqTQTMJGQoEAHCu57JWE) · [SaaSworthy ELSA pricing](https://www.saasworthy.com/product/elsa-speak/pricing)
- [OEG Loora review](https://oxfordenglishglobal.com/blog/loora-ai-review/) · [Papora Loora review](https://www.papora.com/learn-english/loora-app/) · [StartupHub Loora](https://www.startuphub.ai/startups/loora) · [Crunchbase Loora](https://www.crunchbase.com/organization/loora)
- [Test Prep Insight TalkPal review](https://testprepinsight.com/reviews/talkpal-review/) · [Futurepedia TalkPal](https://www.futurepedia.io/tool/talkpal)
- [ICanLearn Univerbal review](https://www.icanlearn.com/univerbal/) · [Univerbal rebrand post](https://blog.univerbal.app/quazel-is-now-univerbal)
- Pricing: [OpenAI Realtime API pricing math](https://www.layer3labs.io/guides/openai-realtime-api-pricing) · [OpenAI Realtime GA](https://alternativeto.net/news/2025/8/openai-updates-the-realtime-api-with-gpt-realtime-its-most-advanced-voice-ai-model-yet) · [Deepgram STT pricing breakdown](https://deepgram.com/learn/speech-to-text-api-pricing-breakdown-2025) · [ElevenLabs API pricing](https://elevenlabs.io/pricing/api) · [Azure Speech pricing](https://azure.microsoft.com/en-us/pricing/details/speech/) · [Azure PA pricing Q&A](https://learn.microsoft.com/en-us/answers/questions/5608069/pricing-and-usage-of-pronunciation-assessment-feat) · [Zep vs Mem0 pricing](https://atlan.com/know/zep-vs-mem0/) · Anthropic model pricing from the Claude API reference (Opus 5 $5/$25, Sonnet 5 $3/$15 intro $2/$10 through 2026-08-31, Haiku 4.5 $1/$5 per MTok)