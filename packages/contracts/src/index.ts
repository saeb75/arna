import { z } from "zod";

// ---------------------------------------------------------------------------
// Ortak sabitler
// ---------------------------------------------------------------------------

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export const cefrLevelSchema = z.enum(CEFR_LEVELS);
export type CefrLevel = z.infer<typeof cefrLevelSchema>;

/**
 * Ders tipi. Sabit müfredat kataloğunun ritmi buna dayanır: `grammar` yapı
 * öğretir, `phrases` işlevsel kalıp seti verir, `practice` yalnızca konuşturur.
 * Katalog lint'i 4'ten fazla ardışık `grammar` dersine izin vermez.
 */
export const LESSON_KINDS = ["phrases", "grammar", "practice"] as const;
export const lessonKindSchema = z.enum(LESSON_KINDS);
export type LessonKind = z.infer<typeof lessonKindSchema>;

/**
 * Katalog satırı kimliği — UUID DEĞİL, kalıcı metin slug ("a1-she-works-at-night").
 * Seed dosyası git'te okunabilir kalsın, URL anlamlı olsun diye böyle. İlerleme ve
 * içerik önbelleği bu kimliğe bağlıdır.
 */
export const catalogLessonIdSchema = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  .max(80);

export const TRACKS = ["business", "conversation", "exam"] as const;
export const trackSchema = z.enum(TRACKS);
export type Track = z.infer<typeof trackSchema>;

export const INTEREST_AREAS = [
  "technology",
  "business",
  "travel",
  "movies_tv",
  "music",
  "sports",
  "gaming",
  "food",
  "science",
  "health",
  "finance",
  "art_design",
  "fashion",
  "education",
  "news_politics",
  "nature",
] as const;
export const interestSchema = z.enum(INTEREST_AREAS);
export type Interest = z.infer<typeof interestSchema>;

// ---------------------------------------------------------------------------
// Onboarding
// ---------------------------------------------------------------------------

export const onboardingInputSchema = z.object({
  dailyGoalMinutes: z.union([z.literal(5), z.literal(10), z.literal(15)]),
  track: trackSchema,
  interests: z.array(interestSchema).min(1).max(8),
  occupation: z.string().trim().max(120).optional(),
  cefrLevel: cefrLevelSchema,
  displayName: z.string().trim().min(1).max(60),
  /**
   * Öğrencinin ANA DİLİ (BCP-47: "tr", "es", "ar", "zh"…). Hedef dil her zaman
   * İngilizce; ana dil kullanıcıdan kullanıcıya değişir ve tüm sunucu tarafı
   * metin üretimi buna göre parametriklenir. Asla belirli bir dile sabitlenmez.
   */
  nativeLanguage: z.string().trim().min(2).max(10).default("tr"),
});
export type OnboardingInput = z.infer<typeof onboardingInputSchema>;

// Not: `planLessonSchema` / `programPlanSchema` KALDIRILDI. Müfredat artık
// onboarding'de LLM'e ürettirilmiyor; repo'da versiyonlanan sabit katalogdan
// geliyor (apps/backend/src/curriculum/). Katalogun API şekli için aşağıdaki
// "Müfredat görünümü" bölümüne bak.

// ---------------------------------------------------------------------------
// Ders içeriği — iki faz: LECTURE (anlatım + alıştırma) → PRACTICE (roleplay)
// Ders bir SOHBET olarak akar; her beat bir/iki sohbet balonudur.
// ---------------------------------------------------------------------------

/**
 * TASARIM İLKESİ (v6): ders içeriği bir OYNATMA SCRIPT'İ değil, pedagojik sözleşmedir.
 *
 * - İçerik MALZEMEYİ taşır: ne öğretilecek, hangi soru sorulacak, hangi cevap kabul.
 *   Bu alanlar authored'dır (sadakat + lint + önbelleklenebilirlik).
 * - Hocanın AĞZINDAN ÇIKAN cümleler (selamlama, geçiş, övgü) içerikte DURMAZ;
 *   oturum açılışında öğrencinin adı ve hafızasıyla birlikte üretilir → sessionScript.
 * - İçerikte kullanıcıya özel hiçbir şey yoktur (isim yok) — bu sayede aynı içerik
 *   ileride kullanıcılar arasında paylaşılabilir.
 * - AKIŞ KONTROLÜ İÇERİKTE DEĞİLDİR: tur tavanı, faz geçişi, deneme sınırı,
 *   "soru sorduysa bekle" kuralları kodda yaşar ve derse göre değişmez.
 */
export const CONTENT_FORMAT = 6;

