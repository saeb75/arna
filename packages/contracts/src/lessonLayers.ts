import { z } from "zod";
import { ACK_EN } from "./lessonFlow.js";

// ============================================================================
// KATMANLI DERS İÇERİĞİ — v7 mimarisi
//
// Monolitik LessonContent (v6) üç üretim katmanına ayrıldı:
//
//   ÇEKİRDEK (core)      %100 İngilizce pedagoji — ders başına BİR kere,
//                        dilden ve track'ten bağımsız, insan denetiminden geçer
//   SAHNE SETİ (scenes)  rol yapma varyantları — çekirdek başına 5 track, İngilizce
//   DİL PAKETİ (locale)  ana dilde anlatım — çekirdek+sahne başına dil başına,
//                        pedagojik İDDİA üretemez, yalnızca çekirdeği ANLATIR
//
// Sunucu üçünü chrome (statik arayüz metinleri) ile BİRLEŞTİRİR; istemci yine
// tek bir nesne (LessonContent v7) tüketir. Metinler dil etiketli parçalar
// (RichText) taşır: ekran `en` parçaları vurgular, TTS her parçayı kendi
// dilinde okur.
//
// TASARIM İLKESİ: ölçümü besleyen hiçbir alan (answers, options, mustUse,
// avatarOpening, örnek cümleler) dil paketinin ÇIKTI ŞEMASINDA YOKTUR.
// Çevirmen model bozamaz, çeviremez, düşüremez — koruma talimatla değil
// şemayla. (Bu kural `mustUse`'un iki canlı hatasından öğrenildi.)
// ============================================================================

export const CORE_FORMAT = 1;
export const L10N_FORMAT = 1;
export const SCENE_FORMAT = 1;

// ---------------------------------------------------------------------------
// RichText — dil etiketli metin parçaları (istemciye giden nihai biçim)
// ---------------------------------------------------------------------------

/**
 * `lang: "l1"` soyuttur — hangi dil olduğu birleşik içeriğin `nativeLanguage`
 * alanında BİR kez durur. Parçalar üç işi birden çözer: (1) ekranda İngilizce
 * ayrı stillenir, (2) TTS parçayı doğru language_code ile okur, (3) RTL
 * dillerde İngilizce <bdi> ile yalıtılır.
 */
export const textRunSchema = z.object({
  lang: z.enum(["en", "l1"]),
  text: z.string().min(1),
  /** Öğretilen kalıbın kendisi — ekranda vurgulanır (eski **bold** yerine) */
  emphasis: z.boolean().optional(),
});
export type TextRun = z.infer<typeof textRunSchema>;

export const richTextSchema = z.array(textRunSchema).min(1);
export type RichText = z.infer<typeof richTextSchema>;

/** Tek İngilizce parçadan RichText — İngilizce tutor modu ve kestirmeler için. */
export function en(text: string, emphasis?: boolean): TextRun {
  return emphasis ? { lang: "en", text, emphasis } : { lang: "en", text };
}
export function l1(text: string): TextRun {
  return { lang: "l1", text };
}

// ---------------------------------------------------------------------------
// Cevap eşleştirme — AnswerSpec
//
// `includes` tabanlı gevşek eşleşme yanlış pozitif üretiyordu ("did" cevabı
// "I didn't" içinde eşleşir; JS \b apostrofta yanılır). Eşleştirme artık
// alıştırma tipine ÖZEL ve deterministik.
// ---------------------------------------------------------------------------

export const answerSpecSchema = z.discriminatedUnion("kind", [
  /** Çoktan seçmeli: doğru şıkkın indeksi — metin eşleşmesi yok */
  z.object({ kind: z.literal("choice"), correctIndex: z.number().int().min(0) }),
  /** Boşluk doldurma: eksik parçanın tam (normalize) eşleşmesi */
  z.object({ kind: z.literal("token"), accepted: z.array(z.string().min(1)).min(1) }),
  /** Tam cümle söyleme: normalize cümle eşleşmesi, kısaltmalara açık tabloyla tolerans */
  z.object({
    kind: z.literal("utterance"),
    accepted: z.array(z.string().min(1)).min(1),
    contractionsAllowed: z.boolean().default(true),
  }),
]);
export type AnswerSpec = z.infer<typeof answerSpecSchema>;

