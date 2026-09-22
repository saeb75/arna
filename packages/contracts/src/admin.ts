import { z } from "zod";
import { CEFR_LEVELS, cefrLevelSchema, lessonKindSchema } from "./levels.js";

const CEFR_LEVELS_FOR_QUERY = CEFR_LEVELS;
import { lessonCoreSchema, sceneVariantSchema } from "./lessonLayers.js";
import { sessionPositionSchema, transcriptTurnSchema } from "./sessionResume.js";

/**
 * ADMİN PANELİ SÖZLEŞMELERİ — `GET /v1/admin/*` uçları.
 *
 * Panel yalnızca bu şemalardan geçen veriyi ekrana taşır (mobil kuralı: elle
 * response tipi yazılmaz). Katalog verisi kanonik İngilizcedir ve olduğu gibi
 * gösterilir — admin arayüzü kullanıcıya değil operatöre bakar.
 *
 * Yaprak modüllerden okur (`levels.ts`); `index.ts`'ten import etmez — index bu
 * dosyayı yeniden dışa aktardığı için aksi ilklenme döngüsü olurdu.
 */

/** Üç katmanın da paylaştığı durum akışı: generating → ready → published → retired (failed yan dal). */
export const LAYER_STATUSES = ["generating", "ready", "failed", "published", "retired"] as const;
export const layerStatusSchema = z.enum(LAYER_STATUSES);
export type LayerStatus = z.infer<typeof layerStatusSchema>;

/** Çekirdek veya sahne seti satırının panelde görünen özeti. */
export const adminLayerSchema = z.object({
  id: z.string().uuid(),
  status: layerStatusSchema,
  updatedAt: z.string(),
});
export type AdminLayer = z.infer<typeof adminLayerSchema>;

/**
 * Dil paketi özeti. `stale`: paketin `sourceHash`i, çekirdek+sahne+başlığın güncel
 * parmak iziyle tutmuyor — ders ilk açılışta yeniden üretilecek; panel bunu
 * turuncu işaretle gösterir ki operatör ısıtma script'ini koşabilsin.
 */
export const adminLocaleSchema = z.object({
  language: z.string().min(2),
  status: layerStatusSchema,
  stale: z.boolean(),
  updatedAt: z.string(),
});
export type AdminLocale = z.infer<typeof adminLocaleSchema>;

/** Katalog satırı + üç katmanın güncel (format/promptVersion/specHash tutan) durumu. */
export const adminLessonSchema = z.object({
  id: z.string(),
  level: cefrLevelSchema,
  unitIndex: z.number().int().min(1),
  unitTitle: z.string(),
  position: z.number().int().min(1),
  kind: lessonKindSchema,
  title: z.string(),
  focus: z.string(),
  targetPhrases: z.array(z.string()),
  /** null = bu katalog sürümü için hiç üretilmemiş */
  core: adminLayerSchema.nullable(),
  sceneSet: adminLayerSchema.nullable(),
  locales: z.array(adminLocaleSchema),
});
export type AdminLesson = z.infer<typeof adminLessonSchema>;

export const adminLessonsResponseSchema = z.object({
  lessons: z.array(adminLessonSchema),
  /** Sunucunun matrisi derlediği an — panel "son güncelleme" olarak gösterir */
  generatedAt: z.string(),
});
export type AdminLessonsResponse = z.infer<typeof adminLessonsResponseSchema>;

// ---------------------------------------------------------------------------
// Ders detayı — `GET /v1/admin/lessons/:id` ve TÜM mutasyon uçlarının dönüşü
// ---------------------------------------------------------------------------

/** Backend `LintReport` ile aynı şekil; şema burada ki panel doğrulayabilsin */
export const lintReportSchema = z.object({
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
});
export type LintReport = z.infer<typeof lintReportSchema>;

export const adminCoreDetailSchema = adminLayerSchema.extend({
  model: z.string().nullable(),
  /** null = satır var ama içerik yok (generating/failed) */
  core: lessonCoreSchema.nullable(),
  report: lintReportSchema.nullable(),
});
export type AdminCoreDetail = z.infer<typeof adminCoreDetailSchema>;

