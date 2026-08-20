/**
 * Akış makinesinin beat'ten OKUDUĞU alanların tamamı — yapısal tip.
 * v6 LectureBeat de v7 ViewBeat de bu şekle uyar; makinenin mantığı içerik
 * formatından bağımsızdır (zaten tasarım ilkesi buydu, tip artık bunu söylüyor).
 */
export type FlowBeat =
  | { kind: "say" }
  | { kind: "ask"; purpose: "readiness" | "questions" }
  | { kind: "teach" }
  | { kind: "exercise" }
  | { kind: "open_response"; maxAttempts: number };

/**
 * DERS AKIŞ MAKİNESİ — saf, deterministik, test edilebilir.
 *
 * KALICI İLKE: akış kararı YALNIZCA şunlara bakabilir —
 *   1. öğrencinin kendi sözü (onay sınıfı, cevap eşleşmesi),
 *   2. sayaçlar (deneme, tur),
 *   3. içerik alanları (beat türü, purpose, maxAttempts…),
 *   4. şemayla doğrulanmış YAPISAL model çıktısı (`beatDone: boolean` gibi).
 *
 * Hocanın CÜMLESİNİN ŞEKLİ — noktalama, anahtar kelime, özel işaret — asla karar
 * girdisi değildir. Bu yüzden aşağıdaki fonksiyonların imzasında model metni YOKTUR:
 * bağımlılık tip düzeyinde imkânsız. Üç ayrı canlı hata bu kuralın ihlalinden çıktı
 * (`<<DONE>>` işareti, ardından iki kez `endsWithQuestion`).
 *
 * Bu modül contracts'ta durur çünkü mobil istemci de aynı makineyi kullanacak.
 */

/** Öğrenci girdisinin onay sınıfı (istemci STT/metinden çıkarır). */
export type AckKind = "yes" | "no" | "proceed";

/**
 * "Bilmiyorum" demek de bir CEVAPTIR — pes eden öğrenci, hakları bitince doğru
 * cevabı duymayı hak eder. Model bunu bazen "konu dışı" sayıp deneme hakkını
 * yakmıyordu ve öğrenci cevabı hiç öğrenemeden döngüde kalıyordu. Kapalı ve küçük
 * bir küme olduğu için modele sorulmaz, deterministik belirlenir.
 *
 * KÜME ARTIK PARAMETRE: eskiden Türkçe+İngilizce hardcode'du — 51. dilde sessizce
 * bozulurdu. Ana dile ait ifadeler chrome bundle'dan gelir (İngilizce çekirdek
 * ifadeler her dilde geçerli kalır, çağıran birleştirir).
 */
export const SURRENDER_EN = [
  "i don't know", "i dont know", "idk", "no idea", "dunno", "not sure", "i'm not sure",
  "im not sure", "no clue", "pass", "skip", "i give up",
] as const;

/**
 * İngilizce çekirdek ONAY kümeleri — SURRENDER_EN ile aynı ilke: hedef dil herkes
 * için İngilizce olduğundan bu ifadeler HER ana dilde geçerlidir ve çekirdekte
 * yaşar; ana dile özgü ifadeler chrome paketinden eklenir (assembleLesson birleştirir).
 *
 * Canlı hata: native modda kümeler yalnız chrome'dan (Türkçe) geliyordu — İngilizce
 * ders çalışan öğrencinin "yes"i tanınmadı, bedava onay LLM'e gitti ve hoca
 * İngilizce'ye kaydı.
 */
export const ACK_EN = {
  yes: ["yes", "yeah", "yep", "sure", "of course", "i do", "i have a question", "ok yes"],
  no: ["no", "nope", "no thanks", "i don't", "i dont", "not really", "no questions", "i'm good", "im good"],
  proceed: ["ok", "okay", "ready", "i'm ready", "im ready", "let's go", "lets go", "let's start", "lets start", "go on", "continue"],
} as const;

/** Kısa söz normalizasyonu — dil-bağımsız (\p{L}; eski regex yalnız Latin+Türkçe tanıyordu) */
export function normalizeShort(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^\p{L}\p{N}' ]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isSurrender(text: string, extraTokens: readonly string[] = []): boolean {
  const t = normalizeShort(text);
  if (!t || t.split(" ").length > 4) return false;
  return SURRENDER_EN.includes(t as (typeof SURRENDER_EN)[number]) || extraTokens.includes(t);
}