/** Açık kısaltma tablosu — "rastgele substring toleransı" yerine bilinen eşdeğerler. */
const CONTRACTIONS: ReadonlyArray<readonly [string, string]> = [
  ["i am", "i'm"],
  ["you are", "you're"],
  ["he is", "he's"],
  ["she is", "she's"],
  ["it is", "it's"],
  ["we are", "we're"],
  ["they are", "they're"],
  ["is not", "isn't"],
  ["are not", "aren't"],
  ["was not", "wasn't"],
  ["were not", "weren't"],
  ["do not", "don't"],
  ["does not", "doesn't"],
  ["did not", "didn't"],
  ["have not", "haven't"],
  ["has not", "hasn't"],
  ["had not", "hadn't"],
  ["will not", "won't"],
  ["would not", "wouldn't"],
  ["cannot", "can't"],
  ["can not", "can't"],
  ["could not", "couldn't"],
  ["should not", "shouldn't"],
  ["i have", "i've"],
  ["you have", "you've"],
  ["we have", "we've"],
  ["they have", "they've"],
  ["i will", "i'll"],
  ["you will", "you'll"],
  ["he will", "he'll"],
  ["she will", "she'll"],
  ["we will", "we'll"],
  ["they will", "they'll"],
  ["i would", "i'd"],
  ["you would", "you'd"],
  ["he would", "he'd"],
  ["she would", "she'd"],
  ["we would", "we'd"],
  ["they would", "they'd"],
  ["there is", "there's"],
  ["there are", "there're"],
  ["that is", "that's"],
  ["what is", "what's"],
  ["let us", "let's"],
];

