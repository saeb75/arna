// İFADE YAMASI ZAMANLAMASI — kaş, göz kapağı, gülümseme (saf; DOM/React yok).
//
// Yama ekseninin UÇLARI CANLIDIR: konum 0'da yama çizilmez (alttaki canlı katmanlar — iris,
// ağız — görünür), kareler aradaki durumlardır. İlk dilimde ilk kare canlı görüntünün üstüne
// KARIŞARAK gelir (bakış kaymış olsa bile iris sıçramaz); sonraki dilimlerde alt kare opak,
// üst kare karışımdır — ağız eksenindeki `axisFrames` ile aynı fikir.

export interface ExprPick {
  /** alttaki kare (yoksa null) ve opaklığı */
  a: string | null;
  aOpacity: number;
  /** üstteki kare (yoksa null) ve opaklığı */
  b: string | null;
  bOpacity: number;
}

const NONE: ExprPick = { a: null, aOpacity: 0, b: null, bOpacity: 0 };

/**
 * Konum (0..1) → çizilecek kare çifti.
 * `closedEnd` (göz kapağı): eksenin öbür ucu da canlıdır — 1 = kapalı göz TABANDA çizili.
 * Son dilimde son kare tabana doğru söner; o dilimde çağıran açık göz katmanını gizler
 * (`exprEndsLive`). `closedEnd` değilse son kare ucun kendisidir (kaş tam kalkık, tam gülümseme).
 */
export function exprFrames(axis: readonly string[], pos: number, closedEnd = false): ExprPick {
  const n = axis.length;
  const p = Math.max(0, Math.min(1, pos));
  if (!n || p <= 0.004) return NONE;
  const u = p * (closedEnd ? n + 1 : n);
  const i = Math.floor(u);
  const f = u - i;
  if (i === 0) return { a: null, aOpacity: 0, b: axis[0]!, bOpacity: f };
  if (i >= n) return closedEnd && p < 1 ? { a: axis[n - 1]!, aOpacity: 1 - f, b: null, bOpacity: 0 } : closedEnd ? NONE : { a: axis[n - 1]!, aOpacity: 1, b: null, bOpacity: 0 };
  return { a: axis[i - 1]!, aOpacity: 1, b: axis[i]!, bOpacity: f };
}

/** `closedEnd` ekseninde son dilim başladı mı — açık göz katmanı artık gizlenir */
export const exprEndsLive = (axis: readonly string[], pos: number) => pos >= axis.length / (axis.length + 1);

// ---- Göz kırpma eğrisi: kapanış hızlı, kısa tutma, açılış yavaş (gerçek kırpmanın oranı).
// Eskiden göz 145 ms boyunca TEK karede kapanıp açılıyordu — "resim değişti" gibi görünüyordu.
export const BLINK_CLOSE_MS = 75;
export const BLINK_HOLD_MS = 35;
export const BLINK_OPEN_MS = 150;
export const BLINK_TOTAL_MS = BLINK_CLOSE_MS + BLINK_HOLD_MS + BLINK_OPEN_MS;

/** Kırpmanın yaşı (ms) → kapak konumu: 0 açık … 1 kapalı */
export function blinkLid(ageMs: number): number {
  if (ageMs <= 0 || ageMs >= BLINK_TOTAL_MS) return 0;
  if (ageMs < BLINK_CLOSE_MS) {
    const x = ageMs / BLINK_CLOSE_MS;
    return x * x * (3 - 2 * x);
  }
  if (ageMs < BLINK_CLOSE_MS + BLINK_HOLD_MS) return 1;
  const y = (ageMs - BLINK_CLOSE_MS - BLINK_HOLD_MS) / BLINK_OPEN_MS;
  return (1 - y) * (1 - y); // önce hızlı, sona doğru yavaşlayan açılış
}
