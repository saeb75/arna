import {
  bigserial,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  vector,
} from "drizzle-orm/pg-core";

// user_id her tabloda Supabase auth.users.id'dir (uuid). FK'yi auth şemasına
// kurmuyoruz (Supabase migration'larıyla çakışmasın); bütünlük uygulama katmanında.

export const userProfiles = pgTable("user_profiles", {
  userId: uuid("user_id").primaryKey(),
  displayName: text("display_name").notNull(),
  nativeLanguage: text("native_language").notNull().default("tr"),
  cefrLevel: text("cefr_level").notNull(), // A1..C1
  track: text("track").notNull(), // business | conversation | exam
  dailyGoalMinutes: integer("daily_goal_minutes").notNull().default(10),
  occupation: text("occupation"),
  interests: jsonb("interests").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const programs = pgTable(
  "programs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    track: text("track").notNull(),
    level: text("level").notNull(),
    status: text("status").notNull().default("generating"), // generating | ready | failed | archived
    generatedByModel: text("generated_by_model"),
    promptVersion: text("prompt_version"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("programs_user_idx").on(t.userId, t.status)],
);

export const programLessons = pgTable(
  "program_lessons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    programId: uuid("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    unitIndex: integer("unit_index"),
    unitTitle: text("unit_title"),
    kind: text("kind"), // phrases | grammar | practice
    title: text("title").notNull(),
    // Kolon adı tarihsel (grammar_focus) — anlamı artık tip-bazlı "focus"
    focus: text("grammar_focus").notNull(),
    /** @deprecated v1 plan yapısından miras; yeni satırlarda yazılmıyor */
    vocabTheme: text("vocab_theme"),
    theme: text("theme").notNull(),
    status: text("status").notNull().default("not_started"), // not_started | in_progress | completed
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("program_lessons_pos_idx").on(t.programId, t.position)],
);

export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    programLessonId: uuid("program_lesson_id")
      .notNull()
      .references(() => programLessons.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
    version: integer("version").notNull().default(1),
    status: text("status").notNull().default("generating"), // generating | ready | failed
    content: jsonb("content"), // LessonContent (@arna/contracts ile doğrulanır)
    validationReport: jsonb("validation_report"),
    model: text("model"),
    promptVersion: text("prompt_version"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("lessons_pl_ver_idx").on(t.programLessonId, t.version)],
);

// ---------------------------------------------------------------------------
// SABİT MÜFREDAT KATALOĞU
//
// Doğruluk kaynağı repo'daki src/curriculum/*.ts dosyalarıdır; bu iki tablo
// onun türetilmiş projeksiyonudur (scripts/seed-curriculum.ts yazar).
// Katalog kullanıcıdan, ana dilden ve track'ten BAĞIMSIZDIR — metinleri kanonik
// İngilizce'dir. Kimlikler UUID değil kalıcı slug: seed dosyası git'te
// okunabilir kalsın ve URL anlamlı olsun diye.
// ---------------------------------------------------------------------------

export const catalogUnits = pgTable(
  "catalog_units",
  {
    id: text("id").primaryKey(), // "a1-u03"
    level: text("level").notNull(), // A1..C2
    unitIndex: integer("unit_index").notNull(),
    title: text("title").notNull(),
    /** Ünite sonunda öğrencinin yapabilecek olduğu şey (can-do, İngilizce) */
    goal: text("goal").notNull(),
    /** active | retired — katalogdan çıkan satır SİLİNMEZ, emekliye ayrılır */
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("catalog_units_level_idx").on(t.level, t.unitIndex)],
);

export const catalogLessons = pgTable(
  "catalog_lessons",
  {
    id: text("id").primaryKey(), // "a1-she-works-at-night"
    unitId: text("unit_id")
      .notNull()
      .references(() => catalogUnits.id),
    /** Ünite üzerinden de bulunabilir; seviye listesi en sık sorgu olduğu için denormalize */
    level: text("level").notNull(),
    /** Seviye içinde 1'den başlayan kesintisiz sıra */
    position: integer("position").notNull(),
    unitIndex: integer("unit_index").notNull(),
    kind: text("kind").notNull(), // phrases | grammar | practice
    title: text("title").notNull(),
    focus: text("focus").notNull(),
    themeHint: text("theme_hint").notNull(),
    /**
     * Öğrencinin BİREBİR söyleyeceği kalıplar; practice.mustUse'a verilen değer
     * olarak geçer. Modelin uydurmasına bırakıldığında iki kez canlı hataya yol
     * açtı (gramer terimi → ölçüm hiç tetiklenmiyor, tek kelime → sahne erken
     * kapanıyor); artık katalogda ve lint denetiminde.
     */
    targetPhrases: jsonb("target_phrases").$type<string[]>().notNull().default([]),
    /**
     * Üretimi etkileyen alanların parmak izi (kind + focus + themeHint +
     * targetPhrases). İçerik önbellek anahtarının parçası: katalogda bir focus
     * düzeltilince hash değişir ve o ders kendiliğinden yeniden üretilir.
     */
    specHash: text("spec_hash").notNull(),
    status: text("status").notNull().default("active"), // active | retired
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("catalog_lessons_level_pos_idx").on(t.level, t.position),
    index("catalog_lessons_unit_idx").on(t.unitId),
  ],
);

/**
 * PAYLAŞIMLI ders içeriği. Aynı satır, aynı anahtarı taşıyan TÜM kullanıcılara
 * servis edilir — işin bütün gerekçesi bu. İçerik kullanıcıdan bağımsızdır
 * (lint isim sızıntısını yasaklar); kişiselleştirme oturum script'inde yapılır.
 *
 * DİKKAT: anahtarın altı kolonu da NOT NULL olmak ZORUNDA. Postgres unique
 * index'te NULL'ları birbirinden farklı sayar; anahtarın bir parçası claim
 * anında yazılmayıp sonra doldurulursa "tek üretim uçuşta" koruması sessizce
 * çöker ve aynı ders için N tane paralel LLM çağrısı gider.
 */
export const lessonContents = pgTable(
  "lesson_contents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    catalogLessonId: text("catalog_lesson_id")
      .notNull()
      .references(() => catalogLessons.id, { onDelete: "cascade" }),
    /** BCP-47 birincil alt etiket, küçük harf — normalizeNativeLanguage() ile */
    nativeLanguage: text("native_language").notNull(),
    /** Sahne varyantı: müfredat track'ten bağımsız, ama senaryolar track'e göre değişir */
    track: text("track").notNull(),
    specHash: text("spec_hash").notNull(),
    formatVersion: integer("format_version").notNull(),
    promptVersion: text("prompt_version").notNull(),
    status: text("status").notNull().default("generating"), // generating | ready | failed | retired
    content: jsonb("content"), // LessonContent (@arna/contracts ile doğrulanır)
    validationReport: jsonb("validation_report"),
    model: text("model"),
    /** Yalnızca denetim: üretimin faturasını kim ödedi. SAHİPLİK DEĞİL. */
    generatedForUserId: uuid("generated_for_user_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("lesson_contents_cache_key_idx").on(
      t.catalogLessonId,
      t.nativeLanguage,
      t.track,
      t.formatVersion,
      t.promptVersion,
      t.specHash,
    ),
    index("lesson_contents_lookup_idx").on(t.catalogLessonId, t.nativeLanguage, t.status),
  ],
);