export interface AckSets {
  yes: readonly string[];
  no: readonly string[];
  proceed: readonly string[];
}

/** token dizisi, kelime sınırlarına saygıyla içinde geçiyor mu ("yok" ⊂ "yok bu kadar yeterli") */
function containsTokenSeq(haystackTokens: string[], phrase: string): boolean {
  const want = phrase.split(" ");
  for (let i = 0; i + want.length <= haystackTokens.length; i++) {
    if (want.every((t, j) => haystackTokens[i + j] === t)) return true;
  }
  return false;
}

/**
 * Kısa onay sınıflandırması — LLM'siz, deterministik, dil-bağımsız (kümeler
 * chrome + ACK_EN'den gelir).
 *
 * TAM eşleşme yetmiyordu: canlıda "Yok, bu kadar yeterli." tanınmadı (listede
 * "yok" var ama dize eşit değil), serbest metin sanılıp LLM'e gitti ve hoca soru
 * penceresinde iki tur boşa döndü. Kural: ≤4 kelimelik sözde bir kümenin ifadesi
 * KELİME SINIRIYLA geçiyorsa o sınıftır; birden fazla SINIF birden eşleşirse
 * belirsizdir (null → LLM karar versin). Uzunluk kapısı yanlış pozitifin asıl
 * sigortası: soru cümleleri 4 kelimeyi aşar.
 */
export function classifyAck(text: string, sets: AckSets): AckKind | null {
  const t = normalizeShort(text);
  if (!t || t.split(" ").length > 4) return null;

  // Önce tam eşleşme (tek sınıf kazanır, mevcut öncelik sırası korunur)
  if (sets.no.includes(t)) return "no";
  if (sets.yes.includes(t)) return "yes";
  if (sets.proceed.includes(t)) return "proceed";

  const tokens = t.split(" ");
  const hit = (list: readonly string[]) => list.some((p) => containsTokenSeq(tokens, normalizeShort(p)));
  const matches: AckKind[] = [];
  if (hit(sets.no)) matches.push("no");
  if (hit(sets.yes)) matches.push("yes");
  if (hit(sets.proceed)) matches.push("proceed");
  return matches.length === 1 ? matches[0]! : null;
}

/** Akışın hangi girdiyi beklediği. */
export type AwaitingInput = "ask" | "exercise" | "open_response" | "practice";

export type FlowDecision =
  /** Sonraki beat'e geç. */
  | { kind: "advance" }
  /** Öğrenciden cevap bekle (mikrofon/klavye açık). */
  | { kind: "wait"; awaiting: AwaitingInput }
  /** "Ne sormak istersin?" — oturum script'indeki davet cümlesi söylenir, beklenir. */
  | { kind: "invite" }
  /** Doğru cevap: script'ten övgü söylenir, ilerlenir (LLM çağrısı YOK). */
  | { kind: "praise" }
  /** Hocaya (LLM) gönder; cevap gelince decideAfterTutorReply çağrılır. */
  | { kind: "askTutor" };

/**
 * Bir beat'te en fazla bu kadar LLM turu; sonra akış ilerler.
 * YALNIZCA gerçek LLM turlarını sayar — bedava davet cümlesi bu bütçeden yemez
 * (yiyordu: öğrenci "evet" deyince soru hakkının üçte biri boşa gidiyordu).
 */
export const MAX_BEAT_EXCHANGES = 3;

/** "Ne sormak istersin?" daveti en fazla bu kadar tekrarlanır (evet-evet sarmalı). */
export const MAX_QUESTION_INVITES = 2;

/**
 * Roleplay, hedef erken tutturulsa bile bu tur sayısından ÖNCE kapanmaz.
 * Hedefi çabuk kullanmak konuşmayı kısaltmanın gerekçesi değildir — canlıda
 * öğrenci konuşmanın ortasında kesiliyordu.
 */
export const PRACTICE_MIN_TURNS_BEFORE_GOAL = 4;

/** Sahne bu tur sayısından kısa olamaz; içerik daha azını yazsa bile taban budur. */
export const PRACTICE_MIN_MAX_TURNS = 8;

