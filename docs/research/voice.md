# Speakly Realtime Voice Stack — Research Report (2025–2026)

Scope: STT, TTS (with viseme/word-timing support for the Three.js ARKit avatar), speech-to-speech realtime APIs, pronunciation assessment, and a recommended end-to-end architecture with latency budget and per-lesson cost. Prices are published list prices as of mid-2026; all per-minute figures are audio minutes unless noted.

---

## 1. STT Options

| Provider / model | Streaming | Latency (partial → final) | Non-native accent accuracy | Word timestamps | Price |
|---|---|---|---|---|---|
| **Deepgram Nova-3** | Yes, WebSocket | ~150–300 ms partials; endpointing built in | Good; strong on noisy/real-world audio | Yes, per-word + confidence | **$0.0077/min streaming** PAYG ($0.462/hr), $0.0065/min on Growth ($4k+/yr prepay); billed per-second |
| **Deepgram Flux** (2025) | Yes | Built-in end-of-turn detection (semantic, not just VAD) — removes 200–400 ms of the turn-taking budget | Same family as Nova-3 | Yes | ~same tier as Nova-3 streaming |
| **AssemblyAI Universal-Streaming** | Yes, WebSocket | **~300 ms P50, immutable partials** (words never rewritten — good for live chat-bubble rendering) | Strong; marketed for voice agents | Yes | **$0.15/hr** ($0.0025/min) — billed on *session/connection* time, not audio; Universal-3.5 Pro Realtime $0.45/hr |
| **Gladia Solaria-1** | Yes | ~103 ms partials | **Best-in-class on accented speech** (benchmarked on CommonVoice/FLEURS); 100+ languages, code-switching | Yes | **$0.55/hr streaming** ($0.0092/min); async from $0.20–0.61/hr |
| **OpenAI Whisper / gpt-4o-transcribe** | Whisper: **no** (batch REST, 25 MB). gpt-4o-transcribe: streaming via Realtime transcription mode | Batch: 1–3 s per utterance; streaming mode ~300–500 ms | Good multilingual, but **hallucinates on silence/short clips** — dangerous for learner audio | Whisper: yes (verbose_json). | **$0.006/min** (whisper-1 and gpt-4o-transcribe); gpt-4o-mini-transcribe **$0.003/min** |
| **Azure STT (realtime)** | Yes, SDK/WebSocket | ~300 ms partials | Decent; tunable with custom models | Yes | **~$1/hr** ($0.0167/min) standard; needed anyway for Pronunciation Assessment (§4) |
| **Browser SpeechRecognition** | Yes (browser-native) | Fast | Poor/uncontrollable for non-native accents; Chrome→Google servers, Safari-only webkit variant, no Firefox, flaky on mobile webviews | No | **Free** |

**Notes for a language-learning app specifically:**
- You want **verbatim** transcription — several models silently "fix" learner grammar/disfluencies, which corrupts assessment. Deepgram and AssemblyAI both lean verbatim; LLM-based transcribers (gpt-4o-transcribe) normalize more aggressively.
- AssemblyAI's session-based billing is a trap for your use case: a 10-min lesson keeps the socket open 10 min even if the user speaks 4 min. Still cheapest at $0.025/session-10-min.
- Browser SpeechRecognition is acceptable only as a zero-cost fallback/offline-degradation path, never primary.

**Pick: Deepgram Nova-3 (or Flux for its native end-of-turn detection) primary; Gladia Solaria as accent-heavy fallback A/B; AssemblyAI if cost dominates.**

---

## 2. TTS Options (viseme/timestamp support is the deciding axis)