/** Küçük harf + noktalama sadeleştirme; apostrof KORUNUR (didn't ≠ didnt değil). */
export function normalizeUtterance(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9' ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Kısaltmaları tek kanonik biçime açar: "i'm" → "i am". */
export function expandContractions(s: string): string {
  let out = ` ${s} `;
  for (const [long, short] of CONTRACTIONS) {
    out = out.split(` ${short} `).join(` ${long} `);
  }
  return out.trim();
}

/**
 * Tip bazlı deterministik cevap eşleştirme. `choice` burada değerlendirilmez —
 * istemci şık indeksiyle bildirir (harf/numara/metin eşleşmesi istemcide).
 */
export function matchesAnswerSpec(input: string, spec: AnswerSpec): boolean {
  const said = normalizeUtterance(input);
  if (!said) return false;

  if (spec.kind === "choice") return false; // şık seçimi ayrı yoldan gelir

  if (spec.kind === "token") {
    // Eksik parça TAM eşleşmeli, ya da cümle içinde KELİME SINIRLARIYLA geçmeli.
    // Token dizisi eşitliği substring'in yaptığı yanlış pozitifi yapamaz:
    // "did" tokeni ["i","didn't"] dizisinde YOKTUR.
    const saidTokens = said.split(" ");
    return spec.accepted.some((a) => {
      const want = normalizeUtterance(a);
      if (said === want) return true;
      const wantTokens = want.split(" ");
      for (let i = 0; i + wantTokens.length <= saidTokens.length; i++) {
        if (wantTokens.every((t, j) => saidTokens[i + j] === t)) return true;
      }
      return false;
    });
  }

  // utterance: normalize tam cümle; istenirse kısaltma açılımıyla ikinci deneme
  const saidExpanded = expandContractions(said);
  return spec.accepted.some((a) => {
    const want = normalizeUtterance(a);
    if (said === want) return true;
    return spec.contractionsAllowed && saidExpanded === expandContractions(want);
  });
}

// ---------------------------------------------------------------------------
// ÇEKİRDEK — LessonCore (%100 İngilizce, ders başına bir, denetlenen katman)
// ---------------------------------------------------------------------------

const englishText = z.string().trim().min(1);
/** Niyet: hocanın ne SÖYLEYECEĞİ değil ne YAPACAĞI (prompt'a gider, ekrana değil) */
const intentSchema = z.string().trim().min(5).max(180);
const idSchema = z.coerce.string().min(1);

/**
 * Öğretim noktası — pedagojinin denetlenen özü.
 * `claimsEn` dersin İDDİALARIDIR ("Add -s to most verbs after he, she or it").
 * Dil paketi bu iddiaları anlatır; yeni iddia EKLEYEMEZ. İnsan incelemesi
 * claims + examples okur — 371 derste pedagojinin tamamı burada.
 */
export const teachingPointSchema = z.object({
  id: idSchema,
  /**
   * Öğretilen kalıbın/yapının KENDİSİ, söylendiği hâliyle: "all of a sudden",
   * "-s after he/she/it". Dil paketi anlatımda bunu ADIYLA anmak zorunda —
   * bu alan olmadan model kalıbı örnek cümlelerle dolaylı anıyor ya da
   * (dikey dilimde görüldü) süslü parantezli uydurma sözdizimi yazıyordu.
   * core_ref ile NOKTA KİMLİĞİ üzerinden referanslanır.
   */
  formEn: englishText.max(60),
  claimsEn: z.array(englishText.max(180)).min(1).max(4),
  examples: z.array(z.object({ id: idSchema, textEn: englishText.max(140) })).min(1).max(3),
});
export type TeachingPoint = z.infer<typeof teachingPointSchema>;

export const coreSayBeatSchema = z.object({
  id: idSchema,
  kind: z.literal("say"),
  intent: intentSchema,
});
export const coreAskBeatSchema = z.object({
  id: idSchema,
  kind: z.literal("ask"),
  purpose: z.enum(["readiness", "questions"]),
  intent: intentSchema,
});
export const coreTeachBeatSchema = z.object({
  id: idSchema,
  kind: z.literal("teach"),
  introIntent: intentSchema,
  points: z.array(teachingPointSchema).min(1).max(4),
});

export const exerciseFormatSchema = z.enum(["fill_blank", "mcq", "say_sentence"]);
export type ExerciseFormat = z.infer<typeof exerciseFormatSchema>;

/**
 * Alıştırma — YÖNERGE İÇERMEZ ("Fill in the blank:" chrome'dan format anahtarıyla
 * gelir; 371 derste 50 dilde aynı cümleyi yeniden üretmenin anlamı yok).
 * `item` öğrencinin gördüğü/duyduğu İngilizce madde; şıklar YALNIZCA `options`ta.
 */
export const coreExerciseBeatSchema = z.object({
  id: idSchema,
  kind: z.literal("exercise"),
  format: exerciseFormatSchema,
  item: englishText.max(200),
  options: z.array(englishText.max(120)).min(2).max(4).optional(),
  answerSpec: answerSpecSchema,
  /** Kabul edilir bir cevap örneği — ipucunun İngilizce gövdesi */
  exampleAnswer: englishText.max(120),
});

export const coreOpenResponseBeatSchema = z.object({
  id: idSchema,
  kind: z.literal("open_response"),
  /** İngilizce kalır: öğrenci İngilizce üretim yapacak, soru da İngilizce sorulur */
  question: englishText.max(200),
  rubric: z.object({
    mustUse: z.array(englishText.min(2)).min(1).max(3),
    criteria: englishText,
  }),
  exampleAnswer: englishText.max(140),
  maxAttempts: z.number().int().min(1).max(3).default(2),
});

export const coreBeatSchema = z.discriminatedUnion("kind", [
  coreSayBeatSchema,
  coreAskBeatSchema,
  coreTeachBeatSchema,
  coreExerciseBeatSchema,
  coreOpenResponseBeatSchema,
]);
export type CoreBeat = z.infer<typeof coreBeatSchema>;

/** Rol yapma ÖLÇÜM spec'i — sahne YOK (sahneler ayrı katman, track başına). */
export const corePracticeSpecSchema = z.object({
  /** Katalogdan gelir, üretimden sonra kodda üzerine yazılır — model üretmez */
  mustUse: z.array(z.string().trim().min(3).max(40)).min(1).max(5),
  minTargetUses: z.number().int().min(1).max(4).default(2),
  successCriteria: englishText,
  maxTurns: z.number().int().min(4).max(12).default(8),
});

export const coreQuizMcqSchema = z
  .object({
    id: idSchema,
    type: z.literal("mcq"),
    stem: englishText,
    options: z.array(englishText).min(3).max(5),
    correctIndex: z.number().int().min(0),
  })
  .refine((s) => s.correctIndex < s.options.length, { message: "correctIndex aralık dışı" })
  .refine((s) => new Set(s.options).size === s.options.length, { message: "şıklar benzersiz olmalı" });

export const coreQuizFillBlankSchema = z.object({
  id: idSchema,
  type: z.literal("fill_blank"),
  text: englishText,
  answers: z.array(z.array(englishText).min(1)).min(1),
});

export const coreQuizItemSchema = z.union([coreQuizMcqSchema, coreQuizFillBlankSchema]);

export const lessonCoreSchema = z.object({
  coreFormat: z.literal(CORE_FORMAT),
  topic: englishText,
  focus: englishText,
  objectives: z.array(englishText).min(2).max(3),
  communicationGoal: englishText,
  estMinutes: z.number().int().min(3).max(20),
  /** commonErrors YOK: dile özgü hata pedagojisi V1'de üretilmiyor; öğretmen
   *  düzeltmeyi öğrencinin GERÇEK hatasına göre canlıda yapar. */
  tutorNotes: z.object({
    target: englishText,
    correctionStyle: englishText,
  }),
  /** İngilizce özet — İngilizce tutor modunda doğrudan, native modda çeviri kaynağı */
  summary: englishText,
  lecture: z.object({ beats: z.array(coreBeatSchema).min(5).max(12) }),
  practice: corePracticeSpecSchema,
  quiz: z.array(coreQuizItemSchema).min(3).max(5).optional(),
});
export type LessonCore = z.infer<typeof lessonCoreSchema>;

// ---------------------------------------------------------------------------
// SAHNE SETİ — beş track'in rol yapma varyantları (İngilizce, atomik sürüm)
// ---------------------------------------------------------------------------

export const sceneVariantSchema = z.object({
  persona: z.object({
    name: englishText.max(40),
    /** İngilizce — tutorPrompt'a girer; L1 karşılığı dil paketinde */
    role: englishText.max(80),
    /** Serbest kısa ton — enum DEĞİL: "supportive" gibi meşru tonlar üretimi düşürüyordu */
    mood: z.string().trim().max(24).optional(),
    goal: englishText,
  }),
  /** İngilizce sahne tarifi — tutorPrompt bunu okur (L1 tarif dil paketinde) */
  scene: englishText.max(280),
  /** İngilizce: öğrencinin sahnedeki görevi */
  objective: englishText.max(240),
  avatarOpening: englishText.max(220),
});
export type SceneVariant = z.infer<typeof sceneVariantSchema>;

/** track → varyant. 5 track'in tamamının varlığını lint zorlar (şema değil). */
export const sceneSetSchema = z.object({
  sceneFormat: z.literal(SCENE_FORMAT),
  scenes: z.record(z.string(), sceneVariantSchema),
});
export type SceneSet = z.infer<typeof sceneSetSchema>;

// ---------------------------------------------------------------------------
// DİL PAKETİ — ana dilde anlatım (çekirdeği ANLATIR, iddia üretemez)
// ---------------------------------------------------------------------------

/**
 * Anlatım parçası: ya ana dilde metin ya çekirdek örneğine REFERANS.
 * İngilizce örneklerin metni burada YOKTUR — model kopyalayamaz, çeviremez,
 * bozamaz. Assembler ref'i çekirdekten çözüp `en` parçasına çevirir.
 */
export const localeRunSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("l1"), text: z.string().trim().min(1) }),
  z.object({ kind: z.literal("core_ref"), refId: z.string().min(1) }),
]);
export type LocaleRun = z.infer<typeof localeRunSchema>;

