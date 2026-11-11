import { normToken } from "./tokens.js";
import type { DrillItem, DrillOf } from "./drills.js";
import { expandContractions, matchesAnswerSpec, normalizeUtterance } from "./lessonLayers.js";

// ============================================================================
// DRILL DEĞERLENDİRME + KUYRUK — saf, deterministik, LLM'siz.
// Mobil, web ve testler AYNI fonksiyonları kullanır; karar tek yerde yaşar.
// ============================================================================

export type DrillAnswer =
  | { kind: "choice"; index: number }
  | { kind: "tokens"; tokens: string[] }
  | { kind: "tap"; index: number }
  | { kind: "speech"; text: string }
  /** Eşleştirme istemcide çift çift yürür; sonuçta yalnız hata sayısı gelir */
  | { kind: "match"; mistakes: number };

/** Sondaki/baştaki noktalamayı atar, iç apostrofu korur: "Ana." → "Ana", "I'm" → "I'm" */
function stripEdgePunct(s: string): string {
  return s.replace(/^[^\p{L}\p{N}']+|[^\p{L}\p{N}']+$/gu, "");
}

/** Kartlar — cümlenin kelimeleri, kenar noktalaması atılmış ("Hi, my name is Ana." → Hi my name is Ana) */
export function sentenceTiles(sentence: string): string[] {
  return sentence.split(/\s+/).map(stripEdgePunct).filter(Boolean);
}

/**
 * `arrange` / `listen_arrange` doğru kart dizisi. Cümle sonu noktalaması (. ? !) SON
 * karta yapışık kalır ve ilk kelimenin büyük harfi korunur: "They are at home." kartları
 * soru düzenine ("are They at home.") çevrilemez görünür — dış inceleme bulgusu
 * (10 Kas 2026): yalın kartlarla her "X are Y" cümlesi ikinci bir doğru dizi taşıyordu.
 * Puanlama noktalamayı yok sayar (normToken), kart görünümü yalnız ipucudur.
 */
export function drillAnswerTiles(item: DrillOf<"arrange"> | DrillOf<"listen_arrange">): string[] {
  const text = item.type === "arrange" ? item.answer : item.audio;
  const tiles = sentenceTiles(text);
  const end = text.trim().match(/[.?!]$/)?.[0];
  if (end && tiles.length) tiles[tiles.length - 1] += end;
  return tiles;
}

/** Ekranda dizilecek bütün kartlar (doğru cümle + çeldiriciler) — sıra çağıranındır */
export function drillTilePool(item: DrillOf<"arrange"> | DrillOf<"listen_arrange">): string[] {
  return [...drillAnswerTiles(item), ...item.extraTiles.map(stripEdgePunct)];
}

/** `find_error` için dokunulabilir kelimeler (noktalama görünür kalır) */
export function errorSentenceWords(item: DrillOf<"find_error">): string[] {
  return item.sentence.split(" ");
}

