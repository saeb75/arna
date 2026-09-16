import { sql } from "drizzle-orm";
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
  cefrLevel: text("cefr_level").notNull(), // A1..C2
  track: text("track").notNull(), // everyday | work | travel | academic | exam (konuşma bağlamı)
  /** native → Emma açıklamaları öğrencinin dilinde yapar; english → tam daldırma */
  tutorLanguage: text("tutor_language").notNull().default("native"),
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

// ---------------------------------------------------------------------------
// KATMANLI İÇERİK (v7) — İngilizce çekirdek + sahne seti + dil paketi
//
// Monolitik `lesson_contents` (v6) yerini üç katmana bırakıyor. Pedagojik
// doğruluk YALNIZCA çekirdekte denetlenir (371 satır, insan onayı); sahne ve
// dil katmanları cevapları/akışı değiştiremez. Servis üçünü chrome ile
// birleştirir; istemci tek nesne görür.
//
// ORTAK KURAL: her tablonun unique anahtar kolonlarının TAMAMI NOT NULL ve
// claim eden INSERT tarafından yazılır — Postgres unique index'te NULL'ları
// farklı sayar, geç yazılan kolon "tek üretim uçuşta" korumasını sessizce çökertir.
// ---------------------------------------------------------------------------

/**
 * Pedagojik çekirdek — ders başına BİR satır, dilden ve track'ten bağımsız.
 * status akışı: generating → ready → (insan incelemesi) → published → retired.
 * YALNIZCA `published` servis edilir ve istek anında ASLA üretilmez —
 * ilk kullanıcı hiçbir zaman yayın öncesi denek olmaz.
 */
export const lessonCores = pgTable(
  "lesson_cores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    catalogLessonId: text("catalog_lesson_id")
      .notNull()
      .references(() => catalogLessons.id, { onDelete: "cascade" }),
    coreFormat: integer("core_format").notNull(),
    promptVersion: text("prompt_version").notNull(),
    /** Katalog satırının üretimi etkileyen alanlarının parmak izi */
    specHash: text("spec_hash").notNull(),
    status: text("status").notNull().default("generating"), // generating | ready | failed | published | retired
    core: jsonb("core"), // LessonCore (@arna/contracts)
    validationReport: jsonb("validation_report"),
    model: text("model"),
    generatedForUserId: uuid("generated_for_user_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("lesson_cores_key_idx").on(t.catalogLessonId, t.coreFormat, t.promptVersion, t.specHash),
    index("lesson_cores_lookup_idx").on(t.catalogLessonId, t.status),
  ],
);

/**
 * Sahne seti — 5 track sahnesinin ATOMİK sürümü (tek LLM çağrısında üretilir).
 * Dil paketleri sete bağlanır: sahneler yeniden üretilince yeni set doğar ve
 * eski paketlere giden yol yapısal olarak kopar — geçersizleme unutulamaz.
 */
export const lessonSceneSets = pgTable(
  "lesson_scene_sets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    coreId: uuid("core_id")
      .notNull()
      .references(() => lessonCores.id, { onDelete: "cascade" }),
    sceneFormat: integer("scene_format").notNull(),
    promptVersion: text("prompt_version").notNull(),
    status: text("status").notNull().default("generating"), // generating | ready | failed | published | retired
    /** track → SceneVariant (5'inin varlığını lint zorlar) */
    scenes: jsonb("scenes"),
    validationReport: jsonb("validation_report"),
    model: text("model"),
    generatedForUserId: uuid("generated_for_user_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("lesson_scene_sets_key_idx").on(t.coreId, t.sceneFormat, t.promptVersion),
    index("lesson_scene_sets_lookup_idx").on(t.coreId, t.status),
  ],
);

/**
 * Dil paketi — (çekirdek × sahne seti × dil) başına ana dilde anlatım.
 * Pedagojik İDDİA üretemez (çekirdeğin claimsEn'ini anlatır); İngilizce
 * malzemeye şema gereği DOKUNAMAZ. Tek lazy üretilebilen katman — pedagojik
 * riski olmadığı için lint sonrası doğrudan servis edilebilir.
 */