| Provider / model | TTFB latency | Word/char timestamps | **Viseme support** | Price |
|---|---|---|---|---|
| **Azure Neural TTS** | ~300 ms streaming | Yes (word boundary events) | **YES — native.** SDK `VisemeReceived` events: 22 viseme IDs with audio offsets, **or JSON blendshape frames — 55 ARKit-compatible blendshapes at 60 FPS** (`mstts:viseme type="FacialExpression"`) | **$16/1M chars** neural (500k/mo free); Neural HD $22/1M |
| **ElevenLabs Flash v2.5** | **~75 ms model latency** (~150–250 ms real-world); Turbo v2.5 ~250–300 ms, higher quality | **Yes — best-in-class**: `/stream/with-timestamps` REST and WebSocket `stream-input` both return `alignment` (`chars`, `char_start_times_ms`, `char_durations_ms`) interleaved with base64 audio chunks | Indirect: char timings → G2P → phoneme→ARKit-viseme map (client-side, deterministic) | Credit-based: Flash = 0.5 credits/char. Effective **~$50–100/1M chars** on Pro/Business plans, ~$0.05/1k chars via resellers; expensive tier |
| **OpenAI gpt-4o-mini-tts** | ~300–500 ms | No | No | **~$0.015/min audio out** ($0.60/1M text-in tokens + $12/1M audio-out tokens) ≈ $12–15/1M chars equivalent — cheapest |
| **Cartesia Sonic 3** | 40 ms claimed, **~188 ms P50 measured** | Yes (word timestamps via WebSocket API) | Indirect (same G2P mapping path as ElevenLabs) | 1 credit/char; effective **$5–37/1M chars** by plan (Scale $299/mo = 8M chars) |
| **PlayHT Play 3.0 mini** | ~200–300 ms | Yes | Indirect | Plan-based, opaque; ~$31/mo for 3M chars/yr on creator plans; API enterprise-quoted. Weakest offer here |
| **Deepgram Aura-2** | ~200 ms | No reliable timestamp API | No | $30/1M chars — only interesting if consolidating on Deepgram |

**Key fact for Speakly:** your avatar is already ARKit-blendshape-rigged. **Azure is the only TTS that emits ARKit blendshapes natively, synchronized to the audio stream, at no extra charge on top of $16/1M chars.** That eliminates an entire G2P/viseme-mapping subsystem. ElevenLabs is the premium-voice upgrade path: its char-level alignment is precise enough to drive your existing ARKit viseme map through a phonemizer (e.g. `phonemizer`/espeak-ng or a JS G2P) — more work, better voices.

**Pick: Azure Neural TTS primary (visemes native, cheap, 400+ voices). ElevenLabs Flash v2.5 as a paid-tier "premium voice" option driven by timestamp→viseme mapping.**

---

## 3. Speech-to-Speech Realtime APIs vs Cascaded

| | OpenAI Realtime (gpt-realtime-2.1) | Gemini Live | Cascaded STT→LLM→TTS |
|---|---|---|---|
| Latency to first audio | ~500–800 ms (best in class) | ~600–900 ms | 900–1,400 ms (achievable, see §5) |
| **Word timings / visemes** | **None.** Output transcript arrives as untimed deltas; lip-sync requires client-side audio analysis (amplitude/formant → visemes, e.g. wawa-lipsync, Mascot Bot SDK) — visibly lower fidelity than timed visemes | **None** (same problem) | **Full control** — Azure visemes or ElevenLabs alignment |
| Cost | $32/1M audio-in, $64/1M audio-out tokens (1 min user speech = 600 tokens, 1 min assistant = 1,200). Real-world measured: **$0.06–0.11/min** with prompt caching, **$0.18–0.46/min** without on long calls. Mini: $10/$20 → $0.02–0.05/min | Audio ~25 tokens/s; Flash-tier audio input ~$1–3/1M, output ~$12/1M tokens → roughly **$0.01–0.04/min**, cheapest realtime | **$0.02–0.06/min** all-in (§6) |
| Pedagogical control | Weak: hard to force lesson-step structure, deterministic exercise grading, mid-utterance translation, memory injection per turn; model "does its own thing" conversationally | Same weakness | **Strong**: you own every stage — inject memory facts into prompt, run lesson-engine state machine, branch to pronunciation drill, show word-level highlights from STT timestamps |
| Transcript for records/memory | Yes but async/approximate | Yes | Exact (it's the pipeline's own data) |

**Verdict: cascaded.** The realtime APIs' only advantage is ~300–500 ms latency — and they cost 2–5x, provide **no timing data for lip-sync** (your single hardest UI requirement), and fight the JSON-driven lesson engine you already have. Speech-to-speech is the right call for free-form "call a tutor" mode later, not for structured lessons; if added, use gpt-realtime-mini + audio-analysis lip-sync as a clearly-lower-fidelity mode.

---

## 4. Pronunciation Assessment

| Provider | Granularity | Delivery | Price |
|---|---|---|---|
| **Azure Pronunciation Assessment** | Accuracy/fluency/completeness/prosody at **phoneme, syllable, word, sentence** level; scripted *and* unscripted; miscue detection; IPA or SAPI phoneme sets | Same realtime STT WebSocket — **you get transcription + assessment in one call** | **Billed as standard STT (~$1/hr)** — no premium |
| **Speechace** | Per-phoneme + syllable, word stress, fluency, intonation; IELTS/TOEFL/CEFR score prediction (Premium) | REST, per-utterance | Basic **$40/mo** (5,000 × 15-s requests, $0.008/15 s overage); Pro $80/mo adds fluency; Premium $125/mo ($0.0125/15 s overage) adds grammar/vocab/task scoring |
| **ELSA API** | Phoneme-level, claims 95%+ accuracy on non-native speech; grammar/vocab feedback | REST | **Sales-gated, no public pricing** — procurement risk |

