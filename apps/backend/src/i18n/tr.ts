import type { ChromeBundle } from "@arna/contracts";

/**
 * Türkçe chrome. Script şablonlarındaki {name}/{topic}/{scenario} sunucuda
 * enterpolasyonla doldurulur; {topic} İngilizce bir terim olabileceği için
 * istemciye RichText parçası olarak `en` etiketiyle gider (TTS doğru okur).
 */
export const TR_CHROME: ChromeBundle = {
  language: "tr",
  labels: {
    exerciseFillBlank: "Boşluğu doldur:",
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
    greeting: "Merhaba {name}! {callback}Bugün seninle {topic} konusunu öğreneceğiz. Başlamaya hazır mısın?",
    teachIntro: "Şimdi konuyu kısaca açıklayayım.",
    askQuestions: "Alıştırmalara geçmeden — sormak istediğin bir şey var mı?",
    exercisesAnnounce: "Harika. Şimdi birkaç kısa soruyla pekiştirelim.",
    practiceIntro: "Çok iyi gidiyorsun! Şimdi kısa bir canlandırma yapalım: {scenario}",
    inviteQuestion: "Tabii — neyi merak ediyorsun?",
    praise: ["Tam isabet!", "Aferin, çok doğru!", "Harika!", "İşte bu!"],
    wrapup: "Bugünkü dersin sonuna geldik — {topic} konusunda gerçekten iyiydin. Bana sormak istediğin bir şey var mı?",
    farewell: "Bugün harikaydın. Bir sonraki derste görüşürüz!",
  },
};
