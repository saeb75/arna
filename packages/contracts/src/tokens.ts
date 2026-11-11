/** Kelime karşılaştırması — noktalama ve büyük/küçük harf yok sayılır (test + oyun bloğu ortak). */
export function normToken(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\u2019\u2018]/g, "'")
    .replace(/[^a-z0-9']/g, "")
    .trim();
}