const l1Text = z.string().trim().min(1);

export const lessonLocalePackSchema = z.object({
  l10nFormat: z.literal(L10N_FORMAT),
  /** Ders listesinde ve ders kartında görünen ana-dil başlık */
  title: l1Text.max(120),
  theme: l1Text.max(160),
  summary: l1Text.max(400),
  /** teachingPoint.id → o noktanın ana dilde anlatımı (core_ref'li parçalar) */
  teachPoints: z.record(z.string(), z.object({ runs: z.array(localeRunSchema).min(1).max(12) })),
  /** track → sahnenin ana-dil tarifleri (ekran rozetleri) */
  scenes: z.record(
    z.string(),
    z.object({
      scenario: l1Text.max(240),
      userGoal: l1Text.max(240),
      personaRole: l1Text.max(80),
    }),
  ),
  /** quizItem.id → şık sırasına HİZALI ana-dil geri bildirimleri */
  quizFeedback: z.record(z.string(), z.array(l1Text.max(200))).optional(),
});
export type LessonLocalePack = z.infer<typeof lessonLocalePackSchema>;

// ---------------------------------------------------------------------------
// CHROME — statik arayüz metinleri (repo'da, dil başına bir dosya, LLM'siz)
// Kural: Emma'nın söylediği ya da akışı süren her SABİT metin buradadır.
// ---------------------------------------------------------------------------

