import { expandContractions, normalizeUtterance } from "./lessonLayers.js";

/**
 * ROL YAPMA HEDEF KALIPLARI — hangisi öğrencinin sözünde BİREBİR geçti?
 *
 * Deterministik, kelime sınırlı, kısaltmaya duyarsız ("I'm" = "I am"). İki tüketici:
 *  · sunucu: rol yapma prompt'una "henüz söylenmeyen kalıplar" yazılır — karakter
 *    sorusunu onlara kapı açacak şekilde kurar (modelin kendi tahmini değil, kod);
 *  · istemci: ekrandaki hedef çiplerinin tiki (yalnız gösterim).
 * Ölçüm (hitTurns) bundan BAĞIMSIZDIR: o, eşanlamlı ifadeleri de sayan iki aşamalı
 * yoldur. Bu yardımcı yalnız birebir kullanımı görür — çip "kullandın" derken yanılmaz.
 */
function tokens(s: string): string[] {
  return expandContractions(normalizeUtterance(s)).split(" ").filter(Boolean);
}

function containsPhrase(said: string[], phrase: string[]): boolean {
  if (phrase.length === 0) return false;
  for (let i = 0; i + phrase.length <= said.length; i++) {
    if (phrase.every((t, j) => said[i + j] === t)) return true;
  }
  return false;
}

/** `mustUse` içinden, `texts`ten (öğrencinin sözleri) en az birinde geçenler — sıra korunur */
export function usedTargetPhrases(mustUse: readonly string[], texts: readonly string[]): string[] {
  const said = texts.map(tokens);
  return mustUse.filter((p) => {
    const want = tokens(p);
    return said.some((s) => containsPhrase(s, want));
  });
}