export const adminSceneDetailSchema = adminLayerSchema.extend({
  model: z.string().nullable(),
  scenes: z.record(z.string(), sceneVariantSchema).nullable(),
  report: lintReportSchema.nullable(),
});
export type AdminSceneDetail = z.infer<typeof adminSceneDetailSchema>;

export const adminLocaleDetailSchema = adminLocaleSchema.extend({
  id: z.string().uuid(),
  model: z.string().nullable(),
  report: lintReportSchema.nullable(),
});
export type AdminLocaleDetail = z.infer<typeof adminLocaleDetailSchema>;

export const adminLessonDetailSchema = z.object({
  /** Matristeki satırla aynı şekil — liste ve detay tek tipten okur */
  lesson: adminLessonSchema,
  catalog: z.object({ themeHint: z.string(), specHash: z.string() }),
  core: adminCoreDetailSchema.nullable(),
  sceneSet: adminSceneDetailSchema.nullable(),
  locales: z.array(adminLocaleDetailSchema),
});
export type AdminLessonDetail = z.infer<typeof adminLessonDetailSchema>;

/** `POST /admin/lessons/:id/core/lint` — kuru koşu, yazmaz */
export const adminCoreLintResponseSchema = z.object({ report: lintReportSchema });
export type AdminCoreLintResponse = z.infer<typeof adminCoreLintResponseSchema>;

/** `PUT /admin/lessons/:id/core` ve `POST .../core/lint` gövdesi */
export const adminCoreBodySchema = z.object({ core: lessonCoreSchema });

// ---------------------------------------------------------------------------
// TTS AYARLARI — `GET/PUT /v1/admin/settings/tts`, `POST .../preview`
// ---------------------------------------------------------------------------

/**
 * Tutor sesi sağlayıcısı. Seçim `app_settings.tts` satırında durur ve admin
 * panelden değişir; API ANAHTARLARI yalnız sunucu .env'inde kalır — bu şemada
 * anahtar alanı YOKTUR ve eklenmez (istemciye sızardı).
 */
export const TTS_PROVIDERS = ["elevenlabs", "inworld", "azure"] as const;
export const ttsProviderSchema = z.enum(TTS_PROVIDERS);
export type TtsProvider = z.infer<typeof ttsProviderSchema>;

/** Sağlayıcı başına ayar. `voiceId: null` = .env varsayılanı kullanılsın. */
export const ttsProviderConfigSchema = z.object({
  voiceId: z.string().trim().min(1).nullable(),
  modelId: z.string().trim().min(1),
});
export type TtsProviderConfig = z.infer<typeof ttsProviderConfigSchema>;

/**
 * `app_settings.tts` değerinin TAMAMI — okurken ve yazarken bu şemadan geçer.
 * Yeni sağlayıcı eklenince eski satırda anahtarı yoktur: okuyan taraf satırı
 * env varsayılanıyla BİRLEŞTİRİP parse eder (`settings.ts`), aksi hâlde eski
 * kayıt düşer ve sessizce varsayılana dönülürdü.
 */
export const ttsSettingsSchema = z.object({
  provider: ttsProviderSchema,
  elevenlabs: ttsProviderConfigSchema,
  inworld: ttsProviderConfigSchema,
  azure: ttsProviderConfigSchema,
});
export type TtsSettings = z.infer<typeof ttsSettingsSchema>;

/** Sağlayıcı → değer; `z.record` yerine açık nesne: her anahtarın gelmesi zorunlu. */
const perProvider = <T extends z.ZodTypeAny>(v: T) => z.object({ elevenlabs: v, inworld: v, azure: v });

/** Sağlayıcının yapabildikleri — panel rozet gösterir, gateway yolu seçer. */
export const ttsCapabilitiesSchema = z.object({
  /** Bir speak çağrısının TÜM dil parçaları TEK klipte (Azure SSML `<lang>`); değilse dil başına klip */
  multiLanguageClip: z.boolean(),
});
export type TtsCapabilities = z.infer<typeof ttsCapabilitiesSchema>;

