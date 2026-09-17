/** Faz 7.6 doğrulama: hocanın sistem prompt'u — LLM'siz, anlık.
 *
 *  Yakalanan regresyon: v6'da `tutorNotes` yapılandırılmış nesneye çevrildi ama
 *  tutorPrompt onu düz metin dizisine basmaya devam ediyordu → prompt'a
 *  "[object Object]" gidiyordu ve derse özel pedagoji her turda kayboluyordu.
 *  TypeScript yakalamadı (join() her diziyi kabul eder), bu test yakalar.
 *
 *  Çalıştırma: apps/backend içinde `npx tsx scripts/test-tutor-prompt.ts` */
import type { LessonCore, SceneVariant } from "@glotmate/contracts";
import { buildTutorPrompt } from "../src/modules/lesson/tutorPrompt.js";

let fail = 0;
const check = (label: string, ok: boolean, detail = "") => {
  if (!ok) fail++;
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
};

// v7: prompt çekirdek + sahne alır (İngilizce). commonErrors V1'de kaldırıldı —
// düzeltme öğrencinin GERÇEK hatasına göre canlıda yapılır.
const core = {
  coreFormat: 1,
  topic: "present perfect",
  focus: "Present Perfect — Have you ever...?",
  objectives: ["Ask about experiences with have you ever.", "Answer with have/haven't."],
  communicationGoal: "Talk about life experiences.",
  estMinutes: 5,
  tutorNotes: { target: "have/has + past participle", correctionStyle: "recast the sentence with have/has + past participle" },
  summary: "You learned to ask about experiences.",
  lecture: { beats: [
    { id: "b1", kind: "ask", purpose: "readiness", intent: "greet and ask if ready" },
    { id: "b2", kind: "teach", introIntent: "announce the explanation", points: [
      { id: "p1", formEn: "have you ever", claimsEn: ["Use have you ever to ask about experiences."], examples: [{ id: "p1e1", textEn: "Have you ever been to London?" }] },
    ] },
    { id: "b3", kind: "ask", purpose: "questions", intent: "invite questions" },
    { id: "b4", kind: "say", intent: "announce exercises" },
    { id: "b5", kind: "exercise", format: "fill_blank", item: "___ you ever tried sushi?", answerSpec: { kind: "token", accepted: ["have"] }, exampleAnswer: "have" },
  ] },
  practice: { mustUse: ["have you ever"], minTargetUses: 2, successCriteria: "Uses the target naturally.", maxTurns: 8 },
} satisfies LessonCore;
const scene: SceneVariant = {
  persona: { name: "Alex", role: "your friend", mood: "curious", goal: "swap travel stories" },
  scene: "You are chatting with a friend about travel experiences.",
  objective: "Ask and answer about experiences.",
  avatarOpening: "Have you ever travelled somewhere really unusual?",
};

const system = buildTutorPrompt({
  displayName: "Saeb",
  cefrLevel: "B1",
  nativeLanguage: "tr",
  occupation: "backend developer",
  interests: ["technology", "sports"],
  tutorLanguage: "native",
  core,
  scene,
  activeContext: "EXERCISE CHECK — the student is answering.",
  memoryBlock: "Previous lesson: Geçmiş Zaman I.\nKnown about the student:\n- Has two cats.",
});

console.log("--- prompt ---\n" + system + "\n--------------\n");

check("nesne düz metne serileşmemiş ([object Object] yok)", !system.includes("[object Object]"));
check("hedef yapı prompt'ta", system.includes("have/has + past participle"));
check("düzeltme yöntemi prompt'ta", system.includes("recast the sentence"));
check("ana dil adı çözülmüş (kod değil)", system.includes("Turkish") && !system.includes(" tr "));
check("meslek prompt'ta", system.includes("backend developer"));
check("ilgi alanları prompt'ta", system.includes("technology"));
check("hafıza bloğu sarmalanmış", system.includes("<student_memory>") && system.includes("Has two cats"));
check("anlık bağlam eklenmiş", system.includes("CURRENT MOMENT IN THE LESSON"));
check("boş satır çöpü yok (arka arkaya 3 satır sonu)", !/\n\n\n/.test(system));

// Opsiyonel alanlar yokken de temiz kalmalı
const minimal = buildTutorPrompt({
  displayName: "Ana", cefrLevel: "A1", nativeLanguage: "es", tutorLanguage: "english", core, scene,
});
check("profilsiz prompt'ta da [object Object] yok", !minimal.includes("[object Object]"));
check("hafıza yokken blok hiç eklenmiyor", !minimal.includes("<student_memory>"));
check("meslek yokken satır eklenmiyor", !minimal.includes("They work as"));
check("ana dil parametrik (İspanyolca)", minimal.includes("Spanish"));

console.log(`\n${fail === 0 ? "✅ hepsi geçti" : `❌ ${fail} başarısız`}`);
process.exit(fail === 0 ? 0 : 1);