**Pick: Azure.** One vendor covers STT-for-assessment + TTS + visemes; assessment costs nothing beyond STT time; unscripted assessment means you can score free conversation, not just read-aloud drills. Speechace is the fallback if Azure's CEFR-fit scoring proves too shallow (Speechace's IELTS/CEFR prediction is genuinely better for level placement tests). Architecture note: run pronunciation assessment as a **parallel branch**, not in the hot path — send the same user audio buffer to Azure PA asynchronously while Deepgram handles the conversational turn; feedback renders 1–2 s later as a score chip on the user's chat bubble.

---

## 5. Recommended Architecture

### Topology
Client (Next.js + Three.js avatar) ⟷ **one multiplexed WebSocket** ⟷ Node.js Voice Gateway, which fans out to: Deepgram WS (STT), LLM streaming API, Azure Speech WS (TTS+visemes), Azure PA (async branch). Do **not** let the browser talk to vendors directly (key exposure, no server-side memory injection, CORS/latency variance).

### Data flow, one conversational turn
1. Client captures mic (AudioWorklet, 16 kHz PCM, 20 ms frames), runs local VAD (Silero via onnxruntime-web) for UI (mic pulse) and to gate upstream frames; frames stream to Gateway over WS (binary).
2. Gateway forwards frames to Deepgram Nova-3/Flux (`interim_results=true`, `smart_format=false` for verbatim, `endpointing` or Flux end-of-turn). Interim transcripts stream back to client → live user chat bubble.
3. On end-of-turn: Gateway simultaneously (a) fires user audio buffer to Azure PA (async scoring branch), (b) assembles LLM prompt: system prompt + lesson-engine state (current step JSON) + retrieved memory facts + rolling transcript, and calls the tutor LLM with streaming.
4. LLM tokens stream into a **sentence chunker** (split on sentence boundary or ~120 chars); first complete sentence goes to Azure TTS WS immediately while the LLM keeps generating.
5. Azure returns interleaved audio chunks + word-boundary events + **viseme/blendshape frames**; Gateway relays all three streams to client tagged with a turn ID.
6. Client plays audio via Web Audio (jitter buffer ~100 ms), drives ARKit morph targets from blendshape frames clocked against `AudioContext.currentTime`, renders tutor chat bubble word-by-word from word-boundary events (this is how you get Praktika-style karaoke text + lip-sync from one event stream).
7. Turn end: Gateway persists transcript + PA scores; a background job (separate LLM call, cheap model) extracts salient facts → memory store; lesson engine advances step.
8. Barge-in: local VAD detects user speech during playback → client ducks/stops audio, Gateway cancels in-flight LLM/TTS (abort controllers), truncates transcript at last spoken word (known from word-boundary events).

### Latency budget (end of user speech → first tutor audio, target <1.5 s)

| Stage | Budget |
|---|---|
| End-of-turn detection (Flux semantic / Deepgram endpointing 300 ms) | 250–400 ms |
| STT finalization (already streamed) | 50–150 ms |
| Memory retrieval (pre-fetched during user speech — **0 ms on hot path**) + prompt assembly | 10–30 ms |
| LLM time-to-first-sentence (fast model, streaming: TTFT 200–300 ms + one sentence ~300 ms) | 400–600 ms |
| TTS TTFB (Azure ~300 ms / ElevenLabs Flash ~150 ms) | 150–300 ms |
| Network + client jitter buffer | 100–150 ms |
| **Total** | **≈ 960–1,630 ms; ~1.1–1.3 s typical** |

Levers if over budget: gpt-realtime-mini-class or Haiku-class LLM, speculative "backchannel" fillers ("Mm-hm…") synthesized during LLM TTFT, pre-warmed TTS/STT sockets per session, co-locate Gateway with vendor regions (US-East).

### Cost per 10-min lesson (user speaks ~4 min, tutor ~4 min ≈ 3,600 chars, ~10 turns)