export const adminTtsSettingsResponseSchema = z.object({
  settings: ttsSettingsSchema,
  /** Sağlayıcının anahtarı .env'de var mı — panel anahtarsızı seçtirmez */
  configured: perProvider(z.boolean()),
  /** .env'den gelen varsayılan ses (panelde "boş = şu kullanılır" ipucu) */
  defaultVoiceId: perProvider(z.string().nullable()),
  /** Panelde model select'i için izinli liste; TEK öğeyse panel alanı gizler (Azure'da model kavramı yok) */
  models: perProvider(z.array(z.string().min(1)).min(1)),
  capabilities: perProvider(ttsCapabilitiesSchema),
  /** Satır hiç yazılmamışsa null (env varsayılanı servis ediliyor) */
  updatedAt: z.string().nullable(),
});
export type AdminTtsSettingsResponse = z.infer<typeof adminTtsSettingsResponseSchema>;

/** Önizleme parçası: `language` BCP-47 (sunucu normalize edip sağlayıcı koduna çevirir). */
export const adminTtsPreviewRunSchema = z.object({
  language: z.string().trim().min(2).max(12),
  text: z.string().trim().min(1).max(300),
});

/**
 * Kaydetmeden dinleme: seçilen sağlayıcı/ses/modelle kısa metin. `runs` verilirse
 * ders akışının aynısı (karışık dil parçaları) çalınır — çok dilli tek klip
 * yeteneği burada kıyaslanır; yoksa tek `text` + `language`.
 */
export const adminTtsPreviewBodySchema = z.object({
  provider: ttsProviderSchema,
  voiceId: z.string().trim().min(1),
  modelId: z.string().trim().min(1),
  text: z.string().trim().min(1).max(300),
  /** BCP-47 (normalize edilir); varsayılan İngilizce */
  language: z.string().trim().min(2).default("en"),
  runs: z.array(adminTtsPreviewRunSchema).min(1).max(8).optional(),
});
export type AdminTtsPreviewBody = z.infer<typeof adminTtsPreviewBodySchema>;

/** Önizleme cevabı ders ucuyla aynı şekli taşır: klip listesi — panel sırayla çalar, sayısını gösterir. */
export const adminTtsPreviewResponseSchema = z.object({
  clips: z
    .array(
      z.object({
        /** mp3, base64 — istemci `data:audio/mpeg;base64,` ile çalar */
        audioBase64: z.string().min(1),
        /** Zaman damgası geldi mi — dudak senkronu bu sağlayıcıyla çalışır mı sorusunun cevabı */
        hasAlignment: z.boolean(),
      }),
    )
    .min(1),
  latencyMs: z.number().int().nonnegative(),
});
export type AdminTtsPreviewResponse = z.infer<typeof adminTtsPreviewResponseSchema>;

// ---------------------------------------------------------------------------
// KULLANICILAR — `GET /v1/admin/users`, `GET /v1/admin/users/:id` (salt okunur)
// ---------------------------------------------------------------------------

/**
 * Liste satırı: auth.users (e-posta, kayıt, son giriş, rol) + profil + sayaçlar.
 * Profil onboarding'de oluşur; `hasProfile: false` = kayıt olmuş, onboarding'i
 * bitirmemiş hesap. Sayaçlar kullanıcıya özel tablolardan toplanır.
 */
export const adminUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().nullable(),
  isAdmin: z.boolean(),
  createdAt: z.string(),
  lastSignInAt: z.string().nullable(),
  hasProfile: z.boolean(),
  displayName: z.string().nullable(),
  /** BCP-47, normalize — panel adını `Intl.DisplayNames` ile çözer, sabitlemez */
  nativeLanguage: z.string().nullable(),
  cefrLevel: cefrLevelSchema.nullable(),
  track: z.string().nullable(),
  tutorLanguage: z.string().nullable(),
  lessonsCompleted: z.number().int().nonnegative(),
  lessonsInProgress: z.number().int().nonnegative(),
  sessionCount: z.number().int().nonnegative(),
  lastSessionAt: z.string().nullable(),
  llmCostUsd: z.number().nonnegative(),
});
export type AdminUser = z.infer<typeof adminUserSchema>;

export const adminUsersResponseSchema = z.object({
  users: z.array(adminUserSchema),
  generatedAt: z.string(),
});
export type AdminUsersResponse = z.infer<typeof adminUsersResponseSchema>;

export const adminUserProgressSchema = z.object({
  catalogLessonId: z.string(),
  title: z.string(),
  level: cefrLevelSchema,
  kind: lessonKindSchema,
  status: z.enum(["in_progress", "completed"]),
  sessionCount: z.number().int().nonnegative(),
  firstStartedAt: z.string(),
  completedAt: z.string().nullable(),
});
export type AdminUserProgress = z.infer<typeof adminUserProgressSchema>;