/** Düzeltilmiş cümle: yanlış kelime `fix` ile değişir, kenar noktalaması korunur */
export function correctedSentence(item: DrillOf<"find_error">): string {
  const words = errorSentenceWords(item);
  const wrong = words[item.wrongIndex] ?? "";
  const lead = wrong.match(/^[^\p{L}\p{N}']+/u)?.[0] ?? "";
  const trail = wrong.match(/[^\p{L}\p{N}']+$/u)?.[0] ?? "";
  words[item.wrongIndex] = `${lead}${item.fix}${trail}`;
  return words.join(" ");
}

function sameTokens(said: string[], want: string[]): boolean {
  const a = said.map(normToken).filter(Boolean);
  const b = want.map(normToken).filter(Boolean);
  return a.length === b.length && a.every((t, i) => t === b[i]);
}

/** Konuşma kartının kabul listesi */
export function speakAccepted(item: DrillOf<"speak">): string[] {
  return item.accepted.length > 0 ? item.accepted : [item.sentence];
}

/**
 * TEK değerlendirme kapısı. Sonuç ya doğru ya yanlış — yorum yok.
 * Konuşma kartı bile tam (normalize + kısaltma tablosu) eşleşme ister: öğretilen
 * yapıda hoşgörü yoktur ("We is" ≠ "We are"); STT kaynaklı ret, kartın iki
 * denemeden sonra cezasız geçmesiyle karşılanır (nextDrillStep).
 */
export function gradeDrill(item: DrillItem, answer: DrillAnswer): boolean {
  switch (item.type) {
    case "fill_choice":
    case "situation":
    case "complete_chat":
    case "listen_choose":
      return answer.kind === "choice" && answer.index === item.correctIndex;
    case "arrange":
      if (answer.kind !== "tokens") return false;
      return (
        sameTokens(answer.tokens, drillAnswerTiles(item)) ||
        item.alsoAccept.some((alt) => sameTokens(answer.tokens, sentenceTiles(alt)))
      );
    case "listen_arrange":
      return answer.kind === "tokens" && sameTokens(answer.tokens, drillAnswerTiles(item));
    case "find_error":
      return answer.kind === "tap" && answer.index === item.wrongIndex;
    case "match":
      return answer.kind === "match" && answer.mistakes === 0;
    case "speak":
      return (
        answer.kind === "speech" &&
        matchesAnswerSpec(answer.text, {
          kind: "utterance",
          accepted: speakAccepted(item),
          contractionsAllowed: item.contractionsAllowed,
        })
      );
  }
}

/** Eşleştirmede tek çift kararı: sol i ile sağ metin aynı çiftten mi? */
export function matchPairOk(item: DrillOf<"match">, leftIndex: number, rightText: string): boolean {
  return item.pairs[leftIndex]?.right === rightText;
}

/**
 * Konuşma kartı geri bildirimi: hedef cümlenin hangi kelimeleri SÖYLENDİ.
 * Sıra gözetmeyen kelime torbası (kısaltmalar açılmış) — yalnız ekranda vurgu
 * içindir, karar `gradeDrill`dedir.
 */
export function spokenWordHits(target: string, said: string): boolean[] {
  const bag = new Map<string, number>();
  for (const w of expandContractions(normalizeUtterance(said)).split(" ").filter(Boolean)) {
    bag.set(w, (bag.get(w) ?? 0) + 1);
  }
  return target.split(/\s+/).map((word) => {
    const parts = expandContractions(normalizeUtterance(word)).split(" ").filter(Boolean);
    if (parts.length === 0) return true;
    const ok = parts.every((p) => (bag.get(p) ?? 0) > 0);
    if (ok) for (const p of parts) bag.set(p, (bag.get(p) ?? 1) - 1);
    return ok;
  });
}

// ---------------------------------------------------------------------------
// KUYRUK — sıra yazıldığı gibi; yanlışlar BİR KEZ sona eklenir; can yok
// ---------------------------------------------------------------------------

/** Konuşma kartı kaç denemeden sonra cezasız geçer */
export const SPEAK_MAX_ATTEMPTS = 2;

/**
 * Blok durumu — oturum pozisyonuna (sessionResume) aynen yazılır, kaldığı yerden
 * devam bunu okur. Sayaç değil kimlik listesi: tekrar eden senkron güvenli.
 */
export interface DrillState {
  /** Sona eklenen (yanlış cevaplanmış) madde kimlikleri — her madde en fazla bir kez */
  retry: string[];
  /** [...items, ...retry] üzerinde sıradaki konum */
  cursor: number;
  /** "Şu an konuşamıyorum" → bu blokta kalan konuşma kartları atlanır */
  skipSpeak: boolean;
  /** İlk denemede doğru bilinen madde kimlikleri (özet ekranı) */
  firstTry: string[];
}

export function initialDrillState(): DrillState {
  return { retry: [], cursor: 0, skipSpeak: false, firstTry: [] };
}

/** Bloğun tam sırası: yazılan maddeler + tekrar kuyruğu */
export function drillSequence(items: readonly DrillItem[], state: DrillState): DrillItem[] {
  const byId = new Map(items.map((i) => [String(i.id), i]));
  return [...items, ...state.retry.map((id) => byId.get(id)).filter((i): i is DrillItem => !!i)];
}

function skippable(item: DrillItem, state: DrillState): boolean {
  return state.skipSpeak && item.type === "speak";
}

/** Atlanması gereken maddeleri geçerek cursor'ı ilk oynanabilir maddeye getirir */
export function settleDrillCursor(items: readonly DrillItem[], state: DrillState): DrillState {
  const seq = drillSequence(items, state);
  let cursor = state.cursor;
  while (cursor < seq.length && skippable(seq[cursor]!, state)) cursor++;
  return cursor === state.cursor ? state : { ...state, cursor };
}

/** Sıradaki madde; null = blok bitti */
export function currentDrill(items: readonly DrillItem[], state: DrillState): DrillItem | null {
  const seq = drillSequence(items, state);
  return seq[settleDrillCursor(items, state).cursor] ?? null;
}

/** Tekrar kuyruğuna girebilir mi — eşleştirme ve konuşma kartı girmez */
function recyclable(item: DrillItem): boolean {
  return item.type !== "match" && item.type !== "speak";
}

/**
 * Bir madde KAPANDIĞINDA (doğru, yanlış ya da konuşma kartının denemeleri bitti)
 * çağrılır. Yanlış + ilk tur + tekrarlanabilir → sona bir kez eklenir.
 */
export function nextDrillStep(items: readonly DrillItem[], state: DrillState, ok: boolean): DrillState {
  const seq = drillSequence(items, state);
  const item = seq[state.cursor];
  if (!item) return state;
  const id = String(item.id);
  const firstPass = state.cursor < items.length;
  const retry =
    !ok && firstPass && recyclable(item) && !state.retry.includes(id) ? [...state.retry, id] : state.retry;
  const firstTry = ok && firstPass && !state.firstTry.includes(id) ? [...state.firstTry, id] : state.firstTry;
  return settleDrillCursor(items, { ...state, retry, firstTry, cursor: state.cursor + 1 });
}

/** "Şu an konuşamıyorum" — kalan konuşma kartlarını atlar (geçerli kart dahil) */
export function skipSpeakDrills(items: readonly DrillItem[], state: DrillState): DrillState {
  return settleDrillCursor(items, { ...state, skipSpeak: true });
}

/** İlerleme çubuğu için 0..1 */
export function drillProgress(items: readonly DrillItem[], state: DrillState): number {
  const total = drillSequence(items, state).length;
  return total === 0 ? 1 : Math.min(1, state.cursor / total);
}