export const chromeBundleSchema = z.object({
  /** BCP-47 (normalize) — "en" paketi mutlak son çare */
  language: z.string().min(2),
  labels: z.object({
    exerciseFillBlank: z.string(),
    exerciseMcq: z.string(),
    exerciseSaySentence: z.string(),
    hint: z.string(),
    practiceHint: z.string(),
    quizTitle: z.string(),
    /** Ünite sonu testinin madde yönergeleri — ana dilde */
    checkpoint: z.object({ mcq: z.string(), gap: z.string(), order: z.string() }),
  }),
  /** Akış sinyalleri — eskiden lessonFlow/istemcide hardcode'du (50 dilde kırılırdı).
   *  Boş OLABİLİR: İngilizce çekirdek onaylar lessonFlow.ACK_EN'de her dilde geçerli. */
  ack: z.object({
    yes: z.array(z.string()),
    no: z.array(z.string()),
    proceed: z.array(z.string()),
  }),
  /** Boş OLABİLİR: İngilizce çekirdek pes ifadeleri lessonFlow.SURRENDER_EN'de her dilde geçerli */
  surrender: z.array(z.string()),
  /** Script şablonları — {name}/{topic}/{scenario} enterpolasyonlu */
  script: z.object({
    greeting: z.string(),
    teachIntro: z.string(),
    askQuestions: z.string(),
    exercisesAnnounce: z.string(),
    practiceIntro: z.string(),
    inviteQuestion: z.string(),
    praise: z.array(z.string()).min(2),
    wrapup: z.string(),
    farewell: z.string(),
  }),
});
export type ChromeBundle = z.infer<typeof chromeBundleSchema>;

// ---------------------------------------------------------------------------
// v7 GÖRÜNÜM — istemcinin tükettiği birleşik nesne
// ---------------------------------------------------------------------------

export const CONTENT_FORMAT_V7 = 7;

export const viewTeachPointSchema = z.object({
  id: z.string(),
  /** Anlatım: native modda L1+en karışık, İngilizce modda claims+examples */
  runs: richTextSchema,
});

export const viewBeatSchema = z.discriminatedUnion("kind", [
  z.object({ id: z.string(), kind: z.literal("say") }),
  z.object({ id: z.string(), kind: z.literal("ask"), purpose: z.enum(["readiness", "questions"]) }),
  z.object({ id: z.string(), kind: z.literal("teach"), points: z.array(viewTeachPointSchema).min(1) }),
  z.object({
    id: z.string(),
    kind: z.literal("exercise"),
    format: exerciseFormatSchema,
    /** Yönerge (L1/EN) + madde (EN) birleşik — ekranda ve seste bu okunur */
    runs: richTextSchema,
    /** Ham İngilizce madde (eşleştirme/debug) */
    item: z.string(),
    options: z.array(z.string()).optional(),
    answerSpec: answerSpecSchema,
    hint: richTextSchema,
  }),
  z.object({
    id: z.string(),
    kind: z.literal("open_response"),
    runs: richTextSchema,
    rubric: z.object({ mustUse: z.array(z.string()), criteria: z.string() }),
    hint: richTextSchema,
    maxAttempts: z.number().int(),
  }),
]);
export type ViewBeat = z.infer<typeof viewBeatSchema>;

export const viewQuizItemSchema = z.union([
  z.object({
    id: z.string(),
    type: z.literal("mcq"),
    stem: z.string(),
    options: z.array(z.string()).min(3),
    correctIndex: z.number().int(),
    feedbackPerOption: z.array(z.string()).optional(),
  }),
  z.object({
    id: z.string(),
    type: z.literal("fill_blank"),
    text: z.string(),
    answers: z.array(z.array(z.string()).min(1)).min(1),
  }),
]);

