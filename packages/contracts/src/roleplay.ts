import { z } from "zod";
import { CEFR_LEVELS, cefrLevelSchema, type CefrLevel } from "./levels.js";
import { spokenRunsSchema, textRunSchema } from "./lessonLayers.js";

// ============================================================================
// ROLEPLAY — bağımsız rol yapma sekmesi
//
// Mimari üç inceleme turundan geçti. Aşağıdaki sekiz madde KARARA BAĞLANDI ve
// uygulama sırasında yeniden yorumlanmaz:
//
//  1. HEDEF = ÖĞRENCİYE AİT İLETİŞİM ADIMI, dış dünya durumu DEĞİL.
//     `Ask for a table`, asla `Get a table` — çünkü dedektör yalnız öğrencinin
//     sözüne bakıyor ve restoran dolu olabilir. Bu ayrım "tik geri alınmaz"
//     sözünün tek dayanağı: konuşma eylemi olduysa olmuştur, sonradan bozulmaz.
//  2. İPTAL VAKASI: "I'll have the chicken" → tik; sonra "cancel that" → TİK
//     KALIR. İptal ayrı bir iletişim adımıdır, o senaryoda hedefse ayrıca tiklenir.
//  3. EŞİK YOK. Gösterilen hedeflerin TAMAMI beklenir; v1'de ikili başarı
//     etiketi gösterilmez, yalnız "3/4".
//  4. Her oturumda EN AZ İKİ AKTİF HEDEF garanti; sağlanamıyorsa senaryo
//     `supportedFrom` seviyesinde oynatılır (kilitleme değil, seviye yükseltme).
//  5. Hedef tespiti mevcut sohbet çağrısına BİNER — tur başına sıfır ek çağrı.
//     Kanıt öğrencinin SON TURUNDA birebir geçmeli. Hedef başına ayrı çağrı YOK.
//  6. `segmentDone` dalı KULLANILMAZ — sohbeti bitiren yalnız buton.
//  7. ŞEMA ZORLAR, PROMPT RİCA ETMEZ: `lang: "en"` literal olarak dayatılır.
//     Bu hafta iki canlı hata prompt talimatının yetmediğini gösterdi.
//  8. `lesson_progress`'e sıfır yazma; roleplay için dil paketi tablosu yok.
// ============================================================================

export const ROLEPLAY_SPEC_FORMAT = 1;
/** Seviye politikası sürümü — deneme satırında saklanır, politika değişince eski denemeler okunabilir kalır */
export const LEVEL_POLICY_VERSION = 1;

const englishText = z.string().trim().min(1);

/** Kimlik: kalıcı slug/id gövdesi — indeks ASLA kimlik olarak kullanılmaz (panelde sıralama değişir) */
const idSchema = z.string().trim().regex(/^[a-z0-9][a-z0-9-]{1,48}$/, "küçük harf, tire, 2-49 karakter");

// ---------------------------------------------------------------------------
// Hedef ve komplikasyon
// ---------------------------------------------------------------------------

export const roleplayObjectiveSchema = z.object({
  /** KALICI kimlik. Denemeler buna atıf yapar; panelde sıralama değişse anlam bozulmaz. */
  id: idSchema,
  /**
   * Öğrencinin YAPACAĞI iletişim adımı, İngilizce, emir kipinde.
   * "Ask for a table" ✓   "Get a table" ✗ (dünya durumu — güvenilir ölçülemez)
   */
  label: englishText.max(80),
  /** Bu hedef hangi seviyeden itibaren aktif */
  activeFrom: cefrLevelSchema,
  /**
   * Persona'ya verilen ipucu: bu hedefe nasıl kapı açacağı.
   * Olmadığında hedef ulaşılamaz kalabilir — kapsama raporunun kovaladığı hata.
   */
  openingHint: englishText.max(120).optional(),
});
export type RoleplayObjective = z.infer<typeof roleplayObjectiveSchema>;

export const roleplayComplicationSchema = z.object({
  id: idSchema,
  /** Persona'nın çıkaracağı zorluk, İngilizce */
  text: englishText.max(200),
  /** Bu komplikasyon hangi seviyeden itibaren devrede */
  activeFrom: cefrLevelSchema,
});
export type RoleplayComplication = z.infer<typeof roleplayComplicationSchema>;

// ---------------------------------------------------------------------------
// Senaryo (revizyon içeriği)
// ---------------------------------------------------------------------------