export interface StudentInputContext {
  /** Onay sınıfı; gerçek bir cümleyse null. */
  ack: AckKind | null;
  /** Bu beat'te şimdiye kadar kaç GERÇEK LLM turu geçti. */
  exchanges: number;
  /** Bu beat'te kaç kez soru daveti yapıldı (LLM çağrısı içermez). */
  invites: number;
  /** Alıştırmada kaçıncı deneme (0-tabanlı). */
  attempt: number;
  /** Alıştırmada cevap kabul edilenlerle eşleşti mi. */
  answerMatched: boolean;
}

/**
 * Bu, bu beat'te İZİN VERİLEN SON tur mu?
 *
 * İstemci LLM'i çağırmadan ÖNCE hesaplar ve sunucuya bayrak olarak geçer, çünkü
 * hocanın son cümlesi farklı olmalı:
 *  - soru penceresinde "başka sorun var mı?" demek yerine kapanış yapar (yoksa
 *    Emma soru sorarken akış ilerliyor ve ders kendiyle çelişiyor),
 *  - ALIŞTIRMADA doğru cevabı VERİR. Canlı hata: öğrenci üç kez anlamsız cevap
 *    yazdı, model üçünü de "cevap denemesi değil" saydı (hak yanmadı), tur tavanı
 *    dolunca ders doğru cevap hiç söylenmeden sonraki soruya geçti.
 */
export function isLastExchange(beat: FlowBeat, exchanges: number): boolean {
  const capped =
    (beat.kind === "ask" && beat.purpose === "questions") ||
    beat.kind === "exercise" ||
    beat.kind === "open_response";
  if (!capped) return false;
  return exchanges + 1 >= MAX_BEAT_EXCHANGES;
}

/** @deprecated `isLastExchange` kullanın — eski ad geriye uyum için duruyor. */
export const isLastQuestionExchange = isLastExchange;

/**
 * Öğrencinin sözü geldi — LLM'e gitmeden ÖNCEKİ karar.
 */
export function decideOnStudentInput(
  beat: FlowBeat,
  ctx: StudentInputContext,
): FlowDecision {
  switch (beat.kind) {
    case "ask": {
      // "Sorun var mı?" penceresinde "evet" = SORUM VAR. "Hazır mısın?"ta ise
      // "evet" = başla. AYNI kelime, TERS anlam — ayrım purpose'tan gelir.
      if (beat.purpose === "questions" && ctx.ack === "yes") {
        const exhausted =
          ctx.exchanges >= MAX_BEAT_EXCHANGES || ctx.invites >= MAX_QUESTION_INVITES;
        return exhausted ? { kind: "advance" } : { kind: "invite" };
      }
      // Kalan onaylar akışı ilerletir; sonraki beat'in kendi girişi karşılık niteliğinde.
      if (ctx.ack) return { kind: "advance" };
      return { kind: "askTutor" };
    }

    case "exercise":
      // Doğru cevap LLM'e gitmez — anında, bedava geri bildirim.
      return ctx.answerMatched ? { kind: "praise" } : { kind: "askTutor" };

    case "open_response":
      // Tek doğru dize yok; sunucu rubrikle değerlendirir.
      return { kind: "askTutor" };

    default:
      // say / teach cevap beklemez; buraya düşmemeli.
      return { kind: "advance" };
  }
}

// ---------------------------------------------------------------------------
// KAPANIŞ (wrapup) — hoca rol karakterinden çıkar, dersi kendi bitirir
// ---------------------------------------------------------------------------

export type WrapupDecision =
  /** "Ne sormak istersin?" — script'teki davet, sonra bekle */
  | { kind: "invite" }
  /** Kısa veda — ama ders BİTMEZ, sohbet açık kalır */
  | { kind: "farewell" }
  /** Soruyu hocaya gönder; cevaptan sonra yine beklenir */
  | { kind: "askTutor" };

/**
 * Kapanış fazında öğrencinin sözüne verilen karar.
 *
 * DİKKAT: hiçbir dal dersi BİTİRMEZ. Ders yalnızca öğrenci "Dersi Bitir"e basınca
 * biter — sayaç, tavan ya da kelime tahmini kullanıcıyı asla kesemez. Bu, kullanıcının
 * açık kararı: practice fazında sayaç konuşmanın ortasında kapattığı için kondu.
 */