export const lessonContentV7Schema = z.object({
  formatVersion: z.literal(CONTENT_FORMAT_V7),
  /** BCP-47 — `l1` parçalarının çözüldüğü dil; TTS ve `dir` kararı buradan */
  nativeLanguage: z.string().min(2),
  /** Öğretim dili: native ise L1 anlatım, english ise her şey İngilizce */
  tutorLanguage: z.enum(["native", "english"]),
  titleEn: z.string().min(1),
  title: z.string().min(1),
  topic: z.string().min(1),
  focus: z.string().min(1),
  theme: z.string().min(1),
  estMinutes: z.number().int(),
  summary: z.string().min(1),
  lecture: z.object({ beats: z.array(viewBeatSchema).min(1) }),
  practice: z.object({
    persona: z.object({ name: z.string(), role: z.string() }),
    scenario: z.string(),
    userGoal: z.string(),
    avatarOpening: z.string(),
    mustUse: z.array(z.string()).min(1),
    minTargetUses: z.number().int(),
    maxTurns: z.number().int(),
  }),
  quiz: z.array(viewQuizItemSchema).optional(),
  /** Akış sinyalleri + etiketler — istemci hardcode etmez, buradan okur */
  ui: z.object({
    ack: z.object({
      yes: z.array(z.string()),
      no: z.array(z.string()),
      proceed: z.array(z.string()),
    }),
    surrender: z.array(z.string()),
    labels: z.object({ hint: z.string(), practiceHint: z.string(), quizTitle: z.string() }),
  }),
});
export type LessonContentV7 = z.infer<typeof lessonContentV7Schema>;

// ---------------------------------------------------------------------------
// ASSEMBLER — saf birleştirici (mobil de aynısını kullanacak)
// ---------------------------------------------------------------------------

export interface AssembleInput {
  core: LessonCore;
  scene: SceneVariant;
  /** Sahnenin track anahtarı — dil paketindeki L1 sahne tarifini bulmak için */
  track: string;
  /** null → İngilizce tutor modu (dil paketi gerekmez) */
  pack: LessonLocalePack | null;
  chrome: ChromeBundle;
  nativeLanguage: string;
  titleEn: string;
}

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? `{${k}}`);
}

/** core_ref'leri çekirdekten çözer; bilinmeyen ref'i assembler DEĞİL lint yakalar. */
function resolveLocaleRuns(runs: LocaleRun[], examplesById: Map<string, string>): RichText {
  const out: TextRun[] = [];
  for (const r of runs) {
    if (r.kind === "l1") out.push({ lang: "l1", text: r.text });
    else {
      const text = examplesById.get(r.refId);
      if (text) out.push({ lang: "en", text, emphasis: true });
    }
  }
  return out;
}

function exerciseInstruction(format: ExerciseFormat, chrome: ChromeBundle): string {
  return format === "fill_blank"
    ? chrome.labels.exerciseFillBlank
    : format === "mcq"
      ? chrome.labels.exerciseMcq
      : chrome.labels.exerciseSaySentence;
}

export function assembleLesson(input: AssembleInput): LessonContentV7 {
  const { core, scene, pack, chrome } = input;
  const native = pack !== null;

  // core_ref hedefleri: örnek kimlikleri → cümle, NOKTA kimlikleri → formEn
  const examplesById = new Map<string, string>();
  for (const b of core.lecture.beats) {
    if (b.kind !== "teach") continue;
    for (const p of b.points) {
      examplesById.set(p.id, p.formEn);
      for (const ex of p.examples) examplesById.set(ex.id, ex.textEn);
    }
  }

  const beats: ViewBeat[] = core.lecture.beats.map((b): ViewBeat => {
    switch (b.kind) {
      case "say":
        return { id: b.id, kind: "say" };
      case "ask":
        return { id: b.id, kind: "ask", purpose: b.purpose };
      case "teach":
        return {
          id: b.id,
          kind: "teach",
          points: b.points.map((p) => ({
            id: p.id,
            runs: native
              ? resolveLocaleRuns(pack.teachPoints[p.id]?.runs ?? [], examplesById)
              : [
                  en(p.formEn, true),
                  ...p.claimsEn.map((c) => en(c)),
                  ...p.examples.map((ex) => en(ex.textEn, true)),
                ],
          })),
        };
      case "exercise": {
        const instruction = exerciseInstruction(b.format, chrome);
        return {
          id: b.id,
          kind: "exercise",
          format: b.format,
          runs: [
            native ? l1(instruction) : en(instruction),
            en(b.item),
          ],
          item: b.item,
          options: b.options,
          answerSpec: b.answerSpec,
          hint: [native ? l1(chrome.labels.hint) : en(chrome.labels.hint), en(b.exampleAnswer, true)],
        };
      }
      case "open_response":
        return {
          id: b.id,
          kind: "open_response",
          runs: [en(b.question)],
          rubric: b.rubric,
          hint: [native ? l1(chrome.labels.hint) : en(chrome.labels.hint), en(b.exampleAnswer, true)],
          maxAttempts: b.maxAttempts,
        };
    }
  });

  const l1Scene = pack?.scenes[input.track];

  return {
    formatVersion: CONTENT_FORMAT_V7,
    nativeLanguage: input.nativeLanguage,
    tutorLanguage: native ? "native" : "english",
    titleEn: input.titleEn,
    title: pack?.title ?? input.titleEn,
    topic: core.topic,
    focus: core.focus,
    theme: pack?.theme ?? scene.scene,
    estMinutes: core.estMinutes,
    summary: pack?.summary ?? core.summary,
    lecture: { beats },
    practice: {
      persona: {
        name: scene.persona.name,
        role: l1Scene?.personaRole ?? scene.persona.role,
      },
      scenario: l1Scene?.scenario ?? scene.scene,
      userGoal: l1Scene?.userGoal ?? scene.objective,
      avatarOpening: scene.avatarOpening,
      mustUse: core.practice.mustUse,
      minTargetUses: core.practice.minTargetUses,
      maxTurns: core.practice.maxTurns,
    },
    quiz: core.quiz?.map((q) =>
      q.type === "mcq"
        ? { ...q, id: String(q.id), feedbackPerOption: pack?.quizFeedback?.[q.id] }
        : { ...q, id: String(q.id) },
    ),
    ui: {
      // İngilizce çekirdek onaylar HER dilde geçerli (hedef dil İngilizce) —
      // chrome yalnız ana dile özgü ifadeleri ekler. SURRENDER_EN ile aynı ilke.
      ack: {
        yes: [...new Set([...ACK_EN.yes, ...chrome.ack.yes])],
        no: [...new Set([...ACK_EN.no, ...chrome.ack.no])],
        proceed: [...new Set([...ACK_EN.proceed, ...chrome.ack.proceed])],
      },
      surrender: chrome.surrender,
      labels: {
        hint: chrome.labels.hint,
        practiceHint: chrome.labels.practiceHint,
        quizTitle: chrome.labels.quizTitle,
      },
    },
  };
}