export const lessonLocales = pgTable(
  "lesson_locales",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    coreId: uuid("core_id")
      .notNull()
      .references(() => lessonCores.id, { onDelete: "cascade" }),
    sceneSetId: uuid("scene_set_id")
      .notNull()
      .references(() => lessonSceneSets.id, { onDelete: "cascade" }),
    /** BCP-47, normalize (zh-hans/pt-br gibi kritik alt etiketler korunur) */
    language: text("language").notNull(),
    l10nFormat: integer("l10n_format").notNull(),
    promptVersion: text("prompt_version").notNull(),
    /** Katalog başlığı + core rev + sceneSet rev parmak izi — başlık değişince yalnız paket yenilenir */
    sourceHash: text("source_hash").notNull(),
    status: text("status").notNull().default("generating"), // generating | ready | failed | retired
    pack: jsonb("pack"), // LessonLocalePack (@arna/contracts)
    validationReport: jsonb("validation_report"),
    model: text("model"),
    generatedForUserId: uuid("generated_for_user_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("lesson_locales_key_idx").on(
      t.coreId,
      t.sceneSetId,
      t.language,
      t.l10nFormat,
      t.promptVersion,
      t.sourceHash,
    ),
    index("lesson_locales_lookup_idx").on(t.coreId, t.language, t.status),
  ],
);

// ---------------------------------------------------------------------------
// ROLEPLAY — bağımsız rol yapma sekmesi
//
// Derslerden AYRIŞAN yön: müfredat repo-kaynaklıdır, roleplay DB-kaynaklıdır.
// Gerekçe içerik ağırlığı: hedef listesi yazmak pedagoji yazmaktan kat kat ucuz,
// kapı KAYIT ANINDA çalışıyor ve revizyonlar değişmez. İki pilot repo dosyasından
// tohumlanıyor (incelenebilirlik için) ama sonrası panelin.
// ---------------------------------------------------------------------------

/** KİMLİK satırı — slug kalıcıdır, içerik revizyonlarda yaşar. */
export const roleplays = pgTable(
  "roleplays",
  {
    /** Kalıcı slug: `rp-restaurant-order` */
    id: text("id").primaryKey(),
    category: text("category").notNull(),
    /** YUMUŞAK: keşif ve sıralama. Kilitlemez. */
    recommendedFrom: text("recommended_from").notNull(),
    /** TEKNİK TABAN: altındaki kullanıcı senaryoyu BU seviyede oynar. */
    supportedFrom: text("supported_from").notNull(),
    status: text("status").notNull().default("active"), // active | retired
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("roleplays_browse_idx").on(t.status, t.category)],
);

/**
 * İÇERİK — yayınlanınca DEĞİŞMEZ.
 *
 * `catalog_lessons` ↔ `lesson_cores` ilişkisinin aynısı ve aynı sebeple:
 * "bozuk içeriği kim gördü" sorusu cevaplanabilsin diye oturum kesin revizyona
 * pinlenir. Düzenleme yeni draft doğurur, eski yayın `retired` olur ama SİLİNMEZ.
 */
export const roleplayRevisions = pgTable(
  "roleplay_revisions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roleplayId: text("roleplay_id")
      .notNull()
      .references(() => roleplays.id, { onDelete: "cascade" }),
    /** 1'den artan sürüm — aynı slug altında */
    revision: integer("revision").notNull(),
    specFormat: integer("spec_format").notNull(),
    /** Üretimi/oynatmayı etkileyen alanların parmak izi */
    specHash: text("spec_hash").notNull(),
    status: text("status").notNull().default("draft"), // draft | published | retired
    spec: jsonb("spec").notNull(), // RoleplaySpec (@arna/contracts)
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("roleplay_revisions_key_idx").on(t.roleplayId, t.revision),
    index("roleplay_revisions_lookup_idx").on(t.roleplayId, t.status),
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
    /** v6 kalıntısı — eski oturumların okunabilirliği için duruyor, 0006'da düşer */
    contentId: uuid("content_id").references(() => lessonContents.id, { onDelete: "set null" }),
    /** v7: oturumun oynattığı katman sürümleri — "bozuk içeriği kim gördü" her katmanda cevaplanır */
    coreId: uuid("core_id").references(() => lessonCores.id, { onDelete: "set null" }),
    sceneSetId: uuid("scene_set_id").references(() => lessonSceneSets.id, { onDelete: "set null" }),
    localeId: uuid("locale_id").references(() => lessonLocales.id, { onDelete: "set null" }),
    /**
     * Oturumun TÜRÜ. NULLABLE, çünkü 28 eski oturumun dört bağlantı kolonu da
     * null (322 transkript turu, 0 özet) — onlara tür atamak yanlış etiket olur.
     * `NOT VALID` kısıt yalnız türü DOLU satırları denetler; eskiler karantinada
     * kalır ve silinmez. Silme kararı veri saklama politikasıyla ayrıca verilir.
     */
    sessionKind: text("session_kind"), // lesson | roleplay
    /** Roleplay oturumunun oynattığı KESİN revizyon — içeriğin tek pinlenme yeri */
    roleplayRevisionId: uuid("roleplay_revision_id").references(() => roleplayRevisions.id, {
      onDelete: "set null",
    }),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    state: jsonb("state"),
    /**
     * Devam (resume) imleci — istemcinin fire-and-forget sync'lediği pozisyon
     * anlık görüntüsü (SessionPosition, contracts). AYRI kolon çünkü `state`
     * güncellemeleri bayat state'i spread'liyor; pozisyon yüksek frekanslı
     * yazılır ve state'le yarışmamalı.
     */
    position: jsonb("position"),
  },
  (t) => [
    index("sessions_user_idx").on(t.userId),
    // Açık oturum araması: "bu derste devam edilecek oturum var mı?"
    index("sessions_open_lookup_idx")
      .on(t.userId, t.catalogLessonId)
      .where(sql`ended_at IS NULL`),
  ],
);