| Tier | STT | LLM | TTS | Pron. assess | **Total** |
|---|---|---|---|---|---|
| **Budget** (AssemblyAI $0.15/hr, small LLM, Azure TTS) | $0.025 | ~$0.02 | $0.058 | $0.067 (Azure, 4 min) | **≈ $0.17** |
| **Recommended** (Deepgram Nova-3, mid LLM, Azure TTS+visemes) | $0.077 | ~$0.05 | $0.058 | $0.067 | **≈ $0.25** |
| **Premium voice** (Deepgram + ElevenLabs Flash @ ~$60/1M chars) | $0.077 | ~$0.05 | $0.216 | $0.067 | **≈ $0.41** |
| **OpenAI Realtime (gpt-realtime-2.1, cached)** | — | bundled | — | +$0.067 (still need Azure PA) | **≈ $0.70–1.20** (up to $2–4.60 uncached) |
| **gpt-realtime-mini / Gemini Live** | — | bundled | — | +$0.067 | **≈ $0.30–0.60** |

Cascaded-recommended is ~3–4x cheaper than full Realtime API *and* is the only column that delivers timed visemes.

### Final recommendation
**Cascaded pipeline over a single WebSocket through a Node.js gateway: Deepgram Nova-3/Flux (STT, word timestamps, verbatim) → streaming fast LLM with sentence-chunked handoff → Azure Neural TTS emitting ARKit blendshape visemes natively → Azure Pronunciation Assessment on an async parallel branch.** ElevenLabs Flash v2.5 with `/stream/with-timestamps` + G2P viseme mapping as the premium-voice tier; browser SpeechRecognition only as a free degraded fallback; OpenAI Realtime mini reserved for a future unstructured "free talk" mode with audio-analysis lip-sync. Justification: it is the cheapest configuration that (a) meets the <1.5 s first-audio target, (b) natively feeds the existing ARKit avatar with 60 FPS timed blendshapes, (c) keeps the lesson engine, memory injection, and translation deterministic and server-controlled, and (d) collects exact transcripts + phoneme scores as first-class data for the long-term memory and curriculum-adaptation systems.

Sources: [Deepgram pricing](https://diyai.io/ai-tools/speech-to-text/deepgram-pricing-2026/), [Deepgram Nova-3 rates](https://convertaudiototext.com/blog/deepgram-nova-3-explained), [AssemblyAI pricing](https://www.assemblyai.com/pricing), [AssemblyAI Universal-Streaming](https://www.assemblyai.com/blog/introducing-universal-streaming), [AssemblyAI session billing](https://www.assemblyai.com/docs/faq/how-does-universal-streaming-session-based-pricing-work), [Gladia Solaria](https://www.gladia.io/blog/introducing-solaria-the-first-truly-universal-speech-to-text-model), [Gladia pricing](https://www.gladia.io/pricing), [Whisper API pricing](https://diyai.io/ai-tools/speech-to-text/openai-whisper-api-pricing-2026/), [OpenAI TTS pricing](https://texttolab.com/blog/openai-tts-pricing), [Azure TTS pricing](https://texttolab.com/blog/azure-text-to-speech-pricing), [Azure Speech pricing](https://azure.microsoft.com/en-us/pricing/details/speech/), [Azure Pronunciation Assessment docs](https://docs.azure.cn/en-us/ai-services/speech-service/how-to-pronunciation-assessment), [ElevenLabs models](https://elevenlabs.io/docs/overview/models), [ElevenLabs stream with timestamps](https://elevenlabs.io/docs/api-reference/streaming-with-timestamps), [ElevenLabs WebSocket TTS](https://elevenlabs.io/docs/api-reference/text-to-speech/v-1-text-to-speech-voice-id-stream-input), [ElevenLabs pricing](https://www.cekura.ai/blogs/elevenlabs-pricing), [Cartesia pricing](https://texttolab.com/blog/cartesia-pricing), [Cartesia Sonic benchmarks](https://www.leadlock.ai/blog/vapi-x-cartesia-ultra-realistic-voice-ai-with-sonic-2-0/), [OpenAI Realtime pricing math](https://www.layer3labs.io/guides/openai-realtime-api-pricing), [Realtime real-world costs](https://hackernoon.com/openai-realtime-api-pricing-in-2026-real-world-data-from-4000-measured-sessions), [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing), [Gemini audio tokens](https://the-rogue-marketing.github.io/google-gemini-tts-speech-audio-api-pricing-may-2026/), [Speechace API plans](https://www.speechace.com/api-plans/), [Speechace phoneme scoring](https://api-docs.speechace.com/features/scripted-activities/pronunciation-scoring), [ELSA API overview](https://www.getapp.com/emerging-technology-software/a/elsa-speech-recognition-api/), [TalkingHead lip-sync patterns](https://github.com/met4citizen/TalkingHead), [Realtime avatar lip-sync SDK](https://docs.mascot.bot/libraries/openai-realtime-api-avatar), [PlayHT plans](https://voice.ai/hub/tts/play-ht-pricing/)