export { interpolate as interpolateTemplate };

// ---------------------------------------------------------------------------
// Şık permütasyonu
// ---------------------------------------------------------------------------

/**
 * DOĞRU ŞIK HEP İLK SIRADA OLAMAZ. Ölçülen bir külliyatta bu bir sızıntıdır:
 * yayınlanmış 208 MCQ'nun 201'i `correctIndex: 0` ile yazılmıştı (A1 156/156,
 * A2 45/45, B1 172/199) — "hep ilkini seç" stratejisi %97 doğru ediyordu.
 *
 * Düzeltme İÇERİKTE değil SERVİS ANINDA yapılır: elle indeks dağıtmak yalnız
 * elle yazılan seviyeleri kurtarır, üretilmiş B1'i ve gelecekteki her satırı
 * açıkta bırakırdı.
 *
 * Permütasyon TOHUMLA DETERMİNİSTİKTİR, rastgele değil. Sebep: `resolveLesson`
 * hem istemci içeriğini hem judge bağlamını besliyor ve bir oturumda birden çok
 * kez çağrılıyor; rastgele karıştırma iki çağrıyı ayrıştırıp judge'a YANLIŞ
 * şıkkı "doğru" diye söyletirdi. Aynı tohum → aynı dizilim, her yerde, durum
 * tutmadan. (Checkpoint ayrı: orada `correctIndex` istemciye gidiyor ve test
 * her istekte yeniden derleniyor, o yüzden orada rastgele karıştırma güvenli.)
 */
function seededRandom(seed: string): () => number {
  // FNV-1a → mulberry32: kısa, bağımlılıksız, platformlar arası aynı sonuç.
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Şıkları `seed`e göre karıştırır ve doğru şıkkın YENİ indeksini döndürür.
 * `order[i]` = yeni i. sıradaki şıkkın ESKİ indeksi — çağıran, şıkla aynı
 * hizada duran yan dizileri (dil paketindeki `quizFeedback` gibi) bununla
 * taşır. İki şıktan azsa dokunmaz.
 */
export function permuteChoices(
  seed: string,
  options: readonly string[],
  correctIndex: number,
): { options: string[]; correctIndex: number; order: number[] } {
  if (options.length < 2) return { options: [...options], correctIndex, order: options.map((_, i) => i) };
  const rand = seededRandom(seed);
  const order = options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  return {
    options: order.map((i) => options[i]!),
    correctIndex: order.indexOf(correctIndex),
    order,
  };
}
