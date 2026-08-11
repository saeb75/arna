/** Faz 7.6 doğrulama: hocanın sistem prompt'u — LLM'siz, anlık.
 *
 *  Yakalanan regresyon: v6'da `tutorNotes` yapılandırılmış nesneye çevrildi ama
 *  tutorPrompt onu düz metin dizisine basmaya devam ediyordu → prompt'a
 *  "[object Object]" gidiyordu ve derse özel pedagoji her turda kayboluyordu.
 *  TypeScript yakalamadı (join() her diziyi kabul eder), bu test yakalar.
 *
 *  Çalıştırma: apps/backend içinde `npx tsx scripts/test-tutor-prompt.ts` */
import { buildTutorPrompt } from "../src/modules/lesson/tutorPrompt.js";
import { makeLessonContent } from "./_fixture.js";

let fail = 0;
const check = (label: string, ok: boolean, detail = "") => {
  if (!ok) fail++;
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
};

const lesson = makeLessonContent({
  focus: "Present Perfect — Have you ever...?",
  tutorNotes: {
    target: "have/has + past participle",
    commonErrors: ["using the past simple with 'ever'", "dropping the auxiliary"],
    correction: "recast the sentence with have/has + past participle",
  },
});

const system = buildTutorPrompt({
  displayName: "Saeb",
  cefrLevel: "B1",
  nativeLanguage: "tr",
  occupation: "backend developer",
  interests: ["technology", "sports"],
  lesson,
  activeContext: "EXERCISE CHECK — the student is answering.",
  memoryBlock: "Previous lesson: Geçmiş Zaman I.\nKnown about the student:\n- Has two cats.",
});

console.log("--- prompt ---\n" + system + "\n--------------\n");

check("nesne düz metne serileşmemiş ([object Object] yok)", !system.includes("[object Object]"));
check("hedef yapı prompt'ta", system.includes("have/has + past participle"));
check("tipik hatalar prompt'ta", system.includes("using the past simple with 'ever'"));
check("ikinci tipik hata da var", system.includes("dropping the auxiliary"));
check("düzeltme yöntemi prompt'ta", system.includes("recast the sentence"));
check("ana dil adı çözülmüş (kod değil)", system.includes("Turkish") && !system.includes(" tr "));
check("meslek prompt'ta", system.includes("backend developer"));
check("ilgi alanları prompt'ta", system.includes("technology"));
check("hafıza bloğu sarmalanmış", system.includes("<student_memory>") && system.includes("Has two cats"));
check("anlık bağlam eklenmiş", system.includes("CURRENT MOMENT IN THE LESSON"));
check("boş satır çöpü yok (arka arkaya 3 satır sonu)", !/\n\n\n/.test(system));

// Opsiyonel alanlar yokken de temiz kalmalı
const minimal = buildTutorPrompt({
  displayName: "Ana", cefrLevel: "A1", nativeLanguage: "es", lesson,
});
check("profilsiz prompt'ta da [object Object] yok", !minimal.includes("[object Object]"));
check("hafıza yokken blok hiç eklenmiyor", !minimal.includes("<student_memory>"));
check("meslek yokken satır eklenmiyor", !minimal.includes("They work as"));
check("ana dil parametrik (İspanyolca)", minimal.includes("Spanish"));

console.log(`\n${fail === 0 ? "✅ hepsi geçti" : `❌ ${fail} başarısız`}`);
process.exit(fail === 0 ? 0 : 1);