export const roleplaySpecSchema = z.object({
  specFormat: z.literal(ROLEPLAY_SPEC_FORMAT),
  /** Kanonik İngilizce başlık */
  title: englishText.max(80),
  category: englishText.max(40),
  persona: z.object({
    name: englishText.max(40),
    role: englishText.max(80),
    goal: englishText.max(160),
    /** Serbest kısa ton — enum DEĞİL (sahne şemasında da böyle: meşru tonlar üretimi düşürüyordu) */
    mood: z.string().trim().max(24).optional(),
  }),
  /** İngilizce sahne tarifi — brief'te gösterilir ve persona prompt'una girer */
  scene: englishText.max(280),
  /** Persona'nın ilk cümlesi. SORUYLA BİTMELİ: turu öğrenciye devretmeyen açılış oturumu kilitler. */
  opening: englishText.max(200),
  objectives: z.array(roleplayObjectiveSchema).min(2).max(6),
  complications: z.array(roleplayComplicationSchema).max(4).default([]),
  /**
   * TEKNİK TABAN. Altındaki kullanıcı kilitlenmez — senaryo BU seviyede oynanır
   * ve ekranda söylenir. Onaylanan sözleşmenin 4. maddesinin dayanağı.
   */
  supportedFrom: cefrLevelSchema,
  /** YUMUŞAK: keşif, sıralama, "bu biraz zorlar" uyarısı. Kilitlemez. */
  recommendedFrom: cefrLevelSchema,
});
export type RoleplaySpec = z.infer<typeof roleplaySpecSchema>;

// ---------------------------------------------------------------------------
// Model çıktısı — ŞEMAYLA zorlanır
// ---------------------------------------------------------------------------

/**
 * Rol yapma HER ZAMAN İngilizce (dersteki kuralın aynısı). Burada `lang: "en"`
 * LİTERAL olarak dayatılıyor: prompt'ta "English only" demek yetmiyor, bu hafta
 * iki canlı hatayla ölçüldü. `spokenRunsSchema` de süslü parantezi reddediyor.
 */
export const roleplayReplySchema = z
  .array(textRunSchema.extend({ lang: z.literal("en") }).refine((r) => !/[{}]/.test(r.text), {
    message: "text alanı süslü parantez içeriyor — yapı sızıntısı",
  }))
  .min(1)
  .max(6);

export const roleplayTurnOutputSchema = z.object({
  reply: roleplayReplySchema,
  /**
   * Modelin ÖNERDİĞİ tikler. Sunucu bunları `applyObjectiveHits` ile doğrular:
   * kimlik aktif mi, kanıt öğrencinin son turunda birebir var mı.
   * Kanıt kuralı UYDURMAYI engeller; yanlış ATFETMEYİ engellemez — o yüzden
   * dedektörün ayrıca ölçülmüş bir precision kapısı var (bkz. mimari dokümanı).
   */
  objectiveHits: z
    .array(z.object({ objectiveId: idSchema, evidence: englishText.max(200) }))
    .max(6)
    .default([]),
});
export type RoleplayTurnOutput = z.infer<typeof roleplayTurnOutputSchema>;

// ---------------------------------------------------------------------------
// Deneme durumu
// ---------------------------------------------------------------------------

export const objectiveHitSchema = z.object({
  objectiveId: idSchema,
  /** Kaçıncı turda tiklendi (denetim izi) */
  turnIndex: z.number().int().min(0),
  /** Öğrencinin BİREBİR sözü — yanlış tikleri sonradan incelemenin tek yolu */
  evidence: z.string(),
  /** Hangi dedektör sürümü tikledi — doğruluk tablosu üretmek için şart */
  detectorVersion: z.string().max(40),
});
export type ObjectiveHit = z.infer<typeof objectiveHitSchema>;

/**
 * DENEME. `sessions` ile BİRE BİR (session_id hem PK hem FK).
 * Revizyon kimliği BURADA TEKRARLANMAZ — tek kaynak `sessions.roleplay_revision_id`;
 * iki yerde tutulursa zamanla çelişirler.
 */
export const roleplayAttemptStateSchema = z.object({
  playedLevel: cefrLevelSchema,
  /** Bu oturumda gösterilen hedefler — sonradan senaryo değişse deneme okunabilir kalır */
  activeObjectiveIds: z.array(idSchema),
  complicationId: idSchema.nullable(),
  objectiveHits: z.array(objectiveHitSchema),
  levelPolicyVersion: z.number().int(),
});
export type RoleplayAttemptState = z.infer<typeof roleplayAttemptStateSchema>;

// ---------------------------------------------------------------------------
// SAF FONKSİYONLAR — karar kodda, modelin düzyazısına bakmaz
//
// `lessonFlow.ts` deseninin aynısı: imzalarında model metni YOKTUR, yani o
// bağımlılık tip düzeyinde kurulamaz. Doğruluk tablosu `test-roleplay-flow.ts`.
// ---------------------------------------------------------------------------

const levelIndex = (l: CefrLevel): number => CEFR_LEVELS.indexOf(l);

/** `a` seviyesi `b`'ye eşit ya da üstünde mi */
export function atLeastLevel(a: CefrLevel, b: CefrLevel): boolean {
  return levelIndex(a) >= levelIndex(b);
}

/** Verilen seviyede aktif hedefler — sıra spec'teki sırayı korur */
export function activeObjectives(spec: RoleplaySpec, level: CefrLevel): RoleplayObjective[] {
  return spec.objectives.filter((o) => atLeastLevel(level, o.activeFrom));
}

/** Verilen seviyede devrede olan komplikasyonlar */
export function activeComplications(spec: RoleplaySpec, level: CefrLevel): RoleplayComplication[] {
  return spec.complications.filter((c) => atLeastLevel(level, c.activeFrom));
}

