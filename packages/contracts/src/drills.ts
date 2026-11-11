import { z } from "zod";

// ============================================================================
// OYUNLAŞTIRILMIŞ ALIŞTIRMA BLOĞU ("drills") — 10 Kas 2026
//
// Anlatım bugünkü gibi sohbettir (Emma konuşur, sorar, öğrenci ses/yazıyla
// cevaplar). "Alıştırmalara geçelim" anında ders KLAVYESİZ bir oyun bloğuna
// geçer: her madde dokunarak (ya da konuşma kartında sesle) cevaplanır, TEK
// doğru cevabı vardır ve değerlendirme tamamen koddadır — LLM yok, judge yok,
// hak yakma pazarlığı yok. Blok bitince rol yapma serbest girişle başlar.
//
// Neden: eski yapıda ders başına ~3 alıştırma vardı ve hangi alıştırmanın
// hangi öğretim maddesini çalıştırdığını kimse denetlemiyordu — çok kalıplı
// derslerde (must/should) bir kalıbın HİÇ alıştırması olmuyordu. Artık her
// madde `pointRef` ile bir öğretim maddesine bağlıdır ve lint kapsamı sayar.
//
// Kelime öğretmiyoruz (müfredat kalıp + konuşma): resim seç, İngilizce↔ana dil
// eşleştirme ve çeviri türleri BİLEREK yok. Bütün maddeler %100 İngilizcedir ve
// çekirdekte yaşar (ASCII değişmezi kapsar); yönergeler istemcide sabit metin.
//
// Bu dosya YALNIZ şemadır ve lessonLayers'a bağımlı değildir (o bunu import
// eder). Puanlama/kuyruk: drillGrade.ts.
// ============================================================================

const idSchema = z.coerce.string().min(1);
const en = z.string().trim().min(1);

export const DRILL_TYPES = [
  "fill_choice",
  "arrange",
  "situation",
  "find_error",
  "complete_chat",
  "match",
  "listen_choose",
  "listen_arrange",
  "speak",
] as const;
export type DrillType = (typeof DRILL_TYPES)[number];

/** Blok sonunda karışık set — birden çok öğretim maddesini birlikte sınar */
export const DRILL_MIX_REF = "mix";

const base = {
  id: idSchema,
  /** Çalıştırdığı öğretim maddesi (`p1`…) ya da `mix` */
  pointRef: z.string().trim().min(1),
};

/** Boşluğu doldur — cümlede TAM bir `___`, şıklardan biri doğru */
export const drillFillChoiceSchema = z.object({
  ...base,
  type: z.literal("fill_choice"),
  sentence: en.max(160),
  options: z.array(en.max(60)).min(2).max(4),
  correctIndex: z.number().int().min(0),
});

/** Kelimeleri sırala — kartlardan cümle kurulur. Kartlar cümleden TÜRETİLİR. */
export const drillArrangeSchema = z.object({
  ...base,
  type: z.literal("arrange"),
  answer: en.max(120),
  /** Çeldirici kartlar (tek kelime) — doğru cümlede yer almamalı */
  extraTiles: z.array(en.max(20)).max(3).default([]),
  /** Aynı kartlarla kurulabilen başka doğru diziler (nadiren gerekir) */
  alsoAccept: z.array(en.max(120)).max(3).default([]),
});

/** Durumu oku, doğru kalıbı seç — bağlam cevabı TEK şıkka kilitler */
export const drillSituationSchema = z.object({
  ...base,
  type: z.literal("situation"),
  context: en.max(200),
  options: z.array(en.max(120)).min(2).max(4),
  correctIndex: z.number().int().min(0),
});

/** Hatayı bul — cümlede yanlış kelimeye dokunulur. Kelimeler boşlukla bölünür. */
export const drillFindErrorSchema = z.object({
  ...base,
  type: z.literal("find_error"),
  sentence: en.max(140),
  /** `sentence.split(" ")` içindeki yanlış kelimenin indeksi */
  wrongIndex: z.number().int().min(0),
  /** Doğrusu (noktalamasız) — geri bildirimde düzeltilmiş cümle bundan kurulur */
  fix: en.max(40),
});

export const chatLineSchema = z.object({
  who: z.enum(["them", "you"]),
  /** null = öğrencinin dolduracağı satır (tam bir tane, `you` olmalı) */
  text: en.max(140).nullable(),
});

/** Sohbeti tamamla — kısa diyalogda öğrencinin satırı şıklardan seçilir */
export const drillCompleteChatSchema = z.object({
  ...base,
  type: z.literal("complete_chat"),
  lines: z.array(chatLineSchema).min(2).max(4),
  options: z.array(en.max(120)).min(2).max(4),
  correctIndex: z.number().int().min(0),
});

/** Eşleştir — İngilizce↔İngilizce (soru↔cevap, durum↔söz, özne↔fiil) */
export const drillMatchSchema = z.object({
  ...base,
  type: z.literal("match"),
  pairs: z.array(z.object({ left: en.max(60), right: en.max(60) })).min(3).max(5),
});

/** Duyduğunu seç — cümle sesle çalar, yazılı şıklardan duyulan seçilir */
export const drillListenChooseSchema = z.object({
  ...base,
  type: z.literal("listen_choose"),
  audio: en.max(120),
  options: z.array(en.max(120)).min(3).max(4),
  correctIndex: z.number().int().min(0),
});

/** Duyduğuna dokun — cümle sesle çalar, kartlarla kurulur */
export const drillListenArrangeSchema = z.object({
  ...base,
  type: z.literal("listen_arrange"),
  audio: en.max(120),
  extraTiles: z.array(en.max(20)).max(3).default([]),
});

/** Bu cümleyi söyle — mikrofon; STT çıktısı kabul listesiyle karşılaştırılır */
export const drillSpeakSchema = z.object({
  ...base,
  type: z.literal("speak"),
  sentence: en.max(120),
  /** Boşsa yalnız `sentence` kabul edilir */
  accepted: z.array(en.max(120)).max(4).default([]),
  contractionsAllowed: z.boolean().default(true),
});

export const drillItemSchema = z
  .discriminatedUnion("type", [
    drillFillChoiceSchema,
    drillArrangeSchema,
    drillSituationSchema,
    drillFindErrorSchema,
    drillCompleteChatSchema,
    drillMatchSchema,
    drillListenChooseSchema,
    drillListenArrangeSchema,
    drillSpeakSchema,
  ])
  .superRefine((d, ctx) => {
    if ("options" in d && d.correctIndex >= d.options.length) {
      ctx.addIssue({ code: "custom", message: `${d.id}: correctIndex aralık dışı` });
    }
    if (d.type === "find_error" && d.wrongIndex >= d.sentence.split(" ").length) {
      ctx.addIssue({ code: "custom", message: `${d.id}: wrongIndex aralık dışı` });
    }
  });
export type DrillItem = z.infer<typeof drillItemSchema>;
export type DrillOf<T extends DrillType> = Extract<DrillItem, { type: T }>;

/** Çekirdek beat'i — anlatımdaki `say` (alıştırma duyurusu) beat'inin hemen ardından */
export const coreDrillsBeatSchema = z.object({
  id: idSchema,
  kind: z.literal("drills"),
  items: z.array(drillItemSchema).min(4).max(20),
});
export type CoreDrillsBeat = z.infer<typeof coreDrillsBeatSchema>;

/** Görünüm beat'i — çekirdekle aynı maddeler, şıklar servis anında seed'li karışık */
export const viewDrillsBeatSchema = z.object({
  id: z.string(),
  kind: z.literal("drills"),
  items: z.array(drillItemSchema).min(1),
});
