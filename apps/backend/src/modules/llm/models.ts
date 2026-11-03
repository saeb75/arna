import type { LLMPurpose } from "./types.js";

/** Amaç → model yönlendirmesi. Tek yerden değişir; kod dağılmaz. */
export const MODEL_BY_PURPOSE: Record<LLMPurpose, string> = {
  plan_gen: "gpt-4.1",
  lesson_gen: "gpt-4.1",
  // v7 katmanları: çekirdek ve sahne pedagoji taşır → güçlü model.
  // Dil paketi de güçlü modelde: kötü ana-dil düzyazısı ekibin GÖREMEYECEĞİ hatadır.
  lesson_core: "gpt-4.1",
  lesson_scenes: "gpt-4.1",
  lesson_locale: "gpt-4.1",
  // Canlı ders sohbeti + judge (konuşma motoru, turn/). 3 Kas 2026 konuşma
  // taraması (135 vaka, scripts/test-conversation-matrix.ts): gpt-4o-mini %59,
  // gpt-4.1 %91, gpt-5.5 %94, gpt-6.1-terra %99 (p50 1,6 sn), gpt-6-astra %99
  // (p50 2,6 sn, 10× fiyat). Mini model canlı sohbette KULLANILMAZ (kullanıcı kararı).
  // Değiştirmeden önce tarama yeni modelle koşulur.
  chat: "gpt-6.1-terra",
  // Cevap incelemesi güncel nesil ucuz katmanda: iki zor işi birden yapıyor —
  // "doğru ama native böyle demez" yargısı ve açıklamayı ÖĞRENCİNİN DİLİNDE yazmak.
  // İkincisi ekibin göremeyeceği hata sınıfı, o yüzden 2024 modeline bırakılmadı.
  answer_review: "gpt-5.6-luna",
  memory_extract: "gpt-4o-mini",
  embedding: "text-embedding-3-small",
};

/** Bir amacın hangi modele gittiğini dışarıdan sormak için (kayıt/log alanları). */
export function modelForPurpose(purpose: LLMPurpose): string {
  return MODEL_BY_PURPOSE[purpose];
}