export const MIN_ACTIVE_OBJECTIVES = 2;

export interface PlayedLevelDecision {
  level: CefrLevel;
  /** Kullanıcının seviyesinden yükseltildi mi — brief'te söylenir */
  raised: boolean;
  objectives: RoleplayObjective[];
}

/**
 * OYNANACAK SEVİYE.
 *
 * Onaylanan sözleşmenin 4. maddesi: kullanıcının seviyesinde iki hedeften azı
 * aktifse senaryo `supportedFrom` seviyesinde oynatılır. Kilitleme DEĞİL —
 * "tüm içerik açık" kararına saygı duyuyor, ama öğrenciyi hedefsiz bir
 * roleplay'e sokmuyor. (Canlı açık: bütün hedefleri `activeFrom: C1` olan bir
 * senaryoya A1 kullanıcısı girince liste boş kalıyordu.)
 */
export function resolvePlayedLevel(spec: RoleplaySpec, userLevel: CefrLevel): PlayedLevelDecision {
  const atUser = activeObjectives(spec, userLevel);
  if (atUser.length >= MIN_ACTIVE_OBJECTIVES) {
    return { level: userLevel, raised: false, objectives: atUser };
  }
  const atSupported = activeObjectives(spec, spec.supportedFrom);
  return {
    level: spec.supportedFrom,
    raised: spec.supportedFrom !== userLevel,
    objectives: atSupported,
  };
}

/** Kanıt karşılaştırması: küçük harf + noktalama sadeleştirme, kesme işareti KORUNUR */
function normalizeEvidence(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9' ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface ApplyHitsResult {
  /** Doğrulanmış YENİ tikler — çağıran bunları deneme durumuna ekler */
  accepted: Array<{ objectiveId: string; evidence: string }>;
  /** Reddedilenler ve sebebi — log ve doğruluk tablosu için */
  rejected: Array<{ objectiveId: string; reason: "not_active" | "already_hit" | "evidence_not_verbatim" }>;
}

/**
 * MODELİN ÖNERDİĞİ TİKLERİ DOĞRULAR.
 *
 * Üç kapı, hepsi deterministik:
 *   1. Kimlik bu oturumun AKTİF hedefleri arasında mı (uydurma kimlik elenir)
 *   2. Zaten tiklenmiş mi (TEKRAR İDEMPOTENT — aktarım hatasında istemci aynı
 *      turu tekrar gönderiyor; `hitTurns` kümesi bu yüzden küme, sayaç değil)
 *   3. Kanıt öğrencinin SON TURUNDA birebir geçiyor mu (halüsinasyon elenir)
 *
 * 3. kural VARYASYONU DEĞİL uydurmayı engelliyor: öğrenci ne söylediyse o
 * kabul edilir, bir listeye uyması gerekmez. Ama kanıtın hedefi gerçekten
 * KANITLADIĞI garanti edilmiyor — "I don't want the fish" öğrencinin sözünde
 * gerçekten var ve sipariş verilmemiş. O yüzden dedektörün ayrıca ölçülmüş bir
 * precision kapısı var; bu fonksiyon yalnız uydurmayı ve tekrarı eler.
 */
export function applyObjectiveHits(
  proposed: ReadonlyArray<{ objectiveId: string; evidence: string }>,
  lastStudentTurn: string,
  activeObjectiveIds: readonly string[],
  alreadyHitIds: readonly string[],
): ApplyHitsResult {
  const said = normalizeEvidence(lastStudentTurn);
  const active = new Set(activeObjectiveIds);
  const hit = new Set(alreadyHitIds);
  const out: ApplyHitsResult = { accepted: [], rejected: [] };

  for (const p of proposed) {
    if (!active.has(p.objectiveId)) {
      out.rejected.push({ objectiveId: p.objectiveId, reason: "not_active" });
      continue;
    }
    if (hit.has(p.objectiveId)) {
      out.rejected.push({ objectiveId: p.objectiveId, reason: "already_hit" });
      continue;
    }
    const ev = normalizeEvidence(p.evidence);
    if (!ev || !said.includes(ev)) {
      out.rejected.push({ objectiveId: p.objectiveId, reason: "evidence_not_verbatim" });
      continue;
    }
    hit.add(p.objectiveId); // aynı turda iki kez önerilirse ikincisi elenir
    out.accepted.push({ objectiveId: p.objectiveId, evidence: p.evidence });
  }
  return out;
}

/**
 * İLERLEME ÖZETİ — v1'de ekranda YALNIZ bu görünür.
 *
 * İkili başarı etiketi (`geçti`/`kaldı`) BİLİNÇLİ OLARAK YOK: savunulabilir bir
 * eşik ölçülmedi, ölçmeden eşik koymak kaldırdığımız hatanın aynısı olurdu.
 */
export function objectiveProgress(
  activeObjectiveIds: readonly string[],
  hits: ReadonlyArray<{ objectiveId: string }>,
): { done: number; total: number } {
  const active = new Set(activeObjectiveIds);
  const done = new Set(hits.map((h) => h.objectiveId).filter((id) => active.has(id)));
  return { done: done.size, total: active.size };
}