export function decideInWrapup(ack: AckKind | null): WrapupDecision {
  if (ack === "yes") return { kind: "invite" };
  if (ack) return { kind: "farewell" }; // "hayır" / "tamam" → veda, ama bekle
  return { kind: "askTutor" };
}

export interface TutorReplyContext {
  /** LLM turu sayılmış hâliyle (çağrıdan sonra). */
  exchanges: number;
  /** Bu cevabın hangi denemeye ait olduğu (0-tabanlı). */
  attempt: number;
  /**
   * Sunucunun yapısal "bu adım tamam" kararı.
   *
   * open_response: rubrik kabul etti ya da hak bitti. exercise: deterministik
   * eşleyicinin ıskaladığı cevabı judge kabul etti (yazım sürçmesi, listede
   * olmayan geçerli varyant) — LLM emniyet ağı. Karar girdisi yine yapısal
   * boolean'dır; modelin düzyazısı değil.
   */
  beatDone: boolean;
  /**
   * Öğrencinin sözü bir CEVAP DENEMESİ miydi? (sunucudan gelen yapısal karar)
   *
   * false ise deneme hakkı YANMAZ ve akış bekler — hoca soruyu yeniden sorar.
   * Canlıda "Hey!" ve konu dışı bir cümle iki denemeyi de yakıp soruyu atlatmıştı;
   * öğrenci soruya hiç cevap vermeden ders ilerlemişti.
   * Geriye uyum için varsayılan true.
   */
  isAttempt?: boolean;
}

/**
 * Konu dışı girdi: deneme hakkı yanmadan beklenir. Yalnızca tur tavanı dolunca
 * ilerlenir — öğrenci sonsuza kadar sohbet edip dersi kilitleyemesin.
 */
function offTopic(awaiting: AwaitingInput, exchanges: number): FlowDecision {
  return exchanges >= MAX_BEAT_EXCHANGES ? { kind: "advance" } : { kind: "wait", awaiting };
}

/**
 * Hocanın cevabı geldi — ilerle mi, bekle mi?
 *
 * DİKKAT: cevabın METNİ bu fonksiyona GEÇİRİLMEZ ve geçirilemez. Karar
 * tamamen beat türü + sayaçlardan çıkar.
 */
export function decideAfterTutorReply(
  beat: FlowBeat,
  ctx: TutorReplyContext,
): FlowDecision {
  switch (beat.kind) {
    case "ask": {
      if (beat.purpose === "questions") {
        // Soru penceresi: hoca cevapladı, öğrenci başka soru sorabilir.
        // Pencereden çıkış YALNIZCA öğrencinin "yok" demesiyle ya da tavanla olur.
        return ctx.exchanges >= MAX_BEAT_EXCHANGES
          ? { kind: "advance" }
          : { kind: "wait", awaiting: "ask" };
      }
      // readiness: bağlam hocaya soru sormayı zaten yasaklıyor, script hemen devam eder.
      return { kind: "advance" };
    }

    case "exercise":
      // Cevap denemesi DEĞİLSE (selamlama, konu dışı laf) deneme hakkı yanmaz;
      // hoca soruyu yeniden sorar, beklenir. Sonsuz döngüyü tur tavanı keser.
      if (ctx.isAttempt === false) return offTopic("exercise", ctx.exchanges);
      // Judge cevabı KABUL etti (deterministik eşleyicinin ıskaladığı doğru:
      // yazım sürçmesi, listede olmayan geçerli varyant) → övgü zaten yanıtta, ilerle.
      if (ctx.beatDone) return { kind: "advance" };
      // 1. yanlışta hoca düzeltip YENİDEN sorar → beklenir.
      // 2. yanlışta hoca cevabı verir → ilerlenir. (Sayaç kararı verir, cevabın metni değil.)
      return ctx.attempt >= 1
        ? { kind: "advance" }
        : { kind: "wait", awaiting: "exercise" };

    case "open_response":
      if (ctx.isAttempt === false) return offTopic("open_response", ctx.exchanges);
      return ctx.beatDone
        ? { kind: "advance" }
        : { kind: "wait", awaiting: "open_response" };

    default:
      return { kind: "advance" };
  }
}
