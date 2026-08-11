# Speakly MVP — Technical Report

**Stack:** Next.js 16.3.0 (App Router, API route handlers), React 19.2.8, TypeScript 5, Tailwind 4, three.js 0.185 + @react-three/fiber 9.7 + drei 10.7 + postprocessing (N8AO 2.0). No database, no auth, no state library, no SDKs — all three AI providers are called with raw `fetch` from three thin route handlers. Everything else runs client-side.

---

## 1. Lesson definition & "engine"

**There is no lesson JSON schema and no step engine.** The entire lesson is four hardcoded constants in `src/lib/lesson.ts`:

- `STUDENT_NAME = "Saeb"` (the actual user's name, baked in)
- `LESSON_TITLE = "'To Be' Fiili (am, is, are)"`
- `SYSTEM_PROMPT` — a single English prompt string that encodes the full pedagogy: persona ("You are Emma, a warm and patient English teacher"), student profile (Turkish speaker, A1–A2), lesson plan ("Progress roughly: I am → you are → he/she/it is → we/they are → short quiz"), reply constraints (1–3 sentences, must end with exactly one question/exercise, no emojis/markdown/lists), error-correction and code-switching policy (understand Turkish, always answer in simple English).
- `KICKOFF_MESSAGE = "Start the lesson now."` — a hidden user message that triggers Emma's opening turn (never rendered in the transcript).

Lesson sequencing is therefore **entirely LLM-improvised inside one prompt**. There are no step types, no checkpoints, no progress tracking, no completion criteria, no scoring. The client state machine (`useLesson.ts`, §6) only orchestrates *turn-taking*, not curriculum.

The only structured JSON schema in the codebase is the **transcript format for the lipsync demo** (`src/lib/viseme.ts` → `parseTranscript`), used by the standalone demo page (`src/app/page.tsx`) and internally by the TTS path:

- **Word-based:** `{ words: [{ text, type?: "word"|"spacing"|..., start, end, speaker_id? }] }` (ElevenLabs Scribe / forced-alignment shape; non-`word` tokens skipped). Words are grouped into `Line`s broken at sentence-ending punctuation, speaker changes, 14 words, or 8 s span.
- **Chunk-based:** `{ chunks: [{ text, speaker?, timestamp: [start, end] }] }` (sentence-level; viseme durations are then distributed by weight across the whole sentence).

Public samples: `public/sample-words.json` (Scribe v2 output) and `public/sample-transcript.json` (two-speaker podcast chunks; the demo page can filter the timeline to one speaker so the avatar "listens" during the other's lines).

## 2. Chat pipeline

`src/app/api/chat/route.ts` — a 35-line proxy:

1. Client keeps the full message array in a ref: `[{system: SYSTEM_PROMPT}, {user: KICKOFF_MESSAGE}, ...all turns]` and POSTs it wholesale to `/api/chat` every turn.
2. Route calls **OpenAI Chat Completions** (`POST https://api.openai.com/v1/chat/completions`) — the legacy endpoint, not the Responses API — with **`model: "gpt-4o-mini"`, `temperature: 0.7`, `max_tokens: 220`**, key from `OPENAI_API_KEY`.
3. **No streaming.** The route awaits the full completion and returns `{ text }`; the client appends it to history and hands it to TTS. Non-2xx returns `{error}` with the upstream body truncated to 300 chars.

Pricing context (as of early 2026): gpt-4o-mini is $0.15/M input, $0.60/M output tokens — a lesson turn here is ~500–2,000 input tokens (history grows unboundedly, resent every turn, no summarization/truncation) + ≤220 output, i.e. well under $0.001/turn. Model is a generation behind (gpt-4.1-mini at $0.40/$1.60 and gpt-5-mini at ~$0.25/$2.00 are the current small-tier options); for this workload gpt-4o-mini is fine and cheapest, but the *no-streaming* choice is the real cost — it serializes full LLM latency before TTS can even start.

## 3. TTS pipeline & viseme production

`src/app/api/tts/route.ts`:

1. Client POSTs `{ text }` (Emma's full reply — one request per turn, no sentence chunking).
2. Route calls **ElevenLabs** `POST /v1/text-to-speech/{voiceId}/with-timestamps?output_format=mp3_44100_128` with **`model_id: "eleven_flash_v2_5"`**. Voice: `ELEVENLABS_VOICE_ID` env or hardcoded default **`21m00Tcm4TlvDq8ikWAM` (Rachel, stock voice)**.
3. Response: `audio_base64` (full MP3, base64 → +33% payload) + character-level alignment (`characters[]`, `character_start_times_seconds[]`, `character_end_times_seconds[]`). The route prefers `normalized_alignment` (aligned to the spoken, text-normalized string) over `alignment`.
4. **Client-side alignment → visemes** (`src/lib/alignment.ts` → `src/lib/viseme.ts`):
   - `alignmentToLine`: folds per-character timestamps into per-word `{text, start, end}` (whitespace splits words), producing one `Line` with `words[]`, timestamps relative to audio t=0 (matches `<audio>.currentTime` exactly).
   - `buildTimeline`: for each word, `wordToSegments` runs a **hand-written English grapheme→viseme ruleset** (no G2P, no phonemes): silent-final-e stripping, 4/3/2/1-letter digraph tables (`ough`, `tch/igh/ing/tio`, `th/sh/ch/ee/oo/ar`…), soft c/g, unknown→DD fallback, mapped onto the **15-viseme Oculus set** (`viseme_sil … viseme_U`). Consecutive identical visemes merge; per-viseme duration weights (vowels ~3× longer than plosives) distribute each word's real time window; inter-word gaps >90 ms insert silence frames, gaps >250 ms close a "speaking interval" (avatar drops to listening pose); a rate limiter (`thin`) drops the weakest consonants if visemes exceed 13–15/s to prevent mouth flicker.
   - Output `Timeline = { frames: [{t, d, v}], intervals: [[start,end]], duration }`, consumed per-render-frame via binary search (`indexAt`) against audio `currentTime`.

So: **timing is real (ElevenLabs character timestamps), mouth-shape identity is heuristic (spelling-based)**. A deliberate mitigation exists: jaw opening is driven by *actual audio RMS energy*, not the timeline (§5), so timing drift or wrong visemes never produce a mouth flapping in silence.

Pricing context: Flash v2.5 bills 0.5 credits/char. On the Creator plan ($22/mo, 100k credits) that's ~200k chars ≈ effectively ~$0.11/1k chars; Pro/Scale tiers push toward ~$0.05–0.075/1k. A 150-char lesson reply ≈ 75 credits ≈ $0.01–0.02. This is 5–10× the cost of Azure/Polly (§8).

## 4. STT pipeline

Client (`useLesson.ts`): push-to-talk via `MediaRecorder` — `getUserMedia({audio: {echoCancellation, noiseSuppression, autoGainControl}})`, mime negotiation `audio/webm;codecs=opus → audio/webm → audio/mp4` (iOS Safari produces mp4). Recordings <400 ms or <1,000 bytes rejected client-side. The blob is named with the **extension matching its real MIME** (`speech.mp4` etc.) because OpenAI infers format from filename — a documented iOS-Safari fix in the code comments.

`src/app/api/stt/route.ts`: forwards the file as multipart to `POST https://api.openai.com/v1/audio/transcriptions` with **`model: "gpt-4o-mini-transcribe"`** (~$0.003/audio-minute; ≈2× cheaper than whisper-1's $0.006/min and more robust). No language hint, no prompt biasing, no word timestamps requested (not needed — user speech isn't lipsynced). Returns `{ text }`.

## 5. 3D avatar (`src/components/AvatarScene.tsx`, ~1,020 lines — the bulk of the app)

**Assets:** GLB avatars in `public/` loaded with `useGLTF` + **local Draco decoders** (`/draco/`, avoiding drei's gstatic CDN default). Primary model is **"Fat Man"** (`fatman.glb`, 26 MB, purchased; per user memory it is the permanent main avatar): ARKit-52 blendshapes + 12 emotion morphs (`Joy` used), Auto-Rig Pro skeleton (`headx`, `spine_01x`, GLTFLoader strips dots from `head.x`), and **22 embedded single-frame pose clips**. Five secondary avatars (ReadyPlayerMe-style Mixamo skeletons, Avaturn, AvatarSDK, VRoid) carry Oculus viseme morphs; `model.glb` (Avaturn T1) has no face morphs at all — lipsync dead, excluded from the lesson page picker. RPM shut down Jan 2026 (code comment), hence all-local files.

**Morph plumbing:** a `morphMap` indexes every morph name → all `(mesh, index)` pairs (faces are often split across meshes). Alias resolution handles unprefixed Oculus names (`aa`, `ih/oh/ou` → `viseme_I/O/U`). Per frame, all writers accumulate into a goal map with **max semantics** (smile vs viseme vs round channel never sum/exaggerate), previously-touched morphs missing this frame are zeroed, then one flush writes `morphTargetInfluences`.

**Two lipsync backends:** if the model has Oculus viseme morphs, the 15 smoothed weights write directly; otherwise (`Fat Man`) each viseme expands through `src/lib/arkitVisemes.ts` — a curated table mapping each Oculus viseme to an ARKit blendshape combo (e.g. PP → `mouthClose 1.0 + mouthPress 0.6 + mouthRoll 0.15`; TH → `tongueOut 0.65`). Jaw is deliberately excluded from the table.

**Audio-driven jaw:** an `AnalyserNode` (fftSize 1024) on the single `<audio>` element yields RMS; a slow-decay peak tracker auto-calibrates to MP3 loudness; an envelope with fast attack (k=30)/slow release (k=9) drives `jawOpen = VISEME_JAW[viseme] × energy`, and a `gate = smoothstep(0.05, 0.32, env)` also scales viseme intensity (`shape = 0.4 + 0.6·gate`) — mouth closes during real pauses even if the text-derived timeline drifts.

**Animation/pose system:**
- Fat Man: bind pose is T-pose; `Pose_19` (arms at sides) is baked by sampling a one-shot `AnimationMixer` to its final frame; a pose-cycle mixer crossfades between configured poses every 9–17 s (currently the list holds only Pose_19, so it's static). A hard-won lesson (documented in comments + user memory): three.js `PropertyMixer` skips writing unchanged values on single-frame clips, so procedural bone offsets are **applied additively and explicitly undone at the start of every frame** to prevent cumulative skeleton warping.
- `aimFace`: pose clips leave the head ~12° down/23° sideways; each frame the head-bone's bind-pose forward axis is measured in world space and partially slerped toward camera-forward, split neck 0.35 / head 0.8 so it doesn't look decapitated.
- Other avatars: no embedded animations; a procedural rest pose rotates arms down via `setFromUnitVectors` aiming (with a special path for Auto-Rig Pro's *sibling* — not parented — arm/forearm/hand chain), and a **Mixamo `idle.fbx`** clip can be retargeted (strip `mixamorig` prefix, drop Head/Neck and all position tracks). The lesson page passes `animate={false}`, so the Mixamo clip is only used on the demo page.
- Procedural life layers, all blended by a continuous `talking` envelope: multi-sine `wobble` head/spine/hip sway, breathing (1.35 rad/s) on spine/shoulders/hips-Y, damped-spring nods **only while listening**, gaze saccades (eye-look ARKit morphs; head lags eyes via slow follow; no glancing away while speaking), single/double blinks, brow wobble + nod-coupled emphasis, baseline smile (halved when a `Joy` morph carries the load, capped ~0.16 to avoid viseme conflicts). Co-articulation: from 45% through each viseme frame, the next viseme pre-blends at up to 0.5 weight; closing rates (k=32) exceed opening (k=24) so lip closures read crisply.

**Rendering:** fixed camera (fov 28, no orbit controls) auto-framed to the measured world position of the head bone; PMREM studio environment baked once from four `Lightformer`s (no HDRI fetch); shadow-casting key light (2048² map, normal-bias acne fix for double-sided materials); `ContactShadows`; `PhotoBackdrop` billboards `bg.png` cover-fitted behind the character; post chain = N8AO (full-res, high) → Bloom → Vignette → **ACES tone mapping at the end of the composer** (renderer tone mapping is disabled by the composer — required or output goes linear/washed); `dpr={2}` hardcoded, `antialias:false` + 8× MSAA on the composer. Max anisotropy forced on all textures; skinned meshes `frustumCulled=false`.

## 6. Client state management

No store library. One hook, `src/lib/useLesson.ts`, owns a **7-state FSM**: `gate → starting → idle ⇄ listening → transcribing → thinking → speaking → idle`. React state: `status`, `turns` (render transcript; last 3 shown), `error`, `timeline`, `subtitle`. Everything else is refs: OpenAI message history, `MediaRecorder`/stream/chunks, mic-permission promise, blob URL, and a **generation counter for barge-in** — pressing the mic during Emma's speech pauses audio, clears the timeline, bumps `gen`, and any in-flight chat/TTS response with a stale `gen` is silently dropped. Autoplay policy is defused by "blessing" a single reused `<audio>` element with a synthesized 50 ms silent WAV inside the Start-button gesture; the same element feeds the `AnalyserNode` chain. `press()` is fully synchronous in the pointer gesture; a `pressed` flag + stored promise handles release-before-permission races. `getTime()`/`getLevel()` are passed into the R3F frame loop — audio-clock-driven, so lipsync survives React re-renders and tab jank. State is per-tab and volatile: **refresh loses the entire lesson**.

## 7. Hardcoded / limitations / tech debt (what a real backend must replace)

1. **Open, unauthenticated proxy routes.** `/api/chat`, `/api/tts`, `/api/stt` have no auth, rate limiting, origin checks, or spend caps — deployed as-is, anyone can drain the ElevenLabs/OpenAI accounts. Highest-severity item.
2. **No lesson model.** Student name, title, curriculum, and language pair live in one prompt string. A backend needs: lesson catalog (structured steps/objectives), per-user session persistence, progress/completion tracking, and server-side prompt assembly (the system prompt is currently shipped to the client and sent up with every request — user-tamperable).
3. **Unbounded, client-owned history** resent every turn; no truncation/summarization, no server-side conversation store.
4. **Zero streaming, fully serial latency stack**: record → STT (~0.5–1 s) → full chat completion (~1–2 s) → full TTS synthesis + base64 download (~1–3 s) before the first audio sample plays. Perceived response gap is easily 3–6 s.
5. **Spelling-based viseme heuristic**, English-only, character-alignment (not phoneme) sourced; `normalized_alignment` text can diverge from display text; no support for the student's L1 audio.
6. **Hardcoded providers/voices**: Rachel voice ID, `eleven_flash_v2_5`, `gpt-4o-mini`, `max_tokens: 220` (truncation risk mid-sentence → TTS speaks a cut-off reply).
7. **Asset debt**: ~130 MB of GLB/FBX in `public/` including duplicates (`fatman.glb` = "Fat Man Character GLB.glb", `model.glb` = `model-animated.glb`) and unused experiments; 26–32 MB uncompressed hero models (no meshopt/KTX2), all uncommitted in git.
8. **No safety/quality rails**: no moderation, no telemetry, no error tracking, no tests, no input validation library; error strings are Turkish and leak upstream API bodies (truncated) to the client. `dpr=2` + full-res N8AO is heavy for low-end phones.

## 8. Backend recommendations (with early-2026 pricing; verify before budgeting)

**Latency (do first, keeps all current providers):** stream Chat Completions (`stream:true`), split on sentence boundaries, and switch TTS to the **ElevenLabs WebSocket streaming endpoint** (`/v1/text-to-speech/{voice}/stream-input`), which emits audio chunks *with per-chunk character alignment* — the existing `alignmentToLine → buildTimeline` code needs only incremental feeding. This alone cuts perceived response time from ~4–6 s to ~1–1.5 s with no visual regression.

**TTS cost/viseme quality:** the standout alternative is **Azure AI Speech TTS** (~$15/1M chars ≈ $0.015/1k, ~7× cheaper than ElevenLabs Creator-tier effective rate): its SDK emits **viseme events using the Oculus/Azure 22-viseme ID set with exact audio offsets**, which map nearly 1:1 onto `VISEME_MORPHS` — this would delete the entire grapheme-heuristic layer (`wordToVisemes`, digraph tables) and make lipsync phoneme-accurate, including for non-English. Amazon Polly (neural $16/1M chars, viseme speech marks) is the comparable AWS option but with weaker voice quality. Trade-off: ElevenLabs voices are noticeably more natural; Azure's latest neural/HD voices are close enough for a teaching persona.

**STT:** keep `gpt-4o-mini-transcribe` (~$0.003/min) for push-to-talk, or move to **Deepgram Nova-3 streaming** (~$0.005–0.008/min) if you later want live partial transcripts/VAD-based hands-free turns. Groq-hosted Whisper large-v3-turbo (~$0.04/hour) is the budget batch option.

**Speech-to-speech (OpenAI Realtime API, `gpt-realtime`, audio ~$32/M input, $64/M output tokens ≈ roughly $0.10–0.30/conversation-minute):** lowest latency and best conversational feel, but it returns *audio only* — no character/phoneme alignment — so the viseme timeline would have to fall back to pure RMS-driven mouth (which this codebase's jaw channel already supports, but shape identity would be lost). Not recommended while the differentiator is the lipsynced avatar.

**Recommended target architecture:** keep the STT→LLM→TTS cascade; move it server-side behind an authenticated WebSocket session (persist lesson state + history in Postgres/Redis keyed by user); stream LLM sentences into **Azure TTS with viseme events** (primary, for cost + phoneme-true visemes) or ElevenLabs WS (premium voice tier); define a real lesson JSON (steps, target phrases, pass criteria evaluated server-side from the STT transcript) so pedagogy stops being an LLM vibe and becomes checkable state. The client's viseme/avatar runtime (`AvatarScene.tsx`, `viseme.ts` Timeline contract) is genuinely solid and can be kept unchanged — only the *producer* of `Timeline` frames should move from the spelling heuristic to provider viseme/phoneme events.

**Key files:** `/Users/saebjafari/Desktop/speakly/src/lib/lesson.ts`, `src/lib/useLesson.ts`, `src/lib/viseme.ts`, `src/lib/alignment.ts`, `src/lib/arkitVisemes.ts`, `src/components/AvatarScene.tsx`, `src/app/api/{chat,tts,stt}/route.ts`, `src/app/lesson/page.tsx`, `src/app/page.tsx` (standalone lipsync demo/debug harness).