/** Niyet: hocanın ne SÖYLEYECEĞİ değil, ne YAPACAĞI. Tırnak içi cümle yasak. */
const intentSchema = z.string().trim().min(5).max(180);

/**
 * Beat kimliği. `coerce` KASITLI: model kimlikleri bazen "b1" gibi, bazen 1 gibi
 * SAYI olarak yazıyor ve sayı yazdığında iki şema denemesi de düşüp ders
 * "üretilemedi" oluyordu. Kimliğin metin olması bir sözleşme gereği; hangi metin
 * olduğu önemsiz (istemci onu yalnızca script'teki karşılığını bulmak için
 * kullanır). Modelin disiplinine bırakılacak bir kural değil.
 */
const beatBase = { id: z.coerce.string().min(1) };

/** Hoca konuşur; sesi bitince akış kendiliğinden ilerler. */
export const sayBeatSchema = z.object({
  ...beatBase,
  kind: z.literal("say"),
  /** ör. "praise the answer and announce that a few practice questions follow" */
  intent: intentSchema,
});

/** Hoca konuşur ve CEVAP BEKLER. */
export const askBeatSchema = z.object({
  ...beatBase,
  kind: z.literal("ask"),
  /**
   * readiness: selamlama + bugünün konusu + başlamaya hazır mı
   * questions: anlatımdan sonra sorusu var mı
   */
  purpose: z.enum(["readiness", "questions"]),
  intent: intentSchema,
});

/** Madde madde anlatım: kısa sesli giriş (niyet) + ekranda madde listesi (authored). */
export const teachBeatSchema = z.object({
  ...beatBase,
  kind: z.literal("teach"),
  /** Hocanın sesli girişinin NİYETİ */
  introIntent: intentSchema,
  /** Anlatım maddeleri — AUTHORED içerik, **kalın** vurgu kullanılabilir */
  points: z.array(z.string().min(1)).min(2).max(5),
});

/** Sohbet mesajı olarak sorulan alıştırma; öğrenci sesle/yazıyla cevaplar. */
export const exerciseBeatSchema = z.object({
  ...beatBase,
  kind: z.literal("exercise"),
  /** Soru metni — AUTHORED; boşluk doldurmada boşluk tam olarak ___ */
  prompt: z.string().min(1),
  /** Çoktan seçmeliyse şıklar (mesajda A) B) C) olarak gösterilir) */
  options: z.array(z.string().min(1)).min(2).max(4).optional(),
  /** Kabul edilen cevaplar (normalize edilmiş eşleşme — LLM'e gitmez) */
  answers: z.array(z.string().min(1)).min(1),
  /** "Inspire" ipucu: söyleyebileceği örnek cümle */
  hint: z.string().min(1),
});

/**
 * Açık uçlu üretim: "Have you ever worked with a remote team?" sorusuna
 * "Yes, I have." de doğru, "No, but I've worked with clients abroad." de doğru.
 * Böyle bir adım `answers[]` ile ölçülemez → rubrikle değerlendirilir (sunucuda).
 */
export const openResponseBeatSchema = z.object({
  ...beatBase,
  kind: z.literal("open_response"),
  /** Soru/görev metni — AUTHORED, İngilizce */
  prompt: z.string().min(1),
  rubric: z.object({
    /** Cevapta geçmesi beklenen yapı(lar) */
    mustUse: z.array(z.string().min(1)).min(1).max(3),
    /** Kabul ölçütü (İngilizce): "uses the target in a full sentence about themselves" */
    criteria: z.string().min(1),
  }),
  hint: z.string().min(1),
  /** Kaç denemeden sonra hoca doğrusunu söyleyip ilerler */
  maxAttempts: z.number().int().min(1).max(3).default(2),
});

export const lectureBeatSchema = z.discriminatedUnion("kind", [
  sayBeatSchema,
  askBeatSchema,
  teachBeatSchema,
  exerciseBeatSchema,
  openResponseBeatSchema,
]);
export type LectureBeat = z.infer<typeof lectureBeatSchema>;

