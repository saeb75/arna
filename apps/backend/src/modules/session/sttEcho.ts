/**
 * STT İPUCU YANKISI — transkripsiyon modeli, sessiz ya da çok kısa kayıtta öğrencinin
 * sözü yerine KENDİSİNE verilen ipucu metnini döndürebiliyor. Canlıda (22 Eyl 2026)
 * öğrenci sözü olarak üç kez "The speaker is learning English; their native language
 * is Turkish. They speak English, sometimes Turkish." geldi ve hoca buna cevap verdi
 * ("Sormak istediğin bir şey var mı?") — öğrenci başka şey söylemişti.
 *
 * Kural dil-bağımsızdır: ipucu metnini biz kuruyoruz (İngilizce), yankısını tanımak
 * ana dile özgü bir şey içermez. Yankı = transkriptin kelimelerinin büyük kısmı ipucu
 * kelimesi VE ipucunun anlamlı bir kısmı transkriptte. İkinci şart, "My native
 * language is Turkish" gibi GERÇEK bir öğrenci cümlesini (tanışma dersinde olağan)
 * elemez: ipucunun yalnız küçük bir kısmını kapsar.
 */
function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^\p{L}\p{N}' ]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Transkripsiyon modeline verilen ipucunun yankısı mı? (yankıysa söz BOŞ sayılır) */
export function isPromptEcho(transcript: string, prompt: string): boolean {
  const said = words(transcript);
  if (said.length < 4) return false;
  const promptWords = new Set(words(prompt));
  if (promptWords.size === 0) return false;
  const inPrompt = said.filter((w) => promptWords.has(w));
  const share = inPrompt.length / said.length;
  const coverage = new Set(inPrompt).size / promptWords.size;
  return share >= 0.7 && coverage >= 0.5;
}
