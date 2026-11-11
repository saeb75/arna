import type { LessonCore, RichText, TurnKind } from "@glotmate/contracts";
import type { z } from "zod";

/**
 * KONUŞMA MOTORU — öğrencinin sözünü hocanın cevabına çeviren katman.
 *
 * SAF: veritabanına, oturuma, HTTP'ye dokunmaz. LLM çağrısı dışarıdan verilir
 * (`TurnLlm`). Böylece aynı kod hem canlıda (service.ts, llm_calls loglu) hem
 * konuşma taraması betiğinde (scripts/test-conversation-matrix.ts, gerçek
 * modelle, DB'siz) koşar — taramanın sınadığı şey canlıdakinin TA KENDİSİDİR.
 *
 * Neden yeniden yazıldı (3 Kas 2026 denetimi): eski judge çağrıları HAFIZASIZDI —
 * model yalnız öğrencinin son cümlesini ve uzun bir yasak listesini görüyordu;
 * kendi az önce ne dediğini, öğrencinin önceki denemesini, zaten selamlaştıklarını
 * bilmiyordu. Beklenmedik her girdide yeni sohbet açan bir chatbot gibi davranıyordu
 * ("Merhaba! Bir şeyler denemek ister misin?"). Her canlı hata prompt'a bir yasak
 * daha ekleyerek kapatılıyordu; asıl neden yerinde kalıyordu. Bu motorda:
 *  1. Model o ADIMIN diyaloğunu görür (sorduğu görev, denemeler, kendi cevapları).
 *  2. Hocanın sözü AKIŞ KARARINDAN TÜRETİLİR: her olası hüküm için "bundan sonra ne
 *     olacak" contracts'taki `outcomeOfVerdict` ile hesaplanıp talimata yazılır.
 *  3. Prompt yasak yığını değil, sahneyi ve tek işi tarif eden kısa bir metindir.
 */

/** Şemayla doğrulanmış JSON üreten LLM çağrısı — canlıda llm_calls'a loglanır. */
export type TurnLlm = <T>(req: {
  system: string;
  user: string;
  schema: z.ZodType<T>;
  promptVersion: string;
  maxTokens: number;
  temperature: number;
}) => Promise<T>;

export interface Learner {
  name: string;
  cefrLevel: string;
  /** BCP-47 */
  nativeLanguage: string;
  /** `languageName(nativeLanguage)` — prompt'a parametre olarak girer */
  l1Name: string;
  tutorLanguage: "native" | "english";
  /** Hocanın adı — seçilen öğretmen (öğretmen kaydı yoksa "Emma"); oturuma pinlidir */
  tutorName: string;
  /** Hocanın cinsiyeti — ana dilde kendinden söz ederken dilbilgisel cinsiyet için */
  tutorGender: "female" | "male";
}

/**
 * Adım içi diyalog satırı. `app`: uygulamanın deterministik eylemi (görevi yeniden
 * gösterip okuması) — model kendi sözüyle karıştırmasın diye ayrı rol.
 */
export interface BeatTurn {
  role: "tutor" | "student" | "app";
  text: string;
}

/** sessions.state.beatLog — o anki lecture adımının diyaloğu (adım değişince sıfırlanır). */
export interface BeatLog {
  beatId: string;
  turns: BeatTurn[];
}

/** Öğrencinin sözü işlenmeden ÖNCEKİ sayaçlar (istemciden gelir — akışı istemci yürütür). */
export interface TurnCounters {
  exchanges: number;
  attempt: number;
}

export interface LectureTurnInput {
  core: LessonCore;
  beatId: string;
  learner: Learner;
  /** Bu adımda daha önce geçen konuşma (şimdiki söz HARİÇ) */
  history: BeatTurn[];
  studentText: string;
  counters: TurnCounters;
  /** Ana dildeki pes ifadeleri (chrome) — İngilizce çekirdek küme contracts'ta */
  surrenderTokens: readonly string[];
  /** ask adımları: hocanın o adımda söylediği script cümlesi (düz metin) */
  askedLine?: string;
  /** ask · questions: bu, pencerenin izin verilen son turu mu (istemci hesaplar) */
  lastExchange?: boolean;
  /**
   * Cevap sızıntısı iki kez onarılamazsa söylenecek SON ÇARE: görevin kendisi,
   * öğrencinin dilindeki yönergeyle (chrome etiketi + İngilizce madde). Eskiden
   * sabit İngilizce "Let's try once more." native modda da okunuyordu (canlıda 4 kez).
   * Yoksa (konuşma taraması) İngilizce satıra düşülür.
   */
  retryLine?: RichText;
}

export interface TaskTurnResult {
  kind: TurnKind;
  isAttempt: boolean;
  ok: boolean;
  beatDone: boolean;
  /** Hoca konuştuktan sonra akış: istemci AYNI sonucu kendi fonksiyonuyla çıkarır */
  outcome: "advance" | "wait";
  reply: RichText;
  /** İstemci görevi yeniden gösterip okuyacak mı (deneme değil + bekleniyor) */
  reAsk: boolean;
  /** Cevap sızıntısı yakalanıp metin yeniden üretildi mi (log/teşhis) */
  repaired: boolean;
}

export interface AskTurnResult {
  reply: RichText;
  /** Yalnız soru penceresi: öğrencinin sorusu kalmadı (yapısal) → contracts windowDone */
  done?: boolean;
}