export const practiceSchema = z.object({
  /** Faz geçişinin NİYETİ — cümleyi oturum script'i kurar */
  introIntent: intentSchema,
  persona: z.object({
    name: z.string().min(1),
    role: z.string().min(1),
    mood: z.string().optional(),
    /** Karakterin sahnedeki AMACI — "mood" tek başına sahneyi taşımıyor */
    goal: z.string().min(1),
  }),
  /** Senaryo — ana dilde (ekranda rozet olarak) */
  scenario: z.string().min(1),
  /** Öğrencinin hedefi — ana dilde */
  userGoal: z.string().min(1),
  /** Persona'nın ilk repliği (İngilizce, AUTHORED — sahne içeriği) */
  avatarOpening: z.string().min(1),
  /**
   * Öğrencinin roleplay'de AĞZINDAN ÇIKMASI beklenen kısa kalıplar —
   * "I think", "have you ever", "I'm getting used to" gibi, birebir söylenecek hâliyle.
   *
   * GRAMER TARİFİ DEĞİLDİR. Bu alan üç işi birden yapıyor: karaktere yön verir,
   * başarıyı ÖLÇER (metin eşleşmesiyle) ve öğrenciye ipucu olarak gösterilir.
   * "Present Simple for habits" gibi bir tarif yazılınca ölçüm hiç tetiklenmiyor,
   * "do" gibi bir kırıntı yazılınca her turda tetiklenip sahneyi kesiyordu.
   * Dersin ne öğrettiğinin TARİFİ `tutorNotes.target` ve `successCriteria`'da durur.
   */
  mustUse: z.array(z.string().trim().min(3).max(40)).min(1).max(5),
  /** Sahne kaç kez hedef yapıyı üretince başarılı sayılır (deterministik sayılır) */
  minTargetUses: z.number().int().min(1).max(4).default(2),
  /** Başarı ölçütü (İngilizce) — maxTurns "ne zaman biter"i söyler, bu "başardı mı"yı */
  successCriteria: z.string().min(1),
  maxTurns: z.number().int().min(4).max(12).default(8),
});
export type Practice = z.infer<typeof practiceSchema>;

// --- Ders sonrası İSTEĞE BAĞLI mini test ------------------------------------

export const quizMcqSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal("mcq"),
    stem: z.string().min(1),
    options: z.array(z.string().min(1)).min(3).max(5),
    correctIndex: z.number().int().min(0),
    feedbackPerOption: z.array(z.string()).optional(),
  })
  .refine((s) => s.correctIndex < s.options.length, {
    message: "correctIndex seçenek aralığının dışında",
  })
  .refine((s) => new Set(s.options).size === s.options.length, {
    message: "seçenekler benzersiz olmalı",
  });

export const quizFillBlankSchema = z.object({
  id: z.string().min(1),
  type: z.literal("fill_blank"),
  text: z.string().min(1),
  answers: z.array(z.array(z.string().min(1)).min(1)).min(1),
});

export const quizQuestionSchema = z.union([quizMcqSchema, quizFillBlankSchema]);
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;

/**
 * Derse ÖZEL pedagoji notları. Global politika (üslup, yanıt uzunluğu, düzeltme
 * yöntemi, hangi dilde konuşulacağı) buraya GİRMEZ — o tutorPrompt'ta sabittir.
 */
export const tutorNotesSchema = z.object({
  /** Öğrenciden koparılmak istenen tam yapı (İngilizce) */
  target: z.string().min(1),
  /** Bu yapıda bu ana dilin konuşmacılarının yaptığı tipik hatalar */
  commonErrors: z.array(z.string().min(1)).min(1).max(3),
  /** Hata görülünce nasıl düzeltilecek */
  correction: z.string().min(1),
});
export type TutorNotes = z.infer<typeof tutorNotesSchema>;

export const lessonContentSchema = z.object({
  /** Format sürümü — eski satırlar otomatik yeniden üretilir */
  formatVersion: z.literal(CONTENT_FORMAT),
  title: z.string().min(1),
  /** Öğretilen konu (kısa, İngilizce), ör. "get used to" */
  topic: z.string().min(1),
  /** Ders odağı (plandaki focus) */
  focus: z.string().min(1),
  /** Bağlam — ana dilde */
  theme: z.string().min(1),
  /** Ölçülebilir can-do hedefleri (İngilizce) */
  objectives: z.array(z.string().min(1)).min(2).max(3),
  /** Dersin iletişimsel amacı (İngilizce) */
  communicationGoal: z.string().min(1),
  estMinutes: z.number().int().min(3).max(20),
  tutorNotes: tutorNotesSchema,
  lecture: z.object({ beats: z.array(lectureBeatSchema).min(5).max(12) }),
  practice: practiceSchema,
  /** Kapanış özeti — ana dilde (tamamlanma ekranında) */
  summary: z.string().min(1),
  quiz: z.array(quizQuestionSchema).min(3).max(5).optional(),
});
export type LessonContent = z.infer<typeof lessonContentSchema>;