/**
 * Oturum özeti — transkript turları ve `sessions.state` (hafıza bloğu, oturum
 * script'i) BURADA YOK ve eklenmez: sistem promptu istemciye asla gitmez.
 */
export const adminUserSessionSchema = z.object({
  id: z.string().uuid(),
  kind: z.string().nullable(),
  catalogLessonId: z.string().nullable(),
  lessonTitle: z.string().nullable(),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
  summary: z.string().nullable(),
  continuityHook: z.string().nullable(),
  errorsObserved: z.unknown().nullable(),
});
export type AdminUserSession = z.infer<typeof adminUserSessionSchema>;

export const adminUserMemorySchema = z.object({
  id: z.string().uuid(),
  kind: z.string(),
  text: z.string(),
  createdAt: z.string(),
});

export const adminUserCheckpointSchema = z.object({
  level: cefrLevelSchema,
  unitIndex: z.number().int(),
  score: z.number().int(),
  total: z.number().int(),
  createdAt: z.string(),
});

export const adminUserCostSchema = z.object({
  totalUsd: z.number().nonnegative(),
  last30dUsd: z.number().nonnegative(),
  byPurpose: z.array(z.object({ purpose: z.string(), calls: z.number().int().nonnegative(), usd: z.number().nonnegative() })),
});

export const adminUserDetailSchema = z.object({
  user: adminUserSchema,
  profile: z
    .object({
      occupation: z.string().nullable(),
      interests: z.array(z.string()),
      dailyGoalMinutes: z.number().int(),
    })
    .nullable(),
  progress: z.array(adminUserProgressSchema),
  /** Son 20 oturum, yeniden eskiye */
  sessions: z.array(adminUserSessionSchema),
  /** Son 30 hafıza gerçeği — öğrencinin kendi sözünden türer, salt okunur */
  memories: z.array(adminUserMemorySchema),
  checkpoints: z.array(adminUserCheckpointSchema),
  cost: adminUserCostSchema,
});
export type AdminUserDetail = z.infer<typeof adminUserDetailSchema>;

// ---------------------------------------------------------------------------
// OTURUMLAR — `GET /v1/admin/sessions`, `GET /v1/admin/sessions/:id` (salt okunur)
//
// Bug avı yüzeyi: transkriptin TAMAMI (script + chat satırları), pozisyon
// imleci, LLM çağrıları. `state.memoryBlock` ve `state.script` prompt
// malzemesidir — şemada YOK, sunucu seçmez.
// ---------------------------------------------------------------------------

export const SESSION_PHASES = ["lecture", "practice", "wrapup"] as const;

export const adminSessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  userEmail: z.string().nullable(),
  userName: z.string().nullable(),
  /** lesson | roleplay | null (eski oturumlar türsüz) */
  kind: z.string().nullable(),
  catalogLessonId: z.string().nullable(),
  lessonTitle: z.string().nullable(),
  level: cefrLevelSchema.nullable(),
  /** Roleplay slug — revizyon üzerinden */
  roleplayId: z.string().nullable(),
  /** Oturuma pinlenen değerler (`state`) */
  track: z.string().nullable(),
  tutorLanguage: z.string().nullable(),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
  durationSec: z.number().int().nonnegative().nullable(),
  /** `position` imleci — nerede kaldı / takıldı */
  phase: z.enum(SESSION_PHASES).nullable(),
  awaiting: z.string().nullable(),
  turnCount: z.number().int().nonnegative(),
  userTurnCount: z.number().int().nonnegative(),
  /** Sunucu LLM yolundan geçen turlar (`source=chat`) */
  chatTurnCount: z.number().int().nonnegative(),
  llmCalls: z.number().int().nonnegative(),
  llmCostUsd: z.number().nonnegative(),
  avgLatencyMs: z.number().int().nonnegative().nullable(),
  maxLatencyMs: z.number().int().nonnegative().nullable(),
  hasSummary: z.boolean(),
  /** `session_summaries.errors_observed` uzunluğu */
  errorCount: z.number().int().nonnegative(),
});
export type AdminSession = z.infer<typeof adminSessionSchema>;

