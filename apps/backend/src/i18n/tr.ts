import type { ChromeBundle } from "@glotmate/contracts";

/**
 * Türkçe chrome. Script şablonlarındaki {name}/{topic}/{scenario} sunucuda
 * enterpolasyonla doldurulur; {topic} İngilizce bir terim olabileceği için
 * istemciye RichText parçası olarak `en` etiketiyle gider (TTS doğru okur).
 */
export const TR_CHROME: ChromeBundle = {
  language: "tr",
  // SESLE OKUNAN her sabit cümle `scripts/tts-chrome-probe.ts` ile ölçülür (4 Kas 2026):
  // çok dilli İngilizce ses 1-2 kelimelik Türkçeyi İngilizce okuyor ("Boşluğu doldur" →
  // "Bush Lou Dolder", "Tam isabet!" → "Tommy Sabat"); ölçümden geçen hâller burada.
  labels: {
    exerciseFillBlank: "Cümledeki boşluğu doldur:",
    exerciseMcq: "Hangisi doğru?",
    exerciseSaySentence: "Cümlenin tamamını söyle:",
    hint: "Şöyle diyebilirsin:",
    practiceHint: "Şunları kullanmayı dene:",
    quizTitle: "Mini test",
    checkpoint: { mcq: "Doğru olanı seç", gap: "Boşluğu doldur", order: "Kelimeleri sırala" },
  },
  ack: {
    yes: ["evet", "var", "sorum var", "tabii", "olur", "evet var"],
    no: ["hayır", "hayir", "yok", "sorum yok", "gerek yok", "istemem", "yok sağol", "yok sagol"],
    proceed: ["tamam", "hazırım", "hazirim", "olur", "devam", "başlayalım", "baslayalim", "hadi"],
  },
  surrender: ["bilmiyorum", "bilmem", "fikrim yok", "emin değilim", "emin degilim", "geç", "gec", "pas", "boş ver", "bos ver"],
  script: {
    // {topic} = dersin İNGİLİZCE adı (`en` parçası). Türkçe ek İngilizce ada bağlanmaz
    // ("…konusunu" yok): ad iki noktadan sonra tek başına durur.
    greeting: "Merhaba {name}! {callback}Bugünkü dersimiz: {topic}. Başlamaya hazır mısın?",
    teachIntro: "Şimdi konuyu kısaca açıklayayım.",
    askQuestions: "Alıştırmalara geçmeden — sormak istediğin bir şey var mı?",
    // Şablon öğrencinin ne yaptığını BİLMEZ: performans iddiası taşımaz (4 Kas 2026 —
    // üç kez takılan öğrenciye "Çok iyi gidiyorsun!" okunuyordu). Övgü yalnız `praise`'te,
    // o da yalnız birebir doğru cevaptan sonra.
    exercisesAnnounce: "Şimdi birkaç kısa soruyla pekiştirelim.",
    practiceIntro: "Şimdi kısa bir canlandırma yapalım: {scenario}",
    inviteQuestion: "Tabii — neyi merak ediyorsun?",
    praise: ["Tam isabet, çok doğru!", "Harika, doğru cevap!", "İşte bu, çok güzel!", "Evet, aynen böyle!"],
    wrapup: "Bugünkü dersin sonuna geldik. Bana sormak istediğin bir şey var mı?",
    farewell: "Emeğine sağlık! Bir sonraki derste görüşürüz.",
  },
};