/**
 * lecture → practice → wrapup. Kapanışta hoca rol karakterinden ÇIKAR, dersi özetler
 * ve soru alır; ders yalnızca öğrenci "Dersi Bitir"e basınca biter (sayaçla değil).
 */
export type LessonPhase = "lecture" | "practice" | "wrapup";

// ---------------------------------------------------------------------------
// Oturum script'i — hocanın BU öğrenciye söyleyeceği cümleler
// Oturum açılışında bir kez üretilir (ad + hafıza + önceki ders ile),
// sessions.state'te saklanır. İçerikten AYRI: içerik kullanıcıdan bağımsızdır.
// ---------------------------------------------------------------------------

export const sessionScriptSchema = z.object({
  v: z.literal(1),
  /** beatId → hocanın o beat'te söyleyeceği cümle (say/ask/teach girişi) */
  beats: z.record(z.string(), z.string().min(1)),
  /** Practice fazına geçiş cümlesi */
  practiceIntro: z.string().min(1),
  /**
   * "Sorun var mı?" sorusuna öğrenci EVET dediğinde söylenen davet
   * ("Of course! What would you like to know?"). Sorusunu sorması beklenir.
   * Eski oturumlarda bulunmayabilir → istemci sabit bir yedeğe düşer.
   */
  inviteQuestion: z.string().min(1).optional(),
  /**
   * Kapanış: hoca karakterden çıkıp dersi bitirir — bugün ne öğrenildiğine dair tek
   * cümle + "sormak istediğin bir şey var mı?". Soru işaretiyle biter.
   */
  wrapup: z.string().min(1).optional(),
  /** Öğrenci "hayır" deyince söylenen kısa veda — soru İÇERMEZ (ders yine bitmez). */
  farewell: z.string().min(1).optional(),
  /** Doğru cevaplarda sırayla kullanılan kısa övgüler (LLM çağrısı yapılmaz) */
  praise: z.array(z.string().min(1)).min(2).max(6),
});
export type SessionScript = z.infer<typeof sessionScriptSchema>;

// ---------------------------------------------------------------------------
// Müfredat görünümü — SABİT katalog + kullanıcının ilerlemesi
//
// Katalog kullanıcıdan bağımsızdır ve tüm kullanıcılarda aynıdır; bu yanıt onu
// kullanıcının ilerlemesiyle birleştirip ünitelere gruplu döndürür. `title` ve
// `focus` KANONİK İNGİLİZCE'dir (bkz. catalogLessonIdSchema): katalog tek bir
// ana dile çivilenmemeli, ayrıca başlığın kendisi de öğrenme malzemesidir.
// Öğrenciye görünen ana-dil metni üretilen LessonContent'ten gelir.
// ---------------------------------------------------------------------------

export const lessonStatusSchema = z.enum(["not_started", "in_progress", "completed"]);
export type LessonStatus = z.infer<typeof lessonStatusSchema>;

export const curriculumLessonSchema = z.object({
  id: catalogLessonIdSchema,
  /** Seviye içindeki 1'den başlayan kesintisiz sıra */
  position: z.number().int().min(1),
  unitIndex: z.number().int().min(1),
  kind: lessonKindSchema,
  /** Kanonik İngilizce başlık */
  title: z.string().min(1),
  /** Öğretilen tek şey, İngilizce */
  focus: z.string().min(1),
  /** Satır YOKSA "not_started" — ilerleme tablosu seyrektir */
  status: lessonStatusSchema,
});
export type CurriculumLesson = z.infer<typeof curriculumLessonSchema>;

export const curriculumUnitSchema = z.object({
  index: z.number().int().min(1),
  title: z.string().min(1),
  /** Ünite sonunda öğrencinin yapabilecek olduğu şey (can-do) */
  goal: z.string().min(1),
  lessons: z.array(curriculumLessonSchema).min(1),
});
export type CurriculumUnit = z.infer<typeof curriculumUnitSchema>;

export const curriculumResponseSchema = z.object({
  level: cefrLevelSchema,
  /** Basamağın görünen adı: Beginner, Pre-Intermediate, … */
  label: z.string().min(1),
  track: trackSchema,
  units: z.array(curriculumUnitSchema),
  totals: z.object({
    lessons: z.number().int().min(0),
    completed: z.number().int().min(0),
  }),
});
export type CurriculumResponse = z.infer<typeof curriculumResponseSchema>;

// ---------------------------------------------------------------------------
// Ders akış makinesi — istemcilerin (web + mobil) paylaştığı deterministik kararlar
// ---------------------------------------------------------------------------

export * from "./lessonFlow.js";