/**
 * DENEME — `sessions` ile BİRE BİR (`session_id` hem PK hem FK).
 *
 * REVİZYON KİMLİĞİ BURADA YOK: tek kaynak `sessions.roleplay_revision_id`.
 * İki yerde tutulsa zamanla çelişirler ve hangisinin doğru olduğu bilinemez.
 *
 * `objective_hits` yalnız tamamlanan kimlikleri değil DENETİM İZİNİ saklar
 * (tur, kanıt, dedektör sürümü) — bu veri olmadan yanlış tikleri incelemek ve
 * doğruluk tablosu üretmek mümkün değil.
 */
export const roleplayAttempts = pgTable("roleplay_attempts", {
  sessionId: uuid("session_id")
    .primaryKey()
    .references(() => sessions.id, { onDelete: "cascade" }),
  /** Gerçekten oynanan seviye — kullanıcının seviyesinden yükseltilmiş olabilir */
  playedLevel: text("played_level").notNull(),
  /** Bu oturumda GÖSTERİLEN hedefler; senaryo sonradan değişse deneme okunabilir kalır */
  activeObjectiveIds: jsonb("active_objective_ids").notNull(),
  complicationId: text("complication_id"),
  /** ObjectiveHit[] — { objectiveId, turnIndex, evidence, detectorVersion } */
  objectiveHits: jsonb("objective_hits").notNull().default([]),
  /** Seviye politikası değişince eski denemelerin hangi kurallarla oynandığı korunur */
  levelPolicyVersion: integer("level_policy_version").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

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
    /**
     * chat = sunucu LLM yolu (mevcut davranış) · script = istemcinin logladığı
     * script/deterministik satır (selamlama, anlatım, alıştırma metni, ack,
     * birebir doğru cevap). Admin görünümü sohbetin TAMAMINI bununla kurar;
     * hafıza çıkarımı script+assistant satırlarını pencereden dışlar.
     */
    source: text("source").notNull().default("chat"),
    /** Dil etiketli parçalar (RichText) — düz `text` eski satırlar için kalır */
    runs: jsonb("runs"),
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

/**
 * ÜNİTE SONU TESTİ SONUCU.
 *
 * Testin KENDİSİ saklanmaz — her girişte yayınlı çekirdeklerden yeniden derlenir
 * (farklı örneklem). Burada yalnız sonuç durur: ilerleme ekranında "Ünite 3 · 7/8"
 * göstermek ve zayıf konuları hatırlatmak için. Aynı üniteye tekrar girilebilir,
 * her deneme yeni satırdır — ilerleme kapısı YOKTUR, bu bir ayna.
 */
export const unitCheckpoints = pgTable(
  "unit_checkpoints",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: uuid("user_id").notNull(),
    level: text("level").notNull(),
    unitIndex: integer("unit_index").notNull(),
    score: integer("score").notNull(),
    total: integer("total").notNull(),
    /** Yanlış yapılan maddelerin ders kimlikleri — "tekrar et" bağlantıları için */
    weakLessonIds: jsonb("weak_lesson_ids").notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("unit_checkpoints_user_idx").on(t.userId, t.level, t.unitIndex)],
);