/**
 * Query-string boolean. `z.coerce.boolean()` KULLANILMAZ: "false" metnini de true
 * yapar (boş olmayan string truthy) — canlıda liste varsayılan olarak yalnız hatalı
 * oturumları getirdi. Yalnız "true"/"1" (ya da gerçek true) açık sayılır.
 */
const queryBool = z
  .union([z.boolean(), z.string()])
  .transform((v) => v === true || v === "true" || v === "1")
  .default(false);

/** Sunucu tarafı sayfalama sorgusu — istemci ve route AYNI şemayı kullanır */
export const SESSION_SORTS = ["newest", "oldest", "longest", "costliest", "slowest"] as const;
export const SESSION_PAGE_SIZES = [25, 50, 100] as const;
export const adminSessionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().refine((n) => (SESSION_PAGE_SIZES as readonly number[]).includes(n), "page size").default(25),
  sort: z.enum(SESSION_SORTS).default("newest"),
  /** kullanıcı e-postası/adı, ders başlığı/slug'ı, roleplay slug'ı ya da oturum id'si (ilike) */
  q: z.string().trim().max(120).default(""),
  kind: z.enum(["all", "lesson", "roleplay"]).default("all"),
  status: z.enum(["all", "open", "ended"]).default("all"),
  level: z.enum(["all", ...CEFR_LEVELS_FOR_QUERY]).default("all"),
  onlyErrors: queryBool,
  onlyChat: queryBool,
});
export type AdminSessionsQuery = z.infer<typeof adminSessionsQuerySchema>;

/** Özet kartları — SÜZÜLMEMİŞ tüm oturumlar üzerinden */
export const adminSessionsStatsSchema = z.object({
  total: z.number().int().nonnegative(),
  open: z.number().int().nonnegative(),
  withErrors: z.number().int().nonnegative(),
  avgDurationSec: z.number().int().nonnegative().nullable(),
  totalCostUsd: z.number().nonnegative(),
});
export type AdminSessionsStats = z.infer<typeof adminSessionsStatsSchema>;

export const adminSessionsResponseSchema = z.object({
  sessions: z.array(adminSessionSchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  /** Süzülmüş toplam — sayfa sayısı bundan türer */
  total: z.number().int().nonnegative(),
  stats: adminSessionsStatsSchema,
  generatedAt: z.string(),
});
export type AdminSessionsResponse = z.infer<typeof adminSessionsResponseSchema>;

export const adminTranscriptTurnSchema = transcriptTurnSchema.extend({
  latencyMs: z.number().int().nullable(),
  createdAt: z.string(),
});
export type AdminTranscriptTurn = z.infer<typeof adminTranscriptTurnSchema>;

export const adminLlmCallSchema = z.object({
  id: z.number().int(),
  purpose: z.string(),
  model: z.string(),
  promptVersion: z.string().nullable(),
  inputTokens: z.number().int().nullable(),
  outputTokens: z.number().int().nullable(),
  costUsd: z.number().nonnegative(),
  latencyMs: z.number().int().nullable(),
  createdAt: z.string(),
});
export type AdminLlmCall = z.infer<typeof adminLlmCallSchema>;

export const adminSessionDetailSchema = z.object({
  session: adminSessionSchema,
  /** Şemadan geçmeyen (eski/bozuk) imleç null döner */
  position: sessionPositionSchema.nullable(),
  /** `state.practice.hitTurns` — hedef yapının üretildiği tur indeksleri */
  practiceHitTurns: z.array(z.number().int()),
  /** id artan — sohbet sırası */
  turns: z.array(adminTranscriptTurnSchema),
  summary: z
    .object({
      summary: z.string(),
      continuityHook: z.string().nullable(),
      errorsObserved: z.unknown().nullable(),
      createdAt: z.string(),
    })
    .nullable(),
  llmCalls: z.array(adminLlmCallSchema),
  /** Oturumun oynattığı katman sürümleri — "bozuk içeriği kim gördü" izi */
  layers: z.object({
    coreId: z.string().uuid().nullable(),
    sceneSetId: z.string().uuid().nullable(),
    localeId: z.string().uuid().nullable(),
  }),
});
export type AdminSessionDetail = z.infer<typeof adminSessionDetailSchema>;