/**
 * Kullanıcının ilerlemesi — SEYREK: satır yalnızca BAŞLANAN ders için açılır,
 * satırın yokluğu "not_started" demektir. Katalog 349 derse çıktığında her
 * kullanıcı için 349 satır kopyalamak yalnızca durum tutmak için olurdu.
 *
 * İlerleme katalog kimliğine bağlı olduğu için seviye değişimi ilerlemeyi
 * ETKİLEMEZ; "tamamladığın dersler kaybolmaz" sözü artık yapısal olarak doğru.
 */
export const lessonProgress = pgTable(
  "lesson_progress",
  {
    userId: uuid("user_id").notNull(),
    catalogLessonId: text("catalog_lesson_id")
      .notNull()
      .references(() => catalogLessons.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("in_progress"), // in_progress | completed
    sessionCount: integer("session_count").notNull().default(0),
    firstStartedAt: timestamp("first_started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.catalogLessonId] }),
    index("lesson_progress_user_idx").on(t.userId, t.updatedAt),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
    /** Müfredat yuvası — ilerleme bunun üzerinden işaretlenir, içerik sürümünden bağımsız */
    catalogLessonId: text("catalog_lesson_id").references(() => catalogLessons.id, {
      onDelete: "set null",
    }),
    /** Hangi paylaşımlı içerik satırı oynatıldı — "bozuk önbelleği kim gördü" sorusunu çözer */
    contentId: uuid("content_id").references(() => lessonContents.id, { onDelete: "set null" }),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    state: jsonb("state"),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const transcriptTurns = pgTable(
  "transcript_turns",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // user | assistant
    text: text("text").notNull(),
    /** lecture | practice — LLM'e yalnızca AYNI fazın geçmişi gönderilir (faz sızıntısı önlenir) */
    phase: text("phase"),
    latencyMs: integer("latency_ms"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("turns_session_idx").on(t.sessionId)],
);

/**
 * Öğrenci hakkında kalıcı, DERSTEN BAĞIMSIZ gerçekler — hoca her derste bunlardan
 * haberdar olur. Metin daima İNGİLİZCE ve 3. şahıs ("Works as a backend developer.")
 * çünkü tüketicisi prompt; öğrencinin ana dili ne olursa olsun format değişmez.
 * Dilbilgisi performansı BURAYA yazılmaz — o session_summaries.errors_observed'a gider.
 */
export const memories = pgTable(
  "memories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    kind: text("kind").notNull(), // fact | preference | goal | context
    text: text("text").notNull(),
    sourceSessionId: uuid("source_session_id").references(() => sessions.id, {
      onDelete: "set null",
    }),
    embedding: vector("embedding", { dimensions: 1536 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("memories_user_idx").on(t.userId, t.createdAt),
    // HNSW: ivfflat'in aksine eğitim verisi istemez, boş tabloda da kurulur
    index("memories_embedding_idx").using("hnsw", t.embedding.op("vector_cosine_ops")),
  ],
);

/** Oturum sonu çıkarımı: kısa özet + sonraki dersin açılışında kullanılacak kanca. */
export const sessionSummaries = pgTable(
  "session_summaries",
  {
    sessionId: uuid("session_id")
      .primaryKey()
      .references(() => sessions.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
    lessonTitle: text("lesson_title"),
    /** İngilizce 2-3 cümle */
    summary: text("summary").notNull(),
    /** İngilizce tek satır: "Ask how the demo for the fintech client went." */
    continuityHook: text("continuity_hook"),
    /** Gözlenen dil hataları (memories'e ASLA yazılmaz) */
    errorsObserved: jsonb("errors_observed"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("session_summaries_user_idx").on(t.userId, t.createdAt)],
);

export const llmCalls = pgTable(
  "llm_calls",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: uuid("user_id"),
    sessionId: uuid("session_id"),
    provider: text("provider").notNull(),
    model: text("model").notNull(),
    purpose: text("purpose").notNull(), // chat | plan_gen | lesson_gen | memory_extract | embedding
    promptVersion: text("prompt_version"),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    costUsd: numeric("cost_usd", { precision: 10, scale: 6 }),
    latencyMs: integer("latency_ms"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("llm_calls_user_idx").on(t.userId, t.createdAt)],
);
